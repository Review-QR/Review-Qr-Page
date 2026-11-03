"use client";

import React from "react";

interface Screen18Props {
  onBack?: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
}

export default function Screen18Profile({ onBack, onLogout, onEditProfile }: Screen18Props) {
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
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rider Partner</span>
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

        {/* Settings Navigation List */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 text-xs">
          <div
            onClick={onEditProfile}
            className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📄</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">KYC &amp; Identity Documents</strong>
                <span className="text-[10px] text-slate-400">RC, Driving License, Real Selfie Photo</span>
              </div>
            </div>
            <span className="text-slate-400">➔</span>
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚡</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">Cashfree UPI Settlement Account</strong>
                <span className="text-[10px] text-slate-400 font-mono">arjun.singh@okhdfcbank</span>
              </div>
            </div>
            <span className="text-slate-400">➔</span>
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🛡️</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">Dispute &amp; Toll Reassignment Desk</strong>
                <span className="text-[10px] text-slate-400">0 Open Disputes · All trips settled</span>
              </div>
            </div>
            <span className="text-slate-400">➔</span>
          </div>

          <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔒</span>
              <div>
                <strong className="text-slate-900 font-bold block text-xs">Privacy &amp; Telephony Call Masking</strong>
                <span className="text-[10px] text-slate-400">Your personal phone number is shielded</span>
              </div>
            </div>
            <span className="text-slate-400">➔</span>
          </div>
        </div>
      </div>

      {/* Logout Action Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
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
