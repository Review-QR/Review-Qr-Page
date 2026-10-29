import { NextRequest, NextResponse } from "next/server";
import { generateAndSendEmailOtp } from "@/lib/auth/email-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 },
      );
    }

    const result = await generateAndSendEmailOtp(email);
    if (!result.success) {
      return NextResponse.json(result, { status: 429 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to send OTP code." },
      { status: 500 },
    );
  }
}
