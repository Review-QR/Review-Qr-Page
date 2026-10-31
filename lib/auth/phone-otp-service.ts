import "server-only";

import { createHash } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limiter";

const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

function cleanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

/**
 * Sends an SMS OTP using an external provider (e.g. Fast2SMS Quick/OTP API)
 * If no API key is configured, falls back to dev preview so setup is never blocked.
 */
async function dispatchSmsOtp(phone10: string, otp: string, businessName?: string): Promise<{ success: boolean; provider: string; previewOtp?: string; error?: string }> {
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;

  if (fast2SmsKey) {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: phone10,
        }),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.return === true) {
        return { success: true, provider: "fast2sms" };
      }
      return {
        success: false,
        provider: "fast2sms",
        error: data?.message?.[0] || "SMS Gateway delivery failed",
      };
    } catch (err) {
      return {
        success: false,
        provider: "fast2sms",
        error: err instanceof Error ? err.message : "Network error contacting SMS gateway",
      };
    }
  }

  // Fallback Dev / Pilot mode: If no SMS provider key is set yet,
  // allow development testing with logged code
  console.info(`[PHONE_OTP_DEV_DISPATCH] Mobile: +91-${phone10} | Business: ${businessName || "Trustit"} | OTP: ${otp}`);
  return {
    success: true,
    provider: "dev_preview",
    previewOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
  };
}

/**
 * Generates and sends a 6-digit verification OTP to a merchant's phone number.
 */
export async function sendMerchantPhoneOtp(
  rawPhone: string,
  businessName?: string,
): Promise<{ success: boolean; message: string; previewOtp?: string }> {
  const phone10 = cleanPhone(rawPhone);
  if (phone10.length !== 10) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  // Rate Limiting: Max 3 OTP requests per 10 minutes per mobile number
  const rateLimit = checkRateLimit(`phone_otp:${phone10}`, {
    maxRequests: 3,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.success) {
    const waitMins = Math.ceil(rateLimit.resetMs / 60000);
    return {
      success: false,
      message: `Too many OTP requests. Please wait ${waitMins} minute(s) before trying again.`,
    };
  }

  const admin = createSupabaseAdminClient();

  // 30-second cooldown check from database
  const thirtySecsAgo = new Date(Date.now() - 30_000).toISOString();
  const { data: recent } = await admin
    .from("customer_auth_codes")
    .select("created_at")
    .eq("destination", phone10)
    .gt("created_at", thirtySecsAgo)
    .limit(1);

  if (recent && recent.length > 0) {
    return {
      success: false,
      message: "Please wait 30 seconds before requesting another OTP.",
    };
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = hashCode(otpCode);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000).toISOString();

  // Save to database
  const { error: insertErr } = await admin.from("customer_auth_codes").insert({
    destination: phone10,
    code_hash: codeHash,
    attempts: 0,
    expires_at: expiresAt,
  });

  if (insertErr) {
    return { success: false, message: "Failed to generate OTP. Please try again." };
  }

  // Dispatch via SMS / WhatsApp gateway
  const dispatchResult = await dispatchSmsOtp(phone10, otpCode, businessName);
  if (!dispatchResult.success) {
    return {
      success: false,
      message: dispatchResult.error || "Failed to deliver SMS. Please check your number.",
    };
  }

  return {
    success: true,
    message: `OTP sent to +91 ${phone10}`,
    previewOtp: dispatchResult.previewOtp,
  };
}

/**
 * Verifies a 6-digit OTP submitted by the merchant.
 */
export async function verifyMerchantPhoneOtp(
  rawPhone: string,
  enteredOtp: string,
): Promise<{ success: boolean; message: string; verifiedPhone?: string }> {
  const phone10 = cleanPhone(rawPhone);
  const cleanOtp = enteredOtp.trim();

  if (phone10.length !== 10 || cleanOtp.length !== 6) {
    return { success: false, message: "Enter a valid 10-digit phone and 6-digit OTP." };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Fetch the latest active OTP code for this phone number
  const { data: records, error: fetchErr } = await admin
    .from("customer_auth_codes")
    .select("id, code_hash, attempts, expires_at, consumed_at")
    .eq("destination", phone10)
    .is("consumed_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchErr || !records || records.length === 0) {
    return {
      success: false,
      message: "OTP expired or not found. Please request a new code.",
    };
  }

  const record = records[0];

  // Brute-force protection: Max attempts reached
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await admin
      .from("customer_auth_codes")
      .update({ consumed_at: now })
      .eq("id", record.id);
    return {
      success: false,
      message: "Too many incorrect attempts. Please request a new OTP.",
    };
  }

  const inputHash = hashCode(cleanOtp);
  if (inputHash !== record.code_hash) {
    // Increment failed attempt counter
    await admin
      .from("customer_auth_codes")
      .update({ attempts: record.attempts + 1 })
      .eq("id", record.id);

    const remaining = MAX_VERIFY_ATTEMPTS - (record.attempts + 1);
    return {
      success: false,
      message: remaining > 0
        ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
        : "Too many incorrect attempts. Please request a new code.",
    };
  }

  // Mark OTP as consumed (single-use guarantee)
  await admin
    .from("customer_auth_codes")
    .update({ consumed_at: now })
    .eq("id", record.id);

  return {
    success: true,
    message: "Mobile number verified successfully.",
    verifiedPhone: `+91${phone10}`,
  };
}
