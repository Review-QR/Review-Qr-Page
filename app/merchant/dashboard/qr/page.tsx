import { requireActiveMerchant } from "@/lib/merchant-auth";
import MyQrCode from "../my-qr-code";
import QrTemplateGallery from "./qr-template-gallery";
import { qrTemplates } from "./templates";
import { getLatestBusinessQrDesignRevision, getPersistedBusinessQrDesignAssets } from "@/lib/trustit-ai/qr-design-assets.server";
import type { QrDesignAssets } from "@/lib/trustit-ai/provider-contracts";
import { getQrBusinessCategoryConfig } from "@/lib/business-category-admin.server";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import ReviewCard from "../review-card";

export const dynamic = "force-dynamic";

type Review = {
  review_id: string;
  rating: number;
  review_text: string;
  selected_experiences: string[];
  submitted_at: string;
};

export default async function MerchantQrPage() {
  const merchant = await requireActiveMerchant();
  const categoryConfig = await getQrBusinessCategoryConfig(merchant.businessType ?? "");
  let designAssets: QrDesignAssets = {};
  let designRevision = 0;
  let designError: string | undefined;
  try {
    designRevision = await getLatestBusinessQrDesignRevision(merchant.businessId, merchant.businessType);
    designAssets = await getPersistedBusinessQrDesignAssets(merchant.businessId, merchant.businessType, designRevision);
  } catch (error) {
    console.error("Trustit QR artwork could not be loaded", error instanceof Error ? error.name : "UnknownError");
    designError = "Saved custom artwork is temporarily unavailable. Your QR code and premium built-in templates are still ready.";
  }
  const currentTemplate = qrTemplates.find((template) => template.id === merchant.qrTemplate) ?? qrTemplates[0];

  // Fetch customer reviews and dashboard stats for this merchant
  const supabase = await createMerchantServerClient();
  const [{ data: reviewsData }, { data: statsData }] = await Promise.all([
    supabase
      .rpc("get_merchant_trustit_reviews", { p_business_id: merchant.businessId })
      .order("submitted_at", { ascending: false })
      .limit(100),
    supabase.rpc("get_merchant_dashboard_stats", { p_business_id: merchant.businessId }),
  ]);

  const stats = ((statsData as unknown[])?.[0] ?? null) as {
    total_scans?: number | string;
    this_month_scans?: number | string;
    total_reviews?: number | string;
    average_rating?: number | string | null;
  } | null;

  const reviews = (reviewsData ?? []) as Review[];
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null;
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const criticalCount = reviews.filter((r) => r.rating <= 2).length;

  return (
    <div className="merchant-qr-page space-y-4">
      <header className="merchant-page-heading">
        <div>
          <p className="merchant-page-heading__eyebrow">Customer sharing kit &amp; reviews</p>
          <h1>My QR Standees &amp; Customer Reviews</h1>
          <p>{merchant.businessName} <span aria-hidden="true">·</span> <span className="font-mono">{merchant.businessId}</span></p>
        </div>
        <span className="merchant-page-heading__badge">● Active Merchant</span>
      </header>

      <div className="merchant-workspace">
        <MyQrCode businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} reviewLink={merchant.reviewLink} templateName={currentTemplate.name} templateId={currentTemplate.id} plan={merchant.plan} layout="standalone" designAssets={designAssets} categoryConfig={categoryConfig} initialTemplate={merchant.qrTemplate} stats={stats} />
      </div>

      {/* ── CUSTOMER REVIEWS (Merged with QR Page) ── */}
      <section id="customer-reviews" className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Customer feedback &amp; Ratings</span>
            <h2 className="text-base sm:text-lg font-bold text-slate-950">Customer Reviews</h2>
            <p className="text-xs text-slate-500">Reviews submitted by customers via your Trustit QR standee.</p>
          </div>
          <span className="self-start sm:self-center text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
            {reviews.length} Total Feedback
          </span>
        </div>

        {/* Compact KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Rating</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">{average === null ? "—" : average.toFixed(1)}</span>
              <span className="text-amber-500 text-sm font-bold">★</span>
              <span className="text-xs text-slate-400">/ 5</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Reviews</span>
            <p className="mt-1 text-xl font-black text-slate-900">{reviews.length}</p>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Positive (4-5★)</span>
            <p className="mt-1 text-xl font-black text-emerald-700">{positiveCount}</p>
          </div>

          <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-3">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Critical (1-2★)</span>
            <p className="mt-1 text-xl font-black text-rose-700">{criticalCount}</p>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <span className="text-2xl block mb-1">💬</span>
            <p className="text-xs font-bold text-slate-700">No reviews received yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">When customers scan your QR standee and rate your business, feedback will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {reviews.map((review) => (
              <ReviewCard
                key={review.review_id}
                review={review}
                dateLabel={new Date(review.submitted_at).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="merchant-lower-panel merchant-template-gallery-panel mt-6 hidden" id="template-gallery" aria-labelledby="template-gallery-title">
        <div className="merchant-section-heading">
          <span className="merchant-section-heading__icon" aria-hidden="true">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
          <div><h2 id="template-gallery-title">All Standee Templates (Export & Customize)</h2><p>High-resolution print-ready templates with category-matched artwork.</p></div>
        </div>
        <QrTemplateGallery businessId={merchant.businessId} businessName={merchant.businessName} businessType={merchant.businessType} qrStatus={merchant.qrStatus} expiry={merchant.expiry} initialTemplate={merchant.qrTemplate} display="carousel" initialDesignAssets={designAssets} initialDesignRevision={designRevision} initialDesignError={designError} googleReviewLink={merchant.reviewLink} categoryConfig={categoryConfig} plan={merchant.plan} />
      </section>

      <section className="merchant-lower-panel merchant-qr-help mt-4">
        <div className="merchant-section-heading"><span className="merchant-section-heading__icon" aria-hidden="true">✦</span><div><h2>Share your QR everywhere customers visit</h2><p>Download the active poster, add it to your counter, or copy your link to send directly.</p></div></div>
      </section>
    </div>
  );
}
