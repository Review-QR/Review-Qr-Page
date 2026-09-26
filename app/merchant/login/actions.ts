"use server";

import { redirect } from "next/navigation";
import { createMerchantActionClient } from "@/lib/supabase-merchant-server";
import { merchantAuthEmail } from "@/lib/merchant-identity";

export type MerchantSignInState = { message: string };

export async function merchantSignInAction(
  _previousState: MerchantSignInState,
  formData: FormData
): Promise<MerchantSignInState> {
  const businessId = String(formData.get("businessId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!businessId || businessId.length > 128 || !password) {
    return { message: "Business ID or password is incorrect." };
  }

  const supabase = await createMerchantActionClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: merchantAuthEmail(businessId),
      password,
    });
    if (error || !data.user) {
      return { message: "Business ID or password is incorrect." };
    }

    const { data: mapping, error: mappingError } = await supabase
      .from("merchant_accounts")
      .select("business_id")
      .eq("business_id", businessId)
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (mappingError || !mapping) {
      await supabase.auth.signOut();
      return { message: "This merchant account is not active. Contact an administrator." };
    }

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("merchant_status", "active")
      .maybeSingle();
    if (businessError || !business) {
      await supabase.auth.signOut();
      return { message: "This merchant account is not active. Contact an administrator." };
    }
  } catch {
    try {
      await supabase.auth.signOut();
    } catch {
      // Fail closed if validation could not be completed.
    }
    return { message: "Unable to sign in right now. Please try again." };
  }

  redirect("/merchant/login");
}

export async function merchantSignOutAction(): Promise<void> {
  const supabase = await createMerchantActionClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // The merchant cookie namespace is isolated from Admin auth.
  }
  redirect("/merchant/login");
}
