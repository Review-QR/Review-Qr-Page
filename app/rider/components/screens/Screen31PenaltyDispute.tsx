"use client";

import React, { useState } from "react";

interface Screen31Props {
  onBack?: () => void;
  onSubmitDispute?: () => void;
}

export default function Screen31PenaltyDispute({
  onBack,
  onSubmitDispute,
}: Screen31Props) {
  const [selectedReason, setSelectedReason] = useState<string>("Railway Crossing Gate Closed");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const disputeReasons = [
    { title: "Railway Crossing Gate Closed", detail: "Train crossing on Station Road caused 18-minute halt" },
    { title: "Waterlogging / Monsoon Road Detour", detail: "Took 2.1 km alternative bypass to avoid flooded street" },
    { title: "Merchant Packaging Delay", detail: "Golden Blossom Café took 15 mins beyond preparation ETA" },
    { title: "Customer Wrong Address Given", detail: "Customer changed delivery point from Civil Lines to Court" },
  ];

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
              Fair Earnings Protection
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Deduction &amp; Detour Dispute</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            ⚖️
          </span>
        </div>

        {/* Penalty Alert Card */}
        <div className="mt-4 bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-200">Trip #TR-4490 · Station Road</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/30 text-rose-300 border border-rose-500/40">
              ₹30.00 Deducted
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-2">
            Automated Penalty: &quot;Delayed Handover (+14 mins)&quot;. If delay was due to genuine external factors, claim full reversal below.
          </p>
        </div>

        {/* Dispute Reasons List */}
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Select Genuine Delay Reason:
          </h4>
          {disputeReasons.map((dr, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedReason(dr.title)}
              className={`w-full text-left p-3 rounded-xl border transition ${
                selectedReason === dr.title
                  ? "bg-rose-50 border-rose-500 text-rose-900 shadow-xs"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{dr.title}</span>
                <span className="text-xs">{selectedReason === dr.title ? "✓" : "○"}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{dr.detail}</p>
            </button>
          ))}
        </div>

        {/* Telemetry Proof Box */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">🛰️ Auto GPS Odometer Audit:</span>
            <span className="font-mono text-emerald-700 font-bold">Zero Movement Verified</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            System logs confirm your bike was stationary at Bahraich Railway Gate for 16.4 mins. Dispute will be auto-approved!
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {!isSubmitted ? (
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(true);
              onSubmitDispute?.();
            }}
            className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
          >
            <span>Submit Claim &amp; Reverse ₹30 Penalty</span>
            <span>⚡</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <p className="text-xs font-black text-emerald-900">🎉 Claim Auto-Approved!</p>
            <p className="text-[11px] text-emerald-700">₹30.00 refunded directly to your Daily Passbook.</p>
          </div>
        )}
        <p className="text-center text-[10px] text-slate-400">
          Trustit Fair Driver Charter · Zero Unfair Penalties
        </p>
      </div>
    </div>
  );
}
