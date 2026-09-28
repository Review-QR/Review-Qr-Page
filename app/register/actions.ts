"use server";

import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeReviewLink } from "@/lib/safe-review-link";
import { appConfig, type PlanId } from "@/lib/config";
import { getTrustitUser, safeActionError } from "@/lib/trustit-onboarding";
import {
  createCashfreeMerchantCheckoutOrder,
  verifyCashfreeMerchantOrderBySignedContext,
} from "@/lib/cashfree";

export type ActionResult = { success: true; value?: string } | { success: false; message: string };

async function currentUser() {
  const result = await getTrustitUser();
  return result?.user ?? null;
}

export async function completeTrustitProfile(fullName: string): Promise<ActionResult> {
  const context = await getTrustitUser();
  if (!context || typeof fullName !== "string" || fullName.trim().length < 1 || fullName.trim().length > 160) {
    return { success: false, message: "Verify your mobile number to continue." };
  }
  try {
    const { error } = await createSupabaseAdminClient().rpc("complete_trustit_profile", {
      p_user_id: context.user.id,
      p_full_name: fullName.trim(),
    });
    if (error) return { success: false, message: "Is mobile number se account already registered ho sakta hai. Login karein ya dobara try karein." };
    return { success: true };
  } catch {
    return safeActionError();
  }
}

export async function saveTrustitBusiness(input: {
  name: string; type: string; address: string; reviewLink: string;
}): Promise<ActionResult> {
  const user = await currentUser();
  const name = input?.name?.trim();
  const address = input?.address?.trim();
  const reviewLink = safeReviewLink(input?.reviewLink);
  const types = ["Shop", "Cafe/Restaurant", "Salon", "Clinic", "Library", "Hotel", "Other"];
  if (!user || !name || name.length > 160 || !types.includes(input.type) || !address || address.length > 1000 || !reviewLink) {
    return { success: false, message: "Please check the business details and HTTPS Google Review link." };
  }
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("create_trustit_business_for_onboarding", {
      p_user_id: user.id, p_name: name, p_type: input.type, p_address: address, p_review_link: reviewLink,
    });
    if (error || typeof data !== "string") return { success: false, message: "Your registration session may have expired. Please start again." };
    return { success: true, value: data };
  } catch { return safeActionError(); }
}

export async function selectTrustitPlan(planId: string): Promise<ActionResult> {
  const user = await currentUser();
  if (!user || !Object.hasOwn(appConfig.plans, planId)) return { success: false, message: "Select an available plan." };
  try {
    const { error } = await createSupabaseAdminClient().rpc("select_trustit_plan", { p_user_id: user.id, p_plan: appConfig.plans[planId as PlanId].name });
    return error ? { success: false, message: "Your registration session may have expired. Please start again." } : { success: true };
  } catch { return safeActionError(); }
}

export async function createTrustitOneTimeCheckout(): Promise<ActionResult & { orderId?: string; paymentSessionId?: string }> {
  const context = await getTrustitUser();
  if (!context) return { success: false, message: "Please sign in to continue." };
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("prepare_trustit_payment", { p_user_id: context.user.id, p_payment_mode: "one_time" });
    const prepared = Array.isArray(data) ? data[0] as { business_id?: unknown; plan?: unknown; mobile?: unknown; full_name?: unknown; payment_reference?: unknown } | undefined : undefined;
    if (error || !prepared || typeof prepared.business_id !== "string" || typeof prepared.plan !== "string" || typeof prepared.mobile !== "string") return { success: false, message: "Your registration session may have expired. Please start again." };
    const planId = (Object.keys(appConfig.plans) as PlanId[]).find((id) => appConfig.plans[id].name === prepared.plan);
    if (!planId) return safeActionError();
    const proposedOrderId = `rqr_${randomUUID().replaceAll("-", "")}`;
    const reserved = await admin.rpc("reserve_trustit_one_time_order", { p_user_id: context.user.id, p_order_id: proposedOrderId });
    const reservation = Array.isArray(reserved.data) ? reserved.data[0] as { payment_reference?: unknown; is_new?: unknown } | undefined : undefined;
    if (reserved.error || typeof reservation?.payment_reference !== "string") return safeActionError();
    const order = await createCashfreeMerchantCheckoutOrder({ planId, businessId: prepared.business_id, orderId: reservation.payment_reference, customerName: typeof prepared.full_name === "string" ? prepared.full_name : undefined, customerPhone: prepared.mobile.replace(/^\+/, "") });
    if (!order.success) return { success: false, message: order.error };
    const recorded = await admin.rpc("record_trustit_payment_session", { p_user_id: context.user.id, p_payment_reference: order.orderId, p_payment_session_id: order.paymentSessionId });
    if (recorded.error) return { success: false, message: "Payment setup could not be saved. Please try again." };
    return { success: true, orderId: order.orderId, paymentSessionId: order.paymentSessionId };
  } catch { return safeActionError(); }
}

export async function verifyTrustitOneTimePayment(orderId: string): Promise<ActionResult> {
  const context = await getTrustitUser();
  if (!context || typeof orderId !== "string" || !/^rqr_[a-f0-9]{32}$/.test(orderId)) return { success: false, message: "Enter a valid payment reference." };
  try {
    // Registration orders are bound to a pending business rather than an active merchant.
    // Resolve the server-owned onboarding link before applying the verified payment.
    const admin = createSupabaseAdminClient();
    const { data: session, error: lookupError } = await admin.from("onboarding_sessions").select("business_id, selected_plan, user_id").eq("payment_reference", orderId).eq("user_id", context.user.id).maybeSingle();
    if (lookupError || !session?.business_id || !session.selected_plan || session.user_id !== context.user.id) return { success: false, message: "Payment verify ho raha hai. Please thoda wait karein." };
    const verifiedOwned = await verifyCashfreeMerchantOrderBySignedContext({ orderId, authenticatedBusinessId: session.business_id });
    if (verifiedOwned.status === "NOT_SUCCESS") return { success: false, message: "Payment is not confirmed yet. If Cashfree shows it as processing, check again shortly. Your business and QR stay inactive until confirmation." };
    if (verifiedOwned.status !== "VERIFIED_SUCCESS" || appConfig.plans[verifiedOwned.planId].name !== session.selected_plan) return { success: false, message: "Payment verify ho raha hai. Please thoda wait karein." };
    const { data, error } = await admin.rpc("finalize_trustit_one_time_payment", {
      p_business_id: session.business_id, p_cashfree_order_id: orderId,
      p_plan: session.selected_plan, p_amount: verifiedOwned.amount,
      p_currency: verifiedOwned.currency, p_paid_at: verifiedOwned.paidAt,
    });
    if (error || !Array.isArray(data) || !data[0]) return { success: false, message: "Payment verify ho raha hai. Please thoda wait karein." };
    return { success: true, value: String((data[0] as { result?: unknown }).result ?? "applied") };
  } catch { return safeActionError(); }
}

export async function getTrustitResumeState() {
  const user = await currentUser();
  if (!user) return null;
  try {
    const { data } = await createSupabaseAdminClient().from("onboarding_sessions").select("current_step, business_id, selected_plan, payment_mode, payment_reference, status").eq("user_id", user.id).in("status", ["in_progress", "payment_pending", "completed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return data;
  } catch { return null; }
}
