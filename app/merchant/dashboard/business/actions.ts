"use server";

import { revalidatePath } from "next/cache";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { safeReviewLink } from "@/lib/safe-review-link";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export type BusinessProfileActionState = { message: string; ok: boolean };

export async function saveBusinessProfileAction(
  _previous: BusinessProfileActionState,
  formData: FormData,
): Promise<BusinessProfileActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const rawReviewLink = String(formData.get("reviewLink") ?? "").trim();

  if (!name || name.length > 200) return { ok: false, message: "Enter a business name under 200 characters." };
  if (!type || type.length > 120) return { ok: false, message: "Enter a business type under 120 characters." };
  if (!owner || owner.length > 200) return { ok: false, message: "Enter an owner name under 200 characters." };
  if (!address || address.length > 1000) return { ok: false, message: "Enter a business address under 1,000 characters." };
  const reviewLink = rawReviewLink ? safeReviewLink(rawReviewLink) : null;
  if (rawReviewLink && (!reviewLink || rawReviewLink.length > 2048)) {
    return { ok: false, message: "Enter a valid HTTPS review link or leave it blank." };
  }

  if (!await getActiveMerchant()) return { ok: false, message: "Sign in to an active merchant account to update your profile." };
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
}
