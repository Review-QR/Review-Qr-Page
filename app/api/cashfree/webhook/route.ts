import { appConfig, type PlanId } from "@/lib/config";
import {
  verifyCashfreeWebhookOrder,
  verifyCashfreeWebhookSignature,
} from "@/lib/cashfree";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createCashfreeWebhookHandler } from "@/lib/cashfree-webhook-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createCashfreeWebhookHandler({
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
