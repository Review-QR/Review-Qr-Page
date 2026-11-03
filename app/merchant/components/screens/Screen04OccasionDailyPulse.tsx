"use client";

import React, { useState } from "react";

interface Screen04Props {
  onBack?: () => void;
  onTopup?: () => void;
}

export default function Screen04OccasionDailyPulse({ onBack, onTopup }: Screen04Props) {
  const [autoDispatch, setAutoDispatch] = useState<boolean>(true);
  const [credits, setCredits] = useState<number>(100);

  return (
    <div className="w-full h-full bg-[#FAF5FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-purple-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🎂
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                AUTOMATED OCCASION CRM
              </span>
              <h2 className="text-xs font-black text-slate-900 leading-tight">
                Today's Customer Wishes
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold"
          >
            ← Back
          </button>
        </div>

        {/* Dispatch Protocol Callout */}
        <div className="mt-3 bg-white border border-purple-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-slate-900">09:30 AM Daily WhatsApp Auto-Blast</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoDispatch(!autoDispatch)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                autoDispatch
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-slate-100 text-slate-500 border-slate-300"
              }`}
            >
              {autoDispatch ? "Active ✓" : "Paused ⏸"}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Personalized greetings with your cafe logo and a 10% birthday discount coupon are sent automatically to customers who scanned your in-store QR code.
          </p>
        </div>

        {/* Today's Celebrants */}
        <div className="mt-3 space-y-2">
          <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
            Celebrants Today (2 Birthdays, 1 Anniversary)
          </h3>

          {/* Celebrant 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎂</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Rahul Verma</h4>
                  <p className="text-[10px] text-slate-500">Turning 26 Today • 5th Order Customer</p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                Scheduled 09:30 AM
              </span>
            </div>

            {/* Preview Coupon Card */}
            <div className="mt-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-2 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold uppercase text-amber-800 tracking-wider">Special Gift Coupon</span>
                <p className="text-[11px] font-black text-amber-950">FREE COLD COFFEE ON YOUR BIRTHDAY</p>
              </div>
              <span className="font-mono text-[10px] font-black bg-white px-2 py-1 rounded border border-amber-300 text-amber-900">
                BDAY-RAHUL
              </span>
            </div>
          </div>

          {/* Celebrant 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💍</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Neha &amp; Rohit Saxena</h4>
                  <p className="text-[10px] text-slate-500">2nd Wedding Anniversary • Regular Table #4</p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                Scheduled 09:30 AM
              </span>
            </div>
          </div>
        </div>

        {/* Connect Credits Wallet */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
              🪙
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Available Balance</span>
              <p className="text-sm font-black text-slate-900">{credits} Connect Credits</p>
              <span className="text-[9px] text-emerald-700 font-semibold">1 Credit = 1 Rich WhatsApp Card</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onTopup}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-xs transition"
          >
            + Top-up
          </button>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition"
        >
          Confirm &amp; Return to Dashboard
        </button>
      </div>
    </div>
  );
}
