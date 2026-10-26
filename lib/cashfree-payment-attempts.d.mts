export type CashfreePaymentAttemptState = "success" | "pending" | "failed" | "expired" | "unverified";

export function classifyCashfreePaymentAttempts(
  payments: unknown,
  orderStatus: unknown,
): CashfreePaymentAttemptState;
