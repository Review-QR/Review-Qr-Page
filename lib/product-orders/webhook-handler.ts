import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isValidProductOrderId } from "./order-id";
import { verifyCashfreeProductPayment } from "./cashfree-product-service";

export interface ProductWebhookOrderData {
  order?: {
    order_id?: unknown;
    order_amount?: unknown;
    order_currency?: unknown;
  };
  payment?: {
    cf_payment_id?: unknown;
    payment_status?: unknown;
    payment_amount?: unknown;
    payment_currency?: unknown;
    payment_time?: unknown;
    payment_method?: unknown;
  };
}

export interface ProductWebhookPayload {
  type?: unknown;
  data?: ProductWebhookOrderData;
}

/**
 * Handles incoming Cashfree Webhooks specifically for Physical Product Orders.
 * Strictly decoupled from subscriptions. Never touches payment_records or subscription plans.
 */
export async function handleProductOrderWebhook(
  payload: ProductWebhookPayload,
): Promise<Response> {
  const orderId = payload.data?.order?.order_id;
  if (!isValidProductOrderId(orderId)) {
    return Response.json({ result: "rejected_invalid_product_order" }, { status: 400 });
  }

  const eventType = payload.type;
  const paymentStatus = payload.data?.payment?.payment_status;

  const isSuccess = eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS";
  const isFailed =
    eventType === "PAYMENT_FAILED_WEBHOOK" ||
    paymentStatus === "FAILED" ||
    paymentStatus === "USER_DROPPED" ||
    paymentStatus === "CANCELLED";

  if (!isSuccess && !isFailed) {
    return Response.json({ result: "ignored_event" }, { status: 200 });
  }

  const admin = createSupabaseAdminClient();

  // 1. Fetch current order state
  const { data: order, error: orderLookupError } = await admin
    .from("product_orders")
    .select("id, status, total_amount, business_id")
    .eq("id", orderId)
    .maybeSingle();

  if (orderLookupError || !order) {
    return Response.json({ result: "order_not_found" }, { status: 404 });
  }

  // Idempotency: If order is already paid, confirmed, in production or shipped
  if (order.status !== "draft" && order.status !== "awaiting_payment") {
    return Response.json({ result: "already_applied" }, { status: 200 });
  }

  if (isFailed) {
    // Record payment failure
    await admin.from("product_payments").upsert({
      order_id: orderId,
      cashfree_order_id: orderId,
      payment_status: paymentStatus === "USER_DROPPED" ? "USER_DROPPED" : "FAILED",
      amount: order.total_amount,
      raw_payload: payload as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    }, { onConflict: "cashfree_order_id" });

    return Response.json({ result: "acknowledged_failure" }, { status: 200 });
  }

  // 2. Perform authoritative server-side verification with Cashfree
  const verification = await verifyCashfreeProductPayment(orderId);
  if (verification.status !== "VERIFIED_SUCCESS") {
    return Response.json({ result: "verification_retry_required" }, { status: 503 });
  }

  // 3. Mark physical product order as paid & record payment
  const paidAt = verification.paidAt || new Date().toISOString();

  const { error: updateOrderError } = await admin
    .from("product_orders")
    .update({
      status: "paid",
      paid_at: paidAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateOrderError) {
    return Response.json({ result: "order_update_failed" }, { status: 500 });
  }

  // 4. Record product payment details
  await admin.from("product_payments").upsert({
    order_id: orderId,
    cashfree_order_id: orderId,
    cashfree_payment_id: verification.paymentId,
    amount: verification.amount,
    currency: "INR",
    payment_status: "SUCCESS",
    payment_method: verification.paymentMethod || "online",
    verified_at: paidAt,
    raw_payload: (verification.rawPayload || payload) as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  }, { onConflict: "cashfree_order_id" });

  // 5. Append immutable audit log
  await admin.from("product_order_audit_logs").insert({
    order_id: orderId,
    actor_type: "webhook",
    action: "payment_verified_and_order_paid",
    details: {
      cashfree_payment_id: verification.paymentId,
      amount: verification.amount,
      paid_at: paidAt,
    },
  });

  return Response.json({ result: "applied" }, { status: 200 });
}
