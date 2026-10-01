import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export const dynamic = "force-dynamic";

type MerchantReview = {
  review_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  selected_experiences: string[];
  submitted_at: string;
};

export default async function MerchantReviewsPage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();

  const [{ data: reviews, error: reviewsError }, { data: business, error: businessError }] =
    await Promise.all([
      supabase.rpc("get_merchant_trustit_reviews", {
        p_business_id: merchant.businessId,
      }),
      supabase
        .from("businesses")
        .select("scans")
        .eq("id", merchant.businessId)
        .maybeSingle(),
    ]);

  const safeReviews = (reviews ?? []) as MerchantReview[];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
          Customer feedback
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Trustit Reviews</h1>
        <p className="mt-2 text-sm text-slate-500">
          {merchant.businessName} · only review information relevant to your business is shown.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">QR scans</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {businessError ? "—" : business?.scans ?? 0}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Trustit reviews</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{safeReviews.length}</p>
        </div>
      </section>

      {reviewsError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert">
          Reviews could not be loaded right now. Please try again later.
        </section>
      ) : safeReviews.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No Trustit reviews yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Customer reviews submitted through Trustit will appear here.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {safeReviews.map((review) => (
            <article key={review.review_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{review.customer_name || "Customer"}</h2>
                  <p className="mt-1 text-sm font-semibold text-amber-600">
                    {"★".repeat(Math.max(0, Math.min(5, Number(review.rating))))}
                    <span className="ml-2 text-slate-500">{review.rating}/5</span>
                  </p>
                </div>
                <time className="text-xs text-slate-500" dateTime={review.submitted_at}>
                  {new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  }).format(new Date(review.submitted_at))}
                </time>
              </div>

              {review.selected_experiences?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.selected_experiences.map((experience) => (
                    <span key={experience} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {experience}
                    </span>
                  ))}
                </div>
              ) : null}

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {review.review_text}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
