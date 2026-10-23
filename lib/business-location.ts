import { BUSINESS_TYPES } from "./business-types.ts";

export type StructuredBusinessLocation = {
  locality: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
};

export type PublicDiscoveryLocationInput = StructuredBusinessLocation;

export type PublicDiscoveryLocationRecord = PublicDiscoveryLocationInput & {
  type: string | null | undefined;
  verifiedAt: string | null | undefined;
  latitude?: number | null;
  longitude?: number | null;
};

const fieldLimits = {
  locality: 160,
  city: 160,
  district: 160,
  state: 100,
} as const;

export function parseStructuredBusinessLocation(
  values: Record<keyof StructuredBusinessLocation, string>,
): StructuredBusinessLocation | null {
  const parsed = {
    locality: values.locality.trim() || null,
    city: values.city.trim() || null,
    district: values.district.trim() || null,
    state: values.state.trim() || null,
    pincode: values.pincode.trim() || null,
  };

  for (const field of Object.keys(fieldLimits) as (keyof typeof fieldLimits)[]) {
    const value = parsed[field];
    if (value !== null && value.length > fieldLimits[field]) return null;
  }

  if (parsed.pincode !== null && !/^\d{6}$/.test(parsed.pincode)) return null;
  return parsed;
}

export function isValidStructuredBusinessLocation(
  values: Record<keyof StructuredBusinessLocation, string>,
) {
  return parseStructuredBusinessLocation(values) !== null;
}

export function parsePublicDiscoveryLocation(
  values: Record<keyof PublicDiscoveryLocationInput, string>,
): PublicDiscoveryLocationInput | null {
  const location = parseStructuredBusinessLocation(values);
  if (!location || !location.city || !location.state) return null;
  return location;
}

export function isPublicDiscoveryLocationComplete(record: PublicDiscoveryLocationRecord) {
  return BUSINESS_TYPES.includes(record.type as (typeof BUSINESS_TYPES)[number])
    && Boolean(record.city?.trim())
    && Boolean(record.state?.trim())
    && Boolean(record.pincode && /^\d{6}$/.test(record.pincode))
    && Boolean(record.verifiedAt);
}

export function hasUsableCoordinates(record: Pick<PublicDiscoveryLocationRecord, "latitude" | "longitude">) {
  return typeof record.latitude === "number" && Number.isFinite(record.latitude) && Math.abs(record.latitude) <= 90
    && typeof record.longitude === "number" && Number.isFinite(record.longitude) && Math.abs(record.longitude) <= 180;
}
