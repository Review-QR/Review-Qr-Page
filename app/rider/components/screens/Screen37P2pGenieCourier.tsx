"use client";

import React, { useState } from "react";

interface Screen37Props {
  onBack?: () => void;
  onVerifySenderOtp?: (otp: string) => void;
  onProceedToDrop?: () => void;
}

export default function Screen37P2pGenieCourier({
  onBack,
  onVerifySenderOtp,
  onProceedToDrop,
}: Screen37Props) {
  const [senderOtp, setSenderOtp] = useState<string>("8192");
  const [isPickupVerified, setIsPickupVerified] = useState<boolean>(false);
  const [declaredLegalCheck, setDeclaredLegalCheck] = useState<boolean>(true);

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
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              P2P Direct Courier
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Trustit Genie (Pickup &amp; Drop)</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-indigo-700 bg-indigo-50 rounded-full py-0.5 border border-indigo-200">
            📦
          </span>
        </div>

        {/* Sender & Receiver Card */}
        <div className="mt-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-indigo-200">Run ID: #GENIE-4021</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Payout: ₹65.00
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Sender */}
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">📍 PICKUP:</span>
              <div>
                <p className="font-bold text-white">Advocate R. P. Verma</p>
                <p className="text-[10px] text-slate-300">Chamber #14, Kachehri Compound, Bahraich</p>
              </div>
            </div>

            {/* Receiver */}
            <div className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold">🏁 DROP:</span>
              <div>
                <p className="font-bold text-white">Sunil Kumar</p>
                <p className="text-[10px] text-slate-300">House 42, Civil Lines (Near Water Tank)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Declared Parcel Contents */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Customer Declared Item:
          </span>
          <p className="text-xs font-extrabold text-slate-900 mt-0.5">
            🔑 House Keys &amp; Sealed Legal Case Papers (A4 Folder)
          </p>
          <label className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={declaredLegalCheck}
              onChange={(e) => setDeclaredLegalCheck(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Verified: No contraband, cash, or hazardous items.</span>
          </label>
        </div>

        {/* Step 1: Sender OTP Box */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
            STEP 1: SENDER HANDOVER OTP
          </span>
          <p className="text-xs text-slate-600">
            Ask Advocate R.P. Verma for the 4-digit Pickup OTP before leaving.
          </p>

          <div className="max-w-[180px] mx-auto">
            <input
              type="text"
              maxLength={4}
              value={senderOtp}
              onChange={(e) => setSenderOtp(e.target.value)}
              className="w-full text-center text-2xl font-black font-mono tracking-widest bg-slate-50 border-2 border-indigo-200 rounded-xl p-2 text-indigo-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPickupVerified(true);
              onVerifySenderOtp?.(senderOtp);
            }}
            className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold hover:bg-indigo-100"
          >
            {isPickupVerified ? "✓ Pickup Confirmed" : "Verify Pickup OTP"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={!isPickupVerified || !declaredLegalCheck}
          onClick={onProceedToDrop}
          className="w-full py-3.5 rounded-xl bg-indigo-700 text-white font-black text-sm shadow-md hover:bg-indigo-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          <span>Start Route to Receiver (Civil Lines)</span>
          <span>➔</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Dual-OTP Security · Receiver will provide delivery OTP at doorstep.
        </p>
      </div>
    </div>
  );
}
