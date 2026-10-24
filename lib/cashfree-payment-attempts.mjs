const TERMINAL_FAILURE_STATES = new Set(["FAILED", "USER_DROPPED", "CANCELLED"]);
const KNOWN_NON_SUCCESS_STATES = new Set(["PENDING", ...TERMINAL_FAILURE_STATES]);

export function classifyCashfreePaymentAttempts(payments, orderStatus) {
  if (!Array.isArray(payments)) return "unverified";
  if (payments.some((payment) =>
    typeof payment !== "object" ||
    payment === null ||
    Array.isArray(payment) ||
    typeof payment.payment_status !== "string"
  )) return "unverified";

  const statuses = payments.map((payment) => payment.payment_status);
  if (statuses.includes("SUCCESS")) return "success";
  if (statuses.some((status) => !KNOWN_NON_SUCCESS_STATES.has(status))) return "unverified";
  if (statuses.includes("PENDING")) return "pending";
  if (statuses.length > 0 && statuses.every((status) => TERMINAL_FAILURE_STATES.has(status))) return "failed";
  if (orderStatus === "EXPIRED") return "expired";
  return "pending";
}
