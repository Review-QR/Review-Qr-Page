import { NextRequest, NextResponse } from "next/server";
import { generateAndSendEmailOtp } from "@/lib/auth/email-service";
import { sendCustomerPhoneOtp } from "@/lib/auth/customer-unified-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, channel = "whatsapp" } = body;

    // 1. If mobile number is provided -> dispatch via SMS or WhatsApp OTP
    if (phone && typeof phone === "string") {
      if (channel === "sms") {
        return NextResponse.json(
          {
            success: false,
            message: "SMS OTP is currently disabled (DLT registration pending). Please use WhatsApp OTP.",
          },
          { status: 400 }
        );
      }

      const result = await sendCustomerPhoneOtp(phone, "whatsapp");
      if (!result.success) {
        return NextResponse.json(result, { status: 429 });
      }
      return NextResponse.json(result);
    }

    // 2. Fallback to Email OTP
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid 10-digit mobile number or email address is required." },
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
