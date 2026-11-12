import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  riderAcceptOrder,
  riderCompleteDeliveryWithOtp,
} from "@/lib/hyperlocal/hyperlocal-service";
import { executeRiderPayout } from "@/lib/hyperlocal/settlement-service";
import {
  handleRiderTimeoutOrDecline,
  dispatchCascadingRadar,
} from "@/lib/hyperlocal/dispatch-engine";
import {
  sendRiderEmailOtp,
  verifyRiderEmailOtp,
} from "@/lib/auth/email-service";
import {
  sendCustomerPhoneOtp,
  verifyCustomerPhoneOtp,
  cleanPhone,
} from "@/lib/auth/customer-unified-auth";
import { signRiderSessionToken, verifyRiderSessionToken } from "@/lib/hyperlocal/rider-session";
import {
  recordMerchantWaitCompensation,
  refundDoorstepChangeToCustomer,
  claimParkingTollReimbursement,
  recordRiderGpsHeartbeat,
  getRiderPassbook,
} from "@/lib/hyperlocal/rider-fleet-engine";
import { buildCorsHeaders, handleCorsPreflight } from "@/lib/auth-cors";
import { enforceRateLimit, verifyGoogleIdToken } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

const RIDER_SESSION_COOKIE = "trustit_rider_session";

function extractSessionRiderId(request: NextRequest): { provided: boolean; riderId: string | null } {
  const authHeader = request.headers.get("Authorization");
  const bearer = authHeader?.replace(/^Bearer\s+/i, "").trim();
  const cookieToken = request.cookies.get(RIDER_SESSION_COOKIE)?.value?.trim();
  const rawToken = bearer || cookieToken || "";
  if (!rawToken) return { provided: false, riderId: null };
  return { provided: true, riderId: verifyRiderSessionToken(rawToken) };
}

function jsonWithRiderCookie(
  payload: Record<string, unknown>,
  riderId?: string,
  status = 200,
  corsHeaders?: Record<string, string>
): NextResponse {
  const res = NextResponse.json(payload, { status, headers: corsHeaders });
  if (riderId) {
    res.cookies.set(RIDER_SESSION_COOKIE, signRiderSessionToken(riderId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  }
  return res;
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request, "rider_get", 120, 60_000);
  if (rateLimited) return rateLimited;

  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  const { searchParams } = new URL(request.url);
  const riderId = searchParams.get("riderId");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  const session = extractSessionRiderId(request);
  if (session.provided && !session.riderId) {
    return NextResponse.json(
      { error: "Unauthorized: invalid or expired rider session token." },
      { status: 401, headers: corsHeaders }
    );
  }

  const admin = createSupabaseAdminClient();
  let query = admin.from("delivery_riders").select("*");

  if (riderId) {
    if (session.riderId && session.riderId !== riderId) {
      return NextResponse.json(
        { error: "Forbidden: rider session mismatch." },
        { status: 403, headers: corsHeaders }
      );
    }
    query = query.eq("id", riderId);
  } else if (email) {
    query = query.eq("email", email.trim().toLowerCase());
  } else if (phone) {
    const clean = phone.replace(/\D/g, "").slice(-10);
    query = query.or(`phone.eq.${clean},phone.eq.+91${clean}`);
  } else if (session.riderId) {
    query = query.eq("id", session.riderId);
  } else {
    return NextResponse.json(
      { error: "Unauthorized: Active rider session or identifier required" },
      { status: 401, headers: corsHeaders }
    );
  }

  const { data: rider, error: riderErr } = await query.maybeSingle();

  if (riderErr || !rider) {
    return NextResponse.json({ error: "Rider not found" }, { status: 404, headers: corsHeaders });
  }

  if (session.riderId && session.riderId !== rider.id) {
    return NextResponse.json(
      { error: "Forbidden: rider session mismatch." },
      { status: 403, headers: corsHeaders }
    );
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

  // ── Dynamic Auto-Escalation Sweeper ──
  // If no incoming order is targeted to this online, available rider,
  // scan for unassigned orders whose target has expired (>30s) or is unassigned, and re-dispatch!
  if (!incomingDispatchOrder && rider.is_online && rider.is_available) {
    const { data: pendingOrders } = await admin
      .from("hyperlocal_orders")
      .select("id, dispatch_target_rider_id, dispatch_expires_at, status")
      .in("status", ["placed", "accepted_by_merchant", "ready_for_pickup"])
      .is("rider_id", null)
      .or("payment_status.eq.paid,payment_mode.eq.cod")
      .order("created_at", { ascending: true })
      .limit(3);

    if (pendingOrders && pendingOrders.length > 0) {
      for (const po of pendingOrders) {
        const isExpired = !po.dispatch_expires_at || new Date(po.dispatch_expires_at).getTime() <= Date.now();
        if (isExpired) {
          try {
            if (po.dispatch_target_rider_id) {
              await handleRiderTimeoutOrDecline(po.id, po.dispatch_target_rider_id);
            } else {
              await dispatchCascadingRadar(po.id);
            }
          } catch {}
        }
      }

      // Check if this rider was matched after auto-escalation!
      const { data: matchedSlot } = await admin
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

      if (matchedSlot && matchedSlot.dispatch_expires_at) {
        const expiryMs = new Date(matchedSlot.dispatch_expires_at).getTime();
        if (expiryMs > Date.now()) {
          incomingDispatchOrder = {
            ...matchedSlot,
            secondsRemaining: Math.max(1, Math.round((expiryMs - Date.now()) / 1000)),
          };
        }
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
      id, total_amount, payment_mode, payment_status, status, cancellation_reason, delivered_at, created_at, updated_at,
      businesses (name, city)
    `)
    .eq("rider_id", rider.id)
    .or("status.eq.delivered,and(status.eq.cancelled,cancellation_reason.eq.customer_refused_at_doorstep)")
    .order("updated_at", { ascending: false })
    .limit(50);

  const trips = completedOrders || [];
  
  const todayTrips = trips.filter(
    (o) => {
      const tripTime = new Date(o.delivered_at || o.updated_at || o.created_at).getTime();
      return tripTime >= startOfToday.getTime();
    },
  );
  const todayEarnings = todayTrips.length * 35;

  const monthTrips = trips.filter(
    (o) => {
      const tripTime = new Date(o.delivered_at || o.updated_at || o.created_at).getTime();
      return tripTime >= startOfMonth.getTime();
    },
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
        deliveredAt: t.delivered_at || t.updated_at || t.created_at,
        status: t.status,
        cancellationReason: t.cancellation_reason,
      };
    }),
  };

  const isActionRequired =
    rider.kyc_status === "pending" &&
    Boolean(rider.rejection_reason || (rider.admin_notes && rider.admin_notes.includes("CORRECTION_REQUESTED")));

  const isVerifiedSession = Boolean(session.riderId && session.riderId === rider.id);
  const maskedBank =
    typeof rider.bank_account_number === "string" && rider.bank_account_number.length >= 4
      ? `••••${rider.bank_account_number.slice(-4)}`
      : null;

  const enrichedRider = {
    ...rider,
    ...(!isVerifiedSession
      ? {
          bank_account_number: maskedBank,
          pan_number: rider.pan_number ? "••••••••••" : null,
          driving_license_number: rider.driving_license_number ? "••••••••" : null,
        }
      : {}),
    display_status: isActionRequired ? "action_required" : rider.kyc_status || "pending",
  };

  return NextResponse.json(
    {
      rider: enrichedRider,
      scorecard,
      activeOrder: activeOrder || null,
      incomingOrder: incomingDispatchOrder || null,
      availableOrders: availableOrders || [],
    },
    { headers: corsHeaders }
  );
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  try {
    const body = await request.json();
    const { action, riderId, orderId } = body;
    const admin = createSupabaseAdminClient();
    const session = extractSessionRiderId(request);

    if (session.provided && !session.riderId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: invalid rider session token." },
        { status: 401, headers: corsHeaders }
      );
    }
    if (session.riderId && riderId && session.riderId !== riderId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: rider session mismatch." },
        { status: 403, headers: corsHeaders }
      );
    }

    // ── 1. SEND OTP (SMS / WhatsApp / Email) ──
    if (action === "send_otp") {
      const rateLimited = enforceRateLimit(request, "rider_send_otp", 15, 10 * 60_000);
      if (rateLimited) return rateLimited;
      if (body.channel === "sms") {
        return Response.json(
          {
            success: false,
            message: "SMS OTP is currently disabled (DLT registration pending). Please use WhatsApp OTP.",
          },
          { status: 400 }
        );
      }

      const phone = body.phone ? cleanPhone(String(body.phone)) : "";
      const channel = "whatsapp";

      if (phone && phone.length === 10) {
        const res = await sendCustomerPhoneOtp(phone, channel);
        return Response.json(res);
      }

      const email = String(body.email || "").trim().toLowerCase();
      if (email.includes("@")) {
        const res = await sendRiderEmailOtp(email);
        return Response.json(res);
      }

      return Response.json(
        { success: false, message: "Valid 10-digit mobile number or email required." },
        { status: 400 },
      );
    }

    // ── 1B. 1-TAP GOOGLE SIGN-IN FOR RIDERS ──
    if (action === "google_login") {
      const rateLimited = enforceRateLimit(request, "rider_google_login", 15, 10 * 60_000);
      if (rateLimited) return rateLimited;

      const email = String(body.email || "").trim().toLowerCase();
      const fullName = String(body.fullName || "Google Rider").trim();
      const phone = body.phone ? cleanPhone(String(body.phone)) : "";
      const idToken = typeof body.idToken === "string" ? body.idToken : "";

      if (!email || !email.includes("@")) {
        return Response.json(
          { success: false, message: "Valid email is required for Google Sign-In." },
          { status: 400 }
        );
      }

      const requireVerifiedGoogle =
        process.env.NODE_ENV === "production" &&
        process.env.ALLOW_UNVERIFIED_GOOGLE_LOGIN !== "true";
      if (idToken) {
        const verified = await verifyGoogleIdToken(idToken, email);
        if (!verified) {
          return NextResponse.json(
            { success: false, message: "Invalid or expired Google ID token." },
            { status: 401, headers: corsHeaders }
          );
        }
      } else if (requireVerifiedGoogle) {
        return NextResponse.json(
          { success: false, message: "Google Sign-In requires a verified OAuth token. Please sign in with OTP." },
          { status: 403, headers: corsHeaders }
        );
      }

      // Check if rider exists by email or phone
      let query = admin.from("delivery_riders").select("*");
      if (phone && phone.length === 10) {
        query = query.or(`email.eq.${email},phone.eq.+91${phone},phone.eq.${phone}`);
      } else {
        query = query.eq("email", email);
      }

      const { data: existingRider } = await query.maybeSingle();

      if (existingRider) {
        const token = signRiderSessionToken(existingRider.id);
        return jsonWithRiderCookie(
          {
            success: true,
            message: `Welcome back, ${existingRider.full_name}!`,
            isNewRider: false,
            rider: existingRider,
            riderToken: token,
          },
          existingRider.id,
          200,
          corsHeaders
        );
      }

      // Register new rider profile with pending KYC (genuine production flow)
      const riderId = crypto.randomUUID();
      const sanitizedPhone = phone && phone.length === 10 ? `+91${phone}` : null;
      const refCode = `TR${riderId.replace(/-/g, "").slice(-6)}`;
      const newRiderPayload = {
        id: riderId,
        full_name: fullName,
        email: email,
        phone: sanitizedPhone,
        vehicle_type: "bike",
        vehicle_number: null,
        driving_license_number: null,
        is_verified: false,
        kyc_status: "pending",
        is_online: false,
        is_available: false,
        rating: 5.0,
        wallet_balance: 0,
        cash_in_hand: 0,
        city: "Bahraich",
        referral_code: refCode,
        created_at: new Date().toISOString(),
      };

      const { data: createdRider } = await admin
        .from("delivery_riders")
        .insert(newRiderPayload)
        .select("*")
        .single();

      const finalRider = createdRider || newRiderPayload;
      const token = signRiderSessionToken(finalRider.id);
      return jsonWithRiderCookie(
        {
          success: true,
          message: `Welcome to Trustit Fleet, ${fullName}! Please complete document verification to start deliveries.`,
          isNewRider: true,
          rider: finalRider,
          riderToken: token,
        },
        finalRider.id,
        200,
        corsHeaders
      );
    }

    // ── 2. VERIFY OTP (SMS / WhatsApp / Email) ──
    if (action === "verify_otp") {
      const rateLimited = enforceRateLimit(request, "rider_verify_otp", 20, 10 * 60_000);
      if (rateLimited) return rateLimited;

      const phone = body.phone ? cleanPhone(String(body.phone)) : "";
      const otp = String(body.otp || "").trim();

      if (phone && phone.length === 10) {
        const res = await verifyCustomerPhoneOtp(phone, otp);
        if (!res.success) {
          return Response.json(res, { status: 400 });
        }

        // Look up or establish rider profile
        const { data: rider } = await admin
          .from("delivery_riders")
          .select("*")
          .or(`phone.eq.${phone},phone.eq.+91${phone}`)
          .maybeSingle();

        if (rider) {
          const token = signRiderSessionToken(rider.id);
          return jsonWithRiderCookie(
            {
              success: true,
              isNewRider: false,
              rider,
              riderToken: token,
            },
            rider.id,
            200,
            corsHeaders
          );
        }

        return Response.json({
          success: true,
          isNewRider: true,
          phone,
          message: "Phone verified. Proceed to KYC onboarding.",
        });
      }

      const email = String(body.email || "").trim().toLowerCase();
      const res = await verifyRiderEmailOtp(email, otp);
      const riderIdFromEmail = (res as { rider?: { id?: string } }).rider?.id;
      return jsonWithRiderCookie(res as Record<string, unknown>, riderIdFromEmail, 200, corsHeaders);
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
      let existingQuery = admin.from("delivery_riders").select("id, is_verified, kyc_status");
      if (cleanEmail && cleanEmail.includes("@")) {
        existingQuery = existingQuery.or(`email.eq.${cleanEmail},phone.eq.+91${cleanPhone}`);
      } else {
        existingQuery = existingQuery.eq("phone", `+91${cleanPhone}`);
      }
      const { data: existing } = await existingQuery.maybeSingle();

      if (existing) {
        if (existing.is_verified && session.riderId !== existing.id) {
          return NextResponse.json(
            { success: false, error: "Unauthorized: verified rider session required to update KYC." },
            { status: 401, headers: corsHeaders }
          );
        }
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
          kyc_status: "pending",
          is_verified: false,
          rejection_reason: null, // clear previous correction reason on re-submit
          admin_notes: "Re-submitted by rider after correction",
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
        return jsonWithRiderCookie(
          { success: true, rider: updatedRider, riderToken: signRiderSessionToken(updatedRider.id) },
          updatedRider.id,
          200,
          corsHeaders
        );
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
          kyc_status: "pending",
          is_verified: false,
          is_online: false,
          is_available: false,
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

      return jsonWithRiderCookie(
        {
          success: true,
          rider: newRider,
          riderToken: signRiderSessionToken(newRider.id),
        },
        newRider.id,
        200,
        corsHeaders
      );
    }

    // ── 4. QUICK 1-TAP LOGIN (Disabled: passwordless phone login bypasses OTP) ──
    if (action === "login") {
      return NextResponse.json(
        {
          success: false,
          error: "Passwordless phone login is disabled. Please verify your mobile number via OTP.",
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // ── 5. LEGACY QUICK REGISTER ──
    if (action === "register") {
      const rateLimited = enforceRateLimit(request, "rider_legacy_register", 10, 10 * 60_000);
      if (rateLimited) return rateLimited;

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
          kyc_status: "pending",
          is_verified: false,
          is_online: false,
          is_available: false,
          rating: 5.0,
        })
        .select()
        .single();

      if (regError) {
        return Response.json({ success: false, error: regError.message }, { status: 400 });
      }

      return jsonWithRiderCookie(
        {
          success: true,
          rider: newRider,
          riderToken: signRiderSessionToken(newRider.id),
        },
        newRider.id,
        200,
        corsHeaders
      );
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
      if (!session.riderId || session.riderId !== riderId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: authenticated rider session required for payouts." },
          { status: 401, headers: corsHeaders }
        );
      }
      const { destinationUpi } = body;
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

      const upiToUse = destinationUpi?.trim() || currentRider?.upi_id?.trim();
      if (!upiToUse || !upiToUse.includes("@")) {
        return Response.json(
          { success: false, error: "Please configure a valid UPI ID (e.g. yourname@oksbi) in your profile before requesting a payout." },
          { status: 400 },
        );
      }

      const payoutResult = await executeRiderPayout({
        riderId,
        amount: balance,
        destinationUpi: upiToUse,
      });

      return Response.json({
        success: payoutResult.success,
        withdrawnAmount: balance,
        destination: upiToUse,
        referenceId: payoutResult.requestId || `UPI-SETTLE-${Date.now().toString().slice(-8)}`,
        utr: payoutResult.utr,
        message: payoutResult.message,
      });
    }

    if (action === "update_upi") {
      if (!session.riderId || session.riderId !== riderId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: authenticated rider session required to change UPI ID." },
          { status: 401, headers: corsHeaders }
        );
      }
      const { upiId } = body;
      if (!upiId || !upiId.includes("@")) {
        return Response.json({ success: false, error: "Please enter a valid UPI ID (e.g. name@oksbi)." }, { status: 400 });
      }
      await admin
        .from("delivery_riders")
        .update({ upi_id: upiId.trim(), updated_at: new Date().toISOString() })
        .eq("id", riderId);
      return Response.json({ success: true, message: "UPI ID updated successfully." });
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
      const goOnline = Boolean(body.isOnline);
      if (goOnline) {
        const { data: riderRecord } = await admin
          .from("delivery_riders")
          .select("kyc_status, cash_in_hand")
          .eq("id", riderId)
          .maybeSingle();
        if (!riderRecord || riderRecord.kyc_status !== "approved") {
          return NextResponse.json(
            { success: false, error: "KYC verification must be approved before going online." },
            { status: 403, headers: corsHeaders }
          );
        }
        if (Number(riderRecord.cash_in_hand || 0) >= 2000) {
          return NextResponse.json(
            { success: false, error: "Cash-in-hand limit (₹2,000) reached. Deposit COD cash before going online." },
            { status: 403, headers: corsHeaders }
          );
        }
      }
      await admin
        .from("delivery_riders")
        .update({
          is_online: goOnline,
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      return Response.json({ success: true, isOnline: goOnline });
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
        .eq("id", orderId)
        .eq("rider_id", riderId);

      return Response.json({ success: true });
    }

    if (action === "deliver_with_otp") {
      const { otp } = body;
      const res = await riderCompleteDeliveryWithOtp(orderId, riderId, otp);
      return Response.json(res);
    }

    // ── 12. REPORT DOORSTEP DISPUTE / CUSTOMER REFUSAL ──
    if (action === "report_dispute") {
      const { reason, notes } = body;
      await admin
        .from("hyperlocal_orders")
        .update({
          dispute_status: reason || "customer_refused",
          dispute_reported_at: new Date().toISOString(),
          dispute_notes: notes || "Customer refused delivery at doorstep",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("rider_id", riderId);

      return Response.json({ success: true, message: "Dispute reported to Admin Command Center." });
    }

    // ── 13. MERCHANT WAIT COMPENSATION (+₹1/MIN AFTER 5 MINS) ──
    if (action === "wait_compensation") {
      const waitMinutes = Number(body.waitMinutes || 6);
      if (!Number.isFinite(waitMinutes) || waitMinutes < 5 || waitMinutes > 120) {
        return NextResponse.json(
          { success: false, error: "Wait minutes must be between 5 and 120." },
          { status: 400, headers: corsHeaders }
        );
      }
      const res = await recordMerchantWaitCompensation(riderId, orderId, waitMinutes);
      return Response.json({ success: true, ...res });
    }

    // ── 14. DOORSTEP CHANGE DEFICIT TO WALLET / UPI ──
    if (action === "doorstep_change_wallet") {
      const { customerPhone, method, upiId } = body;
      const changeAmount = Number(body.changeAmount);
      if (!Number.isFinite(changeAmount) || changeAmount <= 0 || changeAmount > 5000) {
        return NextResponse.json(
          { success: false, error: "Change amount must be between ₹1 and ₹5,000." },
          { status: 400, headers: corsHeaders }
        );
      }
      const res = await refundDoorstepChangeToCustomer(
        orderId,
        customerPhone,
        changeAmount,
        method || "wallet",
        upiId,
      );
      return Response.json(res);
    }

    // ── 15. CLAIM PARKING / TOLL REIMBURSEMENT ──
    if (action === "claim_parking") {
      const { receiptPhotoUrl } = body;
      const amount = Number(body.amount || 10);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 500) {
        return NextResponse.json(
          { success: false, error: "Parking reimbursement must be between ₹1 and ₹500." },
          { status: 400, headers: corsHeaders }
        );
      }
      const res = await claimParkingTollReimbursement(
        riderId,
        orderId,
        amount,
        receiptPhotoUrl,
      );
      return Response.json(res);
    }

    // ── 16. DETAILED GPS TELEMETRY & HALT MONITOR ──
    if (action === "heartbeat_telemetry") {
      const { latitude, longitude, speedKmh, heading, accuracyMeters, batteryPercentage, isMoving, haltSeconds } = body;
      const ok = await recordRiderGpsHeartbeat({
        rider_id: riderId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        speed_kmh: Number(speedKmh || 0),
        heading_degrees: Number(heading || 0),
        accuracy_meters: Number(accuracyMeters || 4),
        battery_percentage: Number(batteryPercentage || 100),
        is_moving: Boolean(isMoving),
        halt_duration_seconds: Number(haltSeconds || 0),
      });
      return Response.json({ success: ok });
    }

    // ── 17. GET DETAILED PASSBOOK ──
    if (action === "get_passbook") {
      const passbook = await getRiderPassbook(riderId);
      return Response.json({ success: true, passbook });
    }

    // ── 18. DAILY HELMET & BAG SELFIE AUDIT ──
    if (action === "verify_helmet_selfie") {
      const { data: riderRecord } = await admin
        .from("delivery_riders")
        .select("kyc_status, cash_in_hand")
        .eq("id", riderId)
        .maybeSingle();
      if (!riderRecord || riderRecord.kyc_status !== "approved") {
        return NextResponse.json(
          { success: false, error: "KYC verification must be approved before unlocking shift." },
          { status: 403, headers: corsHeaders }
        );
      }
      const canGoOnline = Number(riderRecord.cash_in_hand || 0) < 2000;
      await admin
        .from("delivery_riders")
        .update({
          daily_helmet_verified_at: new Date().toISOString(),
          is_online: canGoOnline,
          is_available: canGoOnline,
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      return Response.json({ success: true, message: "Helmet verified. Shift unlocked!" });
    }

    // ── 19. COMPLETE TRAINING ACADEMY ──
    if (action === "complete_academy") {
      await admin
        .from("delivery_riders")
        .update({
          training_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      return Response.json({
        success: true,
        message: "Trustit Fleet Academy completed! Your certificates have been recorded for fleet compliance.",
      });
    }

    // ── 20. BUDDY BREAKDOWN HANDOVER ──
    if (action === "report_breakdown") {
      const { breakdownType } = body;
      const handoverOtp = String(Math.floor(1000 + Math.random() * 9000));
      
      await admin.from("rider_road_incidents").insert({
        order_id: orderId,
        original_rider_id: riderId,
        incident_type: "puncture_breakdown",
        handover_otp: handoverOtp,
        status: "open",
        notes: `Breakdown reported: ${breakdownType || "Puncture"}. Handover code generated.`,
      });

      return Response.json({
        success: true,
        handoverOtp,
        message: "Breakdown logged. Nearby rescue riders notified.",
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Rider action failed" },
      { status: 400 },
    );
  }
}
