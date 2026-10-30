/**
 * Customer Domain Permissions & Access Boundaries
 * Enforces strict multi-tenant boundary: customers can ONLY see their own data
 */

export const CUSTOMER_PERMISSIONS = {
  VIEW_OWN_ORDERS: "customer:view_own_orders",
  PLACE_ORDER: "customer:place_order",
  UPLOAD_PARCHA: "customer:upload_parcha",
  BOOK_SERVICE_TOKEN: "customer:book_service_token",
  MANAGE_OWN_ADDRESSES: "customer:manage_own_addresses",
  SUBMIT_REVIEW: "customer:submit_review",
} as const;

/**
 * Asserts customer ownership of an order
 */
export function assertCustomerOwnsOrder(sessionCustomerId: string, orderCustomerId: string | null) {
  if (!sessionCustomerId || sessionCustomerId !== orderCustomerId) {
    throw new Error("Unauthorized: You do not have permission to access this order.");
  }
}

/**
 * Asserts customer ownership of a saved address
 */
export function assertCustomerOwnsAddress(sessionCustomerId: string, addressCustomerId: string) {
  if (!sessionCustomerId || sessionCustomerId !== addressCustomerId) {
    throw new Error("Unauthorized: You do not have permission to modify this address.");
  }
}
