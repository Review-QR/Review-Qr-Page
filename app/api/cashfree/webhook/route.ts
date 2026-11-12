import { appConfig, type PlanId } from "@/lib/config";
import {
  verifyCashfreeWebhookOrder,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createCashfreeWebhookHandler } from "@/lib/cashfree-webhook-handler";
import { handleProductOrderWebhook } from "@/lib/product-orders/webhook-handler";
import { creditMerchantConnectWallet } from "@/lib/customer-crm-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const subscriptionWebhookHandler = createCashfreeWebhookHandler({
  verifySignature: verifyCashfreeWebhookSignature,
  verifyOrder: verifyCashfreeWebhookOrder,
  getPlanName: (planId) => appConfig.plans[planId as PlanId]?.name,
  createAdminGateway: () => {
    const admin = createSupabaseAdminClient();
    return {
      findOnboarding: (orderId: string, businessId: string) => admin
        .from("onboarding_sessions")
        .select("business_id, selected_plan, payment_mode, status, user_id")
        .eq("payment_reference", orderId)
        .eq("business_id", businessId)
        .maybeSingle(),
      finalizeOneTimePayment: (input) => admin.rpc("finalize_trustit_one_time_payment", {
        p_business_id: input.businessId,
        p_cashfree_order_id: input.orderId,
        p_plan: input.plan,
        p_amount: input.amount,
        p_currency: input.currency,
        p_paid_at: input.paidAt,
      }),
      applyPayment: (input) => admin.rpc("apply_verified_cashfree_payment", {
        p_business_id: input.businessId,
        p_cashfree_order_id: input.orderId,
        p_plan: input.plan,
        p_amount: input.amount,
        p_currency: input.currency,
        p_paid_at: input.paidAt,
      }),
    };
  },
});

export async function POST(request: Request): Promise<Response> {
  const cloned = request.clone();
  try {
    const text = await cloned.text();
    const payload = JSON.parse(text);
    const eventType = payload?.type;
    const orderId = payload?.data?.order?.order_id;
    const targetOrderTag = payload?.data?.order?.order_tags?.target_order_id;
    const resolvedHyperlocalOrderId =
      typeof orderId === "string" && orderId.startsWith("hord_")
        ? orderId
        : typeof targetOrderTag === "string" && targetOrderTag.startsWith("hord_")
          ? targetOrderTag
          : null;

    // A. Hyperlocal Order Refunds (REFUND_STATUS_WEBHOOK)
    if (
      eventType === "REFUND_STATUS_WEBHOOK" &&
      payload?.data?.refund &&
      (resolvedHyperlocalOrderId || typeof orderId === "string")
    ) {
      const timestamp = request.headers.get("x-webhook-timestamp");
      const signature = request.headers.get("x-webhook-signature");
      if (!verifyCashfreeWebhookSignature({ rawBody: text, timestamp, signature })) {
        return Response.json({ result: "unauthorized" }, { status: 401 });
      }

      const refundData = payload.data.refund as {
        refund_status?: string;
        refund_id?: string;
        cf_refund_id?: string | number;
        refund_arn?: string;
        refund_amount?: number;
        order_id?: string;
      };
      const lookupOrderId = resolvedHyperlocalOrderId || refundData.order_id || orderId;
      const refundStatus = String(refundData.refund_status || "").toUpperCase();
      if (typeof lookupOrderId === "string" && refundStatus === "SUCCESS") {
        const admin = createSupabaseAdminClient();
        const note = `Cashfree Refund Confirmed (ARN: ${refundData.refund_arn || refundData.cf_refund_id || refundData.refund_id || "processed"})`;
        await admin
          .from("hyperlocal_orders")
          .update({
            payment_status: "refunded",
            admin_notes: note,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${lookupOrderId},cashfree_order_id.eq.${lookupOrderId}`);
      }
      return Response.json({ success: true, eventType, refundStatus });
    }

    // B. Cashfree Payment Link Event (Rider Doorstep COD QR fallback)
    if (eventType === "PAYMENT_LINK_EVENT" && payload?.data?.link_status) {
      const timestamp = request.headers.get("x-webhook-timestamp");
      const signature = request.headers.get("x-webhook-signature");
      if (!verifyCashfreeWebhookSignature({ rawBody: text, timestamp, signature })) {
        return Response.json({ result: "unauthorized" }, { status: 401 });
      }

      const linkNotes = (payload?.data?.link_notes || {}) as Record<string, string>;
      const targetOrderId = linkNotes.target_order_id;
      const linkStatus = String(payload?.data?.link_status || "").toUpperCase();
      if (typeof targetOrderId === "string" && targetOrderId.startsWith("hord_") && linkStatus === "PAID") {
        const admin = createSupabaseAdminClient();
        const { data: dbOrder } = await admin
          .from("hyperlocal_orders")
          .select("id, total_amount, payment_status")
          .eq("id", targetOrderId)
          .maybeSingle();

        if (!dbOrder) {
          return Response.json({ result: "order_not_found" }, { status: 404 });
        }
        const paidAmount = Number(payload?.data?.link_amount_paid ?? payload?.data?.order?.order_amount ?? 0);
        if (!Number.isFinite(paidAmount) || paidAmount + 0.01 < Number(dbOrder.total_amount)) {
          return Response.json({ result: "tampered_amount_rejected" }, { status: 400 });
        }

        const linkRef = String(payload?.data?.link_id || payload?.data?.cf_link_id || "");
        const txId = String(payload?.data?.order?.transaction_id || payload?.data?.cf_link_id || linkRef);
        await admin
          .from("hyperlocal_orders")
          .update({
            payment_status: "paid",
            payment_mode: "online_cashfree",
            cashfree_order_id: linkRef || null,
            cashfree_payment_id: txId || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetOrderId);
      }
      return Response.json({ success: true, eventType, linkStatus });
    }

    if (resolvedHyperlocalOrderId) {
      // Verify webhook signature for Hyperlocal Super-App Order (and Rider QR orders)
      const timestamp = request.headers.get("x-webhook-timestamp");
      const signature = request.headers.get("x-webhook-signature");
      if (!verifyCashfreeWebhookSignature({ rawBody: text, timestamp, signature })) {
        return Response.json({ result: "unauthorized" }, { status: 401 });
      }

      const admin = createSupabaseAdminClient();
      const paymentStatus = payload?.data?.payment?.payment_status;
      const isSuccess = paymentStatus === "SUCCESS" || eventType === "PAYMENT_SUCCESS_WEBHOOK";

      if (isSuccess) {
        // Anti-tampering & idempotency check: require DB order and exact numeric amount match
        const { data: dbOrder } = await admin
          .from("hyperlocal_orders")
          .select("total_amount, payment_status")
          .eq("id", resolvedHyperlocalOrderId)
          .maybeSingle();

        if (!dbOrder) {
          return Response.json({ result: "order_not_found" }, { status: 404 });
        }

        if (dbOrder.payment_status === "paid") {
          return Response.json({ success: true, orderId: resolvedHyperlocalOrderId, paymentStatus: "paid", idempotent: true });
        }

        const rawAmount = payload?.data?.order?.order_amount ?? payload?.data?.payment?.payment_amount;
        const webhookOrderAmount = Number(rawAmount);
        if (!Number.isFinite(webhookOrderAmount) || Math.abs(webhookOrderAmount - Number(dbOrder.total_amount)) > 0.01) {
          return Response.json({ result: "tampered_amount_rejected" }, { status: 400 });
        }

        const cfPaymentId = payload?.data?.payment?.cf_payment_id
          ? String(payload.data.payment.cf_payment_id)
          : null;

        await admin
          .from("hyperlocal_orders")
          .update({
            payment_status: "paid",
            payment_mode: "online_cashfree",
            cashfree_order_id: typeof orderId === "string" ? orderId : resolvedHyperlocalOrderId,
            cashfree_payment_id: cfPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resolvedHyperlocalOrderId);

        return Response.json({ success: true, orderId: resolvedHyperlocalOrderId, paymentStatus: "paid" });
      }

      return Response.json({ success: true, orderId: resolvedHyperlocalOrderId, paymentStatus: paymentStatus || "PENDING" });
    }

    if (typeof orderId === "string" && orderId.startsWith("tord_")) {
      // Verify webhook signature for product order
      const timestamp = request.headers.get("x-webhook-timestamp");
      const signature = request.headers.get("x-webhook-signature");
      if (!verifyCashfreeWebhookSignature({ rawBody: text, timestamp, signature })) {
        return Response.json({ result: "unauthorized" }, { status: 401 });
      }
      return await handleProductOrderWebhook(payload);
    }

    if (typeof orderId === "string" && orderId.startsWith("twal_")) {
      // Verify webhook signature for Connect Wallet recharge
      const timestamp = request.headers.get("x-webhook-timestamp");
      const signature = request.headers.get("x-webhook-signature");
      if (!verifyCashfreeWebhookSignature({ rawBody: text, timestamp, signature })) {
        return Response.json({ result: "unauthorized" }, { status: 401 });
      }

      const paymentStatus = payload?.data?.payment?.payment_status;
      const eventType = payload?.type;
      const isSuccess = paymentStatus === "SUCCESS" || eventType === "PAYMENT_SUCCESS_WEBHOOK";

      if (isSuccess) {
        const orderAmount = Number(payload?.data?.order?.order_amount ?? payload?.data?.payment?.payment_amount ?? 0);
        const orderTags = (payload?.data?.order as { order_tags?: Record<string, string> } | undefined)?.order_tags || {};
        const businessId = orderTags.business_id;
        const orderType = orderTags.order_type;
        const rawCredits = Number(orderTags.credits || orderAmount);
        const maxAllowedCredits = Math.ceil(orderAmount * 1.5);
        const credits =
          Number.isFinite(rawCredits) && rawCredits > 0 && rawCredits <= maxAllowedCredits
            ? Math.floor(rawCredits)
            : Math.floor(orderAmount);

        if (businessId && orderType === "connect_wallet_recharge" && Number.isFinite(orderAmount) && orderAmount > 0 && credits > 0) {
          await creditMerchantConnectWallet(
            businessId,
            orderAmount,
            credits,
            orderId,
            "Cashfree Webhook Top-up"
          );
        }
        return Response.json({ success: true, orderId, paymentStatus: "paid" });
      }
      return Response.json({ success: true, orderId, paymentStatus: paymentStatus || "PENDING" });
    }
  } catch {
    // If JSON parsing fails, fall through to subscriptionWebhookHandler which rejects safely
  }

  return subscriptionWebhookHandler(request);
}
