"use client";

import React, { useState } from "react";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

interface Screen19Props {
  onBack?: () => void;
  onOpenReply?: (customerName: string) => void;
}

export default function Screen19CustomerReviewsFeed({
  onBack,
  onOpenReply,
}: Screen19Props) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const allReviews = [
    {
      id: 1,
      name: "Rohit Agarwal",
      rating: 5,
      date: "Today, 01:20 PM",
      verified: true,
      tags: ["Great Taste", "Fast Service"],
      comment: "Best cold coffee in Bahraich! Sandwich was fresh and crunchy. Table service was very polite.",
      reply: "Thank you Rohit ji! We look forward to serving you again soon.",
    },
    {
      id: 2,
      name: "Dr. Ananya Mishra",
      rating: 5,
      date: "Yesterday",
      verified: true,
      tags: ["Hygienic Packaging"],
      comment: "Clean tables, hygienic food preparation, and quick order fulfillment.",
      reply: null,
    },
    {
      id: 3,
      name: "Vikas Srivastava",
      rating: 4,
      date: "2 days ago",
      verified: true,
      tags: ["Good Food"],
      comment: "Good experience overall. Frappe took 5 mins longer due to rush, but tasted delicious.",
      reply: null,
    },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Compact Header (No Overlap) */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider block">
              CUSTOMER SENTIMENT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Trustit Verified Reviews
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Demo Mode Toggle Pill */}
            <button
              type="button"
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition ${
                isSubscribed
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-amber-50 text-amber-900 border-amber-300"
              }`}
              title="Click to toggle Free vs Subscribed View"
            >
              {isSubscribed ? "VIP Active ✓" : "Test Free Mode"}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="text-[11px] text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Compact Rating Strip (Fits Screen without taking huge vertical space) */}
        <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black text-slate-900 leading-none">4.9</span>
            <div>
              <div className="flex text-amber-400 text-xs leading-none">★★★★★</div>
              <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                148 Reviews · 88% Positive
              </span>
            </div>
          </div>

          {!isSubscribed && (
            <button
              type="button"
              onClick={() => setIsUpgradeModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <span>⚡ Unlock All (₹29)</span>
            </button>
          )}
        </div>

        {/* Reviews Feed Container */}
        <div className="mt-2 space-y-2">
          {/* REVIEW 1: ALWAYS VISIBLE (Free Unlocked Hook) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900 leading-tight">
                  {allReviews[0].name}
                </h4>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-amber-500 font-bold">★★★★★</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 text-[9px]">{allReviews[0].date}</span>
                </div>
              </div>

              <span className="text-[8px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-200">
                ✓ In-Store QR Scan
              </span>
            </div>

            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              "{allReviews[0].comment}"
            </p>

            {/* Owner Response */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-[9px] text-slate-600">
              <span className="font-bold text-slate-900">Owner Response: </span>
              <span>{allReviews[0].reply}</span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* IF SUBSCRIBED: SHOW REMAINING REVIEWS IN FULL DETAIL       */}
          {/* IF FREE: SHOW 1 COMPACT LOCKED TEASER CARD (NO CUT-OFF)    */}
          {/* ========================================================== */}
          {isSubscribed ? (
            allReviews.slice(1).map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">{r.name}</h4>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-amber-500 font-bold">{"★".repeat(r.rating)}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 text-[9px]">{r.date}</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-200">
                    ✓ Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  "{r.comment}"
                </p>
                <button
                  type="button"
                  onClick={() => onOpenReply?.(r.name)}
                  className="text-[9px] font-bold text-blue-600 hover:text-blue-800 pt-0.5"
                >
                  💬 Reply to Customer
                </button>
              </div>
            ))
          ) : (
            /* COMPACT TEASER CARD (Fits perfectly inside the viewport without overflowing) */
            <div className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-dashed border-amber-300 rounded-2xl p-3 shadow-xs text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                  🔒
                </span>
                <span className="text-xs font-black text-slate-900">
                  2 More Customer Reviews Waiting
                </span>
              </div>

              {/* Blurred Customer Previews */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 filter blur-xs select-none">
                <span>Dr. Ananya Mishra (5★)</span>
                <span>•</span>
                <span>Vikas Srivastava (4★)</span>
              </div>

              <p className="text-[10px] text-slate-600 max-w-[260px] mx-auto leading-tight">
                Grahakon ne aapki dukan ki tareef ki hai! Sabhi reviews padhein aur reply dekar trust badhayein.
              </p>

              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="mt-1 w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-black rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Unlock All Reviews for ₹29/Month</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Disclaimer (Clean & Compact) */}
      <div className="pt-2 text-center text-[9px] text-slate-400 font-mono">
        100% Authentic Customer Feedback Verified via GPS &amp; Table QR
      </div>

      {/* Universal Upgrade Modal */}
      <UniversalUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="reviews"
        onSuccessPay={() => {
          setIsSubscribed(true);
        }}
      />
    </div>
  );
}
