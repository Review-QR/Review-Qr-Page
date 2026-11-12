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
    const orderId = payload?.data?.order?.order_id;
    if (typeof orderId === "string" && orderId.startsWith("hord_")) {
      // Verify webhook signature for Hyperlocal Super-App Order
      const timestamp = request.headers.get("x-webhook-timestamp");
      const signature = request.headers.get("x-webhook-signature");
      if (!verifyCashfreeWebhookSignature({ rawBody: text, timestamp, signature })) {
        return Response.json({ result: "unauthorized" }, { status: 401 });
      }

      const admin = createSupabaseAdminClient();
      const paymentStatus = payload?.data?.payment?.payment_status;
      const eventType = payload?.type;
      const isSuccess = paymentStatus === "SUCCESS" || eventType === "PAYMENT_SUCCESS_WEBHOOK";

      if (isSuccess) {
        // Anti-tampering & idempotency check: require DB order and exact numeric amount match
        const { data: dbOrder } = await admin
          .from("hyperlocal_orders")
          .select("total_amount, payment_status")
          .eq("id", orderId)
          .maybeSingle();

        if (!dbOrder) {
          return Response.json({ result: "order_not_found" }, { status: 404 });
        }

        if (dbOrder.payment_status === "paid") {
          return Response.json({ success: true, orderId, paymentStatus: "paid", idempotent: true });
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
            cashfree_order_id: orderId,
            cashfree_payment_id: cfPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        return Response.json({ success: true, orderId, paymentStatus: "paid" });
      }

      return Response.json({ success: true, orderId, paymentStatus: paymentStatus || "PENDING" });
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
