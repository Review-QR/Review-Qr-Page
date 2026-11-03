import { NextRequest, NextResponse } from "next/server";
import { verifyEmailOtp, createCustomerProfile } from "@/lib/auth/email-service";
import { verifyCustomerPhoneOtp, authenticateCustomerWithGoogle } from "@/lib/auth/customer-unified-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, phone, otp, fullName } = body;

    // 1. Google 1-Tap Login
    if (action === "google_login") {
      if (!email || typeof email !== "string") {
        return NextResponse.json(
          { success: false, message: "Valid email is required for Google Sign-In." },
          { status: 400 },
        );
      }
      const result = await authenticateCustomerWithGoogle(email, fullName || "Google User", phone);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    // 2. Profile Creation (existing contract)
    if (action === "create_profile") {
      if (!email || !fullName) {
        return NextResponse.json(
          { success: false, message: "Email and Full Name are required to create profile." },
          { status: 400 },
        );
      }
      const result = await createCustomerProfile(email, fullName, phone);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    // 3. Mobile Phone OTP Verification
    if (phone && otp) {
      const result = await verifyCustomerPhoneOtp(phone, otp, fullName);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }

    // 4. Email OTP Verification (existing contract)
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Mobile number/Email and 6-digit OTP code are required." },
        { status: 400 },
      );
    }

    const result = await verifyEmailOtp(email, otp, fullName, phone);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to verify code." },
      { status: 500 },
    );
  }
}
