"use client";

import React, { useState } from "react";

interface Screen41Props {
  onBack?: () => void;
  onSave?: () => void;
}

export default function Screen41SecurityTwoFactor({ onBack, onSave }: Screen41Props) {
  const [twoFactor, setTwoFactor] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              ACCOUNT PROTECTION
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Security &amp; 2-Factor Authentication
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Security Health Card */}
        <div className="mt-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛡️</span>
            <div>
              <h3 className="text-xs font-black text-emerald-950">Security Shield High</h3>
              <p className="text-[10px] text-emerald-800">
                Registered Mobile: +91 9118643415 (Verified)
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
            Protected
          </span>
        </div>

        {/* Security Controls */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900 block">2-Factor Authentication (OTP)</span>
              <span className="text-[10px] text-slate-500">Requires WhatsApp/SMS OTP on new logins</span>
            </div>
            <button
              type="button"
              onClick={() => setTwoFactor(!twoFactor)}
              className={`w-10 h-6 rounded-full transition relative p-0.5 ${
                twoFactor ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition shadow-xs ${
                  twoFactor ? "translate-x-4" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Login Alerts Toggle */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Instant Login SMS Alerts</span>
              <span className="text-[10px] text-slate-500">Notifies owner phone if staff signs in</span>
            </div>
            <button
              type="button"
              onClick={() => setLoginAlerts(!loginAlerts)}
              className={`w-10 h-6 rounded-full transition relative p-0.5 ${
                loginAlerts ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition shadow-xs ${
                  loginAlerts ? "translate-x-4" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Password Reset */}
          <div className="pt-1">
            <button
              type="button"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              🔑 Change Master Password →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSave}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          Save Security Settings
        </button>
      </div>
    </div>
  );
}
