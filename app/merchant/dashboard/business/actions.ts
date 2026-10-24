"use server";

import { revalidatePath } from "next/cache";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { safeGoogleReviewLink, safeReviewLink } from "@/lib/safe-review-link";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { isAvailableBusinessType } from "@/lib/business-category-admin.server";

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

  if (!name || name.length > 200) return { ok: false, message: "Enter a business name under 200 characters." };
  if (!type || type.length > 120) return { ok: false, message: "Enter a business type under 120 characters." };
  if (!owner || owner.length > 200) return { ok: false, message: "Enter an owner name under 200 characters." };
  if (!address || address.length > 1000) return { ok: false, message: "Enter a business address under 1,000 characters." };
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

    for (const path of ["/merchant/dashboard/business", "/merchant/dashboard/profile", "/merchant/dashboard", "/merchant/dashboard/qr"]) revalidatePath(path);
    return { ok: true, message: "Business details saved." };
  } catch {
    return { ok: false, message: "We could not save your business details. Please try again." };
  }
}
