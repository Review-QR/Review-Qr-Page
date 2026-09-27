import { appConfig } from "@/lib/config";
import {
  verifyCashfreeWebhookOrder,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WEBHOOK_BYTES = 1_000_000;
const ORDER_ID_PATTERN = /^rqr_[a-f0-9]{32}$/;
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

function jsonResponse(status: number, result: string): Response {
  return Response.json(
    { result },
    { status, headers: SAFE_RESPONSE_HEADERS },
  );
}

export async function POST(request: Request): Promise<Response> {
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

  if (
    !verifyCashfreeWebhookSignature({
      rawBody,
      timestamp: request.headers.get("x-webhook-timestamp"),
      signature: request.headers.get("x-webhook-signature"),
    })
  ) {
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
    (eventType === "PAYMENT_USER_DROPPED_WEBHOOK" &&
      paymentStatus === "USER_DROPPED") ||
    (eventType === "PAYMENT_PENDING_WEBHOOK" && paymentStatus === "PENDING");

  if (!isSuccessEvent && !isNonSuccessEvent) {
    // Other valid Cashfree event types do not affect Review-QR subscriptions.
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

  const verified = await verifyCashfreeWebhookOrder(order.order_id);
  if (verified.status === "VERIFICATION_ERROR") {
    return jsonResponse(503, "retry");
  }
  if (verified.status === "NOT_SUCCESS") {
    return jsonResponse(503, "retry");
  }
  if (verified.status === "UNMAPPED") {
    // Older orders have no signed server-created order context; never guess.
    return jsonResponse(200, "ignored_unmapped");
  }
  if (
    order.order_amount !== verified.amount ||
    payment.payment_amount !== verified.amount
  ) {
    return jsonResponse(400, "rejected");
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc(
      "apply_verified_cashfree_payment",
      {
        p_business_id: verified.businessId,
        p_cashfree_order_id: verified.orderId,
        p_plan: appConfig.plans[verified.planId].name,
        p_amount: verified.amount,
        p_currency: "INR",
        p_paid_at: verified.paidAt,
      },
    );
    if (error || !Array.isArray(data) || !data[0]) {
      return jsonResponse(503, "retry");
    }

    const result = (data[0] as { result?: unknown }).result;
    if (result === "applied" || result === "already_applied") {
      return jsonResponse(200, result);
    }
    return jsonResponse(503, "retry");
  } catch {
    return jsonResponse(503, "retry");
  }
}
