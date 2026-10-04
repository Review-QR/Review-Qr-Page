"use server";

import { revalidatePath } from "next/cache";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { safeGoogleReviewLink } from "@/lib/safe-review-link";

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
