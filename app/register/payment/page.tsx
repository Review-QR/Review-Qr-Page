import { redirect } from "next/navigation";
import Link from "next/link";
import { getTrustitUser } from "@/lib/trustit-onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import OneTimeCheckout from "./one-time-checkout";

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
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><Link href="/trustit" className="font-bold text-blue-700">Trustit</Link><p className="mt-6 text-xs font-semibold text-blue-700">4 of 4 · PAYMENT</p><h1 className="mt-2 text-2xl font-bold">Review your plan and pay once</h1><p className="mt-2 text-slate-600">{data.selected_plan} · ₹{price} for 30 days</p><OneTimeCheckout initialOrderId={savedOrderId} autoVerifyOrderId={autoVerifyOrderId} /><p className="mt-4 text-center text-xs text-slate-500">One-time payment only. AutoPay and recurring charges are not enabled.</p></section></main>;
}