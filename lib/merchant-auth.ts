import "server-only";

import { redirect } from "next/navigation";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export type MerchantContext = {
  businessId: string;
  businessName: string;
  ownerName: string | null;
  registeredMobile: string | null;
  businessType: string | null;
  address: string | null;
  businessStatus: string | null;
  merchantStatus: string;
  plan: string | null;
  registrationDate: string | null;
  qrStatus: string | null;
  expiry: string | null;
  reviewLink: string | null;
};

export async function getActiveMerchant(): Promise<MerchantContext | null> {
  try {
    const supabase = await createMerchantServerClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const userId = claimsData?.claims.sub;
    if (claimsError || !userId) return null;

    const { data: mapping, error: mappingError } = await supabase
      .from("merchant_accounts")
      .select("business_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (mappingError || !mapping) return null;

    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, owner, phone, type, address, status, merchant_status, plan, registration_date, qr_status, expiry, review_link")
      .eq("id", mapping.business_id)
      .eq("merchant_status", "active")
      .maybeSingle();
    if (businessError || !business) return null;

    return {
      businessId: business.id,
      businessName: business.name,
      ownerName: business.owner,
      registeredMobile: business.phone,
      businessType: business.type,
      address: business.address,
      businessStatus: business.status,
      merchantStatus: business.merchant_status,
      plan: business.plan,
      registrationDate: business.registration_date,
      qrStatus: business.qr_status,
      expiry: business.expiry,
      reviewLink: business.review_link,
    };
  } catch {
    // Fail closed without exposing database or session details to the merchant.
    return null;
  }
}

export async function requireActiveMerchant(): Promise<MerchantContext> {
  const merchant = await getActiveMerchant();
  if (!merchant) redirect("/merchant/login");
  return merchant;
}
