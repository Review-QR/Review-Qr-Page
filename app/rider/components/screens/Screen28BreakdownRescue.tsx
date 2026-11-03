"use client";

import React, { useState } from "react";

interface Screen28Props {
  onBack?: () => void;
  onRequestBuddy?: () => void;
  onHandoverComplete?: () => void;
}

export default function Screen28BreakdownRescue({
  onBack,
  onRequestBuddy,
  onHandoverComplete,
}: Screen28Props) {
  const [breakdownType, setBreakdownType] = useState<"puncture" | "chain_engine" | "accident">("puncture");
  const [buddyAssigned, setBuddyAssigned] = useState<boolean>(true);
  const [handoverOtp, setHandoverOtp] = useState<string>("7821");

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              On-Road Emergency
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Breakdown &amp; Buddy Handover</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            🆘
          </span>
        </div>

        {/* Emergency Alert Banner */}
        <div className="mt-4 bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-100">Stranded with Order #TR-4492</span>
            <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-black/20 text-white">
              Food in Bag
            </span>
          </div>
          <p className="text-xs text-rose-100 mt-2 leading-relaxed">
            Report your vehicle issue immediately. Trustit will dispatch a nearby active rider to take the package and complete the delivery.
          </p>
        </div>

        {/* Issue Type Selector */}
        <div className="mt-4 space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
            Select Breakdown Cause:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setBreakdownType("puncture")}
              className={`p-2.5 rounded-xl border text-center transition ${
                breakdownType === "puncture"
                  ? "bg-rose-50 border-rose-500 text-rose-900 font-extrabold shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 text-xs"
              }`}
            >
              <span className="text-lg block">🛞</span>
              <span className="text-[10px] mt-1 block">Tyre Puncture</span>
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType("chain_engine")}
              className={`p-2.5 rounded-xl border text-center transition ${
                breakdownType === "chain_engine"
                  ? "bg-rose-50 border-rose-500 text-rose-900 font-extrabold shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 text-xs"
              }`}
            >
              <span className="text-lg block">⚙️</span>
              <span className="text-[10px] mt-1 block">Engine / Chain</span>
            </button>
            <button
              type="button"
              onClick={() => setBreakdownType("accident")}
              className={`p-2.5 rounded-xl border text-center transition ${
                breakdownType === "accident"
                  ? "bg-rose-50 border-rose-500 text-rose-900 font-extrabold shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 text-xs"
              }`}
            >
              <span className="text-lg block">🚑</span>
              <span className="text-[10px] mt-1 block">Minor Slip</span>
            </button>
          </div>
        </div>

        {/* Buddy Handover Card */}
        {buddyAssigned ? (
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-black text-slate-900">Rescue Rider En-Route</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">ETA: 4 Mins (800m away)</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0D47A1] font-black text-sm flex items-center justify-center">
                  VI
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Vikas Mishra (UP 40 AK 8812)</p>
                  <p className="text-[10px] text-slate-500">Honda Shine · 4.9★ Rating</p>
                </div>
              </div>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold"
              >
                📞 Call
              </button>
            </div>

            {/* Handover OTP Box */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                GIVE THIS CODE TO VIKAS AT HANDOVER
              </span>
              <div className="text-2xl font-black font-mono tracking-widest text-[#0D47A1] mt-0.5">
                {handoverOtp}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p>• Split Payout: You receive <strong>₹25.00</strong> for pickup portion.</p>
              <p>• Zero penalty recorded on your rider profile for genuine breakdowns.</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setBuddyAssigned(true);
                onRequestBuddy?.();
              }}
              className="px-4 py-2 rounded-xl bg-[#0D47A1] text-white text-xs font-bold"
            >
              Find Nearest Buddy Rider
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onHandoverComplete}
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <span>Handover Complete · Claim Split Pay</span>
          <span>✓</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Trustit Fleet Ground Support · Bahraich SOS Hotline: 1800-TRUSTIT
        </p>
      </div>
    </div>
  );
}
