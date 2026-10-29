import { NextRequest, NextResponse } from "next/server";
import { verifyEmailOtp } from "@/lib/auth/email-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, fullName, phone } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and 6-digit OTP code are required." },
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
