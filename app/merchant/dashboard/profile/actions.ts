"use server";

import { revalidatePath } from "next/cache";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { isValidMerchantLocation } from "@/lib/merchant-profile-completion";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { merchantAuthEmail } from "@/lib/merchant-identity";

export async function saveMerchantLocationAction(latitude: number, longitude: number) {
  if (!isValidMerchantLocation(latitude, longitude)) {
    return { ok: false as const, message: "The device returned invalid coordinates. Please try again." };
  }
  if (!await getActiveMerchant()) {
    return { ok: false as const, message: "Sign in to an active merchant account to save your location." };
  }
  const supabase = await createMerchantServerClient();
  const { data, error } = await supabase.rpc("set_merchant_business_location", {
    p_latitude: latitude,
    p_longitude: longitude,
  });
  if (error || typeof data !== "string") {
    return { ok: false as const, message: "We could not save the location. Please try again." };
  }
  revalidatePath("/merchant/dashboard/profile");
  revalidatePath("/merchant/dashboard/business");
  return { ok: true as const, capturedAt: data, message: "Location captured and saved." };
}

export type ChangePasswordResult = {
  success: boolean;
  message: string;
};

export async function changeMerchantPasswordAction(
  _previousState: ChangePasswordResult | null,
  formData: FormData
): Promise<ChangePasswordResult> {
  const merchant = await getActiveMerchant();
  if (!merchant) {
    return { success: false, message: "You must be signed in to change your password." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (!newPassword || newPassword.length < 8 || newPassword.length > 64) {
    return { success: false, message: "New password must be between 8 and 64 characters." };
  }

  if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { success: false, message: "New password must contain at least one letter and one number." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New password and confirmation password do not match." };
  }

  try {
    const adminClient = createSupabaseAdminClient();

    // If current password provided, verify it first
    if (currentPassword) {
      const { error: signInError } = await adminClient.auth.signInWithPassword({
        email: merchantAuthEmail(merchant.businessId),
        password: currentPassword,
      });
      if (signInError) {
        return { success: false, message: "Current password is incorrect." };
      }
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      merchant.userId,
      { password: newPassword }
    );

    if (updateError) {
      return { success: false, message: updateError.message || "Failed to update password. Please try again." };
    }

    return { success: true, message: "Password updated successfully!" };
  } catch {
    return { success: false, message: "Unable to update password right now. Please try again." };
  }
}
