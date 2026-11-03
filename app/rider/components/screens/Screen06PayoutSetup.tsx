"use client";

import React, { useState } from "react";

interface Screen06Props {
  onPayoutConfigured?: (upiId: string) => void;
  onBack?: () => void;
}

export default function Screen06PayoutSetup({ onPayoutConfigured, onBack }: Screen06Props) {
  const [upiId, setUpiId] = useState("arjun.singh@okhdfcbank");
  const [payoutMethod, setPayoutMethod] = useState<"upi" | "bank">("upi");
  const [pennyDropSuccess, setPennyDropSuccess] = useState(true);

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
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 6 of 6</span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Instant Cashfree Payout Setup</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Link your UPI VPA handle for instant daily delivery earnings and tips transfer.
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5">
          {/* Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPayoutMethod("upi")}
              className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                payoutMethod === "upi"
                  ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1]"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>⚡ Instant UPI (Recommended)</span>
            </button>
            <button
              type="button"
              onClick={() => setPayoutMethod("bank")}
              className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                payoutMethod === "bank"
                  ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1]"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>🏦 Bank Account &amp; IFSC</span>
            </button>
          </div>

          {/* UPI ID Field */}
          {payoutMethod === "upi" ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">UPI ID / VPA Handle</label>
                <span className="text-[10px] font-bold text-slate-400">e.g. @okhdfcbank, @paytm</span>
              </div>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@bank"
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Account Number"
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Bank IFSC Code (e.g. HDFC0001234)"
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>
          )}

          {/* Penny-Drop Verification Test Card */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                <span>✓</span> Cashfree ₹1 Penny-Drop Verified
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700">UTR: CF94821049</span>
            </div>
            <p className="text-[10px] text-emerald-800 leading-tight">
              A ₹1 test deposit was validated on your VPA to ensure payouts reach your account without failures.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            💡 Earnings from completed deliveries are withdrawable instantly 24x7 to this UPI handle.
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onPayoutConfigured?.(upiId)}
          className="w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98] transition"
        >
          <span>Complete KYC ➔ Launch Duty Cockpit</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
