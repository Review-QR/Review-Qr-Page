"use client";

import React from "react";

interface ScreenAuth01Props {
  onStartRegistration?: () => void;
  onGoToLogin?: () => void;
}

/**
 * ScreenAuth01: Sleek, compact Trustit Partner Landing Screen.
 * Designed to fit completely within a single viewport without vertical scroll.
 */
export default function ScreenAuth01LandingBecomePartner({
  onStartRegistration,
  onGoToLogin,
}: ScreenAuth01Props) {
  return (
    <div className="w-full h-full bg-[#FAF9F6] text-slate-900 flex flex-col justify-between p-3.5 sm:p-4 font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              T
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block leading-tight">
                TRUSTIT PARTNER
              </span>
              <h2 className="text-[11px] font-black text-slate-900 leading-none">
                Merchant Business Suite
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToLogin}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-200/80 shadow-2xs transition flex items-center gap-1 active:scale-95"
          >
            <span>Partner Login</span>
            <span className="text-amber-700 font-black">→</span>
          </button>
        </div>

        {/* Hero Pitch (Compact) */}
        <div className="mt-2 text-center space-y-0.5">
          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            ✓ 0% Commission Direct UPI Settlements
          </span>
          <h1 className="text-sm sm:text-base font-black leading-tight text-slate-950 tracking-tight pt-0.5">
            Grow Your Business With Brand Trust
          </h1>
          <p className="text-[10px] text-slate-600 leading-tight max-w-xs mx-auto">
            Get your store online, accept contactless orders, build 5★ customer trust, and reach local buyers in Bahraich.
          </p>
        </div>

        {/* 4 Pillars Grid (Compact 2x2 Tiles - Clean & Slim) */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 text-left">
          <div className="bg-white border border-amber-200/80 rounded-xl p-2 shadow-2xs space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🛡️</span>
              <h3 className="text-[11px] font-black text-slate-900 leading-none">Brand Trust</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-snug">
              Official verified QR standee delivered to your shop counter.
            </p>
          </div>

          <div className="bg-white border border-amber-200/80 rounded-xl p-2 shadow-2xs space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">👥</span>
              <h3 className="text-[11px] font-black text-slate-900 leading-none">Local Footfall</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-snug">
              Reach 40,000+ local buyers searching for shops in your city.
            </p>
          </div>

          <div className="bg-white border border-amber-200/80 rounded-xl p-2 shadow-2xs space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚡</span>
              <h3 className="text-[11px] font-black text-slate-900 leading-none">Instant Payouts</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-snug">
              Payments settle directly into your verified bank account.
            </p>
          </div>

          <div className="bg-white border border-amber-200/80 rounded-xl p-2 shadow-2xs space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📋</span>
              <h3 className="text-[11px] font-black text-slate-900 leading-none">Digital Khata</h3>
            </div>
            <p className="text-[9px] text-slate-500 leading-snug">
              Manage products, live prices & orders seamlessly on mobile.
            </p>
          </div>
        </div>

        {/* Categories Pill Strip */}
        <div className="mt-2 bg-white/80 border border-amber-200/70 rounded-xl p-1.5 text-center shadow-2xs">
          <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-slate-700">
            <span>🛒 Kirana</span>
            <span className="text-amber-400">•</span>
            <span>💊 Medical</span>
            <span className="text-amber-400">•</span>
            <span>☕ Food</span>
            <span className="text-amber-400">•</span>
            <span>✂️ Salon</span>
            <span className="text-amber-400">•</span>
            <span>🚗 Auto</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 border-t border-amber-200/50 space-y-1.5">
        <button
          type="button"
          onClick={onStartRegistration}
          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
        >
          <span>🚀 Dukaan Register Karein (Naya Merchant)</span>
          <span>→</span>
        </button>

        <p className="text-[9px] text-center text-slate-500 leading-none">
          Trusted by 500+ local verified merchants across UP
        </p>
      </div>
    </div>
  );
}
