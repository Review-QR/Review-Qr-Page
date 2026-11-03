"use client";

import React, { useState } from "react";

interface Screen09Props {
  onBack?: () => void;
  onRemit?: () => void;
}

export default function Screen09CashCeiling({ onBack, onRemit }: Screen09Props) {
  const [cashAmount, setCashAmount] = useState(680);
  const ceiling = 1500;
  const isOverLimit = cashAmount >= ceiling;
  const percentage = Math.min(100, Math.round((cashAmount / ceiling) * 100));

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
            <span>← Scorecard</span>
          </button>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            ₹1,500 Hard Ceiling
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Cash-in-Hand Safety Guard</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Safety protocol for COD collections in Bahraich. Exceeding ₹1,500 pauses COD order dispatch.
          </p>
        </div>

        {/* Cash Status Card */}
        <div
          className={`mt-4 rounded-2xl p-5 border-2 shadow-sm space-y-4 transition ${
            isOverLimit ? "bg-red-50 border-red-500" : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Unremitted Cash
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-2xl font-black ${isOverLimit ? "text-red-700" : "text-slate-900"}`}>
                  ₹{cashAmount}.00
                </span>
                <span className="text-xs text-slate-400">/ ₹{ceiling}</span>
              </div>
            </div>
            <span className="text-3xl">{isOverLimit ? "🚨" : "💵"}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span className={isOverLimit ? "text-red-700" : "text-slate-600"}>{percentage}% of ceiling</span>
              <span className="text-slate-400">₹{ceiling - cashAmount} headroom remaining</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                style={{ width: `${percentage}%` }}
                className={`h-full transition-all duration-300 rounded-full ${
                  isOverLimit ? "bg-red-600" : percentage > 70 ? "bg-amber-500" : "bg-emerald-500"
                }`}
              ></div>
            </div>
          </div>

          {/* Alert Callout */}
          {isOverLimit ? (
            <div className="p-3 rounded-xl bg-red-100/80 border border-red-300 text-xs text-red-900 space-y-1">
              <strong className="block font-black">🛑 COD DISPATCH AUTOMATICALLY BLOCKED</strong>
              <p className="text-[11px] leading-tight">
                Aapka cash collection ₹1,500 ceiling cross kar chuka hai. Naye COD orders accept karne ke liye Trustit account me remit karein.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900">
              ✓ Dispatch active. You can accept both Online Paid &amp; Cash on Delivery orders.
            </div>
          )}

          {/* Simulation Toggle */}
          <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-100">
            <span className="text-slate-500 text-[10px]">Test Scenario:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCashAmount(680)}
                className={`px-2 py-1 rounded text-[10px] font-bold ${
                  cashAmount === 680 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Normal (₹680)
              </button>
              <button
                type="button"
                onClick={() => setCashAmount(1520)}
                className={`px-2 py-1 rounded text-[10px] font-bold ${
                  cashAmount === 1520 ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Over Limit (₹1,520)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onRemit}
          className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-[#0D47A1] hover:bg-[#082b66] text-white shadow-sm transition"
        >
          <span>📱 Remit Cash via Cashfree UPI (Deposit)</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
