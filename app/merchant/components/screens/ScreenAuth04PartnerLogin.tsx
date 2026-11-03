"use client";

import React, { useState } from "react";

interface ScreenAuth04Props {
  onLoginSuccess?: () => void;
  onGoToRegister?: () => void;
}

export default function ScreenAuth04PartnerLogin({
  onLoginSuccess,
  onGoToRegister,
}: ScreenAuth04Props) {
  const [tab, setTab] = useState<"mobile" | "biz_id">("mobile");
  const [mobile, setMobile] = useState("9118643415");
  const [bizId, setBizId] = useState("QR-77837892");
  const [password, setPassword] = useState("••••••••");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = () => {
    setLoggingIn(true);
    setTimeout(() => {
      setLoggingIn(false);
      onLoginSuccess?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              T
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                TRUSTIT PARTNER
              </span>
              <h2 className="text-xs font-black text-slate-900 leading-tight">
                Merchant Sign In
              </h2>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            SSL 256-Bit Secure
          </span>
        </div>

        {/* Dual Tab Switcher */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/80 p-1 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setTab("mobile")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === "mobile" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            <span>📱</span>
            <span>Mobile OTP</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("biz_id")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === "biz_id" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            <span>🏢</span>
            <span>Business ID</span>
          </button>
        </div>

        {/* Login Inputs */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          {tab === "mobile" ? (
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Registered Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2">
                <span className="text-xs font-bold text-slate-600 mr-2 border-r border-slate-300 pr-2">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Instant 6-digit login OTP will be sent to WhatsApp/SMS.
              </span>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Trustit Business / Outlet ID
                </label>
                <input
                  type="text"
                  value={bizId}
                  onChange={(e) => setBizId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-1 text-[10px]">
            <span className="text-slate-500">Forgot credentials?</span>
            <a href="tel:+919118643415" className="text-blue-600 font-bold hover:underline">
              Call 24x7 Help Desk
            </a>
          </div>
        </div>

        {/* Demo Credentials Tip */}
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-center text-[10px] text-amber-900">
          <span>Demo Account: <strong>+91 9118643415</strong> (Golden Blossom Cafe)</span>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="pt-2 space-y-2">
        {loggingIn ? (
          <div className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs text-center shadow-md animate-pulse">
            Authenticating Partner Session...
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>SIGN IN TO MERCHANT CONSOLE →</span>
          </button>
        )}

        <button
          type="button"
          onClick={onGoToRegister}
          className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition"
        >
          New Merchant? Become a Trustit Partner
        </button>
      </div>
    </div>
  );
}
