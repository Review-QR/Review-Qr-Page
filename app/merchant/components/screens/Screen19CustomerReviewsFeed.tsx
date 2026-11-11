"use client";

import React from "react";

export interface RealMerchantReview {
  id: string;
  customer_name?: string | null;
  rating: number;
  review_text: string;
  submitted_at?: string;
}

interface Screen19Props {
  onBack?: () => void;
  onOpenReply?: (customerName: string) => void;
  onOpenStandeeQr?: () => void;
  reviews?: RealMerchantReview[];
  reviewStats?: {
    totalReviews?: number;
    averageRating?: number | null;
    totalScans?: number;
    positivePct?: number | null;
  };
}

export default function Screen19CustomerReviewsFeed({
  onBack,
  onOpenReply,
  onOpenStandeeQr,
  reviews = [],
  reviewStats,
}: Screen19Props) {
  const totalReviews = reviewStats?.totalReviews ?? reviews.length;
  const averageRating =
    reviewStats?.averageRating != null
      ? reviewStats.averageRating
      : reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1))
      : null;
  const positivePct = reviewStats?.positivePct ?? null;

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        {/* Top Compact Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider block">
              CUSTOMER SENTIMENT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Trustit Verified Reviews
            </h1>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Authentic Rating Strip */}
        <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black text-slate-900 leading-none">
              {averageRating != null ? averageRating.toFixed(1) : "—"}
            </span>
            <div>
              <div className="flex text-amber-400 text-xs leading-none">
                {averageRating != null ? "★★★★★" : "☆☆☆☆☆"}
              </div>
              <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                {totalReviews} Verified {totalReviews === 1 ? "Review" : "Reviews"}
                {positivePct != null ? ` · ${positivePct}% Positive` : ""}
              </span>
            </div>
          </div>

          {onOpenStandeeQr && (
            <button
              type="button"
              onClick={onOpenStandeeQr}
              className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <span>🪧 Counter QR</span>
            </button>
          )}
        </div>

        {/* Live Store Reviews or Clean Empty State */}
        <div className="mt-2.5 space-y-2">
          {reviews.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center space-y-2 shadow-2xs mt-2">
              <span className="text-3xl block">⭐</span>
              <h3 className="text-xs font-black text-slate-900">No Verified Reviews Yet</h3>
              <p className="text-[10px] text-slate-500 max-w-[240px] mx-auto leading-snug">
                Customers who scan your store&apos;s official Trustit QR Standee will appear here in real time.
              </p>
              {onOpenStandeeQr && (
                <button
                  type="button"
                  onClick={onOpenStandeeQr}
                  className="mt-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black shadow-xs transition active:scale-95"
                >
                  Open Counter Standee QR →
                </button>
              )}
            </div>
          ) : (
            reviews.map((r) => {
              const dateLabel = r.submitted_at
                ? new Date(r.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "Verified";
              const displayName = r.customer_name?.trim() || "Verified Customer";
              const stars = "★".repeat(Math.max(1, Math.min(5, Number(r.rating) || 5)));
              return (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{displayName}</h4>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-amber-500 font-bold">{stars}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400 text-[9px]">{dateLabel}</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-200">
                      ✓ Verified QR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    &ldquo;{r.review_text}&rdquo;
                  </p>
                  {onOpenReply && (
                    <button
                      type="button"
                      onClick={() => onOpenReply(displayName)}
                      className="text-[9px] font-bold text-blue-600 hover:text-blue-800 pt-0.5"
                    >
                      💬 Reply to Customer
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[9px] text-slate-400 font-mono">
        100% Authentic Customer Feedback Verified via Store QR
      </div>
    </div>
  );
}
