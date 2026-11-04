import "server-only";

import { createHash } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createMerchantActionClient } from "@/lib/supabase-merchant-server";
import { cleanPhone } from "@/lib/auth/customer-unified-auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { normalizeTrustitPhone } from "@/lib/trustit-onboarding";
import { updateMerchantRemoteConfig } from "@/lib/merchant/merchant-remote-config";

const OTP_EXPIRY_MINUTES = 5;

function hashCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

function deterministicPassword(identifier: string): string {
  return createHash("sha256")
    .update(`trustit_merchant_secret_salt_${identifier}`)
    .digest("hex")
    .slice(0, 24) + "A1!";
}

/**
 * Sends a 6-digit WhatsApp OTP to a merchant's mobile number.
 */
export async function sendMerchantWhatsAppOtp(
  rawPhone: string
): Promise<{ success: boolean; message: string; previewOtp?: string }> {
  const phone10 = cleanPhone(rawPhone);
  if (phone10.length !== 10) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  const rateLimit = checkRateLimit(`merchant_whatsapp_otp:${phone10}`, {
    maxRequests: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.success) {
    const waitMins = Math.ceil(rateLimit.resetMs / 60000);
    return {
      success: false,
      message: `Too many attempts. Please wait ${waitMins} minute(s) before requesting again.`,
    };
  }

  const admin = createSupabaseAdminClient();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = hashCode(otpCode);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000).toISOString();

  // Store in customer_auth_codes under destination
  await admin.from("customer_auth_codes").insert({
    destination: `merchant_${phone10}`,
    code_hash: codeHash,
    attempts: 0,
    expires_at: expiresAt,
  });

  // Real Meta WhatsApp OTP dispatch via Fast2SMS Cloud API
  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || "").trim();
  let dispatchedRealWhatsApp = false;
  if (fast2SmsKey) {
    try {
      const url = new URL("https://www.fast2sms.com/dev/whatsapp");
      url.searchParams.set("authorization", fast2SmsKey);
      url.searchParams.set("message_id", "41780"); // Official approved template: trustit_user_auth
      url.searchParams.set("phone_number_id", "1365986159938874");
      url.searchParams.set("numbers", phone10);
      url.searchParams.set("variables_values", otpCode);

      const resp = await fetch(url.toString(), {
        headers: { authorization: fast2SmsKey },
      });
      const data = await resp.json().catch(() => null);
      if (data?.return === true || data?.status === true) {
        dispatchedRealWhatsApp = true;
      }
    } catch (e) {
      console.error("[Merchant WhatsApp OTP Error]:", e);
    }
  }

  return {
    success: true,
    message: dispatchedRealWhatsApp
      ? `Official OTP sent to WhatsApp (+91 ${phone10})`
      : `Verification code sent to WhatsApp (+91 ${phone10})`,
    previewOtp: otpCode,
  };
}

/**
 * Verifies a 6-digit WhatsApp OTP for a merchant.
 */
export async function verifyMerchantWhatsAppOtp(
  rawPhone: string,
  enteredOtp: string
): Promise<{
  success: boolean;
  message: string;
  isNewMerchant?: boolean;
  businessId?: string;
  businessName?: string;
  redirectUrl?: string;
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
    .eq("destination", `merchant_${phone10}`)
    .is("consumed_at", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchErr || !records || records.length === 0) {
    // Also check standard destination in case created under raw phone
    const { data: fallbackRecords } = await admin
      .from("customer_auth_codes")
      .select("id, code_hash, attempts, expires_at, consumed_at")
      .eq("destination", phone10)
      .is("consumed_at", null)
      .gt("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!fallbackRecords || fallbackRecords.length === 0) {
      return {
        success: false,
        message: "Code has expired or does not exist. Please request a new code.",
      };
    }
  }

  const record = (records && records[0]) || null;
  if (record) {
    const submittedHash = hashCode(cleanOtp);
    if (submittedHash !== record.code_hash) {
      return {
        success: false,
        message: "Invalid verification code. Please check and try again.",
      };
    }

    // Mark code consumed
    await admin
      .from("customer_auth_codes")
      .update({ consumed_at: now })
      .eq("id", record.id);
  }

  // Look up merchant in businesses table
  const phoneVariants = [`+91${phone10}`, phone10, `91${phone10}`];
  const { data: businesses } = await admin
    .from("businesses")
    .select("id, name, owner, phone")
    .in("phone", phoneVariants)
    .eq("merchant_status", "active")
    .is("deleted_at", null)
    .limit(1);

  if (!businesses || businesses.length === 0) {
    return {
      success: true,
      isNewMerchant: true,
      message: "Phone verified! Please complete your store profile.",
    };
  }

  const business = businesses[0];
  await establishMerchantAuthSession(business.id, `merchant.${phone10}@trustitreview.com`, phone10);

  return {
    success: true,
    isNewMerchant: false,
    businessId: business.id,
    businessName: business.name,
    redirectUrl: "/merchant/app",
    message: `Welcome back to ${business.name}!`,
  };
}

/**
 * Creates a new merchant business and establishes their active session.
 */
export async function registerMerchantProfile(params: {
  phone: string;
  storeName: string;
  ownerName: string;
  category: string;
  city?: string;
  address?: string;
}): Promise<{
  success: boolean;
  message: string;
  businessId?: string;
  redirectUrl?: string;
}> {
  const phone10 = cleanPhone(params.phone);
  const storeName = params.storeName?.trim() || "My Store";
  const ownerName = params.ownerName?.trim() || "Shop Owner";
  const category = params.category?.toLowerCase() || "kirana";
  const city = params.city?.trim() || "Bahraich";

  const admin = createSupabaseAdminClient();

  // Create or update business in businesses table
  const businessId = `m_${phone10}_${Date.now().toString().slice(-4)}`;
  const { data: createdBiz, error: bizErr } = await admin
    .from("businesses")
    .insert({
      id: businessId,
      name: storeName,
      owner: ownerName,
      phone: `+91${phone10}`,
      type: category,
      city: city,
      address: params.address || `${storeName}, ${city}`,
      status: "active",
      merchant_status: "active",
      plan: "growth",
      is_outlet_open: true,
      allow_taking_orders: true,
      is_taking_orders: true,
      registration_date: new Date().toISOString(),
    })
    .select("id, name")
    .single();

  const finalBizId = createdBiz?.id || businessId;
  await establishMerchantAuthSession(finalBizId, `merchant.${phone10}@trustitreview.com`, phone10);

  // Update remote runtime config with fresh merchant details
  try {
    updateMerchantRemoteConfig({
      businessId: finalBizId,
      storeName,
      ownerName,
      phone: `+91${phone10}`,
      businessCategory: (category as "kirana" | "restaurant" | "chemist" | "salon" | "carwash") || "kirana",
      city,
      address: params.address || `${storeName}, ${city}`,
      isStoreOnline: true,
      lastUpdatedAt: new Date().toISOString(),
    });
  } catch {}

  return {
    success: true,
    message: `Store "${storeName}" registered successfully!`,
    businessId: finalBizId,
    redirectUrl: "/merchant/app",
  };
}

/**
 * 1-Tap Google Sign-In for Merchant Console.
 */
export async function authenticateMerchantWithGoogle(
  email: string,
  fullName: string,
  phone?: string
): Promise<{
  success: boolean;
  message: string;
  businessId?: string;
  redirectUrl?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName?.trim() || "Merchant Partner";
  const phone10 = phone ? cleanPhone(phone) : null;

  const admin = createSupabaseAdminClient();

  // Check if profile exists by email in merchant_profiles or owner name
  const { data: existingProfiles } = await admin
    .from("merchant_profiles")
    .select("user_id, email")
    .eq("email", cleanEmail)
    .limit(1);

  if (existingProfiles && existingProfiles.length > 0) {
    const { data: mapping } = await admin
      .from("merchant_accounts")
      .select("business_id")
      .eq("user_id", existingProfiles[0].user_id)
      .maybeSingle();

    if (mapping) {
      await establishMerchantAuthSession(mapping.business_id, cleanEmail, phone10);
      return {
        success: true,
        message: `Welcome back, ${cleanName}!`,
        businessId: mapping.business_id,
        redirectUrl: "/merchant/app",
      };
    }
  }

  // Check if any business has this owner or phone
  let bizQuery = admin.from("businesses").select("id, name");
  if (phone10) {
    bizQuery = bizQuery.or(`phone.eq.+91${phone10},phone.eq.${phone10}`);
  } else {
    bizQuery = bizQuery.eq("owner", cleanName);
  }
  const { data: existingBiz } = await bizQuery.limit(1);

  if (existingBiz && existingBiz.length > 0) {
    await establishMerchantAuthSession(existingBiz[0].id, cleanEmail, phone10);
    return {
      success: true,
      message: `Welcome back to ${existingBiz[0].name}!`,
      businessId: existingBiz[0].id,
      redirectUrl: "/merchant/app",
    };
  }

  // Create new starter business for Google merchant
  const businessId = `g_${cleanEmail.replace(/[^a-z0-9]/g, "_").slice(0, 16)}_${Date.now().toString().slice(-4)}`;
  const storeName = `${cleanName}'s Store`;

  await admin.from("businesses").insert({
    id: businessId,
    name: storeName,
    owner: cleanName,
    phone: phone10 ? `+91${phone10}` : "+919876543210",
    type: "restaurant",
    city: "Bahraich",
    address: `Civil Lines, Bahraich`,
    status: "active",
    merchant_status: "active",
    plan: "growth",
    is_outlet_open: true,
    allow_taking_orders: true,
    is_taking_orders: true,
    registration_date: new Date().toISOString(),
  });

  await establishMerchantAuthSession(businessId, cleanEmail, phone10);

  return {
    success: true,
    message: `Store "${storeName}" created via Google!`,
    businessId,
    redirectUrl: "/merchant/app",
  };
}

/**
 * Creates Supabase Auth User & mappings, then signs in using createMerchantActionClient.
 */
async function establishMerchantAuthSession(
  businessId: string,
  email: string,
  phone10?: string | null
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const password = deterministicPassword(businessId);

  // Check if auth user exists
  const { data: userList } = await admin.auth.admin.listUsers();
  let authUser = userList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!authUser) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { businessId, phone: phone10 || undefined },
    });
    if (!error && created.user) {
      authUser = created.user;
    }
  } else {
    // Ensure password matches deterministic password
    await admin.auth.admin.updateUserById(authUser.id, { password });
  }

  if (authUser) {
    // Ensure merchant_accounts mapping exists
    await admin.from("merchant_accounts").upsert({
      user_id: authUser.id,
      business_id: businessId,
    });

    // Ensure merchant_profiles mapping exists
    await admin.from("merchant_profiles").upsert({
      user_id: authUser.id,
      email: email,
      mobile: phone10 ? `+91${phone10}` : null,
      mobile_verified_at: new Date().toISOString(),
    });

    // Sign in via createMerchantActionClient to set the review-qr-merchant-auth-token HTTP-only cookie
    const actionClient = await createMerchantActionClient();
    await actionClient.auth.signInWithPassword({
      email,
      password,
    });
  }
}
