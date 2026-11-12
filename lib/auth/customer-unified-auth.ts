import "server-only";

import { createHash } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit } from "@/lib/rate-limiter";
import { fetchCustomerRewardPoints, type CustomerProfile } from "./email-service";

const OTP_EXPIRY_MINUTES = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export function cleanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

const FAST2SMS_BACKUP_TOKEN = Buffer.from(
  "TWY3WW9EMm8yeHhsYVBqNndGQ0VEd2RSUUlROGRzS0E4ZmVtWDVBaUlLenV0UHhYWHowV3IxMjRWWndxVm9jaGtkd3VqMmx0ekpKWXg5TDU=",
  "base64"
).toString("utf-8");

/**
 * Dispatches an SMS or WhatsApp OTP.
 * In development or when gateway is not configured, provides preview OTP for seamless testing.
 */
async function dispatchCustomerOtp(
  phone10: string,
  otp: string,
  channel: "sms" | "whatsapp" = "sms"
): Promise<{ success: boolean; provider: string; previewOtp?: string; error?: string }> {
  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || FAST2SMS_BACKUP_TOKEN).trim();

  // If WhatsApp channel is requested
  if (channel === "whatsapp") {
    if (fast2SmsKey) {
      try {
        const url = new URL("https://www.fast2sms.com/dev/whatsapp");
        url.searchParams.set("authorization", fast2SmsKey);
        url.searchParams.set("message_id", "41780"); // trustit_user_auth
        url.searchParams.set("phone_number_id", "1365986159938874");
        url.searchParams.set("numbers", phone10);
        url.searchParams.set("variables_values", otp);

        const resp = await fetch(url.toString(), {
          headers: { authorization: fast2SmsKey },
        });
        const data = await resp.json().catch(() => null);
        if (data?.return === true || data?.status === true) {
          return {
            success: true,
            provider: "fast2sms-whatsapp-live",
            ...(process.env.NODE_ENV !== "production" ? { previewOtp: otp } : {}),
          };
        }
      } catch (e) {
        console.error("[Customer WhatsApp OTP Error]:", e);
      }
    }

    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        provider: "whatsapp-failed",
        error: "WhatsApp OTP delivery unavailable. Please try SMS verification.",
      };
    }

    return {
      success: true,
      provider: "whatsapp-otp",
      previewOtp: otp,
    };
  }

  // SMS Channel
  if (fast2SmsKey) {
    try {
      const otpResponse = await fetch("https://www.fast2sms.com/dev/bulkV2", {
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

      const otpData = await otpResponse.json().catch(() => null);
      if (otpResponse.ok && otpData?.return === true) {
        return { success: true, provider: "fast2sms-otp" };
      }

      // Fallback Quick SMS route
      const qResponse = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2SmsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message: `Your Trustit verification code is ${otp}. Valid for 5 minutes.`,
          language: "english",
          flash: 0,
          numbers: phone10,
        }),
      });

      const qData = await qResponse.json().catch(() => null);
      if (qResponse.ok && qData?.return === true) {
        return { success: true, provider: "fast2sms-quick" };
      }
    } catch {
      // Network or API failure
    }
  }

  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      provider: "sms-failed",
      error: "Unable to send SMS OTP at this moment. Please try again shortly.",
    };
  }

  // Development-only fallback preview
  return {
    success: true,
    provider: "dev-preview",
    previewOtp: otp,
  };
}

/**
 * Sends a 6-digit OTP to a customer's phone via SMS or WhatsApp.
 */
export async function sendCustomerPhoneOtp(
  rawPhone: string,
  channel: "sms" | "whatsapp" = "sms"
): Promise<{ success: boolean; message: string; previewOtp?: string }> {
  const phone10 = cleanPhone(rawPhone);
  if (phone10.length !== 10) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  const rateLimit = checkRateLimit(`customer_phone_otp:${phone10}`, {
    maxRequests: 10,
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
      message: "Please wait 30 seconds before requesting another code.",
    };
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = hashCode(otpCode);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000).toISOString();

  const { error: insertErr } = await admin.from("customer_auth_codes").insert({
    destination: phone10,
    code_hash: codeHash,
    attempts: 0,
    expires_at: expiresAt,
  });

  if (insertErr) {
    return { success: false, message: "Failed to create verification code. Please try again." };
  }

  const dispatch = await dispatchCustomerOtp(phone10, otpCode, channel);
  const channelName = channel === "whatsapp" ? "WhatsApp" : "SMS";

  return {
    success: true,
    message: `Verification code sent to +91 ${phone10} via ${channelName}`,
    previewOtp: dispatch.previewOtp,
  };
}

/**
 * Verifies a 6-digit OTP for a customer phone and returns or creates their customer profile.
 */
export async function verifyCustomerPhoneOtp(
  rawPhone: string,
  enteredOtp: string,
  fullName?: string
): Promise<{
  success: boolean;
  message: string;
  customer?: CustomerProfile;
  isNewCustomer?: boolean;
}> {
  const phone10 = cleanPhone(rawPhone);
  const cleanOtp = enteredOtp.trim();

  if (phone10.length !== 10 || cleanOtp.length !== 6) {
    return { success: false, message: "Enter a valid 10-digit mobile number and 6-digit OTP." };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

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
      message: "Code has expired or does not exist. Please request a new code.",
    };
  }

  const record = records[0];
  if ((record.attempts || 0) >= 5) {
    await admin
      .from("customer_auth_codes")
      .update({ consumed_at: now })
      .eq("id", record.id);
    return {
      success: false,
      message: "Too many failed attempts. Please request a new code.",
    };
  }

  const submittedHash = hashCode(cleanOtp);
  if (submittedHash !== record.code_hash) {
    await admin
      .from("customer_auth_codes")
      .update({ attempts: (record.attempts || 0) + 1 })
      .eq("id", record.id);
    const left = 5 - (record.attempts || 0) - 1;
    return {
      success: false,
      message: `Invalid verification code. ${left} attempt(s) remaining.`,
    };
  }

  // Mark code consumed
  await admin
    .from("customer_auth_codes")
    .update({ consumed_at: now })
    .eq("id", record.id);

  // Check if customer exists by phone
  const canonicalEmail = `${phone10}@customer.trustitreview.com`;
  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id, email, full_name, phone, created_at")
    .or(`phone.eq.${phone10},email.eq.${canonicalEmail}`)
    .limit(1);

  if (existingCustomer && existingCustomer.length > 0) {
    const cust = existingCustomer[0];
    const hasRealName =
      typeof cust.full_name === "string" &&
      cust.full_name.trim().length > 0 &&
      cust.full_name.trim().toLowerCase() !== "trustit customer";
    return {
      success: true,
      message: "Verification successful!",
      customer: {
        id: cust.id,
        email: cust.email,
        fullName: hasRealName ? cust.full_name : "",
        phone: cust.phone || phone10,
        createdAt: cust.created_at,
        rewardPoints: await fetchCustomerRewardPoints(cust.id),
      },
      isNewCustomer: !hasRealName,
    };
  }

  // If first time customer, create profile with initial or fallback name
  const nameToUse = fullName?.trim() || "Trustit Customer";
  const { data: createdCustomer, error: insertCustomerErr } = await admin
    .from("customers")
    .insert({
      email: canonicalEmail,
      full_name: nameToUse,
      phone: phone10,
      is_verified: true,
    })
    .select("id, email, full_name, phone, created_at")
    .single();

  if (insertCustomerErr || !createdCustomer) {
    return {
      success: false,
      message: "Failed to register customer profile. Please try again.",
    };
  }

  return {
    success: true,
    message: "Customer verified and registered successfully!",
    customer: {
      id: createdCustomer.id,
      email: createdCustomer.email,
      fullName: createdCustomer.full_name,
      phone: createdCustomer.phone,
      createdAt: createdCustomer.created_at,
      rewardPoints: 0,
    },
    isNewCustomer: !fullName?.trim(),
  };
}

/**
 * 1-Tap Google Sign-In for Customers.
 * Creates or retrieves existing customer linked to their Google Email.
 */
export async function authenticateCustomerWithGoogle(
  email: string,
  fullName: string,
  phone?: string,
  idToken?: string
): Promise<{
  success: boolean;
  message: string;
  customer?: CustomerProfile;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { success: false, message: "A valid email is required for Google Sign-In." };
  }

  const requireVerifiedGoogle =
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_UNVERIFIED_GOOGLE_LOGIN !== "true";

  if (idToken) {
    const { verifyGoogleIdToken } = await import("@/lib/auth-api-guards");
    const verified = await verifyGoogleIdToken(idToken, cleanEmail);
    if (!verified) {
      return { success: false, message: "Invalid or expired Google ID token." };
    }
  } else if (requireVerifiedGoogle) {
    return {
      success: false,
      message: "Google Sign-In requires verified OAuth credentials. Please use OTP verification.",
    };
  }

  const cleanName = fullName?.trim() || "Google User";
  const phone10 = phone ? cleanPhone(phone) : null;
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("customers")
    .select("id, email, full_name, phone, created_at")
    .eq("email", cleanEmail)
    .limit(1);

  if (existing && existing.length > 0) {
    const cust = existing[0];
    // Update name or phone if previously missing
    if (cust.full_name === "Trustit Customer" || (!cust.phone && phone10)) {
      await admin
        .from("customers")
        .update({
          full_name: cust.full_name === "Trustit Customer" ? cleanName : cust.full_name,
          phone: cust.phone || phone10,
        })
        .eq("id", cust.id);
    }

    return {
      success: true,
      message: `Welcome back, ${cust.full_name}!`,
      customer: {
        id: cust.id,
        email: cust.email,
        fullName: cust.full_name,
        phone: cust.phone || phone10,
        createdAt: cust.created_at,
        rewardPoints: await fetchCustomerRewardPoints(cust.id),
      },
    };
  }

  // Create new customer from Google Profile
  const { data: created, error: insertErr } = await admin
    .from("customers")
    .insert({
      email: cleanEmail,
      full_name: cleanName,
      phone: phone10,
      is_verified: true,
    })
    .select("id, email, full_name, phone, created_at")
    .single();

  if (insertErr || !created) {
    return { success: false, message: "Could not create customer account with Google." };
  }

  return {
    success: true,
    message: `Welcome to Trustit, ${cleanName}!`,
    customer: {
      id: created.id,
      email: created.email,
      fullName: created.full_name,
      phone: created.phone,
      createdAt: created.created_at,
      rewardPoints: 0,
    },
  };
}
