/**
 * Trustit Admin Domain Types
 */

export interface AdminCommandMetrics {
  totalRunningOrders: number;
  activeRidersCount: number;
  totalDisputesCount: number;
  todayGrossSales: number;
}

export interface DisputeResolutionPayload {
  orderId: string;
  adminAction: "cancel_and_refund" | "return_to_merchant" | "dismiss_dispute";
  reason: string;
}
