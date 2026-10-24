import { isVerifiedCashfreeSuccess } from "./cashfree-payment-guard.ts";

const MAX_WEBHOOK_BYTES = 1_000_000;
const ORDER_ID_PATTERN = /^rqr_[a-f0-9]{32,34}$/;
const SAFE_RESPONSE_HEADERS = { "cache-control": "no-store" };

type WebhookPayload = {
  type?: unknown;
  data?: {
    order?: {
      order_id?: unknown;
      order_amount?: unknown;
      order_currency?: unknown;
    };
    payment?: {
      payment_status?: unknown;
      payment_amount?: unknown;
      payment_currency?: unknown;
      payment_time?: unknown;
    };
  };
};

type VerifiedOrder =
  | { status: "VERIFIED_SUCCESS"; orderId: string; businessId: string; planId: string; amount: number; paidAt: string }
  | { status: "NOT_SUCCESS" }
  | { status: "UNMAPPED" }
  | { status: "VERIFICATION_ERROR" };

type PaymentApplication = {
  businessId: string;
  orderId: string;
  plan: string;
  amount: number;
  currency: "INR";
  paidAt: string;
};

type OnboardingSession = {
  payment_mode?: unknown;
  selected_plan?: unknown;
  user_id?: unknown;
};

type RpcResult = { data: unknown; error: unknown };
type Awaitable<T> = Promise<T> | PromiseLike<T>;

export type CashfreeWebhookDependencies = {
  verifySignature(input: {
    rawBody: string;
    timestamp: string | null;
    signature: string | null;
  }): boolean;
  verifyOrder(orderId: string): Promise<VerifiedOrder>;
  getPlanName(planId: string): string | undefined;
  createAdminGateway(): {
    findOnboarding(orderId: string, businessId: string): Awaitable<{
      data: OnboardingSession | null;
      error: unknown;
    }>;
    finalizeOneTimePayment(input: PaymentApplication): Awaitable<RpcResult>;
    applyPayment(input: PaymentApplication): Awaitable<RpcResult>;
  };
};

function jsonResponse(status: number, result: string): Response {
  return Response.json({ result }, { status, headers: SAFE_RESPONSE_HEADERS });
}

export function createCashfreeWebhookHandler(deps: CashfreeWebhookDependencies) {
  return async function POST(request: Request): Promise<Response> {
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) {
      return jsonResponse(413, "rejected");
    }

    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return jsonResponse(400, "rejected");
    }
    if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BYTES) {
      return jsonResponse(413, "rejected");
    }

    if (!deps.verifySignature({
      rawBody,
      timestamp: request.headers.get("x-webhook-timestamp"),
      signature: request.headers.get("x-webhook-signature"),
    })) {
      return jsonResponse(401, "unauthorized");
    }

    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody) as WebhookPayload;
    } catch {
      return jsonResponse(400, "rejected");
    }

    const eventType = payload.type;
    const paymentStatus = payload.data?.payment?.payment_status;
    const isSuccessEvent = eventType === "PAYMENT_SUCCESS_WEBHOOK";
    const isNonSuccessEvent =
      (eventType === "PAYMENT_FAILED_WEBHOOK" && paymentStatus === "FAILED") ||
      (eventType === "PAYMENT_USER_DROPPED_WEBHOOK" && paymentStatus === "USER_DROPPED") ||
      (eventType === "PAYMENT_PENDING_WEBHOOK" && paymentStatus === "PENDING") ||
      (eventType === "PAYMENT_CANCELLED_WEBHOOK" && paymentStatus === "CANCELLED");

    if (!isSuccessEvent && !isNonSuccessEvent) {
      return jsonResponse(200, "ignored");
    }

    const order = payload.data?.order;
    const payment = payload.data?.payment;
    if (
      typeof order?.order_id !== "string" ||
      !ORDER_ID_PATTERN.test(order.order_id) ||
      typeof order.order_amount !== "number" ||
      !Number.isFinite(order.order_amount) ||
      order.order_amount < 1 ||
      order.order_currency !== "INR" ||
      typeof payment?.payment_amount !== "number" ||
      !Number.isFinite(payment.payment_amount) ||
      payment.payment_amount < 0 ||
      payment.payment_currency !== "INR"
    ) {
      return jsonResponse(400, "rejected");
    }
    if (isNonSuccessEvent) return jsonResponse(200, "acknowledged");
    if (paymentStatus !== "SUCCESS") return jsonResponse(400, "rejected");

    const verified = await deps.verifyOrder(order.order_id);
    if (verified.status === "VERIFICATION_ERROR" || verified.status === "NOT_SUCCESS") {
      return jsonResponse(503, "retry");
    }
    if (verified.status === "UNMAPPED") {
      return jsonResponse(200, "ignored_unmapped");
    }
    if (verified.orderId !== order.order_id) return jsonResponse(400, "rejected");

    const planName = deps.getPlanName(verified.planId);
    if (!planName || !isVerifiedCashfreeSuccess({
      eventType,
      paymentStatus,
      orderAmount: order.order_amount,
      paymentAmount: payment.payment_amount,
      verifiedAmount: verified.amount,
    })) {
      return jsonResponse(400, "rejected");
    }

    const application: PaymentApplication = {
      businessId: verified.businessId,
      orderId: verified.orderId,
      plan: planName,
      amount: verified.amount,
      currency: "INR",
      paidAt: verified.paidAt,
    };

    try {
      const admin = deps.createAdminGateway();
      const { data: onboarding, error: onboardingLookupError } = await admin.findOnboarding(
        verified.orderId,
        verified.businessId,
      );
      if (onboardingLookupError) return jsonResponse(503, "retry");

      if (onboarding?.payment_mode === "one_time") {
        if (onboarding.selected_plan !== planName || typeof onboarding.user_id !== "string") {
          return jsonResponse(400, "rejected");
        }
        const { data, error } = await admin.finalizeOneTimePayment(application);
        if (error || !Array.isArray(data) || !data[0]) return jsonResponse(503, "retry");
        const result = (data[0] as { result?: unknown }).result;
        return result === "applied" || result === "already_applied"
          ? jsonResponse(200, result)
          : jsonResponse(503, "retry");
      }

      const { data, error } = await admin.applyPayment(application);
      if (error || !Array.isArray(data) || !data[0]) return jsonResponse(503, "retry");
      const result = (data[0] as { result?: unknown }).result;
      return result === "applied" || result === "already_applied"
        ? jsonResponse(200, result)
        : jsonResponse(503, "retry");
    } catch {
      return jsonResponse(503, "retry");
    }
  };
}
