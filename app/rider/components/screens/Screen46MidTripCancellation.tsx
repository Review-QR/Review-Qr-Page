"use client";

import React from "react";

interface Screen46Props {
  onBack?: () => void;
  onReturnToRadar?: () => void;
}

export default function Screen46MidTripCancellation({
  onBack,
  onReturnToRadar,
}: Screen46Props) {
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
              Trip Exception
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Order Cancelled Mid-Way</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-full py-0.5 border border-emerald-200">
            +₹22
          </span>
        </div>

        {/* Cancellation Alert Hero */}
        <div className="mt-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 text-center shadow-lg">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mb-2">
            ✕
          </div>
          <h3 className="text-base font-black text-white">Order Cancelled by Customer</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Order #TR-4492 has been cancelled. You do not need to proceed to the merchant.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-amber-300">
            Reason: Customer Placed Order by Mistake
          </div>
        </div>

        {/* Distance Travelled Compensation Card */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">GPS Odometer Telemetry</span>
              <h4 className="text-xs font-black text-slate-900">Distance Travelled: 2.4 KM</h4>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              +₹22.00 Credited
            </span>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <p className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Fuel &amp; Time Protected</strong>: Travelled kilometers auto-compensated.</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Zero Impact on Acceptance</strong>: Cancellation not counted against you.</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Transferred directly to your Daily Passbook balance.</span>
            </p>
          </div>
        </div>

        {/* Next Opportunity Banner */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-900 flex items-center gap-2">
          <span>⚡</span>
          <span>You are now prioritized for the next incoming order in Civil Lines!</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onReturnToRadar}
          className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
        >
          <span>Claim ₹22 Pay &amp; Return to Radar</span>
          <span>➔</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Fair Compensation Guarantee · Trustit Partner Security
        </p>
      </div>
    </div>
  );
}
