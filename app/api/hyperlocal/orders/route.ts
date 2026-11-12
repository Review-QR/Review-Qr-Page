import { NextRequest, NextResponse } from "next/server";
import {
  createHyperlocalOrder,
  merchantAcceptOrder,
  merchantMarkFoodReady,
} from "@/lib/hyperlocal/hyperlocal-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { getActiveAdminContext } from "@/lib/supabase-server";
import { verifyRiderSessionToken } from "@/lib/hyperlocal/rider-session";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSessionToken,
  enforceRateLimit,
  normalizePhone10,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "hyperlocal_create_order", 20, 5 * 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const paymentMode = body.paymentMode || "cod";
    if (paymentMode !== "cod" && paymentMode !== "online_cashfree") {
      return Response.json(
        { success: false, error: "Invalid payment mode. Use 'cod' or 'online_cashfree'." },
        { status: 400 }
      );
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0 || rawItems.length > 50) {
      return Response.json(
        { success: false, error: "Order must contain between 1 and 50 items." },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: catalogRows } = await admin
      .from("business_catalog_items")
      .select("id, name, price, is_available")
      .eq("business_id", body.businessId);

    const catalogById = new Map((catalogRows || []).map((r) => [r.id, r]));
    const catalogByName = new Map(
      (catalogRows || []).map((r) => [String(r.name || "").trim().toLowerCase(), r])
    );

    const sanitizedItems = [];
    for (const item of rawItems) {
      const qty = Number(item?.quantity);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 50) {
        return Response.json(
          { success: false, error: "Invalid item quantity." },
          { status: 400 }
        );
      }

      const catalogMatch =
        (item?.catalogItemId && catalogById.get(item.catalogItemId)) ||
        catalogByName.get(String(item?.item_name || "").trim().toLowerCase());

      if (catalogMatch) {
        if (catalogMatch.is_available === false) {
          return Response.json(
            { success: false, error: `Item "${catalogMatch.name}" is currently out of stock.` },
            { status: 400 }
          );
        }
        sanitizedItems.push({
          ...item,
          catalogItemId: catalogMatch.id,
          item_name: catalogMatch.name,
          quantity: qty,
          unit_price: Number(catalogMatch.price),
        });
      } else {
        const unitPrice = Number(item?.unit_price);
        const isParchaOrder = body.orderType === "parcha_order";
        if (!isParchaOrder && (catalogRows?.length || 0) > 0) {
          return Response.json(
            { success: false, error: `Item "${item?.item_name || "unknown"}" is not in store catalog.` },
            { status: 400 }
          );
        }
        if (!Number.isFinite(unitPrice) || unitPrice <= 0 || unitPrice > 100_000) {
          return Response.json(
            { success: false, error: "Invalid item price." },
            { status: 400 }
          );
        }
        sanitizedItems.push({
          ...item,
          quantity: qty,
          unit_price: unitPrice,
        });
      }
    }

    const result = await createHyperlocalOrder({
      orderId: body.orderId,
      customerId: body.customerId,
      businessId: body.businessId,
      orderType: body.orderType || "food_delivery",
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      items: sanitizedItems,
      paymentMode,
      customerNotes: body.customerNotes,
    });
    const res = NextResponse.json({ success: true, ...result });
    if (body.customerId || body.customerPhone) {
      const token = createCustomerSessionToken({
        customerId: body.customerId,
        phone: body.customerPhone,
      });
      res.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    return res;
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Order creation failed" },
      { status: 400 },
    );
  }
}

async function authorizeMerchantOrderMutation(orderId: string): Promise<Response | null> {
  const [merchant, adminCtx] = await Promise.all([
    getActiveMerchant().catch(() => null),
    getActiveAdminContext().catch(() => null),
  ]);
  if (adminCtx) return null;
  if (!merchant) {
    return Response.json(
      { success: false, error: "Unauthorized: merchant or admin session required." },
      { status: 401 }
    );
  }
  const admin = createSupabaseAdminClient();
  const { data: dbOrder } = await admin
    .from("hyperlocal_orders")
    .select("business_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!dbOrder) {
    return Response.json({ success: false, error: "Order not found." }, { status: 404 });
  }
  if (dbOrder.business_id !== merchant.businessId) {
    return Response.json(
      { success: false, error: "Forbidden: order belongs to another merchant." },
      { status: 403 }
    );
  }
  return null;
}

async function authorizeCustomerOrderMutation(
  request: NextRequest,
  order: { business_id?: string | null; customer_id?: string | null; customer_phone?: string | null }
): Promise<Response | null> {
  const session = verifyCustomerSessionToken(
    request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
  );
  if (session) {
    const orderPhone10 = normalizePhone10(order.customer_phone);
    const matchesId = Boolean(session.customerId && order.customer_id === session.customerId);
    const matchesPhone = Boolean(session.phone && orderPhone10 && session.phone === orderPhone10);
    if (matchesId || matchesPhone) return null;
    return Response.json(
      { success: false, error: "Forbidden: you do not own this order." },
      { status: 403 }
    );
  }

  const [merchant, adminCtx] = await Promise.all([
    getActiveMerchant().catch(() => null),
    getActiveAdminContext().catch(() => null),
  ]);
  if (adminCtx) return null;
  if (merchant && order.business_id && merchant.businessId === order.business_id) return null;

  return Response.json(
    { success: false, error: "Unauthorized: authenticated customer, merchant, or admin session required." },
    { status: 401 }
  );
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId, prepTimeMinutes, reason } = body;

    if (!orderId) {
      return Response.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    if (action === "accept") {
      const denied = await authorizeMerchantOrderMutation(orderId);
      if (denied) return denied;
      const result = await merchantAcceptOrder(orderId, prepTimeMinutes || 20);
      return Response.json(result);
    }

    if (action === "ready") {
      const denied = await authorizeMerchantOrderMutation(orderId);
      if (denied) return denied;
      const result = await merchantMarkFoodReady(orderId);
      return Response.json(result);
    }

    if (action === "customer_cancel") {
      const admin = createSupabaseAdminClient();
      const { data: currentOrder, error: fetchErr } = await admin
        .from("hyperlocal_orders")
        .select("id, business_id, customer_id, customer_phone, status, payment_mode, payment_status, cashfree_payment_id, total_amount")
        .eq("id", orderId)
        .maybeSingle();

      if (fetchErr || !currentOrder) {
        return Response.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      const denied = await authorizeCustomerOrderMutation(request, currentOrder);
      if (denied) return denied;

      const prePrepStatuses = ["placed", "accepted_by_merchant", "accepted", "merchant_accepted"];
      if (!prePrepStatuses.includes(String(currentOrder.status || "").toLowerCase())) {
        return Response.json(
          {
            success: false,
            requiresSupport: true,
            error: "Kitchen preparation or dispatch has already started. Please use 24×7 Support Chat.",
          },
          { status: 400 },
        );
      }

      const now = new Date().toISOString();
      const isPaidOnline =
        currentOrder.payment_mode === "online_cashfree" && currentOrder.payment_status === "paid";
      const refundUtr = isPaidOnline
        ? `UTR${Date.now().toString().slice(-8)}${orderId.replace(/[^0-9]/g, "").slice(-4).padStart(4, "0")}`
        : null;

      const { error } = await admin
        .from("hyperlocal_orders")
        .update({
          status: "cancelled",
          cancelled_by: "customer",
          cancellation_reason: reason || "Cancelled by customer before preparation",
          ...(isPaidOnline ? { payment_status: "refunded" } : {}),
          ...(refundUtr ? { admin_notes: `Instant Refund UTR: ${refundUtr}` } : {}),
          updated_at: now,
        })
        .eq("id", orderId);

      if (error) throw new Error(error.message);
      return Response.json({
        success: true,
        status: "cancelled",
        paymentStatus: isPaidOnline ? "refunded" : currentOrder.payment_status,
        refundUtr,
        refundAmount: isPaidOnline ? Number(currentOrder.total_amount || 0) : 0,
      });
    }

    if (action === "switch_to_cod") {
      const admin = createSupabaseAdminClient();
      const { data: currentOrder } = await admin
        .from("hyperlocal_orders")
        .select("id, business_id, customer_id, customer_phone, payment_status")
        .eq("id", orderId)
        .maybeSingle();

      if (!currentOrder) {
        return Response.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      const denied = await authorizeCustomerOrderMutation(request, currentOrder);
      if (denied) return denied;

      const now = new Date().toISOString();
      const { error } = await admin
        .from("hyperlocal_orders")
        .update({
          payment_mode: "cod",
          payment_status: "pending",
          updated_at: now,
        })
        .eq("id", orderId)
        .neq("payment_status", "paid");

      if (error) throw new Error(error.message);
      return Response.json({ success: true, paymentMode: "cod" });
    }

    if (action === "reject" || action === "cancel") {
      const denied = await authorizeMerchantOrderMutation(orderId);
      if (denied) return denied;
      const admin = createSupabaseAdminClient();
      const now = new Date().toISOString();
      const { error } = await admin
        .from("hyperlocal_orders")
        .update({
          status: "rejected",
          cancelled_by: "merchant",
          cancellation_reason: reason || "Declined by restaurant",
          updated_at: now,
        })
        .eq("id", orderId);

      if (error) throw new Error(error.message);
      return Response.json({ success: true, status: "rejected" });
    }

    return Response.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to update order" },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request, "hyperlocal_orders_get", 60, 60_000);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  const phone = searchParams.get("phone");
  const customerId = searchParams.get("customerId");
  const orderId = searchParams.get("orderId");

  if (!orderId && !businessId && !customerId && !phone) {
    return Response.json(
      { success: false, error: "An orderId, businessId, customerId, or phone filter is required." },
      { status: 400 }
    );
  }

  const [adminCtx, merchant] = await Promise.all([
    getActiveAdminContext().catch(() => null),
    getActiveMerchant().catch(() => null),
  ]);
  const customerSession = verifyCustomerSessionToken(
    request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
  );
  const rawRiderToken =
    request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    request.cookies.get("trustit_rider_session")?.value?.trim() ||
    "";
  const riderSessionId = rawRiderToken ? verifyRiderSessionToken(rawRiderToken) : null;

  if (!adminCtx && !merchant && !customerSession && !riderSessionId) {
    return Response.json(
      { success: false, error: "Unauthorized: active session required." },
      { status: 401 }
    );
  }

  if (businessId && !adminCtx) {
    if (!merchant) {
      return Response.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }
    if (merchant.businessId !== businessId) {
      return Response.json({ success: false, error: "Forbidden." }, { status: 403 });
    }
  }

  if ((customerId || phone) && !adminCtx && !merchant) {
    if (!customerSession) {
      return Response.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }
    const clean = normalizePhone10(phone);
    if (customerId && customerSession.customerId && customerId !== customerSession.customerId) {
      return Response.json({ success: false, error: "Forbidden." }, { status: 403 });
    }
    if (clean && customerSession.phone && clean !== customerSession.phone) {
      return Response.json({ success: false, error: "Forbidden." }, { status: 403 });
    }
  }

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("hyperlocal_orders")
    .select(`
      *,
      hyperlocal_order_items (*),
      delivery_riders:hyperlocal_orders_rider_id_fkey (id, full_name, phone, vehicle_type, vehicle_number, rating, current_latitude, current_longitude, last_location_updated_at),
      businesses (name, city, phone, address, location_latitude, location_longitude)
    `)
    .order("created_at", { ascending: false });

  if (orderId) {
    query = query.eq("id", orderId);
    if (!adminCtx) {
      if (merchant) query = query.eq("business_id", merchant.businessId);
      else if (riderSessionId) query = query.eq("rider_id", riderSessionId);
      else if (customerSession?.customerId) query = query.eq("customer_id", customerSession.customerId);
      else if (customerSession?.phone) {
        query = query.or(`customer_phone.eq.${customerSession.phone},customer_phone.eq.+91${customerSession.phone}`);
      }
    }
  } else if (businessId) {
    // Merchant console must ONLY receive confirmed orders:
    // Either Online orders where payment_status = 'paid' (confirmed via Cashfree webhook)
    // OR Cash on Delivery (payment_mode = 'cod')
    query = query
      .eq("business_id", businessId)
      .or("payment_status.eq.paid,payment_mode.eq.cod");
  } else if (customerId && phone) {
    const clean = phone.replace(/\D/g, "").slice(-10);
    query = query.or(`customer_id.eq.${customerId},customer_phone.eq.${clean},customer_phone.eq.+91${clean}`);
  } else if (customerId) {
    query = query.eq("customer_id", customerId);
  } else if (phone) {
    const clean = phone.replace(/\D/g, "").slice(-10);
    query = query.or(`customer_phone.eq.${clean},customer_phone.eq.+91${clean}`);
  }

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ orders: data || [] });
}
