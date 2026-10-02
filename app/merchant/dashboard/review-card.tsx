type ReviewCardData = {
  review_id: string;
  customer_name: string | null;
  rating: number;
  review_text: string;
  selected_experiences: string[];
  submitted_at: string;
};

export default function ReviewCard({ review, dateLabel }: { review: ReviewCardData; dateLabel: string }) {
  const tone = review.rating <= 2 ? "negative" : review.rating === 3 ? "mixed" : "positive";
  const toneStyles = tone === "positive"
    ? "border-emerald-100 bg-emerald-50 text-emerald-800"
    : tone === "mixed"
      ? "border-amber-100 bg-amber-50 text-amber-800"
      : "border-rose-100 bg-rose-50 text-rose-800";

  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,.035)] sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-semibold text-slate-900">{review.customer_name || "Name not shared"}</p>
      <time className="text-xs text-slate-500" dateTime={review.submitted_at}>{dateLabel}</time>
    </div>
    <p className="mt-1 text-sm font-bold text-amber-500" aria-label={`${review.rating} out of 5 stars`}>
      <span aria-hidden="true">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
      <span className="ml-2 text-slate-800">{review.rating.toFixed(1)} / 5</span>
      <span className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${toneStyles}`}>{tone} feedback</span>
    </p>
    <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">Customer review</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.review_text}</p>
    </div>
    {review.selected_experiences?.length > 0 && <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">Customer highlighted points</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{review.selected_experiences.map((point) => <span key={point} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles}`}><span aria-hidden="true">✓</span>{point}</span>)}</div>
    </div>}
  </article>;
}
