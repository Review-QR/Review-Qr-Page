import { NextRequest, NextResponse } from "next/server";
import { verifyEmailOtp, createCustomerProfile } from "@/lib/auth/email-service";
import { verifyCustomerPhoneOtp, authenticateCustomerWithGoogle } from "@/lib/auth/customer-unified-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSessionToken,
  enforceRateLimit,
  normalizePhone10,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

function attachCustomerSessionCookie(
  response: NextResponse,
  customer?: { id?: string; phone?: string | null; email?: string | null }
): NextResponse {
  if (!customer?.id) return response;
  const token = createCustomerSessionToken({
    customerId: customer.id,
    phone: customer.phone,
    email: customer.email,
  });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "customer_verify_otp", 25, 10 * 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { action, email, phone, otp, fullName, idToken } = body;

    // 1. Google 1-Tap Login
    if (action === "google_login") {
      if (!email || typeof email !== "string") {
        return NextResponse.json(
          { success: false, message: "Valid email is required for Google Sign-In." },
          { status: 400 },
        );
      }
      const result = await authenticateCustomerWithGoogle(email, fullName || "Google User", phone, idToken);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return attachCustomerSessionCookie(NextResponse.json(result), result.customer);
    }

    // 2. Profile Creation (existing contract + phone-only fallback; prevents overwriting verified accounts)
    if (action === "create_profile") {
      const cleanPhoneDigits = normalizePhone10(phone);
      const resolvedEmail =
        typeof email === "string" && email.includes("@")
          ? email.trim().toLowerCase()
          : cleanPhoneDigits.length === 10
            ? `${cleanPhoneDigits}@customer.trustitreview.com`
            : "";
      if (!resolvedEmail || !fullName) {
        return NextResponse.json(
          { success: false, message: "Phone/Email and Full Name are required to create profile." },
          { status: 400 },
        );
      }

      const session = verifyCustomerSessionToken(
        request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
      );
      const admin = createSupabaseAdminClient();
      const { data: existingCust } = await admin
        .from("customers")
        .select("id, full_name, email, phone")
        .eq("email", resolvedEmail)
        .maybeSingle();

      if (
        existingCust &&
        existingCust.full_name &&
        existingCust.full_name.trim().toLowerCase() !== "trustit customer" &&
        (!session || session.email !== resolvedEmail)
      ) {
        return NextResponse.json(
          { success: false, message: "OTP verification required before modifying an existing profile." },
          { status: 401 }
        );
      }

      const result = await createCustomerProfile(resolvedEmail, fullName, cleanPhoneDigits || phone);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return attachCustomerSessionCookie(NextResponse.json(result), result.customer);
    }

    // 3. Mobile Phone OTP Verification
    if (phone && otp) {
      const result = await verifyCustomerPhoneOtp(phone, otp, fullName);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return attachCustomerSessionCookie(NextResponse.json(result), result.customer);
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

    return attachCustomerSessionCookie(NextResponse.json(result), result.customer);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to verify code." },
      { status: 500 },
    );
  }
}
