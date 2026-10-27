export interface ShippingCalculationInput {
  pinCode: string;
  subtotal: number;
  hasBanner?: boolean;
  hasStandee?: boolean;
}

export interface ShippingCalculationResult {
  shippingAmount: number;
  isFreeShipping: boolean;
  estimatedDays: number;
  pinCodeValid: boolean;
  region: "metro" | "standard" | "special_zone";
}

const INDIAN_PINCODE_PATTERN = /^[1-9][0-9]{5}$/;

// Remote / Special logistics zones in India
const SPECIAL_ZONE_PREFIXES = ["19", "79", "744"]; // J&K, North-East, Andaman

/**
 * Calculates delivery shipping fee and transit estimate based on destination PIN and cart contents.
 * Threshold: Free shipping for orders of ₹999 and above.
 */
export function calculateShipping(input: ShippingCalculationInput): ShippingCalculationResult {
  const cleanPin = (input.pinCode || "").trim();
  const pinCodeValid = INDIAN_PINCODE_PATTERN.test(cleanPin);

  // Free shipping eligibility
  if (input.subtotal >= 999) {
    return {
      shippingAmount: 0,
      isFreeShipping: true,
      estimatedDays: 4,
      pinCodeValid,
      region: "standard",
    };
  }

  const isSpecialZone = pinCodeValid && SPECIAL_ZONE_PREFIXES.some((prefix) => cleanPin.startsWith(prefix));
  const region = isSpecialZone ? "special_zone" : "standard";

  // Base shipping cost based on volumetric weight
  let baseShipping = 49; // Default for small items like stickers
  if (input.hasBanner) {
    baseShipping = 149; // Heavy roll-up standee / banner
  } else if (input.hasStandee) {
    baseShipping = 79; // Acrylic or wooden tabletop standees
  }

  const specialSurcharge = isSpecialZone ? 50 : 0;
  const shippingAmount = baseShipping + specialSurcharge;
  const estimatedDays = isSpecialZone ? 7 : input.hasBanner ? 5 : 3;

  return {
    shippingAmount,
    isFreeShipping: false,
    estimatedDays,
    pinCodeValid,
    region,
  };
}
