import Link from "next/link";
import { appConfig } from "@/lib/config";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export const dynamic = "force-dynamic";

function daysUntilExpiry(expiry: string | null) {
  if (!expiry || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return null;
  const expiryTime = Date.parse(`${expiry}T00:00:00Z`);
  if (!Number.isFinite(expiryTime) || new Date(expiryTime).toISOString().slice(0, 10) !== expiry) return null;
  const today = new Date().toISOString().slice(0, 10);
  return Math.trunc((expiryTime - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

function statusTone(status: string | null) {
  switch (status?.trim().toLowerCase()) {
    case "active": return "bg-emerald-100 text-emerald-800";
    case "pending": return "bg-amber-100 text-amber-800";
    case "expired":
    case "suspended": return "bg-rose-100 text-rose-800";
    default: return "bg-slate-100 text-slate-700";
  }
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
    </div>
  );
}

const actions = [
  { href: "/merchant/dashboard/business", title: "My Business", description: "View your registered business details." },
  { href: "/merchant/dashboard/qr", title: "My QR Code", description: "Download, print, or share your Trustit scan QR." },
  { href: "/merchant/dashboard/subscription", title: "Subscription", description: "Review your plan and renewal options." },
  { href: "/merchant/dashboard/payments", title: "Payments", description: "View payments for your business." },
];

export default async function MerchantDashboardPage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();
  const { data: currentSubscription } = await supabase
    .from("subscriptions")
    .select("auto_renew")
    .eq("business_id", merchant.businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const expiryDays = daysUntilExpiry(merchant.expiry);
  const expiryLabel = expiryDays === null
    ? "Not set"
    : expiryDays < 0
      ? `Expired ${Math.abs(expiryDays)} day${Math.abs(expiryDays) === 1 ? "" : "s"} ago`
      : expiryDays === 0
        ? "Expires today"
        : `${expiryDays} day${expiryDays === 1 ? "" : "s"} remaining`;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Merchant dashboard</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Welcome, {merchant.ownerName?.trim() || merchant.businessName}
        </h1>
        <p className="mt-2 text-slate-600">Here’s an overview of {merchant.businessName}.</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Active Merchant</span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusTone(merchant.businessStatus)}`}>
            Business: {merchant.businessStatus?.trim() || "Unknown"}
          </span>
          <span className="font-mono text-xs text-slate-500">Business ID: {merchant.businessId}</span>
        </div>
      </section>

      <section aria-label="Business summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Current plan" value={merchant.plan?.trim() || "—"} />
        <SummaryCard label="QR status" value={merchant.qrStatus?.trim() || "—"} />
        <SummaryCard label="Expiry date" value={merchant.expiry || "—"} detail={expiryLabel} />
        <SummaryCard label="Renewal status" value={currentSubscription?.auto_renew === null || currentSubscription?.auto_renew === undefined ? "—" : currentSubscription.auto_renew ? "On" : "Off"} />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your business, QR code, plan, and payments.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
              <span className="text-base font-semibold text-slate-900 group-hover:text-blue-700">{action.title}</span>
              <span className="mt-1 block text-sm text-slate-500">{action.description}</span>
              <span className="mt-4 inline-block text-sm font-semibold text-blue-700">Open <span aria-hidden="true">→</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
