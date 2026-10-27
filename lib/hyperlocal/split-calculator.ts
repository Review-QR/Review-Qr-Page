import type { PayoutSplit, HyperlocalOrderType, PaymentMode } from "./types.ts";

export interface SplitCalculationInput {
  orderId: string;
  merchantId: string;
  orderType: HyperlocalOrderType;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  commissionRatePct?: number; // default 10%
  riderId?: string | null;
  paymentMode: PaymentMode;
}

export function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates multi-vendor escrow settlement splits down to 1 paisa precision.
 */
export function calculatePayoutSplits(input: SplitCalculationInput): PayoutSplit {
  const subtotal = Math.max(0, input.subtotal);
  const deliveryFee = Math.max(0, input.deliveryFee);
  const platformFee = Math.max(0, input.platformFee);
  const grossAmount = round(subtotal + deliveryFee + platformFee);

  const rate = (input.commissionRatePct ?? 10) / 100;

  // Merchant calculations
  const merchantGross = round(subtotal);
  const platformCommission = round(merchantGross * rate);
  const merchantNetPayable = round(merchantGross - platformCommission);

  // Rider calculations (Delivery orders get the delivery fee)
  const isDelivery = input.orderType === "food_delivery" || input.orderType === "grocery_parcha" || input.orderType === "parcel_pickup";
  const riderPayout = isDelivery ? round(deliveryFee) : 0;

  // Payment gateway fee (Cashfree ~1.75% for online payments)
  const paymentGatewayFee = input.paymentMode === "online_cashfree" ? round(grossAmount * 0.0175) : 0;

  return {
    order_id: input.orderId,
    gross_amount: grossAmount,
    merchant_id: input.merchantId,
    merchant_gross: merchantGross,
    platform_commission: platformCommission,
    merchant_net_payable: merchantNetPayable,
    rider_id: input.riderId || null,
    rider_payout: riderPayout,
    platform_convenience_fee: platformFee,
    payment_gateway_fee: paymentGatewayFee,
    settlement_status: "pending",
  };
}
