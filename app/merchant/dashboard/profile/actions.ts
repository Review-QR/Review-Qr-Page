"use server";

import { revalidatePath } from "next/cache";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { isValidMerchantLocation } from "@/lib/merchant-profile-completion";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

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
