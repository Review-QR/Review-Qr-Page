"use client";

import React, { useState } from "react";

interface Screen06Props {
  onPayoutConfigured?: (upiId: string) => void;
  onBack?: () => void;
}

export default function Screen06PayoutSetup({ onPayoutConfigured, onBack }: Screen06Props) {
  // Single standardized payout method as instructed by user: UPI only
  const [upiId, setUpiId] = useState("trustit.rider@oksbi");

  return (
    <div className="w-full h-full max-h-[580px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 6 of 6</span>
        </div>

        {/* Title */}
        <div className="mt-2.5 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">Instant Cashfree UPI Payout</h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            Link your UPI VPA handle for instant daily earnings transfer directly to your bank.
          </p>
        </div>

        {/* Form Card (Single Clean Option: UPI Only - Zero Bank Clutter) */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
          {/* Active Method Badge (UPI Only) */}
          <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs font-bold text-[#0D47A1]">
            <div className="flex items-center gap-1.5">
              <span>⚡</span>
              <span className="font-black">Instant UPI Payout (तत्काल यूपीआई)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white shadow-2xs">
              ✓ Active
            </span>
          </div>

          {/* UPI ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                UPI ID / Virtual Payment Address (VPA)
              </label>
              <span className="text-[9px] text-slate-400">@okhdfcbank, @paytm, @oksbi</span>
            </div>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
              placeholder="yourname@oksbi"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Cashfree Penny-Drop Badge (Single Line) */}
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-emerald-900 font-bold">
              <span>✓</span>
              <span>Cashfree ₹1 Penny-Drop Active</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-700 font-bold">UTR: CF94821049</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 leading-tight">
            💡 Earnings from completed deliveries are withdrawable 24x7 to this UPI handle.
          </div>
        </div>
      </div>

      {/* Slim 40px Action Footer */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onPayoutConfigured?.(upiId || "trustit.rider@oksbi")}
          className="w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-700 text-white shadow-xs active:scale-[0.99] transition"
        >
          <span>Complete KYC ➔ Launch Duty Cockpit</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
