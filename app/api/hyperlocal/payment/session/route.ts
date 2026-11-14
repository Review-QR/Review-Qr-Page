import { createCashfreeHyperlocalPaymentOrder } from "@/lib/hyperlocal/cashfree-hyperlocal-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { enforceRateLimit } from "@/lib/auth-api-guards";
import { generateHyperlocalDraftId, isValidHyperlocalPaymentReference } from "@/lib/hyperlocal/order-id";
import { assertBusinessAcceptingOrders } from "@/lib/hyperlocal/hyperlocal-service";

export const dynamic = "force-dynamic";

function resolveSafeCashfreeReturnUrl(orderId: string, rawReturnUrl: unknown, fromAppFlag: unknown): string {
  let isFromApp = fromAppFlag === true || fromAppFlag === "1";

  const canonical = new URL("https://trustitreview.com/pay/cashfree");
  canonical.searchParams.set("order_id", orderId);
  canonical.searchParams.set("returned", "1");

  if (typeof rawReturnUrl === "string" && rawReturnUrl.trim()) {
    try {
      const parsed = new URL(rawReturnUrl.trim());
      if (parsed.searchParams.get("fromApp") === "1") {
        isFromApp = true;
      }
      const isProd = process.env.NODE_ENV === "production";
      const allowedHost =
        parsed.hostname === "trustitreview.com" ||
        parsed.hostname === "www.trustitreview.com" ||
        (!isProd && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1"));
      const allowedProto = parsed.protocol === "https:" || (!isProd && parsed.protocol === "http:");
      if (allowedHost && allowedProto && (parsed.pathname === "/pay/cashfree" || parsed.pathname === "/order")) {
        if (isFromApp) {
          parsed.searchParams.set("fromApp", "1");
        }
        return parsed.toString();
      }
    } catch {
      // Fall back to safe canonical return URL below
    }
  }

  if (isFromApp) {
    canonical.searchParams.set("fromApp", "1");
  }
  return canonical.toString();
}

export async function POST(request: Request) {
  try {
    const rateLimited = enforceRateLimit(request, "hyperlocal_payment_session", 20, 10 * 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const {
      orderId: inputOrderId,
      businessId,
      businessName,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerNotes,
      orderType,
      items,
      returnUrl,
      fromApp,
      isRetry,
    } = body;

    if (!businessId) {
      return Response.json(
        { success: false, error: "Missing required businessId." },
        { status: 400 },
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      (!process.env.CASHFREE_CLIENT_ID?.trim() || !process.env.CASHFREE_CLIENT_SECRET?.trim())
    ) {
      return Response.json(
        { success: false, error: "Payment gateway is not configured." },
        { status: 503 }
      );
    }

    const admin = createSupabaseAdminClient();
    let orderId = inputOrderId;
    let authoritativeAmount = 0;
    let effectiveBusinessName = businessName;

    let existingCfOrderId: string | undefined = undefined;

    // PATH A: Checkout with cart items directly (Strict Zero-Fake-Orders pre-payment flow)
    if (!orderId && Array.isArray(items) && items.length > 0) {
      const { data: business, error: bizError } = await admin
        .from("businesses")
        .select("id, name, city, type, phone, deleted_at, merchant_status, is_outlet_open, allow_taking_orders, is_taking_orders")
        .eq("id", businessId)
        .maybeSingle();

      if (bizError || !business) {
        return Response.json({ success: false, error: "Business not found." }, { status: 404 });
      }
      assertBusinessAcceptingOrders(business);
      effectiveBusinessName = business.name || businessName || "Bahraich Partner";

      const { data: catalogRows } = await admin
        .from("business_catalog_items")
        .select("id, name, price, is_available")
        .eq("business_id", businessId);

      const catalogPriceMap = new Map((catalogRows || []).map((ci) => [ci.name.trim().toLowerCase(), Number(ci.price)]));
      const catalogById = new Map((catalogRows || []).map((r) => [r.id, r]));

      let subtotal = 0;
      const sanitizedItems = [];
      for (const item of items) {
        const itemName = String(item.item_name || item.itemName || "Item").trim();
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const matchedCatalog = (item.catalogItemId && catalogById.get(item.catalogItemId));
        const catalogPrice = matchedCatalog ? Number(matchedCatalog.price) : (itemName ? catalogPriceMap.get(itemName.toLowerCase()) : undefined);
        const rawPrice = Number(item.unit_price ?? item.unitPrice ?? 0);
        const price = typeof catalogPrice === "number" && catalogPrice > 0 ? catalogPrice : Math.max(0, rawPrice);
        const itemTotal = Math.round(qty * price * 100) / 100;
        subtotal += itemTotal;
        sanitizedItems.push({
          catalog_item_id: item.catalogItemId || item.catalog_item_id || null,
          item_name: itemName,
          quantity: qty,
          unit_price: price,
          total_price: itemTotal,
          is_veg: item.is_veg ?? item.isVeg ?? true,
          notes: item.notes || null,
        });
      }

      const isDelivery = (orderType || "food_delivery") === "food_delivery" || orderType === "grocery_parcha" || orderType === "parcel_pickup";
      const deliveryFee = isDelivery ? (subtotal >= 499 ? 0 : 35) : 0;
      const platformFee = 5;
      authoritativeAmount = Math.round((subtotal + deliveryFee + platformFee) * 100) / 100;

      orderId = generateHyperlocalDraftId();

      const { error: draftInsertErr } = await admin
        .from("hyperlocal_checkout_drafts")
        .insert({
          id: orderId,
          business_id: businessId,
          customer_name: customerName || "Trustit Customer",
          customer_phone: customerPhone || "9876543210",
          customer_address: customerAddress || {},
          customer_notes: customerNotes || null,
          order_type: orderType || "food_delivery",
          items: sanitizedItems,
          subtotal,
          delivery_fee: deliveryFee,
          platform_fee: platformFee,
          total_amount: authoritativeAmount,
          payment_status: "pending",
        });

      if (draftInsertErr) {
        throw new Error(`Failed to create checkout session: ${draftInsertErr.message}`);
      }
    } else if (orderId && String(orderId).startsWith("cdraft_")) {
      const { data: dbDraft } = await admin
        .from("hyperlocal_checkout_drafts")
        .select("id, business_id, total_amount, payment_status, placed_order_id, cashfree_session_id, cashfree_order_id")
        .eq("id", orderId)
        .maybeSingle();

      if (!dbDraft) {
        return Response.json({ success: false, error: "Checkout draft session not found." }, { status: 404 });
      }
      if (dbDraft.placed_order_id || dbDraft.payment_status === "paid") {
        return Response.json({ success: false, error: "Order is already paid." }, { status: 400 });
      }
      authoritativeAmount = Number(dbDraft.total_amount);
      existingCfOrderId = dbDraft.cashfree_order_id || undefined;
    } else if (orderId) {
      const { data: dbOrder } = await admin
        .from("hyperlocal_orders")
        .select("id, business_id, total_amount, payment_status")
        .eq("id", orderId)
        .maybeSingle();

      if (!dbOrder) {
        return Response.json({ success: false, error: "Order not found." }, { status: 404 });
      }
      if (dbOrder.business_id !== businessId) {
        return Response.json({ success: false, error: "Order business mismatch." }, { status: 403 });
      }
      if (dbOrder.payment_status === "paid") {
        return Response.json({ success: false, error: "Order is already paid." }, { status: 400 });
      }
      authoritativeAmount = Number(dbOrder.total_amount);
    } else {
      return Response.json(
        { success: false, error: "Missing required order fields (items or orderId, businessId)." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(authoritativeAmount) || authoritativeAmount <= 0) {
      return Response.json({ success: false, error: "Invalid authoritative order amount." }, { status: 400 });
    }

    const safeReturnUrl = resolveSafeCashfreeReturnUrl(String(orderId), returnUrl, fromApp);

    const result = await createCashfreeHyperlocalPaymentOrder({
      orderId,
      cashfreeOrderId: isRetry ? undefined : existingCfOrderId,
      forceNewAttempt: Boolean(isRetry),
      amount: authoritativeAmount,
      businessId,
      businessName: effectiveBusinessName,
      customerName,
      customerPhone,
      customerEmail,
      returnUrl: safeReturnUrl,
    });

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: result.httpStatus || 400 });
    }

    if (String(orderId).startsWith("cdraft_")) {
      await admin
        .from("hyperlocal_checkout_drafts")
        .update({
          cashfree_order_id: result.orderId,
          cashfree_session_id: result.paymentSessionId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    return Response.json({
      ...result,
      draftId: String(orderId).startsWith("cdraft_") ? orderId : undefined,
    });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Payment session creation failed." },
      { status: 500 },
    );
  }
}
