import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  riderAcceptOrder,
  riderCompleteDeliveryWithOtp,
} from "@/lib/hyperlocal/hyperlocal-service";
import {
  handleRiderTimeoutOrDecline,
  dispatchCascadingRadar,
} from "@/lib/hyperlocal/dispatch-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get("riderId");
  const phone = searchParams.get("phone");

  const admin = createSupabaseAdminClient();
  let query = admin.from("delivery_riders").select("*");

  if (riderId) {
    query = query.eq("id", riderId);
  } else if (phone) {
    const clean = phone.replace(/\D/g, "").slice(-10);
    query = query.or(`phone.eq.${clean},phone.eq.+91${clean}`);
  } else {
    query = query.eq("id", "33333333-3333-4333-a333-333333333301");
  }

  const { data: rider, error: riderErr } = await query.maybeSingle();

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
    .eq("rider_id", rider.id)
    .in("status", ["rider_assigned", "picked_up", "out_for_delivery"])
    .maybeSingle();

  // Cascading proximity radar slot specifically targeted to this rider (must be paid or COD)
  const { data: targetedSlot } = await admin
    .from("hyperlocal_orders")
    .select(`
      *,
      hyperlocal_order_items (*),
      businesses (name, city, address, phone, location_latitude, location_longitude)
    `)
    .eq("dispatch_target_rider_id", rider.id)
    .is("rider_id", null)
    .or("payment_status.eq.paid,payment_mode.eq.cod")
    .maybeSingle();

  let incomingDispatchOrder = null;
  if (targetedSlot) {
    const expiryMs = new Date(targetedSlot.dispatch_expires_at || 0).getTime();
    if (expiryMs > Date.now()) {
      const secondsRemaining = Math.max(1, Math.round((expiryMs - Date.now()) / 1000));
      incomingDispatchOrder = {
        ...targetedSlot,
        secondsRemaining,
      };
    } else {
      // 30s Window expired! Auto-escalate to next nearest rider
      try {
        await handleRiderTimeoutOrDecline(targetedSlot.id, rider.id);
      } catch {
        // Non-blocking catch
      }
    }
  }

  // Available ready orders awaiting pickup within the city (only paid or COD)
  const { data: availableOrders } = await admin
    .from("hyperlocal_orders")
    .select(`
      *,
      hyperlocal_order_items (*),
      businesses (name, city, address, phone, location_latitude, location_longitude)
    `)
    .in("status", ["placed", "accepted_by_merchant", "ready_for_pickup"])
    .is("rider_id", null)
    .or("payment_status.eq.paid,payment_mode.eq.cod")
    .order("created_at", { ascending: false })
    .limit(5);

  return Response.json({
    rider,
    activeOrder: activeOrder || null,
    incomingOrder: incomingDispatchOrder || null,
    availableOrders: availableOrders || [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, riderId, orderId } = body;
    const admin = createSupabaseAdminClient();

    if (action === "login") {
      const cleanPhone = String(body.phone || "").replace(/\D/g, "").slice(-10);
      if (cleanPhone.length < 10) {
        return Response.json(
          { success: false, error: "Please enter a valid 10-digit mobile number." },
          { status: 400 },
        );
      }

      const { data: rider } = await admin
        .from("delivery_riders")
        .select("*")
        .or(`phone.eq.${cleanPhone},phone.eq.+91${cleanPhone}`)
        .maybeSingle();

      if (!rider) {
        return Response.json(
          {
            success: false,
            notRegistered: true,
            error: "Rider is not registered with this number. Please register as a new partner.",
          },
          { status: 404 },
        );
      }

      return Response.json({ success: true, rider });
    }

    if (action === "register") {
      const { fullName, phone, vehicleType, vehicleNumber } = body;
      const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);
      if (!fullName?.trim() || cleanPhone.length < 10) {
        return Response.json(
          { success: false, error: "Full Name and 10-digit mobile number are required." },
          { status: 400 },
        );
      }

      const { data: newRider, error: regError } = await admin
        .from("delivery_riders")
        .insert({
          full_name: fullName.trim(),
          phone: `+91${cleanPhone}`,
          vehicle_type: vehicleType || "bike",
          vehicle_number: (vehicleNumber || "UP-40-TEMP").toUpperCase().trim(),
          is_online: true,
          is_available: true,
          rating: 5.0,
        })
        .select()
        .single();

      if (regError) {
        return Response.json({ success: false, error: regError.message }, { status: 400 });
      }

      return Response.json({ success: true, rider: newRider });
    }

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

    if (action === "decline_order") {
      const res = await handleRiderTimeoutOrDecline(orderId, riderId);
      return Response.json({ success: true, nextDispatch: res });
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
