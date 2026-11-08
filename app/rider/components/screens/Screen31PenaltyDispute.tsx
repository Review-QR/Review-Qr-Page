"use client";

import React, { useState } from "react";

export interface DisputeItem {
  id: string;
  orderCode: string;
  roadName: string;
  deductedAmount: number;
  reason: string;
}

interface Screen31Props {
  onBack?: () => void;
  onSubmitDispute?: (reason: string) => void;
  disputeItem?: DisputeItem | null;
}

export default function Screen31PenaltyDispute({
  onBack,
  onSubmitDispute,
  disputeItem,
}: Screen31Props) {
  const [selectedReason, setSelectedReason] = useState<string>("Railway Crossing Gate Closed");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const disputeReasons = [
    { title: "Railway Crossing Gate Closed", detail: "Train crossing on Station Road caused halt" },
    { title: "Waterlogging / Monsoon Road Detour", detail: "Took alternative bypass to avoid flooded street" },
    { title: "Merchant Packaging Delay", detail: "Store took extra minutes beyond preparation ETA" },
    { title: "Customer Wrong Address Given", detail: "Customer changed delivery point mid-run" },
  ];

  if (!disputeItem) {
    return (
      <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
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
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Fair Earnings Protection
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Deductions &amp; Disputes</h2>
            </div>
            <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
              ⚖️
            </span>
          </div>

          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
              ✓
            </div>
            <h3 className="text-sm font-black text-slate-900">Zero Active Deductions</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Your fleet account is in 100% good standing. No automated penalties or trip deductions have been recorded.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 rounded-xl bg-[#0D47A1] text-white font-bold text-xs"
          >
            Back to Passbook
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans overflow-y-auto">
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
            <span className="text-xs font-bold text-rose-200">Trip #{disputeItem.orderCode} · {disputeItem.roadName}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/30 text-rose-300 border border-rose-500/40">
              ₹{disputeItem.deductedAmount.toFixed(2)} Deducted
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-2">
            Automated Penalty: &quot;{disputeItem.reason}&quot;. If delay was due to genuine external factors, claim full reversal below.
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
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {!isSubmitted ? (
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(true);
              onSubmitDispute?.(selectedReason);
            }}
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>Submit Dispute for Reversal</span>
            <span>➔</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-center text-xs font-bold text-emerald-800">
            Dispute submitted successfully! Fleet ops will review within 2 hours.
          </div>
        )}
      </div>
    </div>
  );
}
