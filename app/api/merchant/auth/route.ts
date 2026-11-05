import { NextRequest, NextResponse } from "next/server";
import {
  sendMerchantWhatsAppOtp,
  verifyMerchantWhatsAppOtp,
  registerMerchantProfile,
  authenticateMerchantWithGoogle,
} from "@/lib/auth/merchant-unified-auth";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization, Accept, Origin",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, otp, storeName, ownerName, category, city, email, fullName, channel } = body;

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
      const res = await authenticateMerchantWithGoogle(email, fullName, phone);
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
