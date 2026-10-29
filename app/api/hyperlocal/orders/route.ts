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

    if (action === "reject" || action === "cancel") {
      const admin = createSupabaseAdminClient();
      const now = new Date().toISOString();
      const { error } = await admin
        .from("hyperlocal_orders")
        .update({
          status: "rejected",
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
      delivery_riders:hyperlocal_orders_rider_id_fkey (id, full_name, phone, vehicle_type, vehicle_number, rating),
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
