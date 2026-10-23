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
  locality: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  discoveryLocationVerifiedAt: string | null;
  discoveryLocationVerifiedBy: string | null;
  discoveryLocationVerificationSource: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
  locationCapturedAt: string | null;
  businessStatus: string | null;
  merchantStatus: string;
  plan: string | null;
  registrationDate: string | null;
  qrStatus: string | null;
  qrTemplate: string;
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
      .select("id, name, owner, phone, type, address, locality, city, district, state, pincode, discovery_location_verified_at, discovery_location_verified_by, discovery_location_verification_source, location_latitude, location_longitude, location_captured_at, status, merchant_status, plan, registration_date, qr_status, qr_template, expiry, review_link, deleted_at")
      .eq("id", mapping.business_id)
      .eq("merchant_status", "active")
      .is("deleted_at", null)
      .maybeSingle();
    if (businessError || !business) return null;

    return {
      businessId: business.id,
      businessName: business.name,
      ownerName: business.owner,
      registeredMobile: business.phone,
      businessType: business.type,
      address: business.address,
      locality: business.locality,
      city: business.city,
      district: business.district,
      state: business.state,
      pincode: business.pincode,
      discoveryLocationVerifiedAt: business.discovery_location_verified_at,
      discoveryLocationVerifiedBy: business.discovery_location_verified_by,
      discoveryLocationVerificationSource: business.discovery_location_verification_source,
      locationLatitude: typeof business.location_latitude === "number" ? business.location_latitude : null,
      locationLongitude: typeof business.location_longitude === "number" ? business.location_longitude : null,
      locationCapturedAt: business.location_captured_at,
      businessStatus: business.status,
      merchantStatus: business.merchant_status,
      plan: business.plan,
      registrationDate: business.registration_date,
      qrStatus: business.qr_status,
      qrTemplate: business.qr_template || "template_1",
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
