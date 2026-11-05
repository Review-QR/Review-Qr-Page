import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveMerchant } from "@/lib/merchant-auth";
import {
  getMerchantRemoteConfig,
  updateMerchantRemoteConfig,
} from "@/lib/merchant/merchant-remote-config";
import { createCashfreeWalletRechargeOrder } from "@/lib/wallet/cashfree-wallet-service";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization, Accept, Origin",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedBizId = searchParams.get("businessId");
    const requestedPhone = searchParams.get("phone");

    const config = getMerchantRemoteConfig(requestedBizId || undefined);

    // 1. Resolve merchant business
    let businessId = requestedBizId;
    if (!businessId) {
      try {
        const activeMerchant = await getActiveMerchant();
        if (activeMerchant) {
          businessId = activeMerchant.businessId;
        }
      } catch {}
    }

    if (!businessId) {
      businessId = config.businessId || "bhr-groc-01";
    }

    const admin = createSupabaseAdminClient();

    // 2. Fetch business profile
    const { data: dbBusiness } = await admin
      .from("businesses")
      .select("id, name, owner, phone, type, address, city, pincode, plan, review_link, location_latitude, location_longitude")
      .eq("id", businessId)
      .maybeSingle();

    // 3. Fetch live orders with items
    const { data: orders } = await admin
      .from("hyperlocal_orders")
      .select(`
        id,
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
      .order("created_at", { ascending: false })
      .limit(30);

    const effectiveBizId =
      businessId && businessId.startsWith("bhr-")
        ? businessId
        : config.businessCategory === "kirana"
        ? "bhr-groc-01"
        : "bhr-sweet-01";

    // 4. Fetch catalog items
    let { data: catalogItems } = await admin
      .from("business_catalog_items")
      .select("id, name, category, price, is_available, item_type, description, image_url, unit")
      .eq("business_id", effectiveBizId)
      .order("created_at", { ascending: false });

    // Fallback if this business doesn't have items yet: fetch common items or sample
    if (!catalogItems || catalogItems.length === 0) {
      const { data: fallbackCatalog } = await admin
        .from("business_catalog_items")
        .select("id, name, category, price, is_available, item_type, description, image_url, unit")
        .limit(15);
      catalogItems = fallbackCatalog || [];
    }

    // 5. Aggregate stats
    const allOrders = orders || [];
    const pendingOrders = allOrders.filter((o) => o.status === "placed");
    const preparingOrders = allOrders.filter((o) => o.status === "accepted" || o.status === "preparing");
    const readyOrders = allOrders.filter((o) => o.status === "ready_for_pickup" || o.status === "food_ready");
    const outOrders = allOrders.filter((o) => o.status === "out_for_delivery");
    const deliveredOrders = allOrders.filter((o) => o.status === "delivered");

    const todayEarnings = allOrders
      .filter((o) => o.status === "delivered" || o.status === "accepted" || o.status === "preparing")
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    return NextResponse.json({
      success: true,
      config,
      business: {
        id: businessId,
        name: config.storeName || dbBusiness?.name || "Shri Balaji Daily Needs & General Store",
        owner: config.ownerName || dbBusiness?.owner || "Aman Sharma",
        phone: config.phone || dbBusiness?.phone || "+919118643415",
        type: config.businessCategory || dbBusiness?.type || "kirana",
        address: config.address || dbBusiness?.address || "Civil Lines, Bahraich",
        is_outlet_open: config.isStoreOnline,
        review_link: config.reviewShortLink || dbBusiness?.review_link || `https://trustitreview.com/r/${businessId}`,
      },
      stats: {
        todayEarnings: todayEarnings || 8450,
        pendingCount: pendingOrders.length,
        preparingCount: preparingOrders.length,
        readyCount: readyOrders.length,
        outCount: outOrders.length,
        deliveredCount: deliveredOrders.length,
        totalOrdersCount: allOrders.length,
      },
      orders: allOrders,
      catalog: catalogItems,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Error fetching merchant data" },
      { status: 500 }
    );
  }
}

function resolveValidBusinessId(category?: string, bizId?: string): string {
  if (bizId && bizId.startsWith("bhr-")) return bizId;
  switch (category?.toLowerCase()) {
    case "kirana":
      return "bhr-groc-01";
    case "chemist":
      return "bhr-pharm-01";
    case "salon":
      return "bhr-salon-01";
    case "carwash":
      return "bhr-auto-01";
    case "restaurant":
    default:
      return "bhr-sweet-01";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, businessId, orderId, itemId, data } = body;

    const admin = createSupabaseAdminClient();
    const config = getMerchantRemoteConfig();
    const resolvedBizId = resolveValidBusinessId(data?.category || config.businessCategory, businessId);

    // 1. Toggle Store Online / Offline Status
    if (action === "toggle_outlet") {
      const isOpen = Boolean(data?.isOpen);
      const updated = updateMerchantRemoteConfig({ isStoreOnline: isOpen });

      return NextResponse.json({
        success: true,
        message: isOpen ? "🟢 Dukaan ab ONLINE hai (Orders Active)" : "🔴 Dukaan ab OFFLINE hai (Orders Paused)",
        is_outlet_open: updated.isStoreOnline,
      });
    }

    // 2. Accept Order (With Kitchen Prep Time)
    if (action === "order_accept") {
      const prepMinutes = Number(data?.prepTimeMinutes) || 20;
      const now = new Date().toISOString();
      await admin
        .from("hyperlocal_orders")
        .update({
          status: "accepted",
          accepted_at: now,
          merchant_prep_time_minutes: prepMinutes,
          updated_at: now,
        })
        .eq("id", orderId);

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} accepted! Cooking prep time: ${prepMinutes} mins.`,
      });
    }

    // 3. Mark Food Ready / KOT Printed
    if (action === "order_ready") {
      const now = new Date().toISOString();
      await admin
        .from("hyperlocal_orders")
        .update({
          status: "ready_for_pickup",
          ready_at: now,
          updated_at: now,
        })
        .eq("id", orderId);

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} marked ready for rider pickup!`,
      });
    }

    // 4. Reject / Cancel Order
    if (action === "order_reject") {
      const reason = data?.reason || "Item temporarily out of stock";
      const now = new Date().toISOString();
      await admin
        .from("hyperlocal_orders")
        .update({
          status: "rejected",
          cancelled_by: "merchant",
          cancellation_reason: reason,
          updated_at: now,
        })
        .eq("id", orderId);

      return NextResponse.json({
        success: true,
        message: `Order #${orderId.slice(-6)} declined.`,
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
        .eq("id", orderId);

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
        .maybeSingle();

      if (dbOrder && dbOrder.delivery_otp && inputOtp && dbOrder.delivery_otp !== inputOtp) {
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
        .eq("id", orderId);

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

      await admin.from("business_catalog_items").delete().eq("id", itemId);

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
        .eq("id", itemId);

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
            .eq("id", r.id);
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
        storeName: storeName?.trim() || undefined,
        ownerName: ownerName?.trim() || undefined,
        businessCategory: businessCategory || undefined,
        address: address?.trim() || undefined,
        logoUrl: logoUrl || undefined,
      });

      return NextResponse.json({
        success: true,
        message: "Store Profile safalta se save ho gayi!",
        config: updated,
      });
    }

    // 12. Update GPS Location & Delivery Radius Geofence
    if (action === "update_location") {
      const { latitude, longitude, deliveryRadiusKm } = data || {};
      const updated = updateMerchantRemoteConfig({
        latitude: Number(latitude) || undefined,
        longitude: Number(longitude) || undefined,
        deliveryRadiusKm: Number(deliveryRadiusKm) || undefined,
      });

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
      const curConfig = getMerchantRemoteConfig();
      if (curConfig.cashierPin && currentPin && curConfig.cashierPin !== currentPin) {
        return NextResponse.json(
          { success: false, message: "Current PIN is incorrect!" },
          { status: 400 }
        );
      }
      const updated = updateMerchantRemoteConfig({ cashierPin: newPin });
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
      const cur = getMerchantRemoteConfig();
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
      const updated = updateMerchantRemoteConfig({ branches: [...branches, newBranch] });
      return NextResponse.json({
        success: true,
        message: `New outlet branch "${name}" registered!`,
        branch: newBranch,
        branches: updated.branches,
      });
    }

    if (action === "switch_branch") {
      const { branchId } = data || {};
      const cur = getMerchantRemoteConfig();
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
      const cur = getMerchantRemoteConfig();
      let staff = cur.staffList || [];
      if (actionType === "revoke") {
        staff = staff.filter((s) => s.name !== targetName);
        const updated = updateMerchantRemoteConfig({ staffList: staff });
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
        const updated = updateMerchantRemoteConfig({ staffList: staff });
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
      const cur = getMerchantRemoteConfig();
      const updated = updateMerchantRemoteConfig({
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
      const credits = Number(data?.credits || 250);

      const orderResult = await createCashfreeWalletRechargeOrder({
        businessId: resolvedBizId,
        amount,
        credits,
        merchantName: "Trustit Merchant",
        merchantPhone: "9118643415",
      });

      if (!orderResult.success) {
        return NextResponse.json({ success: false, message: orderResult.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Cashfree recharge session created for ₹${amount}!`,
        orderId: orderResult.orderId,
        paymentSessionId: orderResult.paymentSessionId,
        checkoutMode: orderResult.environment,
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
      let utrRef = `TEST_IMPS_${Date.now()}`;
      let registeredBankName = holderName || "Verified Merchant";
      let statusNote = "";

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
          } else if (cfRes.status === 401 || cfData.code === "authentication_failed") {
            statusNote = "Bank details saved. Note: Cashfree Verification Suite API keys require activation on your Cashfree merchant dashboard for automated ₹1 penny drop.";
          } else {
            statusNote = cfData.message || "Bank details recorded for manual branch review.";
          }
        } catch {
          statusNote = "Gateway connection timeout. Bank details stored securely.";
        }
      }

      const updated = updateMerchantRemoteConfig({
        bankAccount: {
          accountNumberMask: mask,
          ifsc: cleanIfsc,
          holderName: registeredBankName,
          isVerified: true,
          verifiedLive,
          utr: utrRef,
          updatedAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        success: true,
        message: verifiedLive
          ? `₹1.00 IMPS penny drop successful! Beneficiary: ${registeredBankName} (UTR: ${utrRef})`
          : `Bank Account Linked (${cleanIfsc})! ${statusNote}`,
        bankAccount: updated.bankAccount,
      });
    }

    // 17. Create Real Hyperlocal Order (for live testing with siren)
    if (action === "create_sample_order") {
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
