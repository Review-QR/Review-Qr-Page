"use client";

import React from "react";

interface Screen30Props {
  onBack?: () => void;
  onOpenSentiment?: () => void;
}

export default function Screen30HourlyRushHeatmap({
  onBack,
  onOpenSentiment,
}: Screen30Props) {
  const hours = [
    { label: "10AM", val: 15 },
    { label: "12PM", val: 40 },
    { label: "02PM", val: 55 },
    { label: "04PM", val: 30 },
    { label: "06PM", val: 85, peak: true },
    { label: "07PM", val: 95, peak: true },
    { label: "08PM", val: 100, peak: true },
    { label: "09PM", val: 80, peak: true },
    { label: "10PM", val: 45 },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
              OPERATIONAL INTELLIGENCE
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              24-Hour Rush Footfall Heatmap
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

        {/* Peak Rush Callout */}
        <div className="mt-2.5 bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🔥</span> Primary Peak Window: 06:00 PM – 09:30 PM
            </span>
            <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
              Kitchen Surge
            </span>
          </div>
          <p className="text-[10px] text-amber-800 leading-relaxed">
            68% of your daily cafe revenue and QR scans happen in this 3.5 hour evening rush. Ensure extra prep of cold frappes and burger patties by 5:30 PM.
          </p>
        </div>

        {/* Hourly Chart Simulation */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Hourly Customer Intensity
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-400">Average 30 Days</span>
          </div>

          <div className="h-32 flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-slate-100">
            {hours.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  style={{ height: `${h.val}%` }}
                  className={`w-full rounded-t-md transition-all shadow-xs ${
                    h.peak ? "bg-amber-500 hover:bg-amber-600 animate-pulse" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                ></div>
                <span className="text-[8px] font-bold text-slate-600">{h.label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-2.5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-300"></span> Normal Hours
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Peak Kitchen Rush
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenSentiment}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>💬 View Customer Sentiment Tags →</span>
        </button>
      </div>
    </div>
  );
}
