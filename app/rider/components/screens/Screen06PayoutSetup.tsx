"use client";

import React, { useState } from "react";

interface Screen06Props {
  onPayoutConfigured?: (upiId: string) => void;
  onBack?: () => void;
}

export default function Screen06PayoutSetup({ onPayoutConfigured, onBack }: Screen06Props) {
  const [upiId, setUpiId] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"upi" | "bank">("upi");

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
          <h2 className="text-base font-black text-slate-900 leading-tight">Instant Cashfree Payout Setup</h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            Link your UPI VPA handle for instant daily earnings transfer directly to your bank.
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setPayoutMethod("upi")}
              className={`py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${
                payoutMethod === "upi"
                  ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>⚡ UPI VPA (Instant)</span>
            </button>
            <button
              type="button"
              onClick={() => setPayoutMethod("bank")}
              className={`py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 transition ${
                payoutMethod === "bank"
                  ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>🏦 Bank &amp; IFSC</span>
            </button>
          </div>

          {/* UPI ID Field */}
          {payoutMethod === "upi" ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  UPI ID / Virtual Payment Address
                </label>
                <span className="text-[9px] text-slate-400">@okhdfcbank, @paytm</span>
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase().trim())}
                placeholder="yourname@oksbi"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Bank Account Number"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
              />
              <input
                type="text"
                placeholder="IFSC Code (e.g. SBIN0001234)"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none uppercase"
              />
            </div>
          )}

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
          onClick={() => onPayoutConfigured?.(upiId || "trustit.partner@oksbi")}
          className="w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-700 text-white shadow-xs active:scale-[0.99] transition"
        >
          <span>Complete KYC ➔ Launch Duty Cockpit</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
