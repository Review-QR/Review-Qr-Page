export function isVerifiedCashfreeSuccess(input: {
  eventType: unknown;
  paymentStatus: unknown;
  orderAmount: number;
  paymentAmount: number;
  verifiedAmount: number;
}): boolean {
  return input.eventType === "PAYMENT_SUCCESS_WEBHOOK" &&
    input.paymentStatus === "SUCCESS" &&
    input.orderAmount === input.verifiedAmount &&
    input.paymentAmount === input.verifiedAmount;
}
