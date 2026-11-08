"use client";

import React, { useState } from "react";

interface Screen03Props {
  onAgree?: () => void;
  onBack?: () => void;
}

export default function Screen03Consent({ onAgree, onBack }: Screen03Props) {
  const [agreed, setAgreed] = useState(true);

  return (
    <div className="w-full h-full max-h-[580px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 3 of 6</span>
        </div>

        {/* Title */}
        <div className="mt-3 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">Partner Terms &amp; Road Safety Policy</h2>
          <p className="text-xs text-slate-500 leading-snug">
            UP 40 Bahraich traffic compliance, cash ceiling &amp; parcel custody rules.
          </p>
        </div>

        {/* 2x2 Compact Policy Grid (Zero Scroll) */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-left">
          {/* Card 1: Cash Ceiling */}
          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1 text-amber-900 font-bold text-[11px]">
              <span>💰</span>
              <span>₹1,500 Cash Limit</span>
            </div>
            <p className="text-[10px] text-amber-800 leading-tight">
              Remit COD cash via UPI before ceiling is reached to keep receiving new orders.
            </p>
          </div>

          {/* Card 2: Helmet & Safety */}
          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/90 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1 text-[#0D47A1] font-bold text-[11px]">
              <span>⛑️</span>
              <span>Helmet &amp; Speed</span>
            </div>
            <p className="text-[10px] text-blue-900 leading-tight">
              Wear helmet at all times. Comply with UP RTO Bahraich road safety rules.
            </p>
          </div>

          {/* Card 3: Dynamic Trustit QR */}
          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/90 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1 text-purple-900 font-bold text-[11px]">
              <span>📱</span>
              <span>Official QR Only</span>
            </div>
            <p className="text-[10px] text-purple-800 leading-tight">
              Always use Trustit dynamic in-app QR for payments. Personal QR is strictly prohibited.
            </p>
          </div>

          {/* Card 4: Anti-Spoof GPS */}
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 space-y-1 shadow-2xs">
            <div className="flex items-center gap-1 text-emerald-900 font-bold text-[11px]">
              <span>📍</span>
              <span>Real Live GPS</span>
            </div>
            <p className="text-[10px] text-emerald-800 leading-tight">
              Honest location telemetry. Fake GPS or mock locations result in permanent ban.
            </p>
          </div>
        </div>

        {/* Master Consent Checkbox */}
        <div className="mt-3.5 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#0D47A1] accent-[#0D47A1] shrink-0"
            />
            <span className="text-[11px] text-slate-800 font-semibold leading-tight">
              I agree to the Trustit Partner terms, safety compliance, and cash remittance ceiling.
            </span>
          </label>
        </div>
      </div>

      {/* Slim 40px Action Footer */}
      <div className="pt-2.5 border-t border-slate-200">
        <button
          type="button"
          onClick={onAgree}
          disabled={!agreed}
          className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer ${
            agreed
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>I Agree &amp; Proceed to Live KYC</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
