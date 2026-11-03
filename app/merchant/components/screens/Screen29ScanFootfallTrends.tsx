"use client";

import React, { useState } from "react";

interface Screen29Props {
  onBack?: () => void;
  onOpenHeatmap?: () => void;
}

export default function Screen29ScanFootfallTrends({ onBack, onOpenHeatmap }: Screen29Props) {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              BUSINESS INTELLIGENCE
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Scan Traffic &amp; Footfall Trends
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

        {/* Date Filter Pills */}
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Analysis Period:</span>
          <div className="flex gap-1 text-xs font-bold">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  range === r ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "3 Months"}
              </button>
            ))}
          </div>
        </div>

        {/* Top 4 Metric Cards */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 block">Total QR Scans</span>
            <p className="text-lg font-black text-slate-900 mt-0.5">1,482</p>
            <span className="text-[9px] font-bold text-emerald-700">↑ 18% vs last month</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 block">Unique Walk-ins</span>
            <p className="text-lg font-black text-blue-700 mt-0.5">946</p>
            <span className="text-[9px] font-bold text-blue-600">64% New Customers</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 block">Repeat Scan Rate</span>
            <p className="text-lg font-black text-amber-900 mt-0.5">36.2%</p>
            <span className="text-[9px] font-bold text-amber-700">High Loyalty</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 block">Online Gross Sales</span>
            <p className="text-lg font-black text-emerald-700 mt-0.5">₹48,920</p>
            <span className="text-[9px] font-bold text-emerald-700">142 Orders</span>
          </div>
        </div>

        {/* Weekly Trend Bar Chart Simulation */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">
            Weekly Scan Footfall Activity
          </span>

          <div className="h-28 flex items-end justify-between gap-1.5 pt-3 pb-1 border-b border-slate-100">
            {[
              { day: "Mon", count: 42, height: "42%" },
              { day: "Tue", count: 38, height: "38%" },
              { day: "Wed", count: 54, height: "54%" },
              { day: "Thu", count: 68, height: "68%" },
              { day: "Fri", count: 86, height: "86%" },
              { day: "Sat", count: 100, height: "100%" },
              { day: "Sun", count: 94, height: "94%" },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  style={{ height: bar.height }}
                  className="w-full bg-blue-600 rounded-t-md hover:bg-blue-500 transition shadow-xs"
                ></div>
                <span className="text-[9px] font-bold text-slate-500">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenHeatmap}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>🔥 Inspect 24-Hour Rush Heatmap →</span>
        </button>
      </div>
    </div>
  );
}
