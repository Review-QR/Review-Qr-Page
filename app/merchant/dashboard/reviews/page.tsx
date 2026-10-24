import { requireActiveMerchant } from "@/lib/merchant-auth";
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

export default async function MerchantReviewsPage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();
  const { data, error } = await supabase
    .rpc("get_merchant_trustit_reviews", { p_business_id: merchant.businessId })
    .order("submitted_at", { ascending: false })
    .limit(100);

  const reviews = (data ?? []) as Review[];
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Customer feedback</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Trustit Reviews</h1>
        <p className="mt-2 text-sm text-slate-600">Feedback customers chose to share on Trustit. Google reviews are created separately by customers on Google.</p>
      </header>

      <section aria-label="Review summary" className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Reviews shown</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{reviews.length}</p>
          {reviews.length === 100 && <p className="mt-1 text-xs text-slate-500">Showing the latest 100</p>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-500">Average rating</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{average === null ? "—" : `${average.toFixed(1)} / 5`}</p>
          <p className="mt-1 text-xs text-slate-500">Based on reviews shown above</p>
        </div>
      </section>

      {error ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Reviews are temporarily unavailable. Please try again later.</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No customers have shared a Trustit review yet. Reviews appear here after a customer submits one through your QR flow.</p>
      ) : (
        <section aria-label="Submitted reviews" className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.review_id} review={review} dateLabel={new Date(review.submitted_at).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" })} />
          ))}
        </section>
      )}
    </div>
  );
}
