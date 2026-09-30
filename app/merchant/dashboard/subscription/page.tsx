import { appConfig, allowedPlanIds } from "@/lib/config";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import SubscriptionCheckout from "../subscription-checkout";

export const dynamic = "force-dynamic";

function daysUntilExpiry(expiry: string | null) {
  if (!expiry || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return null;
  const expiryTime = Date.parse(`${expiry}T00:00:00Z`);
  if (!Number.isFinite(expiryTime) || new Date(expiryTime).toISOString().slice(0, 10) !== expiry) return null;
  const today = new Date().toISOString().slice(0, 10);
  return Math.trunc((expiryTime - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

function matchingPlan(plan: string | null) {
  const normalized = plan?.trim().toLowerCase();
  return Object.values(appConfig.plans).find((item) => item.name.toLowerCase() === normalized);
}

function subscriptionStatus(status: string | null, days: number | null) {
  const normalized = status?.trim().toLowerCase();
  if (normalized === "suspended") return "Suspended";
  if (normalized === "expired" || (days !== null && days < 0)) return "Expired";
  if (normalized === "expiring soon" || (days !== null && days >= 0 && days <= appConfig.subscription.expiryWarningDays)) return "Expiring Soon";
  if (normalized === "active") return "Active";
  return status?.trim() || "—";
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export default async function MerchantSubscriptionPage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("auto_renew")
    .eq("business_id", merchant.businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const plan = matchingPlan(merchant.plan);
  const days = daysUntilExpiry(merchant.expiry);
  const daysLabel = days === null ? "—" : days < 0 ? `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago` : days === 0 ? "Expires today" : `${days} day${days === 1 ? "" : "s"} remaining`;
  const renewalLabel = days === null ? "Not set" : days < 0 ? "Renewal required" : days === 0 ? "Due today" : days <= appConfig.subscription.expiryWarningDays ? "Due soon" : "Not due";
  const plans = allowedPlanIds(merchant.plan).map((planId) => ({
    id: planId,
    ...appConfig.plans[planId],
    isCurrent: plan?.name === appConfig.plans[planId].name,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Plan and billing</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Subscription</h1>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Current Plan" value={plan?.name || merchant.plan || "—"} />
          <Field label="Current Price" value={plan ? `₹${plan.price}/month` : "—"} />
          <Field label="Subscription Status" value={subscriptionStatus(merchant.businessStatus, days)} />
          <Field label="Registration Date" value={merchant.registrationDate || "—"} />
          <Field label="Expiry Date" value={merchant.expiry || "—"} />
          <Field label="Days Remaining" value={daysLabel} />
          <Field label="Renewal Status" value={renewalLabel} />
          <Field label="Auto-Renew" value={subscription?.auto_renew === null || subscription?.auto_renew === undefined ? "—" : subscription.auto_renew ? "On" : "Off"} />
        </dl>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <SubscriptionCheckout plans={plans} />
      </section>
    </div>
  );
}
