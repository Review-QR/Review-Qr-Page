"use server";

import { revalidatePath } from "next/cache";
import { BUSINESS_TYPES } from "@/lib/business-types";
import { parsePublicDiscoveryLocation } from "@/lib/business-location";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export type PublicLocationActionState = { ok: boolean; message: string };

export async function saveMerchantDiscoveryLocationAction(
  _previous: PublicLocationActionState,
  formData: FormData,
): Promise<PublicLocationActionState> {
  const location = parsePublicDiscoveryLocation({
    locality: String(formData.get("locality") ?? ""),
    city: String(formData.get("city") ?? ""),
    district: String(formData.get("district") ?? ""),
    state: String(formData.get("state") ?? ""),
    pincode: String(formData.get("pincode") ?? ""),
  });
  if (!location) return { ok: false, message: "Enter a city and state. Pincode may be blank or exactly 6 digits." };

  const merchant = await getActiveMerchant();
  if (!merchant) return { ok: false, message: "Sign in to an active merchant account to save your location." };
  if (!merchant.businessType || !BUSINESS_TYPES.includes(merchant.businessType as (typeof BUSINESS_TYPES)[number])) {
    return { ok: false, message: "Ask an administrator to correct the business category before completing its public location." };
  }

  const supabase = await createMerchantServerClient();
  const { error } = await supabase.rpc("save_merchant_discovery_location", {
    p_locality: location.locality,
    p_city: location.city,
    p_district: location.district,
    p_state: location.state,
    p_pincode: location.pincode,
  });
  if (error) return { ok: false, message: "We could not save the public location. Please try again." };

  for (const path of ["/merchant/dashboard/business", "/merchant/dashboard", "/merchant/dashboard/profile"]) revalidatePath(path);
  return { ok: true, message: "Location saved and marked as merchant confirmed." };
}
