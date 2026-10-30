/**
 * Merchant Authentication Module
 * Enforces strict merchant isolation and business-scoped authorization
 */

import { getActiveMerchant as getBaseActiveMerchant, requireActiveMerchant as requireBaseActiveMerchant } from "@/lib/merchant-auth";

/**
 * Re-exports the canonical server-side active merchant check
 * Throws redirect to /merchant/login if unauthenticated or suspended
 */
export async function requireActiveMerchant() {
  return requireBaseActiveMerchant();
}

/**
 * Returns the active authenticated merchant or null
 */
export async function getActiveMerchant() {
  return getBaseActiveMerchant();
}
