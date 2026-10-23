"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createMerchantActionClient } from "@/lib/supabase-merchant-server";
import { merchantAuthEmail } from "@/lib/merchant-identity";
import { normalizeTrustitPhone } from "@/lib/trustit-onboarding";

export type MerchantSignInState = { message: string };

type ResolvedMerchantIdentity = {
  businessId: string;
  userId: string;
  email: string;
};

async function resolveMerchantIdentity(identifier: string): Promise<ResolvedMerchantIdentity | null> {
  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return null;
  }

  const normalizedMobile = normalizeTrustitPhone(identifier);

  if (normalizedMobile) {
    const digits = normalizedMobile.slice(1);
    const localNumber = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
    const phoneVariants = [...new Set([normalizedMobile, digits, localNumber])];

    const { data: businesses, error: businessError } = await adminClient
      .from("businesses")
      .select("id")
      .in("phone", phoneVariants)
      .eq("merchant_status", "active")
      .is("deleted_at", null);

    if (businessError || !businesses || businesses.length !== 1) return null;
    const businessId = businesses[0].id;

    const { data: mapping, error: mappingError } = await adminClient
      .from("merchant_accounts")
      .select("user_id")
      .eq("business_id", businessId)
      .maybeSingle();

    if (mappingError || !mapping) return null;
    const { data: userResult, error: userError } = await adminClient.auth.admin.getUserById(mapping.user_id);
    const email = userResult.user?.email ?? null;
    if (userError || !email) return null;

    return { businessId, userId: mapping.user_id, email };
  }

  const { data: business, error: businessError } = await adminClient
    .from("businesses")
    .select("id")
    .eq("id", identifier)
    .eq("merchant_status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (businessError || !business) return null;

  const { data: mapping, error: mappingError } = await adminClient
    .from("merchant_accounts")
    .select("user_id")
    .eq("business_id", business.id)
    .maybeSingle();

  if (mappingError || !mapping) return null;

  const { data: userResult, error: userError } = await adminClient.auth.admin.getUserById(mapping.user_id);
  const email = userResult.user?.email ?? null;
  if (userError || !email) return null;

  return { businessId: business.id, userId: mapping.user_id, email };
}

export async function merchantSignInAction(
  _previousState: MerchantSignInState,
  formData: FormData
): Promise<MerchantSignInState> {
  const identifier = String(formData.get("businessId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || identifier.length > 128 || !password) {
    return { message: "Business ID or password is incorrect." };
  }

  const supabase = await createMerchantActionClient();

  try {
    const identity = await resolveMerchantIdentity(identifier);
    if (!identity) {
      return { message: "Business ID or password is incorrect." };
    }

    // Merchant accounts use an internal email identity for password authentication.
    // Resolving the mapped Auth identity first makes Business ID and verified-mobile
    // login deterministic and avoids depending on the project's phone-provider toggle.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identity.email,
      password,
    });

    if (error || !data.user) {
      console.warn("Merchant password sign-in failed", {
        identifierType: normalizeTrustitPhone(identifier) ? "mobile" : "business_id",
        code: error?.code ?? "missing_user",
        status: error?.status ?? null,
      });
      return { message: "Business ID or password is incorrect." };
    }

    if (data.user.id !== identity.userId) {
      await supabase.auth.signOut();
      return { message: "Business ID or password is incorrect." };
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
