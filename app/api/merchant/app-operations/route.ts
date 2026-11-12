import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  getMerchantRemoteConfig,
  updateMerchantRemoteConfig,
} from "@/lib/merchant/merchant-remote-config";
import { createCashfreeWalletRechargeOrder } from "@/lib/wallet/cashfree-wallet-service";
import { createCashfreeDynamicQr } from "@/lib/hyperlocal/cashfree-pg-qr-refund";
import { dispatchCascadingRadar } from "@/lib/hyperlocal/dispatch-engine";
import { cancelHyperlocalOrderWithRefund } from "@/lib/hyperlocal/hyperlocal-service";
import { buildCorsHeaders, handleCorsPreflight } from "@/lib/auth-cors";
import { requireMerchantApi } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function GET(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  try {
    const auth = await requireMerchantApi();
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const requestedBizId = searchParams.get("businessId")?.trim() || "";
    if (requestedBizId && requestedBizId !== auth.merchant.businessId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: business mismatch." },
        { status: 403, headers: corsHeaders }
      );
    }

    const admin = createSupabaseAdminClient();
    const businessId = auth.merchant.businessId;
    const config = getMerchantRemoteConfig(businessId);

    if (!businessId) {
      return NextResponse.json({
        success: true,
        config,
        business: null,
        stats: {
          todayEarnings: 0,
          pendingCount: 0,
          preparingCount: 0,
          readyCount: 0,
          outCount: 0,
          deliveredCount: 0,
          totalOrdersCount: 0,
          totalReviews: 0,
          averageRating: null,
          totalScans: 0,
          positivePct: null,
        },
        orders: [],
        catalog: [],
        reviews: [],
      });
    }

    // 2. Fetch authentic business profile, orders, catalog, reviews & scan stats in parallel
    const [bizRes, ordersRes, catalogRes, reviewsRes, scansRes] = await Promise.all([
      admin
        .from("businesses")
        .select(
          "id, name, owner, phone, type, address, city, pincode, plan, review_link, is_outlet_open, allow_taking_orders, is_taking_orders, is_verified, merchant_status, location_latitude, location_longitude",
        )
        .eq("id", businessId)
        .maybeSingle(),
      admin
        .from("hyperlocal_orders")
        .select(`
          id,
          business_id,
          status,
          customer_name,
          customer_phone,
          customer_address,
          total_amount,
          subtotal_amount,
          delivery_fee,
          payment_mode,
          payment_status,
          delivery_otp,
          created_at,
          accepted_at,
          ready_at,
          delivered_at,
          merchant_prep_time_minutes,
          hyperlocal_order_items (id, item_name, quantity, unit_price, total_price, is_veg)
        `)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50),
      admin
        .from("business_catalog_items")
        .select("id, name, category, price, is_available, item_type, description, image_url, unit")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      admin
        .from("trustit_reviews")
        .select("id, rating, review_text, customer_name, submitted_at")
        .eq("business_id", businessId)
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false })
        .limit(25),
      admin
        .from("business_scan_events")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
    ]);

    const dbBusiness = bizRes.data;
    const allOrders = ordersRes.data || [];
    const catalogItems = catalogRes.data || [];
    const reviewsList = reviewsRes.data || [];
    const totalScans = scansRes.count ?? 0;

    // 3. Aggregate strictly for THIS merchant (Zero fake fallback numbers)
    const pendingOrders = allOrders.filter((o) => o.status === "placed");
    const preparingOrders = allOrders.filter(
      (o) => o.status === "accepted_by_merchant" || o.status === "accepted" || o.status === "preparing",
    );
    const readyOrders = allOrders.filter((o) => o.status === "ready_for_pickup" || o.status === "food_ready");
    const outOrders = allOrders.filter(
      (o) => o.status === "rider_assigned" || o.status === "picked_up" || o.status === "out_for_delivery",
    );
    const deliveredOrders = allOrders.filter((o) => o.status === "delivered" || o.status === "completed");

    const todayKey = new Date().toISOString().slice(0, 10);
    const todayEarnings = allOrders
      .filter((o) => {
        const isToday = String(o.created_at || "").startsWith(todayKey);
        const isCountable =
          o.status === "delivered" ||
          o.status === "completed" ||
          o.status === "accepted_by_merchant" ||
          o.status === "accepted" ||
          o.status === "preparing" ||
          o.status === "ready_for_pickup" ||
          o.status === "rider_assigned" ||
          o.status === "picked_up" ||
          o.status === "out_for_delivery";
        return isToday && isCountable;
      })
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    const totalReviews = reviewsList.length;
    const averageRating = totalReviews > 0
      ? Number((reviewsList.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews).toFixed(1))
      : null;
    const positiveCount = reviewsList.filter((r) => Number(r.rating || 0) >= 4).length;
    const positivePct = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : null;

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        businessId: dbBusiness?.id || businessId,
        storeName: dbBusiness?.name || config.storeName,
        ownerName: dbBusiness?.owner || config.ownerName,
        phone: dbBusiness?.phone || config.phone,
        businessCategory: dbBusiness?.type || config.businessCategory,
        address: dbBusiness?.address || config.address,
        latitude: dbBusiness?.location_latitude ?? config.latitude,
        longitude: dbBusiness?.location_longitude ?? config.longitude,
        isStoreOnline:
          Boolean(dbBusiness?.is_outlet_open ?? config.isStoreOnline) &&
          dbBusiness?.is_taking_orders !== false &&
          dbBusiness?.allow_taking_orders !== false,
      },
      business: {
        id: dbBusiness?.id || businessId,
        name: dbBusiness?.name || "My Store",
        owner: dbBusiness?.owner || "Merchant Partner",
        phone: dbBusiness?.phone || "",
        type: dbBusiness?.type || "kirana",
        address: dbBusiness?.address || "",
        location_latitude: dbBusiness?.location_latitude ?? null,
        location_longitude: dbBusiness?.location_longitude ?? null,
        is_outlet_open: dbBusiness?.is_outlet_open ?? true,
        allow_taking_orders: dbBusiness?.allow_taking_orders ?? true,
        is_taking_orders: dbBusiness?.is_taking_orders ?? true,
        is_verified: dbBusiness?.is_verified ?? false,
        merchant_status: dbBusiness?.merchant_status || "active",
        review_link: dbBusiness?.review_link || `https://trustitreview.com/r/${businessId}`,
      },
      stats: {
        todayEarnings,
        pendingCount: pendingOrders.length,
        preparingCount: preparingOrders.length,
        readyCount: readyOrders.length,
        outCount: outOrders.length,
        deliveredCount: deliveredOrders.length,
        totalOrdersCount: allOrders.length,
        totalReviews,
        averageRating,
        totalScans,
        positivePct,
      },
      orders: allOrders,
      catalog: catalogItems,
      reviews: reviewsList,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Error fetching merchant data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  try {
    const auth = await requireMerchantApi();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { action, businessId, orderId, itemId, data } = body;

    if (businessId && String(businessId).trim() !== auth.merchant.businessId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: business mismatch." },
        { status: 403, headers: corsHeaders }
      );
    }

    const admin = createSupabaseAdminClient();
    const resolvedBizId = auth.merchant.businessId;

    // 1. Toggle Store Online / Offline Status
    if (action === "toggle_outlet") {
      const isOpen = Boolean(data?.isOpen);
      if (!resolvedBizId) {
        return NextResponse.json(
          { success: false, message: "Business ID not found for merchant session." },
          { status: 400 }
        );
      }

      if (isOpen) {
        const { data: bizPerm } = await admin
          .from("businesses")
          .select("allow_taking_orders, merchant_status")
          .eq("id", resolvedBizId)
          .maybeSingle();
        if (bizPerm && bizPerm.allow_taking_orders === false) {
          return NextResponse.json(
            {
              success: false,
              message: "Order taking permission is paused by Admin. Contact Trustit support.",
            },
            { status: 403 }
          );
        }
      }

      const { error: dbErr } = await admin
        .from("businesses")
        .update({
          is_outlet_open: isOpen,
          is_taking_orders: isOpen,
        })
        .eq("id", resolvedBizId);

      if (dbErr) {
        return NextResponse.json(
          { success: false, message: dbErr.message || "Failed to update outlet status." },
          { status: 500 }
        );
      }

      const updated = updateMerchantRemoteConfig({ businessId: resolvedBizId, isStoreOnline: isOpen });

      return NextResponse.json({
        success: true,
        message: isOpen ? "🟢 Orders Active" : "🔴 Orders Paused",
        is_outlet_open: updated.isStoreOnline,
        is_taking_orders: isOpen,
      });
    }

    // 2. Accept Order (With Kitchen Prep Time + Trigger Rider Radar)
    if (action === "order_accept") {
      const prepMinutes = Number(data?.prepTimeMinutes) || 20;
      const now = new Date().toISOString();
      const { error: acceptErr } = await admin
        .from("hyperlocal_orders")
        .update({
          status: "accepted_by_merchant",
          accepted_at: now,
          merchant_prep_time_minutes: prepMinutes,
          updated_at: now,
        })
        .eq("id", orderId)
        .eq("business_id", resolvedBizId);

      if (acceptErr) {
        return NextResponse.json(
          { success: false, message: acceptErr.message || "Failed to accept order." },
          { status: 500 }
        );
      }

      let dispatchInfo: Awaited<ReturnType<typeof dispatchCascadingRadar>> | null = null;
      try {
        dispatchInfo = await dispatchCascadingRadar(orderId);
      } catch (dispErr) {
        console.warn("Rider radar dispatch warning after merchant accept:", dispErr);
      }

      return NextResponse.json({
        success: true,
        status: "accepted_by_merchant",
        dispatch: dispatchInfo,
        message: `Order #${orderId.slice(-6)} accepted! Prep time: ${prepMinutes} mins.`,
      });
    }

    // 3. Mark Food Ready / KOT Printed (+ Ensure Rider Radar Dispatched)
    if (action === "order_ready") {
      const now = new Date().toISOString();
      const { error: readyErr } = await admin
        .from("hyperlocal_orders")
        .update({
          status: "ready_for_pickup",
          ready_at: now,
          updated_at: now,
        })
        .eq("id", orderId)
        .eq("business_id", resolvedBizId);

      if (readyErr) {
        return NextResponse.json(
          { success: false, message: readyErr.message || "Failed to mark order ready." },
          { status: 500 }
        );
      }

      let dispatchInfo: Awaited<ReturnType<typeof dispatchCascadingRadar>> | null = null;
      try {
        dispatchInfo = await dispatchCascadingRadar(orderId);
      } catch (dispErr) {
        console.warn("Rider radar dispatch warning on order_ready:", dispErr);
      }

      return NextResponse.json({
        success: true,
        status: "ready_for_pickup",
        dispatch: dispatchInfo,
        message: `Order #${orderId.slice(-6)} marked ready for rider pickup!`,
      });
    }

    // 4. Reject / Cancel Order (With Genuine Cashfree Refund + Rider Release)
    if (action === "order_reject") {
      const reason = data?.reason || "Item temporarily out of stock";
      const result = await cancelHyperlocalOrderWithRefund({
        orderId,
        cancelledBy: "merchant",
        reason,
        issueRefund: true,
        targetStatus: "rejected",
      });

      return NextResponse.json({
        success: true,
        result,
        message: `Order #${orderId.slice(-6)} declined${result.refundId ? ` & refund ${result.refundId} initiated` : ""}.`,
      });
    }

    // 5. Rider Dispatch / Assign Rider
    if (action === "order_dispatch") {
      const now = new Date().toISOString();
      const riderName = data?.riderName || "Ramesh Verma (Trustit Rider)";
      await admin
        .from("hyperlocal_orders")
        .update({
          status: "out_for_delivery",
          picked_up_at: now,
          admin_notes: `Dispatched with ${riderName}`,
          updated_at: now,
        })
        .eq("id", orderId)
        .eq("business_id", resolvedBizId);

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} is out for delivery with ${riderName}!`,
      });
    }

    // 6. Complete Order Delivery (with 4-digit Delivery OTP verification)
    if (action === "order_deliver") {
      const inputOtp = String(data?.otp || "").trim();
      
      // Fetch order to verify OTP
      const { data: dbOrder } = await admin
        .from("hyperlocal_orders")
        .select("delivery_otp, status")
        .eq("id", orderId)
        .eq("business_id", resolvedBizId)
        .maybeSingle();

      if (!dbOrder) {
        return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
      }

      if (dbOrder.delivery_otp && dbOrder.delivery_otp !== inputOtp) {
        return NextResponse.json(
          { success: false, message: "Galat OTP! Kripya customer se sahi 4-digit OTP mangein." },
          { status: 400 }
        );
      }

      const now = new Date().toISOString();
      await admin
        .from("hyperlocal_orders")
        .update({
          status: "delivered",
          delivered_at: now,
          updated_at: now,
        })
        .eq("id", orderId)
        .eq("business_id", resolvedBizId);

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} safalta se deliver ho gaya!`,
      });
    }

    // 7. Add New Product to Catalog
    if (action === "add_product") {
      const { name, category, price, itemType, unit, description, mrp, imageUrl } = data || {};
      if (!name || !price) {
        return NextResponse.json({ success: false, message: "Name and Price are required" }, { status: 400 });
      }

      const { data: newProd, error } = await admin
        .from("business_catalog_items")
        .insert({
          business_id: resolvedBizId,
          name: name.trim(),
          category: category?.trim() || "General",
          price: Number(price),
          item_type: itemType || "veg",
          unit: unit || "plate",
          description: description || (mrp ? `MRP: ₹${mrp}` : null),
          image_url: imageUrl || null,
          is_available: true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        success: true,
        message: `"${name}" catalog me jud gaya!`,
        product: newProd,
      });
    }

    // 8. Delete Product from Catalog
    if (action === "delete_product") {
      if (!itemId) {
        return NextResponse.json({ success: false, message: "Item ID required" }, { status: 400 });
      }

      await admin
        .from("business_catalog_items")
        .delete()
        .eq("id", itemId)
        .eq("business_id", resolvedBizId);

      return NextResponse.json({
        success: true,
        message: "Item catalog se hata diya gaya.",
      });
    }

    // 9. Toggle Item Availability (In Stock / Out of Stock)
    if (action === "toggle_item_stock") {
      const isAvailable = Boolean(data?.isAvailable);
      await admin
        .from("business_catalog_items")
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .eq("business_id", resolvedBizId);

      return NextResponse.json({
        success: true,
        message: isAvailable ? "Item In-Stock ho gaya" : "Item Out-of-Stock ho gaya",
      });
    }

    // 10. Bulk Update Kirana Mandi Rates
    if (action === "update_mandi_rates") {
      const rates = data?.rates || []; // Array of { id, name, price }
      for (const r of rates) {
        if (r.id) {
          await admin
            .from("business_catalog_items")
            .update({ price: Number(r.price), updated_at: new Date().toISOString() })
            .eq("id", r.id)
            .eq("business_id", resolvedBizId);
        } else if (r.name && r.price) {
          await admin.from("business_catalog_items").insert({
            business_id: resolvedBizId,
            name: r.name,
            price: Number(r.price),
            category: "Kirana Mandi",
            unit: "kg",
            is_available: true,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Kirana Mandi Rates safalta se update ho gaye!",
      });
    }

    // 11. Update Store Branding Profile
    if (action === "update_profile") {
      const { storeName, ownerName, businessCategory, address, logoUrl } = data || {};
      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        storeName: storeName?.trim() || undefined,
        ownerName: ownerName?.trim() || undefined,
        businessCategory: businessCategory || undefined,
        address: address?.trim() || undefined,
        logoUrl: logoUrl || undefined,
      });

      if (resolvedBizId) {
        const dbPatch: Record<string, string> = {};
        if (storeName?.trim()) dbPatch.name = storeName.trim();
        if (ownerName?.trim()) dbPatch.owner = ownerName.trim();
        if (businessCategory?.trim()) dbPatch.type = businessCategory.trim();
        if (address?.trim()) dbPatch.address = address.trim();
        if (Object.keys(dbPatch).length > 0) {
          await admin.from("businesses").update(dbPatch).eq("id", resolvedBizId);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Store profile updated!",
        config: updated,
      });
    }

    // 12. Update GPS Location & Delivery Radius Geofence
    if (action === "update_location") {
      const { latitude, longitude, deliveryRadiusKm, address } = data || {};
      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        latitude: Number(latitude) || undefined,
        longitude: Number(longitude) || undefined,
        deliveryRadiusKm: Number(deliveryRadiusKm) || undefined,
      });

      if (resolvedBizId && latitude && longitude) {
        const locPatch: Record<string, unknown> = {
          location_latitude: Number(latitude),
          location_longitude: Number(longitude),
        };
        if (address && String(address).trim()) {
          locPatch.address = String(address).trim();
        }
        await admin.from("businesses").update(locPatch).eq("id", resolvedBizId);
      }

      return NextResponse.json({
        success: true,
        message: `GPS Geofence updated (${updated.deliveryRadiusKm} KM radius)!`,
        config: updated,
      });
    }

    // 13. Update Operating Hours & Split Shifts
    if (action === "update_operating_hours") {
      const { openingTime, closingTime, isFestivalMode, festivalMode, isLunchPause, lunchPause } = data || {};
      const fest = isFestivalMode !== undefined ? Boolean(isFestivalMode) : festivalMode !== undefined ? Boolean(festivalMode) : undefined;
      const lunch = isLunchPause !== undefined ? Boolean(isLunchPause) : lunchPause !== undefined ? Boolean(lunchPause) : undefined;
      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        openingTime: openingTime || undefined,
        closingTime: closingTime || undefined,
        isFestivalMode: fest,
        isLunchPause: lunch,
      });

      return NextResponse.json({
        success: true,
        message: "Operating hours and shifts updated!",
        config: updated,
      });
    }

    // 14. Update Google Review Gating
    if (action === "update_review_gating") {
      const { googlePlaceId, reviewShortLink, smartGatingMinStars } = data || {};
      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        googlePlaceId: googlePlaceId?.trim() || undefined,
        reviewShortLink: reviewShortLink?.trim() || undefined,
        smartGatingMinStars: Number(smartGatingMinStars) || 4,
      });

      return NextResponse.json({
        success: true,
        message: "Google Review Smart Gating link updated!",
        config: updated,
      });
    }

    // 14b. Update Master Cashier PIN (Security Screen 41)
    if (action === "update_security_pin") {
      const { currentPin, newPin } = data || {};
      if (!newPin || newPin.length < 4) {
        return NextResponse.json(
          { success: false, message: "New PIN must be at least 4 digits" },
          { status: 400 }
        );
      }
      const curConfig = getMerchantRemoteConfig(resolvedBizId);
      if (curConfig.cashierPin && (!currentPin || curConfig.cashierPin !== currentPin)) {
        return NextResponse.json(
          { success: false, message: "Current PIN is required and must match!" },
          { status: 400 }
        );
      }
      const updated = updateMerchantRemoteConfig({ businessId: resolvedBizId, cashierPin: newPin });
      return NextResponse.json({
        success: true,
        message: "Master Cashier PIN safalta se badal diya gaya!",
        cashierPin: updated.cashierPin,
      });
    }

    // 14c. Update Security 2FA & Login Alerts (Security Screen 41)
    if (action === "update_security_settings") {
      const { twoFactorEnabled, loginAlerts } = data || {};
      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        twoFactorEnabled: twoFactorEnabled !== undefined ? Boolean(twoFactorEnabled) : undefined,
        loginAlerts: loginAlerts !== undefined ? Boolean(loginAlerts) : undefined,
      });
      return NextResponse.json({
        success: true,
        message: "Security settings saved!",
        config: updated,
      });
    }

    // 14d. Multi-Outlet Branch Registration & Switching (Screen 42)
    if (action === "add_branch") {
      const { name, locality, phone } = data || {};
      if (!name || !locality) {
        return NextResponse.json(
          { success: false, message: "Branch name and locality are required" },
          { status: 400 }
        );
      }
      const cur = getMerchantRemoteConfig(resolvedBizId);
      const branches = cur.branches || [];
      const newBranch = {
        id: `branch_${Date.now()}`,
        name: name.trim(),
        locality: locality.trim(),
        phone: phone?.trim() || cur.phone,
        idCode: `QR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        active: false,
        pendingOrders: 0,
        revenueToday: "₹0",
      };
      const updated = updateMerchantRemoteConfig({ businessId: resolvedBizId, branches: [...branches, newBranch] });
      return NextResponse.json({
        success: true,
        message: `New outlet branch "${name}" registered!`,
        branch: newBranch,
        branches: updated.branches,
      });
    }

    if (action === "switch_branch") {
      const { branchId } = data || {};
      const cur = getMerchantRemoteConfig(resolvedBizId);
      const branches = cur.branches || [];
      const target = branches.find((b) => b.id === branchId);
      if (!target) {
        return NextResponse.json({ success: false, message: "Branch not found" }, { status: 404 });
      }
      const updatedBranches = branches.map((b) => ({
        ...b,
        active: b.id === branchId,
      }));
      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        branches: updatedBranches,
        storeName: target.name,
      });
      return NextResponse.json({
        success: true,
        message: `Switched active branch to ${target.name}`,
        activeBranch: target,
        config: updated,
      });
    }

    // 14e. Staff Roles & Matrix (Screen 43)
    if (action === "manage_staff") {
      const { actionType, staffMember, targetName } = data || {};
      const cur = getMerchantRemoteConfig(resolvedBizId);
      let staff = cur.staffList || [];
      if (actionType === "revoke") {
        staff = staff.filter((s) => s.name !== targetName);
        const updated = updateMerchantRemoteConfig({ businessId: resolvedBizId, staffList: staff });
        return NextResponse.json({
          success: true,
          message: `✓ Staff access revoked for ${targetName}!`,
          staffList: updated.staffList,
        });
      } else if (actionType === "invite") {
        if (!staffMember?.name || !staffMember?.phone) {
          return NextResponse.json(
            { success: false, message: "Name and phone are required" },
            { status: 400 }
          );
        }
        staff.push(staffMember);
        const updated = updateMerchantRemoteConfig({ businessId: resolvedBizId, staffList: staff });
        return NextResponse.json({
          success: true,
          message: `✓ ${staffMember.name} has been added to staff list!`,
          staffList: updated.staffList,
        });
      }
      return NextResponse.json({ success: false, message: "Invalid staff action" }, { status: 400 });
    }

    // 14f. Thermal Printer Settings (Screen 11 & Screen 46)
    if (action === "update_printer_settings") {
      const { paperSize, connectionType, autoCut } = data || {};
      const cur = getMerchantRemoteConfig(resolvedBizId);
      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        printerSettings: {
          paperSize: paperSize || cur.printerSettings?.paperSize || "80mm",
          connectionType: connectionType || cur.printerSettings?.connectionType || "bluetooth",
          autoCut: autoCut !== undefined ? Boolean(autoCut) : cur.printerSettings?.autoCut ?? true,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Printer configuration updated (${updated.printerSettings?.paperSize})!`,
        printerSettings: updated.printerSettings,
      });
    }

    // 15. Real Cashfree Wallet / Boost Credits Top-up
    if (action === "recharge_wallet") {
      const amount = Number(data?.amount || 199);
      if (!Number.isFinite(amount) || amount < 10 || amount > 100_000) {
        return NextResponse.json(
          { success: false, message: "Recharge amount must be between ₹10 and ₹1,00,000." },
          { status: 400 }
        );
      }
      const rawCredits = Number(data?.credits || amount);
      const maxAllowedCredits = Math.ceil(amount * 1.5);
      const credits =
        Number.isFinite(rawCredits) && rawCredits >= amount && rawCredits <= maxAllowedCredits
          ? Math.floor(rawCredits)
          : Math.floor(amount);

      const orderResult = await createCashfreeWalletRechargeOrder({
        businessId: resolvedBizId,
        amount,
        credits,
        merchantName: auth.merchant.businessName || "Trustit Merchant",
        merchantPhone: auth.merchant.registeredMobile || undefined,
      });

      if (!orderResult.success) {
        return NextResponse.json({ success: false, message: orderResult.error }, { status: 500 });
      }

      let qrCodeImage: string | null = null;
      let qrCodeUrl: string | null = null;
      if (data?.includeQr === true) {
        const qrRes = await createCashfreeDynamicQr({
          internalOrderId: orderResult.orderId,
          amount,
          customerName: auth.merchant.businessName || "Trustit Merchant",
          customerPhone: auth.merchant.registeredMobile || "9999999999",
          purpose: `Trustit Wallet Recharge (${credits} Credits)`,
          orderTags: {
            source: "merchant_wallet_recharge",
            business_id: resolvedBizId,
            wallet_order_id: orderResult.orderId,
          },
        });
        if (qrRes.success) {
          qrCodeImage = qrRes.qrDataUrl;
          qrCodeUrl = qrRes.paymentUrl;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Cashfree recharge session created for ₹${amount}!`,
        orderId: orderResult.orderId,
        paymentSessionId: orderResult.paymentSessionId,
        checkoutMode: orderResult.environment,
        qrCodeImage,
        qrCodeUrl,
      });
    }

    // 16. Bank Account Penny Drop Verification
    if (action === "verify_bank_kyc") {
      const { accountNumber, ifsc, holderName, phone } = data || {};
      const cleanAcc = (accountNumber || "").replace(/\s+/g, "");
      const cleanIfsc = (ifsc || "").trim().toUpperCase();

      // Production-grade validation
      if (!/^\d{8,18}$/.test(cleanAcc)) {
        return NextResponse.json(
          { success: false, message: "Kripya 8 se 18 digit ka valid Bank Account Number dalein." },
          { status: 400 }
        );
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
        return NextResponse.json(
          { success: false, message: "Kripya valid 11-digit IFSC code dalein (jaise SBIN0000024)." },
          { status: 400 }
        );
      }

      const mask = `•••• •••• ${cleanAcc.slice(-4)}`;
      const clientId = process.env.CASHFREE_CLIENT_ID?.trim();
      const clientSecret = process.env.CASHFREE_CLIENT_SECRET?.trim();
      const env = (process.env.CASHFREE_ENVIRONMENT || "production").trim().toLowerCase();
      const verificationBaseUrl = env === "production"
        ? "https://api.cashfree.com/verification"
        : "https://sandbox.cashfree.com/verification";

      let verifiedLive = false;
      let utrRef: string | null = null;
      let registeredBankName = holderName || "Merchant Partner";
      let statusNote =
        "Bank details saved for manual settlement — Cashfree ₹1 Penny Drop Verification Suite is not enabled yet.";

      if (clientId && clientSecret) {
        try {
          const cfRes = await fetch(`${verificationBaseUrl}/bank-account/sync`, {
            method: "POST",
            headers: {
              "x-client-id": clientId,
              "x-client-secret": clientSecret,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bank_account: cleanAcc,
              ifsc: cleanIfsc,
              name: holderName || "Trustit Partner",
              phone: phone || "9118643415",
            }),
            signal: AbortSignal.timeout(10000),
          });

          const cfData = await cfRes.json();
          if (cfRes.ok && (cfData.account_status === "VALID" || cfData.status === "SUCCESS")) {
            verifiedLive = true;
            utrRef = cfData.utr || cfData.reference_id || `UTR_${Date.now()}`;
            registeredBankName = cfData.name_at_bank || holderName || "Verified Partner";
            statusNote = "Live ₹1 IMPS penny drop confirmed by Cashfree NPCI gateway.";
          } else if (cfRes.status === 401 || cfRes.status === 403 || cfData.code === "authentication_failed") {
            statusNote =
              "Bank details saved for manual settlement — Cashfree Verification Suite (Penny Drop) is not enabled on your Cashfree account yet.";
          } else {
            statusNote = cfData.message || "Bank details saved for manual review.";
          }
        } catch {
          statusNote = "Gateway connection timeout. Bank details saved for manual review.";
        }
      }

      const updated = updateMerchantRemoteConfig({
        businessId: resolvedBizId,
        bankAccount: {
          accountNumberMask: mask,
          ifsc: cleanIfsc,
          holderName: registeredBankName,
          isVerified: verifiedLive,
          verifiedLive,
          utr: utrRef ?? undefined,
          updatedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        verifiedLive,
        message: verifiedLive
          ? `₹1.00 IMPS penny drop successful! Beneficiary: ${registeredBankName} (UTR: ${utrRef})`
          : `Bank details saved (${cleanIfsc}). ${statusNote}`,
        bankAccount: updated.bankAccount,
      });
    }

    // 17. Create Real Hyperlocal Order (for live testing with siren - disabled in production)
    if (action === "create_sample_order") {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, message: "Sample order injection is disabled in production." },
          { status: 403 }
        );
      }
      const sampleOrderId = `hord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const sampleItems = data?.items || [
        { name: "Special Shahi Paneer", quantity: 1, price: 240 },
        { name: "Butter Naan (2 pcs)", quantity: 2, price: 90 },
      ];
      const total = sampleItems.reduce(
        (acc: number, item: { price: number; quantity: number }) => acc + item.price * item.quantity,
        0
      );
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const { data: createdOrder, error } = await admin
        .from("hyperlocal_orders")
        .insert({
          id: sampleOrderId,
          business_id: resolvedBizId,
          customer_name: data?.customerName || "Aman Sharma",
          customer_phone: data?.customerPhone || "9118643415",
          customer_address: data?.customerAddress || "Civil Lines near Gandhi Park, Bahraich",
          order_type: "food_delivery",
          subtotal_amount: total,
          total_amount: total,
          payment_mode: "online_cashfree",
          payment_status: "paid",
          status: "placed",
          delivery_otp: deliveryOtp,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      for (const it of sampleItems) {
        await admin.from("hyperlocal_order_items").insert({
          order_id: sampleOrderId,
          item_name: it.name,
          quantity: it.quantity,
          unit_price: it.price,
          total_price: it.price * it.quantity,
          is_veg: true,
        });
      }

      return NextResponse.json({
        success: true,
        message: "New incoming order triggered with Cashfree UPI Paid status & Siren!",
        order: {
          ...createdOrder,
          items: sampleItems,
          delivery_otp: deliveryOtp,
        },
      });
    }

    return NextResponse.json({ success: false, message: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Error processing operation" },
      { status: 500 }
    );
  }
}
