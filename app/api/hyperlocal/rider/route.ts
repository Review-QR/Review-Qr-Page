import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  riderAcceptOrder,
  riderCompleteDeliveryWithOtp,
} from "@/lib/hyperlocal/hyperlocal-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get("riderId") || "33333333-3333-4333-a333-333333333301";

  const admin = createSupabaseAdminClient();

  const { data: rider, error: riderErr } = await admin
    .from("delivery_riders")
    .select("*")
    .eq("id", riderId)
    .maybeSingle();

  if (riderErr || !rider) {
    return Response.json({ error: "Rider not found" }, { status: 404 });
  }

  // Active assigned order (if any)
  const { data: activeOrder } = await admin
    .from("hyperlocal_orders")
    .select(`
      *,
      hyperlocal_order_items (*),
      businesses (name, city, address, phone, location_latitude, location_longitude)
    `)
    .eq("rider_id", riderId)
    .in("status", ["rider_assigned", "picked_up", "out_for_delivery"])
    .maybeSingle();

  // Available ready orders awaiting pickup within the city
  const { data: availableOrders } = await admin
    .from("hyperlocal_orders")
    .select(`
      *,
      hyperlocal_order_items (*),
      businesses (name, city, address, phone, location_latitude, location_longitude)
    `)
    .in("status", ["placed", "accepted_by_merchant", "ready_for_pickup"])
    .is("rider_id", null)
    .order("created_at", { ascending: false })
    .limit(5);

  return Response.json({
    rider,
    activeOrder: activeOrder || null,
    availableOrders: availableOrders || [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, riderId, orderId } = body;
    const admin = createSupabaseAdminClient();

    if (action === "update_gps") {
      const { latitude, longitude } = body;
      await admin
        .from("delivery_riders")
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
          last_location_updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      return Response.json({ success: true });
    }

    if (action === "toggle_online") {
      const { isOnline } = body;
      await admin
        .from("delivery_riders")
        .update({
          is_online: Boolean(isOnline),
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      return Response.json({ success: true, isOnline: Boolean(isOnline) });
    }

    if (action === "accept_order") {
      const res = await riderAcceptOrder(orderId, riderId);
      return Response.json(res);
    }

    if (action === "pickup_order") {
      await admin
        .from("hyperlocal_orders")
        .update({
          status: "picked_up",
          picked_up_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return Response.json({ success: true });
    }

    if (action === "deliver_with_otp") {
      const { otp } = body;
      const res = await riderCompleteDeliveryWithOtp(orderId, riderId, otp);
      return Response.json(res);
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Rider action failed" },
      { status: 400 },
    );
  }
}
