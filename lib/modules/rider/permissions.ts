/**
 * Rider Domain Permissions
 */

export const RIDER_PERMISSIONS = {
  TOGGLE_DUTY_STATUS: "rider:toggle_duty",
  UPDATE_LIVE_GPS: "rider:update_gps",
  ACCEPT_DISPATCH_JOB: "rider:accept_dispatch",
  CONFIRM_COUNTER_PICKUP: "rider:confirm_pickup",
  VERIFY_DOORSTEP_OTP: "rider:verify_otp",
  REPORT_DISPUTE: "rider:report_dispute",
  REQUEST_INSTANT_PAYOUT: "rider:request_payout",
} as const;

/**
 * Asserts rider is allocated to the order
 */
export function assertRiderAssignedToOrder(sessionRiderId: string, orderRiderId: string | null) {
  if (!sessionRiderId || sessionRiderId !== orderRiderId) {
    throw new Error("Unauthorized: You are not the assigned delivery partner for this order.");
  }
}
