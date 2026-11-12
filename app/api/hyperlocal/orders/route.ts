import {
  createHyperlocalOrder,
  merchantAcceptOrder,
  merchantMarkFoodReady,
} from "@/lib/hyperlocal/hyperlocal-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createHyperlocalOrder({
      orderId: body.orderId,
      customerId: body.customerId,
      businessId: body.businessId,
      orderType: body.orderType || "food_delivery",
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      items: body.items || [],
      paymentMode: body.paymentMode || "cod",
      customerNotes: body.customerNotes,
    });
    return Response.json({ success: true, ...result });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Order creation failed" },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, prepTimeMinutes, reason } = body;

    if (!orderId) {
      return Response.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    if (action === "accept") {
      const result = await merchantAcceptOrder(orderId, prepTimeMinutes || 20);
      return Response.json(result);
    }

    if (action === "ready") {
      const result = await merchantMarkFoodReady(orderId);
      return Response.json(result);
    }

    if (action === "customer_cancel") {
      const admin = createSupabaseAdminClient();
      const { data: currentOrder, error: fetchErr } = await admin
        .from("hyperlocal_orders")
        .select("id, status, payment_mode, payment_status, cashfree_payment_id, total_amount")
        .eq("id", orderId)
        .maybeSingle();

      if (fetchErr || !currentOrder) {
        return Response.json({ success: false, error: "Order not found" }, { status: 404 });
      }

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  const phone = searchParams.get("phone");
  const customerId = searchParams.get("customerId");
  const orderId = searchParams.get("orderId");

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

  if (orderId) query = query.eq("id", orderId);
  else if (businessId) {
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
  } else {
    query = query.limit(20);
  }

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ orders: data || [] });
}
