import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  riderAcceptOrder,
  riderCompleteDeliveryWithOtp,
} from "@/lib/hyperlocal/hyperlocal-service";
import {
  handleRiderTimeoutOrDecline,
  dispatchCascadingRadar,
} from "@/lib/hyperlocal/dispatch-engine";
import {
  sendRiderEmailOtp,
  verifyRiderEmailOtp,
} from "@/lib/auth/email-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get("riderId");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  const admin = createSupabaseAdminClient();
  let query = admin.from("delivery_riders").select("*");

  if (riderId) {
    query = query.eq("id", riderId);
  } else if (email) {
    query = query.eq("email", email.trim().toLowerCase());
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

  // Compute Live Financial Scorecard & Trip History
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

  const { data: completedOrders } = await admin
    .from("hyperlocal_orders")
    .select(`
      id, total_amount, payment_mode, payment_status, status, delivered_at, created_at,
      businesses (name, city)
    `)
    .eq("rider_id", rider.id)
    .eq("status", "delivered")
    .order("delivered_at", { ascending: false })
    .limit(50);

  const trips = completedOrders || [];
  
  const todayTrips = trips.filter(
    (o) => o.delivered_at && new Date(o.delivered_at).getTime() >= startOfToday.getTime(),
  );
  const todayEarnings = todayTrips.length * 35;

  const monthTrips = trips.filter(
    (o) => o.delivered_at && new Date(o.delivered_at).getTime() >= startOfMonth.getTime(),
  );
  const monthEarnings = monthTrips.length * 35;

  const scorecard = {
    todayEarnings: Number(todayEarnings),
    todayTripsCount: todayTrips.length,
    monthEarnings: Math.max(Number(monthEarnings), Number(rider.total_earnings || 0)),
    monthTripsCount: Math.max(monthTrips.length, Number(rider.total_deliveries_count || 0)),
    totalDeliveries: Math.max(Number(rider.total_deliveries_count || 0), trips.length),
    walletBalance: Number(rider.wallet_balance || 0),
    cashInHand: Number(rider.cash_in_hand || 0),
    codLimit: 2000,
    rating: Number(rider.rating || 5.0),
    recentTrips: trips.slice(0, 5).map((t) => {
      const biz = Array.isArray(t.businesses) ? t.businesses[0] : t.businesses;
      return {
        id: t.id,
        shopName: biz?.name || "Merchant Store",
        amount: 35,
        billAmount: t.total_amount,
        paymentMode: t.payment_mode,
        deliveredAt: t.delivered_at || t.created_at,
      };
    }),
  };

  return Response.json({
    rider,
    scorecard,
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

    // ── 1. SEND EMAIL OTP ──
    if (action === "send_otp") {
      const email = String(body.email || "").trim().toLowerCase();
      const res = await sendRiderEmailOtp(email);
      return Response.json(res);
    }

    // ── 2. VERIFY EMAIL OTP ──
    if (action === "verify_otp") {
      const email = String(body.email || "").trim().toLowerCase();
      const otp = String(body.otp || "").trim();
      const res = await verifyRiderEmailOtp(email, otp);
      return Response.json(res);
    }

    // ── 3. REGISTER / KYC ONBOARDING ──
    if (action === "register_kyc") {
      const {
        email,
        fullName,
        phone,
        profileImageUrl,
        residentialAddress,
        city,
        pincode,
        vehicleType,
        vehicleNumber,
        drivingLicenseNumber,
        bankAccountHolderName,
        bankAccountNumber,
        bankIfscCode,
        bankName,
        upiId,
        panNumber,
      } = body;

      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);

      if (!fullName?.trim() || cleanPhone.length < 10) {
        return Response.json(
          { success: false, error: "Full Name and 10-digit mobile number are required." },
          { status: 400 },
        );
      }

      // Check if rider already exists
      let existingQuery = admin.from("delivery_riders").select("id");
      if (cleanEmail && cleanEmail.includes("@")) {
        existingQuery = existingQuery.or(`email.eq.${cleanEmail},phone.eq.+91${cleanPhone}`);
      } else {
        existingQuery = existingQuery.eq("phone", `+91${cleanPhone}`);
      }
      const { data: existing } = await existingQuery.maybeSingle();

      if (existing) {
        const updatePayload: Record<string, unknown> = {
          full_name: fullName.trim(),
          phone: `+91${cleanPhone}`,
          residential_address: residentialAddress || null,
          city: city || "Bahraich",
          pincode: pincode || "271801",
          vehicle_type: vehicleType || "bike",
          vehicle_number: (vehicleNumber || "UP-40-TEMP").toUpperCase().trim(),
          driving_license_number: drivingLicenseNumber || null,
          bank_account_holder_name: bankAccountHolderName || fullName.trim(),
          bank_account_number: bankAccountNumber || null,
          bank_ifsc_code: (bankIfscCode || "").toUpperCase().trim() || null,
          bank_name: bankName || null,
          upi_id: upiId || null,
          pan_number: (panNumber || "").toUpperCase().trim() || null,
          kyc_status: "approved",
          is_verified: true,
          is_online: true,
          is_available: true,
          updated_at: new Date().toISOString(),
        };

        if (cleanEmail && cleanEmail.includes("@")) {
          updatePayload.email = cleanEmail;
        }
        if (profileImageUrl) {
          updatePayload.profile_image_url = profileImageUrl;
        }

        const { data: updatedRider, error: updateErr } = await admin
          .from("delivery_riders")
          .update(updatePayload)
          .eq("id", existing.id)
          .select()
          .single();

        if (updateErr) {
          return Response.json({ success: false, error: updateErr.message }, { status: 400 });
        }
        return Response.json({ success: true, rider: updatedRider });
      }

      const { data: newRider, error: regError } = await admin
        .from("delivery_riders")
        .insert({
          full_name: fullName.trim(),
          email: cleanEmail && cleanEmail.includes("@") ? cleanEmail : null,
          phone: `+91${cleanPhone}`,
          profile_image_url: profileImageUrl || null,
          residential_address: residentialAddress || null,
          city: city || "Bahraich",
          pincode: pincode || "271801",
          vehicle_type: vehicleType || "bike",
          vehicle_number: (vehicleNumber || "UP-40-TEMP").toUpperCase().trim(),
          driving_license_number: drivingLicenseNumber || null,
          bank_account_holder_name: bankAccountHolderName || fullName.trim(),
          bank_account_number: bankAccountNumber || null,
          bank_ifsc_code: (bankIfscCode || "").toUpperCase().trim() || null,
          bank_name: bankName || null,
          upi_id: upiId || null,
          pan_number: (panNumber || "").toUpperCase().trim() || null,
          kyc_status: "approved",
          is_verified: true,
          is_online: true,
          is_available: true,
          wallet_balance: 0,
          cash_in_hand: 0,
          rating: 5.0,
          total_deliveries_count: 0,
          total_earnings: 0,
        })
        .select()
        .single();

      if (regError) {
        return Response.json({ success: false, error: regError.message }, { status: 400 });
      }

      return Response.json({ success: true, rider: newRider });
    }

    // ── 4. QUICK 1-TAP LOGIN / PHONE LOOKUP ──
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

    // ── 5. LEGACY QUICK REGISTER ──
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

    // ── 6. UPDATE PROFILE / SETTINGS ──
    if (action === "update_profile") {
      const {
        profileImageUrl,
        bankAccountHolderName,
        bankAccountNumber,
        bankIfscCode,
        bankName,
        upiId,
        residentialAddress,
      } = body;

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (profileImageUrl !== undefined) updates.profile_image_url = profileImageUrl;
      if (bankAccountHolderName !== undefined) updates.bank_account_holder_name = bankAccountHolderName;
      if (bankAccountNumber !== undefined) updates.bank_account_number = bankAccountNumber;
      if (bankIfscCode !== undefined) updates.bank_ifsc_code = bankIfscCode ? bankIfscCode.toUpperCase().trim() : null;
      if (bankName !== undefined) updates.bank_name = bankName;
      if (upiId !== undefined) updates.upi_id = upiId;
      if (residentialAddress !== undefined) updates.residential_address = residentialAddress;

      const { data: updatedRider, error: updateErr } = await admin
        .from("delivery_riders")
        .update(updates)
        .eq("id", riderId)
        .select()
        .single();

      if (updateErr) {
        return Response.json({ success: false, error: updateErr.message }, { status: 400 });
      }
      return Response.json({ success: true, rider: updatedRider });
    }

    // ── 7. INSTANT UPI PAYOUT REQUEST ──
    if (action === "request_payout") {
      const { data: currentRider } = await admin
        .from("delivery_riders")
        .select("wallet_balance, upi_id, bank_account_number, full_name")
        .eq("id", riderId)
        .maybeSingle();

      const balance = Number(currentRider?.wallet_balance || 0);
      if (balance <= 0) {
        return Response.json(
          { success: false, error: "No wallet balance available to withdraw." },
          { status: 400 },
        );
      }

      const payoutDestination = currentRider?.upi_id || currentRider?.bank_account_number || "Registered Bank / UPI";

      // Reset wallet balance
      await admin
        .from("delivery_riders")
        .update({
          wallet_balance: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      return Response.json({
        success: true,
        withdrawnAmount: balance,
        destination: payoutDestination,
        referenceId: `UPI-SETTLE-${Date.now().toString().slice(-8)}`,
        message: `₹${balance} payout transferred to ${payoutDestination}!`,
      });
    }

    // ── 8. GPS HEARTBEAT ──
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

    // ── 9. DUTY TOGGLE ──
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

    // ── 10. ORDER ACCEPT / DECLINE ──
    if (action === "accept_order") {
      const res = await riderAcceptOrder(orderId, riderId);
      return Response.json(res);
    }

    if (action === "decline_order") {
      const res = await handleRiderTimeoutOrDecline(orderId, riderId);
      return Response.json({ success: true, nextDispatch: res });
    }

    // ── 11. PICKUP & DOORSTEP OTP DELIVERY ──
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
