"use client";

import React from "react";

interface Screen31Props {
  onBack?: () => void;
  onOpenExporter?: () => void;
}

export default function Screen31CustomerSentimentTags({
  onBack,
  onOpenExporter,
}: Screen31Props) {
  const metrics = [
    { label: "Food Taste & Quality", score: 96, positive: "134 mentions", color: "bg-emerald-500" },
    { label: "Hygiene & Cleanliness", score: 92, positive: "118 mentions", color: "bg-blue-500" },
    { label: "Staff Hospitality & Politeness", score: 89, positive: "94 mentions", color: "bg-indigo-500" },
    { label: "Order Preparation Speed", score: 84, positive: "82 mentions", color: "bg-amber-500" },
    { label: "Value for Money Pricing", score: 88, positive: "98 mentions", color: "bg-teal-500" },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              REPUTATION METRICS
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Customer Sentiment &amp; Experience
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Overall Sentiment Callout */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Customer Net Promoter Score</span>
            <p className="text-lg font-black text-emerald-700 mt-0.5">91.4% Positive</p>
            <span className="text-[9px] text-slate-500">Based on 148 verified in-store reviews</span>
          </div>
          <span className="text-2xl">🌟</span>
        </div>

        {/* Progress Breakdown */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Category-Wise Satisfaction Score
          </span>

          {metrics.map((m, i) => (
            <div key={i} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{m.label}</span>
                <span className="font-mono font-black text-slate-900">{m.score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${m.score}%` }}
                  className={`h-full ${m.color} rounded-full`}
                ></div>
              </div>
              <span className="text-[9px] text-slate-400 block">{m.positive}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenExporter}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>📊 Export Full Spreadsheet Report →</span>
        </button>
      </div>
    </div>
  );
}
