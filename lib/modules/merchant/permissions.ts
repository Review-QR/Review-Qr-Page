/**
 * Merchant Permissions & Multi-Tenant Access Boundaries
 */

export const MERCHANT_PERMISSIONS = {
  VIEW_STORE_DASHBOARD: "merchant:view_dashboard",
  MANAGE_CATALOG: "merchant:manage_catalog",
  ACCEPT_ORDERS: "merchant:accept_orders",
  MARK_ORDER_READY: "merchant:mark_ready",
  QUOTE_PARCHA: "merchant:quote_parcha",
  MANAGE_QR_STANDEES: "merchant:manage_qr",
  VIEW_SETTLEMENTS: "merchant:view_settlements",
  REPLY_REVIEWS: "merchant:reply_reviews",
} as const;

/**
 * Asserts that the authenticated merchant owns the target business
 * Prevents cross-business tenant data manipulation
 */
export function assertMerchantOwnsBusiness(sessionBusinessId: string, targetBusinessId: string) {
  if (!sessionBusinessId || sessionBusinessId !== targetBusinessId) {
    throw new Error("Unauthorized: Merchant is not permitted to access this business record.");
  }
}
