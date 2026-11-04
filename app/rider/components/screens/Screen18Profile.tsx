"use client";

import React from "react";

interface Screen18Props {
  onBack?: () => void;
  onLogout?: () => void;
  onEditKyc?: () => void;
  onOpenPayoutSetup?: () => void;
  onOpenDisputes?: () => void;
  onOpenSafetyRules?: () => void;
  onOpenFleetId?: () => void;
}

export default function Screen18Profile({
  onBack,
  onLogout,
  onEditKyc,
  onOpenPayoutSetup,
  onOpenDisputes,
  onOpenSafetyRules,
  onOpenFleetId,
}: Screen18Props) {
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
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rider Fleet ID</span>
        </div>

        {/* Profile Card */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl border-2 border-emerald-400 bg-slate-900 flex items-center justify-center text-3xl shadow-sm">
            👨‍🦱
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-slate-900 truncate">Arjun Singh</h3>
              <span className="text-emerald-600 text-xs font-bold">✓ Verified</span>
            </div>
            <span className="text-[11px] text-slate-500 block font-mono">+91 98765 43210</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                UP 40 AB 2345
              </span>
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                ★ 4.92 Rating
              </span>
            </div>
          </div>
        </div>

        {/* Settings Navigation List (Zero Dummy Clicks) */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 text-xs">
          <div
            onClick={onEditKyc}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📄</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">KYC &amp; Identity Documents</strong>
                <span className="text-[10px] text-slate-400">RC, Driving License, Real Selfie Photo</span>
              </div>
            </div>
            <span className="text-slate-400 font-bold text-xs">➔</span>
          </div>

          <div
            onClick={onOpenPayoutSetup}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚡</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">Cashfree Instant UPI Payout</strong>
                <span className="text-[10px] text-slate-400 font-mono">arjun.singh@okhdfcbank</span>
              </div>
            </div>
            <span className="text-slate-400 font-bold text-xs">➔</span>
          </div>

          <div
            onClick={onOpenFleetId}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🪪</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">Digital Fleet ID &amp; Police Pass</strong>
                <span className="text-[10px] text-slate-400">Official Bahraich Night Transit Permit</span>
              </div>
            </div>
            <span className="text-slate-400 font-bold text-xs">➔</span>
          </div>

          <div
            onClick={onOpenSafetyRules}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🛡️</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">Safe Driving Rules &amp; Road Code</strong>
                <span className="text-[10px] text-slate-400">35 km/h town speed limit &amp; helmet compliance</span>
              </div>
            </div>
            <span className="text-slate-400 font-bold text-xs">➔</span>
          </div>

          <div
            onClick={onOpenDisputes}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚖️</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">Penalty &amp; Detour Dispute Desk</strong>
                <span className="text-[10px] text-slate-400">100% human review for unjust deductions</span>
              </div>
            </div>
            <span className="text-slate-400 font-bold text-xs">➔</span>
          </div>
        </div>
      </div>

      {/* Logout Action Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98"
        >
          <span>🚪 End Shift Duty &amp; Log Out</span>
        </button>
        <span className="text-[9px] text-slate-400 block text-center">
          Note: Logout is strictly blocked while carrying an active order in transit.
        </span>
      </div>
    </div>
  );
}
