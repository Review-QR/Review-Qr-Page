import Link from "next/link";
import { appConfig } from "@/lib/config";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import MyQrCode from "./my-qr-code";
import ScanAnalytics from "./scan-analytics";
import { qrTemplates } from "./qr/templates";

export const dynamic = "force-dynamic";

type DashboardStats = {
  total_scans: number | string;
  this_month_scans: number | string;
  total_reviews: number | string;
  average_rating: number | string | null;
  rating_5_count: number | string;
  rating_4_count: number | string;
  rating_3_count: number | string;
  rating_2_count: number | string;
  rating_1_count: number | string;
  experience_counts: unknown;
};

type Review = {
  review_id: string;
  customer_name: string | null;
  rating: number;
  review_text: string;
  selected_experiences: string[];
  submitted_at: string;
};

type Payment = { cashfree_order_id: string; amount: number | string; currency: string; payment_status: string; created_at: string };
type ExperienceCount = { label: string; count: number };

function count(value: number | string | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(date)
    : "—";
}

function amountLabel(amount: number | string | null | undefined, currency = "INR") {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function infoField(label: string, value: string | null | undefined) {
  return <div key={label} className="rounded-xl border border-slate-200 px-4 py-3"><dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value?.trim() || "—"}</dd></div>;
}

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-shadow hover:shadow-md"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>{detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}</div>;
}

const actions = [
  { href: "/merchant/dashboard/qr", title: "View QR", description: "View and download your Trustit QR." },
  { href: "/merchant/dashboard/reviews", title: "Customer Reviews", description: "Read customer feedback shared on Trustit." },
  { href: "/merchant/dashboard/business", title: "My Business", description: "View your registered business details." },
  { href: "/merchant/dashboard/subscription", title: "Subscription", description: "Review your plan and renewal options." },
  { href: "/merchant/dashboard/payments", title: "Payments", description: "View payments for your business." },
];

export default async function MerchantDashboardPage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();
  const [statsResult, activityResult, reviewsResult, subscriptionResult, paymentsResult] = await Promise.all([
    supabase.rpc("get_merchant_dashboard_stats", { p_business_id: merchant.businessId }),
    supabase.rpc("get_merchant_scan_activity", { p_business_id: merchant.businessId, p_days: 90 }),
    supabase.rpc("get_merchant_trustit_reviews", { p_business_id: merchant.businessId }).order("submitted_at", { ascending: false }).limit(5),
    supabase.from("subscriptions").select("amount, status, starts_at, expires_at, auto_renew, created_at").eq("business_id", merchant.businessId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("payment_records").select("cashfree_order_id, amount, currency, payment_status, created_at").eq("business_id", merchant.businessId).order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = (statsResult.data?.[0] ?? null) as DashboardStats | null;
  const activity = activityResult.error ? null : (activityResult.data ?? []) as { scan_date: string; scans: number | string }[];
  const reviews = reviewsResult.error ? null : (reviewsResult.data ?? []) as Review[];
  const subscription = subscriptionResult.data;
  const payments = paymentsResult.error ? null : (paymentsResult.data ?? []) as Payment[];
  const planConfig = Object.values(appConfig.plans).find((plan) => plan.name.toLowerCase() === merchant.plan?.trim().toLowerCase());
  const planPrice = subscription?.amount ?? planConfig?.price;
  const subscriptionStatus = subscription?.status || merchant.businessStatus || "Unknown";
  const statusClass = String(subscriptionStatus).toLowerCase() === "active" ? "bg-emerald-100 text-emerald-800" : String(subscriptionStatus).toLowerCase() === "expired" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800";
  const experienceCounts = Array.isArray(stats?.experience_counts) ? stats.experience_counts as ExperienceCount[] : [];
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    total: count(stats?.[`rating_${rating}_count` as keyof DashboardStats] as number | string | undefined),
  }));
  const totalReviews = count(stats?.total_reviews);
  const average = stats?.average_rating == null ? null : Number(stats.average_rating);
  const currentTemplate = qrTemplates.find((template) => template.id === merchant.qrTemplate) ?? qrTemplates[0];

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.045)] sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" /><div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/2 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative flex min-w-0 flex-wrap items-start justify-between gap-5">
          <div className="min-w-0"><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{greeting()} · Merchant overview</div><h1 className="mt-4 break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">{merchant.businessName}</h1><p className="mt-2 text-sm text-slate-600">Here’s how your business is performing.</p><div className="mt-4 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-800"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{merchant.merchantStatus}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{merchant.businessType || "Business"}</span><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{merchant.plan || "No plan"} plan</span></div></div>
          <div className="relative min-w-[190px] rounded-2xl border border-slate-200 bg-white/90 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Subscription</p><div className="mt-2 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${String(subscriptionStatus).toLowerCase() === "active" ? "bg-emerald-500" : "bg-amber-500"}`} /><p className="text-sm font-semibold capitalize text-white">{subscriptionStatus}</p></div><p className="mt-2 text-xs text-blue-100">Renews / expires {dateLabel(subscription?.expires_at ?? merchant.expiry)}</p></div>
        </div>
      </section>

      <section aria-label="Merchant statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Scans" value={stats ? count(stats.total_scans).toLocaleString("en-IN") : "—"} />
        <StatCard label="This Month's Scans" value={stats ? count(stats.this_month_scans).toLocaleString("en-IN") : "—"} />
        <StatCard label="Total Reviews" value={stats ? totalReviews.toLocaleString("en-IN") : "—"} detail={stats && totalReviews === 0 ? "No reviews yet" : undefined} />
        <StatCard label="Average Rating" value={average !== null && Number.isFinite(average) ? `${average.toFixed(1)} / 5` : "— / 5"} detail={stats && totalReviews === 0 ? "No reviews yet" : undefined} />
      </section>

      {!statsResult.error && !stats ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="status">Dashboard analytics are not available for this merchant account.</p> : null}

      <MyQrCode businessId={merchant.businessId} businessName={merchant.businessName} qrStatus={merchant.qrStatus} expiry={merchant.expiry} reviewLink={merchant.reviewLink} totalScans={stats ? count(stats.total_scans) : 0} templateName={currentTemplate.name} />

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <ScanAnalytics activity={activity ?? []} />
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">REVIEW SUMMARY</p><h2 className="mt-1 text-lg font-bold text-slate-900">Customer ratings</h2><div className="mt-3 flex items-end gap-2"><strong className="text-3xl text-slate-950">{average !== null && Number.isFinite(average) ? average.toFixed(1) : "—"}</strong><span className="pb-1 text-sm text-slate-500">/ 5 · {totalReviews} reviews</span></div><div className="mt-5 space-y-3">{ratingCounts.map(({ rating, total }) => <div key={rating} className="flex items-center gap-3 text-sm"><span className="w-14 shrink-0 text-amber-600">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${totalReviews ? (total / totalReviews) * 100 : 0}%` }} /></div><span className="w-8 text-right font-medium text-slate-700">{total}</span></div>)}</div></section>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">CUSTOMER EXPERIENCE</p><h2 className="mt-1 text-lg font-bold text-slate-900">Selected experience points</h2>{!stats || experienceCounts.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No customer feedback yet.</p> : <ol className="mt-4 space-y-3">{experienceCounts.map((item) => <li key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"><span className="text-sm font-medium text-slate-800">{item.label}</span><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">{count(item.count)}</span></li>)}</ol>}</section>
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">LATEST FEEDBACK</p><h2 className="mt-1 text-lg font-bold text-slate-900">Recent Reviews</h2></div><Link href="/merchant/dashboard/reviews" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-900">View All Reviews →</Link></div>{reviews === null ? <p className="mt-4 text-sm text-rose-700">Reviews are temporarily unavailable.</p> : reviews.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No reviews yet.</p> : <div className="mt-4 space-y-3">{reviews.map((review) => <article key={review.review_id} className="rounded-xl border border-slate-100 p-4"><p className="text-sm font-semibold text-slate-900">Customer: {review.customer_name || "Name not shared"}</p><p className="mt-1 text-sm font-semibold text-amber-600" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} <span className="text-slate-700">{review.rating}/5</span></p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700"><strong>Review:</strong> {review.review_text}{review.selected_experiences?.length > 0 && <strong className="ml-2 text-slate-900">{review.selected_experiences.map((point) => `• ${point}`).join(" ")}</strong>}</p><time className="mt-2 block text-xs text-slate-400">{dateLabel(review.submitted_at)}</time></article>)}</div>}</section>
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">MY BUSINESS</p><h2 className="mt-1 text-lg font-bold text-slate-900">Business details</h2></div><dl className="grid gap-3 sm:grid-cols-2">{infoField("Business Name", merchant.businessName)}{infoField("Business ID", merchant.businessId)}{infoField("Business Type", merchant.businessType)}{infoField("Owner / Merchant Name", merchant.ownerName)}{infoField("Mobile", merchant.registeredMobile)}{infoField("Address", merchant.address)}</dl><Link href="/merchant/dashboard/business" className="mt-4 inline-flex text-sm font-semibold text-blue-700">My Business →</Link></section>
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">SUBSCRIPTION</p><h2 className="mt-1 text-lg font-bold text-slate-900">Current subscription</h2></div><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}>{subscriptionStatus}</span></div><dl className="mt-4 grid gap-3 sm:grid-cols-2">{infoField("Current Plan", merchant.plan)}{infoField("Price", planPrice == null ? null : `${amountLabel(planPrice)} / month`)}{infoField("Start Date", dateLabel(subscription?.starts_at ?? merchant.registrationDate))}{infoField("Expiry Date", dateLabel(subscription?.expires_at ?? merchant.expiry))}</dl><Link href="/merchant/dashboard/subscription" className="mt-4 inline-flex text-sm font-semibold text-blue-700">Renew Plan →</Link></section>
      </section>

      <section className="min-w-0">
        <section className="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><div className="flex min-w-0 flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">PAYMENTS</p><h2 className="mt-1 text-lg font-bold text-slate-900">Recent payments</h2></div><Link href="/merchant/dashboard/payments" className="text-sm font-semibold text-blue-700">View All Payments →</Link></div>{payments === null ? <p className="mt-4 text-sm text-rose-700">Payment history is temporarily unavailable.</p> : payments.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No payments yet.</p> : <div className="mt-4 max-w-full overflow-x-auto"><table className="w-full table-fixed text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase text-slate-500"><th className="w-[34%] py-2">Date</th><th className="w-[33%] py-2">Amount</th><th className="w-[33%] py-2">Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.cashfree_order_id} className="border-b border-slate-100 last:border-0"><td className="py-3">{dateLabel(payment.created_at)}</td><td className="py-3 font-medium">{amountLabel(payment.amount, payment.currency)}</td><td className="py-3 capitalize">{payment.payment_status.replaceAll("_", " ")}</td></tr>)}</tbody></table></div>}</section>
      </section>

      <section><div className="mb-4"><h2 className="text-lg font-semibold text-slate-950">Quick actions</h2></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{actions.map((action) => <Link key={action.href} href={action.href} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"><span className="font-semibold text-slate-900">{action.title}</span><span className="mt-1 block text-sm text-slate-500">{action.description}</span></Link>)}</div></section>
    </div>
  );
}
