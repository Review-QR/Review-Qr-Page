export type MerchantProfileFields = {
  businessName: string | null;
  businessType: string | null;
  ownerName: string | null;
  registeredMobile: string | null;
  address: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
  locationCapturedAt: string | null;
};

export function isValidMerchantLocation(latitude: number, longitude: number) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90
    && longitude >= -180 && longitude <= 180;
}

// The profile score is the share of six core registration/location details that are present.
// Google Review Link is optional by design and is never included in the denominator.
export function getMerchantProfileCompletion(profile: MerchantProfileFields) {
  const locationPresent = profile.locationCapturedAt !== null
    && profile.locationCapturedAt.trim() !== ""
    && profile.locationLatitude !== null
    && profile.locationLongitude !== null
    && isValidMerchantLocation(profile.locationLatitude, profile.locationLongitude);
  const items = [
    { id: "business-name", label: "Business Name", complete: Boolean(profile.businessName?.trim()), action: "/merchant/dashboard/business" },
    { id: "business-type", label: "Business Type", complete: Boolean(profile.businessType?.trim()), action: "/merchant/dashboard/business" },
    { id: "owner-name", label: "Owner Name", complete: Boolean(profile.ownerName?.trim()), action: "/merchant/dashboard/business" },
    { id: "mobile", label: "Mobile Number", complete: Boolean(profile.registeredMobile?.trim()), action: "/merchant/dashboard/business" },
    { id: "business-address", label: "Business Address", complete: Boolean(profile.address?.trim()), action: "/merchant/dashboard/business" },
    { id: "live-location", label: "Live Location", complete: locationPresent, action: "capture-location" },
  ] as const;
  const completedCount = items.filter((item) => item.complete).length;
  return { score: Math.round((completedCount / items.length) * 100), completedCount, totalCount: items.length, items };
}
