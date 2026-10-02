import Link from "next/link";
import { appConfig } from "@/lib/config";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import MyQrCode from "./my-qr-code";
import ScanAnalytics from "./scan-analytics";
import QrTemplateGallery from "./qr/qr-template-gallery";
import { qrTemplates } from "./qr/templates";
import ReviewCard from "./review-card";

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
  return <div key={label} className="merchant-data-field"><dt>{label}</dt><dd>{value?.trim() || "—"}</dd></div>;
}

function StatIcon({ kind }: { kind: "qr" | "bars" | "star" }) {
  if (kind === "qr") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v2m-3 3h4v2h-2" /></svg>;
  if (kind === "bars") return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="4" height="8" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.1 6.7.9-4.9 4.7 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6-4.9-4.7 6.7-.9L12 2Z" /></svg>;
}

function StatCard({ label, value, detail, tone, icon }: { label: string; value: string; detail: string; tone: string; icon: "qr" | "bars" | "star" }) {
  return <article className={`merchant-stat merchant-stat--${tone}`}><span className="merchant-stat__icon"><StatIcon kind={icon} /></span><div className="merchant-stat__copy"><p>{label}</p><strong>{value}</strong><small>{detail}</small></div></article>;
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
  const businessType = merchant.businessType || "Business";
  const sweetsBusiness = /(sweet|mithai|bakery|cake|dessert)/i.test(businessType);
  const ownerName = merchant.ownerName?.trim() || "Merchant";
  const ownerInitials = ownerName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "M";
  const categoryIcon = /(sweet|mithai|bakery|cake|dessert|food|restaurant|cafe)/i.test(businessType) ? "✿" : /(medical|clinic|doctor|health)/i.test(businessType) ? "+" : "✦";

  return (
    <div className="merchant-dashboard-page">
      <section className={`merchant-hero${sweetsBusiness ? " merchant-hero--sweets" : ""}`}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" /><div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/2 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative flex min-w-0 flex-wrap items-start justify-between gap-5">
          <div className="min-w-0"><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{greeting()} · Merchant overview</div><h1 className="mt-4 break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">{merchant.businessName}</h1><p className="mt-2 text-sm text-slate-600">Here’s how your business is performing.</p><div className="mt-4 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold capitalize text-emerald-800"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{merchant.merchantStatus}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{merchant.businessType || "Business"}</span><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{merchant.plan || "No plan"} plan</span></div></div>
          <div className="merchant-profile"><span className="merchant-profile__bell" aria-hidden="true">♧<i /></span><span className="merchant-profile__avatar">{ownerInitials}</span><span className="merchant-profile__copy"><strong>{ownerName}</strong><small>Merchant</small></span></div>
        </div>
      </section>

      <section aria-label="Merchant statistics" className="merchant-stats">
        <StatCard tone="green" icon="qr" label="Total Scans" value={stats ? count(stats.total_scans).toLocaleString("en-IN") : "—"} detail="All-time QR scans" />
        <StatCard tone="amber" icon="bars" label="This Month’s Scans" value={stats ? count(stats.this_month_scans).toLocaleString("en-IN") : "—"} detail="Current month activity" />
        <StatCard tone="rose" icon="star" label="Total Reviews" value={stats ? totalReviews.toLocaleString("en-IN") : "—"} detail={totalReviews === 0 ? "No reviews yet" : "Customer feedback"} />
        <StatCard tone="violet" icon="star" label="Average Rating" value={average !== null && Number.isFinite(average) ? `${average.toFixed(1)} / 5` : "— / 5"} detail={totalReviews === 0 ? "Waiting for first review" : "Customer rating"} />
      </section>

      {!statsResult.error && !stats ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="status">Dashboard analytics are not available for this merchant account.</p> : null}

      <div className="merchant-workspace">
        <MyQrCode businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} reviewLink={merchant.reviewLink} totalScans={stats ? count(stats.total_scans) : 0} templateName={currentTemplate.name} templateId={currentTemplate.id} plan={merchant.plan} />
        <section className="merchant-template-panel merchant-template-panel--compact" id="template-gallery" aria-labelledby="merchant-template-title">
          <header><span className="merchant-template-panel__icon" aria-hidden="true">✿</span><div><h2 id="merchant-template-title">Choose a QR Template</h2><p>Pick a design that matches your business style.</p></div></header>
          <QrTemplateGallery businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} initialTemplate={merchant.qrTemplate} display="dashboard" />
        </section>
      </div>

      <section className="merchant-lower-grid">
        <div className="merchant-lower-panel">
          <div className="merchant-section-heading"><span className="merchant-section-heading__icon" aria-hidden="true">ϟ</span><div><h2>Quick Actions</h2><p>Manage your QR code and get more reviews.</p></div></div>
          <div className="merchant-quick-grid">{actions.map((action, index) => <Link key={action.href} href={action.href} className="merchant-quick-link"><span className="merchant-quick-link__icon" aria-hidden="true">{["⇩", "▤", "▣", "↗", "✦"][index]}</span><strong>{action.title}</strong><small>{action.description}</small></Link>)}</div>
        </div>
        <aside className="merchant-lower-panel merchant-tips">
          <div className="merchant-section-heading"><span className="merchant-section-heading__icon" aria-hidden="true">♙</span><div><h2>Tips to Get More Reviews</h2><p>Simple ways to invite honest feedback.</p></div></div>
          <ul className="merchant-tips__list"><li>Place your QR code at your shop counter.</li><li>Add a small “Review us on Google” message.</li><li>Use a table stand or sticker.</li><li>Offer great service to every customer.</li></ul>
          <span className="merchant-tips__art" aria-hidden="true">{categoryIcon}</span>
        </aside>
      </section>

      <section className="merchant-analytics-grid">
        <ScanAnalytics activity={activity ?? []} />
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">REVIEW SUMMARY</p><h2 className="mt-1 text-lg font-bold text-slate-900">Customer ratings</h2><div className="mt-3 flex items-end gap-2"><strong className="text-3xl text-slate-950">{average !== null && Number.isFinite(average) ? average.toFixed(1) : "—"}</strong><span className="pb-1 text-sm text-slate-500">/ 5 · {totalReviews} reviews</span></div><div className="mt-5 space-y-3">{ratingCounts.map(({ rating, total }) => <div key={rating} className="flex items-center gap-3 text-sm"><span className="w-14 shrink-0 text-amber-600">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${totalReviews ? (total / totalReviews) * 100 : 0}%` }} /></div><span className="w-8 text-right font-medium text-slate-700">{total}</span></div>)}</div></section>
      </section>

      <section className="merchant-data-grid">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">CUSTOMER EXPERIENCE</p><h2 className="mt-1 text-lg font-bold text-slate-900">Selected experience points</h2>{!stats || experienceCounts.length === 0 ? <p className="mt-5 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No customer feedback yet.</p> : <ol className="mt-4 space-y-3">{experienceCounts.map((item) => <li key={item.label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"><span className="text-sm font-medium text-slate-800">{item.label}</span><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">{count(item.count)}</span></li>)}</ol>}</section>
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">LATEST FEEDBACK</p><h2 className="mt-1 text-lg font-bold text-slate-900">Recent Reviews</h2></div><Link href="/merchant/dashboard/reviews" className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-900">View All Reviews →</Link></div>{reviews === null ? <p className="mt-4 text-sm text-rose-700">Reviews are temporarily unavailable.</p> : reviews.length === 0 ? <p className="mt-4 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No reviews yet.</p> : <div className="mt-4 space-y-3">{reviews.map((review) => <ReviewCard key={review.review_id} review={review} dateLabel={dateLabel(review.submitted_at)} />)}</div>}</section>
      </section>

      <section className="merchant-data-grid">
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">MY BUSINESS</p><h2 className="mt-1 text-lg font-bold text-slate-900">Business details</h2></div><dl className="grid gap-3 sm:grid-cols-2">{infoField("Business Name", merchant.businessName)}{infoField("Business ID", merchant.businessId)}{infoField("Business Type", merchant.businessType)}{infoField("Owner / Merchant Name", merchant.ownerName)}{infoField("Mobile", merchant.registeredMobile)}{infoField("Address", merchant.address)}</dl><Link href="/merchant/dashboard/business" className="mt-4 inline-flex text-sm font-semibold text-blue-700">My Business →</Link></section>
        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">SUBSCRIPTION</p><h2 className="mt-1 text-lg font-bold text-slate-900">Current subscription</h2></div><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}>{subscriptionStatus}</span></div><dl className="mt-4 grid gap-3 sm:grid-cols-2">{infoField("Current Plan", merchant.plan)}{infoField("Price", planPrice == null ? null : `${amountLabel(planPrice)} / month`)}{infoField("Start Date", dateLabel(subscription?.starts_at ?? merchant.registrationDate))}{infoField("Expiry Date", dateLabel(subscription?.expires_at ?? merchant.expiry))}</dl><Link href="/merchant/dashboard/subscription" className="mt-4 inline-flex text-sm font-semibold text-blue-700">Renew Plan →</Link></section>
      </section>

      <section className="merchant-data-panel"><p>PAYMENTS</p><div className="flex items-center justify-between gap-3"><h2>Recent payments</h2><Link href="/merchant/dashboard/payments">View all →</Link></div>{payments === null ? <p className="mt-4 text-sm text-rose-700">Payment history is temporarily unavailable.</p> : payments.length === 0 ? <p className="merchant-data-panel__empty">No payments yet.</p> : <div className="mt-4 max-w-full overflow-x-auto"><table className="w-full table-fixed text-left"><thead><tr><th className="w-[34%]">Date</th><th className="w-[33%]">Amount</th><th className="w-[33%]">Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.cashfree_order_id}><td>{dateLabel(payment.created_at)}</td><td>{amountLabel(payment.amount, payment.currency)}</td><td className="capitalize">{payment.payment_status.replaceAll("_", " ")}</td></tr>)}</tbody></table></div>}</section>
    </div>
  );
}
