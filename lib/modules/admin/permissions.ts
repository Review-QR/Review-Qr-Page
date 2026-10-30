/**
 * Admin Domain Permissions
 */

export const ADMIN_PERMISSIONS = {
  VIEW_COMMAND_CENTER: "admin:view_command_center",
  AUDIT_DELIVERY_OTPS: "admin:audit_otps",
  CANCEL_DOORSTEP_REFUSAL: "admin:cancel_refusal",
  MANAGE_BUSINESS_VERIFICATION: "admin:verify_merchants",
  MANAGE_COURIER_SHIPMENTS: "admin:manage_courier",
  EXECUTE_SETTLEMENTS: "admin:execute_settlements",
} as const;

/**
 * Asserts active administrator role
 */
export function assertAdminAccess(isAdmin: boolean) {
  if (!isAdmin) {
    throw new Error("Forbidden: System Administrator privileges required.");
  }
}
