import { NextRequest, NextResponse } from "next/server";
import {
  sendMerchantWhatsAppOtp,
  verifyMerchantWhatsAppOtp,
  registerMerchantProfile,
  authenticateMerchantWithGoogle,
} from "@/lib/auth/merchant-unified-auth";
import { buildCorsHeaders, handleCorsPreflight } from "@/lib/auth-cors";
import { enforceRateLimit } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  try {
    const body = await request.json();
    const { action, phone, otp, storeName, ownerName, category, city, address, latitude, longitude, locality, pincode, email, fullName, channel, idToken } = body;

    const rateLimited = enforceRateLimit(
      request,
      `merchant_auth:${typeof action === "string" ? action : "unknown"}`,
      20,
      10 * 60_000
    );
    if (rateLimited) return rateLimited;

    // 1. Send OTP (SMS disabled by DLT, WhatsApp active)
    if (action === "send_otp") {
      if (channel === "sms") {
        return NextResponse.json(
          {
            success: false,
            message: "SMS OTP is currently disabled (DLT registration pending). Please use WhatsApp OTP.",
          },
          { status: 400, headers: corsHeaders }
        );
      }

      const res = await sendMerchantWhatsAppOtp(phone);
      return NextResponse.json(res, { status: res.success ? 200 : 400, headers: corsHeaders });
    }

    // 2. Verify OTP
    if (action === "verify_otp") {
      const res = await verifyMerchantWhatsAppOtp(phone, otp);
      return NextResponse.json(res, { status: res.success ? 200 : 400, headers: corsHeaders });
    }

    // 3. Register Merchant Profile
    if (action === "register_merchant") {
      const res = await registerMerchantProfile({
        phone,
        storeName,
        ownerName,
        category,
        city,
        address,
        latitude,
        longitude,
        locality,
        pincode,
      });
      return NextResponse.json(res, { status: res.success ? 200 : 400, headers: corsHeaders });
    }

    // 4. Google 1-Tap Sign-In
    if (action === "google_login") {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { success: false, message: "Valid email required for Google Sign-In." },
          { status: 400, headers: corsHeaders }
        );
      }
      const res = await authenticateMerchantWithGoogle(email, fullName, phone, idToken);
      return NextResponse.json(res, { status: res.success ? 200 : 400, headers: corsHeaders });
    }

    return NextResponse.json({ success: false, message: "Unknown action." }, { status: 400, headers: corsHeaders });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Internal auth error." },
      { status: 500, headers: corsHeaders }
    );
  }
}
