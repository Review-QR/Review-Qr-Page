import { redirect } from "next/navigation";
import { getTrustitUser } from "@/lib/trustit-onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import OneTimeCheckout from "./one-time-checkout";
import RegisterShell from "../register-shell";

export const dynamic = "force-dynamic";

export default async function RegisterPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string | string[] }>;
}) {
  const params = await searchParams;
  const context = await getTrustitUser();
  if (!context) redirect("/register");
  const { data } = await createSupabaseAdminClient().from("onboarding_sessions").select("current_step,selected_plan,payment_reference,status").eq("user_id", context.user.id).in("status", ["in_progress", "payment_pending", "completed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (data?.status === "completed") redirect("/merchant/dashboard");
  if (!data?.selected_plan) redirect("/register/plan");
  const prices: Record<string, number> = { Basic: 29, Standard: 49, Premium: 99 };
  const price = prices[data.selected_plan] ?? 0;
  const savedOrderId = typeof data.payment_reference === "string" && /^rqr_[a-f0-9]{32}$/.test(data.payment_reference)
    ? data.payment_reference
    : null;
  const returnedOrderId = typeof params.order_id === "string" && /^rqr_[a-f0-9]{32}$/.test(params.order_id)
    ? params.order_id
    : null;
  const autoVerifyOrderId = returnedOrderId === savedOrderId ? returnedOrderId : null;
  return <RegisterShell currentStep={4} title="Review your plan and pay once" description="Your business and QR activate after Cashfree confirms the payment."><p className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-800">{data.selected_plan} · ₹{price} for 30 days</p><OneTimeCheckout initialOrderId={savedOrderId} autoVerifyOrderId={autoVerifyOrderId} /><p className="mt-4 text-center text-xs leading-5 text-slate-500">One-time payment only. AutoPay and recurring charges are not enabled.</p></RegisterShell>;
}
