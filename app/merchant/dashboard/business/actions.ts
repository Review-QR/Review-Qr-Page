"use server";

import { revalidatePath } from "next/cache";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { safeGoogleReviewLink, safeReviewLink } from "@/lib/safe-review-link";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAvailableBusinessType } from "@/lib/business-category-admin.server";
import { normalizeTrustitPhone } from "@/lib/trustit-onboarding";
import { sendMerchantPhoneOtp, verifyMerchantPhoneOtp } from "@/lib/auth/phone-otp-service";
import { sendMerchantEmailOtp, verifyMerchantEmailOtp } from "@/lib/auth/email-service";

export type GoogleReviewLinkState = { success: boolean; message: string };

export async function updateGoogleReviewLinkAction(
  _previous: GoogleReviewLinkState,
  formData: FormData,
): Promise<GoogleReviewLinkState> {
  const merchant = await getActiveMerchant();
  if (!merchant) return { success: false, message: "Sign in to an active merchant account to update this link." };

  const raw = String(formData.get("reviewLink") ?? "").trim();
  const reviewLink = safeGoogleReviewLink(raw);
  if (!reviewLink) return { success: false, message: "Enter a valid HTTPS Google Review link." };

  try {
    const supabase = await createMerchantServerClient();
    const { error } = await supabase.rpc("set_merchant_google_review_link", {
      p_review_link: reviewLink,
    });
    if (error) return { success: false, message: "The Google Review link could not be saved. Please try again." };
    revalidatePath("/merchant/dashboard/business");
    revalidatePath("/merchant/dashboard");
    revalidatePath("/merchant/dashboard/qr");
    return { success: true, message: "Google Review link updated." };
  } catch {
    return { success: false, message: "The Google Review link could not be saved. Please try again." };
  }
}

export type BusinessProfileActionState = { message: string; ok: boolean };

export async function saveBusinessProfileAction(
  _previous: BusinessProfileActionState,
  formData: FormData,
): Promise<BusinessProfileActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const emailRaw = formData.get("email");
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

  if (!name || name.length > 200) return { ok: false, message: "Enter a business name under 200 characters." };
  if (!type || type.length > 120) return { ok: false, message: "Enter a business type under 120 characters." };
  if (!owner || owner.length > 200) return { ok: false, message: "Enter an owner name under 200 characters." };
  if (!address || address.length > 1000) return { ok: false, message: "Enter a business address under 1,000 characters." };
  if (email && (!email.includes("@") || !email.includes("."))) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const merchant = await getActiveMerchant();
  if (!merchant) return { ok: false, message: "Sign in to an active merchant account to update your profile." };
  if (!(await isAvailableBusinessType(type, true))) {
    return { ok: false, message: "Choose a valid business type from the category list." };
  }
  const reviewLink = merchant.reviewLink ? safeReviewLink(merchant.reviewLink) : null;
  if (merchant.reviewLink && !reviewLink) {
    return { ok: false, message: "Update your Google Review link before saving business details." };
  }

  try {
    const supabase = await createMerchantServerClient();
    const { error } = await supabase.rpc("update_merchant_business_profile", {
      p_name: name,
      p_type: type,
      p_owner: owner,
      p_address: address,
      p_review_link: reviewLink,
    });
    if (error) return { ok: false, message: "We could not save your business details. Please try again." };

    // Update optional email in merchant_profiles
    const admin = createSupabaseAdminClient();
    await admin.from("merchant_profiles").update({ email: email || null }).eq("user_id", merchant.userId);

    for (const path of ["/merchant/dashboard/business", "/merchant/dashboard/profile", "/merchant/dashboard", "/merchant/dashboard/qr"]) revalidatePath(path);
    return { ok: true, message: "Business details saved." };
  } catch {
    return { ok: false, message: "We could not save your business details. Please try again." };
  }
}

/** 1. Request OTP for Changing Registered Mobile */
export async function requestMerchantMobileChangeOtpAction(newMobile: string): Promise<{ success: boolean; message: string }> {
  const merchant = await getActiveMerchant();
  if (!merchant) return { success: false, message: "Please sign in to update your registered mobile number." };

  const phone = normalizeTrustitPhone(newMobile);
  if (!phone) {
    return { success: false, message: "Please enter a valid 10-digit mobile number." };
  }

  const digits = phone.replace(/\D/g, "");
  const currentDigits = (merchant.registeredMobile || "").replace(/\D/g, "");
  if (digits === currentDigits) {
    return { success: false, message: "This is already your registered mobile number." };
  }

  const admin = createSupabaseAdminClient();
  const { data: existingBiz } = await admin
    .from("businesses")
    .select("id, name")
    .eq("phone", phone)
    .neq("id", merchant.businessId)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingBiz) {
    return { success: false, message: `This number is already registered with "${existingBiz.name}".` };
  }

  return sendMerchantPhoneOtp(phone, merchant.businessName);
}

/** 2. Verify OTP & Apply Registered Mobile Change */
export async function verifyAndApplyMobileChangeAction(newMobile: string, otp: string): Promise<{ success: boolean; message: string; phone?: string }> {
  const merchant = await getActiveMerchant();
  if (!merchant) return { success: false, message: "Please sign in to update your registered mobile number." };

  const phone = normalizeTrustitPhone(newMobile);
  if (!phone) return { success: false, message: "Invalid mobile number." };
  if (!otp || otp.trim().length !== 6) return { success: false, message: "Enter a valid 6-digit OTP code." };

  const verification = await verifyMerchantPhoneOtp(phone, otp.trim());
  if (!verification.success) {
    return { success: false, message: verification.message };
  }

  const admin = createSupabaseAdminClient();

  // 1. Update businesses table
  await admin.from("businesses").update({ phone }).eq("id", merchant.businessId);

  // 2. Update merchant_profiles table
  await admin.from("merchant_profiles").update({
    mobile: phone,
    mobile_verified_at: new Date().toISOString(),
  }).eq("user_id", merchant.userId);

  // 3. Update auth user phone and user_metadata
  try {
    await admin.auth.admin.updateUserById(merchant.userId, {
      phone,
      phone_confirm: true,
      user_metadata: { phone_verified: true },
    });
  } catch {}

  for (const path of ["/merchant/dashboard/business", "/merchant/dashboard/profile", "/merchant/dashboard"]) revalidatePath(path);
  return { success: true, message: "Mobile number updated and verified successfully!", phone: phone.slice(-10) };
}

/** 3. Request OTP for Changing/Verifying Email */
export async function requestMerchantEmailChangeOtpAction(newEmail: string): Promise<{ success: boolean; message: string }> {
  const merchant = await getActiveMerchant();
  if (!merchant) return { success: false, message: "Please sign in to update your email." };

  const cleanEmail = newEmail.trim().toLowerCase();
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { success: false, message: "Please enter a valid email address." };
  }

  return sendMerchantEmailOtp(cleanEmail, merchant.businessName);
}

/** 4. Verify OTP & Apply Email Change/Verification */
export async function verifyAndApplyEmailChangeAction(newEmail: string, otp: string): Promise<{ success: boolean; message: string; email?: string }> {
  const merchant = await getActiveMerchant();
  if (!merchant) return { success: false, message: "Please sign in to update your email." };

  const cleanEmail = newEmail.trim().toLowerCase();
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) return { success: false, message: "Invalid email." };
  if (!otp || otp.trim().length !== 6) return { success: false, message: "Enter a valid 6-digit OTP code." };

  const verification = await verifyMerchantEmailOtp(cleanEmail, otp.trim());
  if (!verification.success) {
    return { success: false, message: verification.message };
  }

  const admin = createSupabaseAdminClient();

  // 1. Update merchant_profiles
  await admin.from("merchant_profiles").update({ email: cleanEmail }).eq("user_id", merchant.userId);

  // 2. Update auth user email metadata
  try {
    await admin.auth.admin.updateUserById(merchant.userId, {
      email: cleanEmail,
      email_confirm: true,
      user_metadata: { email_verified: true },
    });
  } catch {}

  for (const path of ["/merchant/dashboard/business", "/merchant/dashboard/profile", "/merchant/dashboard"]) revalidatePath(path);
  return { success: true, message: "Email updated and verified successfully!", email: cleanEmail };
}
