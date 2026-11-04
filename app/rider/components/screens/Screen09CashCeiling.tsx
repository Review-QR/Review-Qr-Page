"use client";

import React from "react";

interface Screen09Props {
  onBack?: () => void;
  onRemit?: () => void;
  cashInHandProp?: number;
  cashCeilingProp?: number;
}

export default function Screen09CashCeiling({
  onBack,
  onRemit,
  cashInHandProp = 680,
  cashCeilingProp = 1500,
}: Screen09Props) {
  const cashAmount = cashInHandProp;
  const ceiling = cashCeilingProp;
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
            <span>← Cockpit</span>
          </button>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            ₹{ceiling} Hard Ceiling
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Cash-in-Hand Safety Guard</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Safety protocol for COD collections in Bahraich. Exceeding ₹{ceiling} pauses COD order dispatch.
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
              <span className="text-slate-400">₹{Math.max(0, ceiling - cashAmount)} headroom remaining</span>
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
              <p className="text-[11px] leading-tight text-red-800">
                Aapki cash limit ₹{ceiling} cross ho chuki hai. Naye orders lene ke liye nazdeeki Trustit Cash Hub par deposit karein ya UPI se remit karein.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900">
              ✓ Safe headroom active. You can accept both Online and Cash on Delivery orders.
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onRemit}
          className="w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-[#0D47A1] hover:bg-blue-800 text-white shadow-sm transition active:scale-98"
        >
          <span>Remit Cash Now (UPI / Hubs)</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
