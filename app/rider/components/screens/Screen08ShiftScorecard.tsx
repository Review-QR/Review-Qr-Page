"use client";

import React from "react";

interface Screen08Props {
  onBack?: () => void;
  onOpenCeiling?: () => void;
}

export default function Screen08ShiftScorecard({ onBack, onOpenCeiling }: Screen08Props) {
  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Cockpit</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shift Metrics</span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Rider Performance Scorecard</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Live shift telemetry, earnings ledger and odometer displacement.
          </p>
        </div>

        {/* 4-Card Scorecard Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {/* Card 1: Today */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Earnings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">₹520.00</span>
              <span className="text-[10px] font-bold text-emerald-600">14 Trips</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Avg ₹37.1 / trip</span>
          </div>

          {/* Card 2: This Month */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">This Month</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">₹14,280</span>
              <span className="text-[10px] font-bold text-blue-700">342 Trips</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Payout Settled</span>
          </div>

          {/* Card 3: Cash in Hand (Clickable to Ceiling Screen) */}
          <div
            onClick={onOpenCeiling}
            className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm space-y-1 cursor-pointer hover:bg-amber-50 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Cash in Hand</span>
              <span className="text-[9px] font-black text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">
                Cap ₹1,500
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">₹680.00</span>
              <span className="text-[10px] text-slate-500">/ 1,500</span>
            </div>
            <span className="text-[10px] font-bold text-amber-900 block">Remittance Healthy (45%)</span>
          </div>

          {/* Card 4: Rating & Fleet Level */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Rating</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-slate-900">4.92</span>
              <span className="text-amber-500 text-sm">★★★★★</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 block">Gold Pro Tier</span>
          </div>
        </div>

        {/* Live Shift Stopwatch & Odometer Breakdown */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5">
          <span className="text-[11px] font-bold text-slate-700 block">Shift Telemetry</span>
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-500">Current Shift Duration</span>
            <strong className="text-slate-900 font-mono">03h 42m 15s</strong>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-500">Haversine GPS Distance</span>
            <strong className="text-slate-900 font-mono">24.84 km</strong>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-500">Customer Tips Received</span>
            <strong className="text-emerald-600 font-bold">+₹60.00 (3 tips)</strong>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onOpenCeiling}
          className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition"
        >
          <span>View ₹1,500 Cash Ceiling &amp; Remittance</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
