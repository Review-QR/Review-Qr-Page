"use client";

import React, { useState } from "react";

interface Screen22Props {
  onAcceptBatch?: () => void;
  onAcceptSingle?: (orderId: string) => void;
  onDecline?: () => void;
}

export default function Screen22MultiOrderBatch({
  onAcceptBatch,
  onAcceptSingle,
  onDecline,
}: Screen22Props) {
  const [selectedMode, setSelectedMode] = useState<"batch" | "single">("batch");

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onDecline}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Corridor Dispatch Mode
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Same-Route 2-Order Batch</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-full py-0.5 border border-emerald-200">
            ₹92
          </span>
        </div>

        {/* Combined Payout Formula Banner */}
        <div className="mt-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-purple-200">Combined Batch Earning</span>
            <span className="text-2xl font-black text-amber-300">₹92.00</span>
          </div>
          <div className="mt-2 text-[11px] space-y-1 text-purple-100">
            <div className="flex justify-between">
              <span>Order A (Base + Distance):</span>
              <span className="font-mono font-bold">₹35.00</span>
            </div>
            <div className="flex justify-between">
              <span>Order B (Incremental Drop):</span>
              <span className="font-mono font-bold">₹25.00</span>
            </div>
            <div className="flex justify-between">
              <span>Shared Corridor KM Bonus:</span>
              <span className="font-mono font-bold text-emerald-300">+₹12.00</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Tips (A + B):</span>
              <span className="font-mono font-bold text-amber-300">+₹20.00</span>
            </div>
          </div>
        </div>

        {/* 4-Step Route Sequence Timeline */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Smart 4-Step Trip Sequence
            </h4>
            <span className="text-[10px] font-bold text-slate-500">Total Route: 4.8 km</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Step 1 */}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-slate-900">📍 Pickup Order A: Golden Blossom Café</p>
                <p className="text-[10px] text-slate-500">Civil Lines (0.8 km) · 2 Items (Burger &amp; Fries)</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-slate-900">📍 Pickup Order B: Royal Dine Restaurant</p>
                <p className="text-[10px] text-slate-500">Same street (+300m away) · 1 Item (Biryani)</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-slate-900">🏁 Drop Order A: Amit Sharma</p>
                <p className="text-[10px] text-slate-500">Civil Lines Near City Hospital · Collect ₹340 COD</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-slate-900">🏁 Drop Order B: Priya Verma</p>
                <p className="text-[10px] text-slate-500">Kachehri Road (+1.2 km on corridor) · Paid Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedMode("batch")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
              selectedMode === "batch"
                ? "bg-purple-50 border-purple-500 text-purple-900"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            🔥 Accept Both (₹92)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMode("single")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
              selectedMode === "single"
                ? "bg-purple-50 border-purple-500 text-purple-900"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            Order A Only (₹35)
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={() => (selectedMode === "batch" ? onAcceptBatch?.() : onAcceptSingle?.("TR-4492"))}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 text-white font-black text-sm shadow-md hover:brightness-110 transition flex items-center justify-center gap-2"
        >
          <span>{selectedMode === "batch" ? "Accept Full Batch (Earn ₹92.00)" : "Accept Order A Only (₹35.00)"}</span>
          <span>⚡</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Corridor routing saves 2.4 km fuel compared to separate trips
        </p>
      </div>
    </div>
  );
}
