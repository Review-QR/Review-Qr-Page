"use client";

import React from "react";

interface ScreenAuth01Props {
  onStartRegistration?: () => void;
  onGoToLogin?: () => void;
}

export default function ScreenAuth01LandingBecomePartner({
  onStartRegistration,
  onGoToLogin,
}: ScreenAuth01Props) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#FFFDF9] via-[#FFF8EE] to-[#FFF3E0] text-slate-900 flex flex-col justify-between p-3.5 sm:p-4 font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Warm Brand Bar */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-center font-black text-base shadow-sm">
              T
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                TRUSTIT PARTNER
              </span>
              <h2 className="text-xs font-black text-slate-900 leading-none">
                Grow Your Business
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToLogin}
            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white hover:bg-amber-50 text-slate-800 border border-amber-200 shadow-2xs transition flex items-center gap-1"
          >
            <span>Partner Login</span>
            <span className="text-amber-700 font-black">→</span>
          </button>
        </div>

        {/* Hero Pitch */}
        <div className="mt-3 text-center space-y-1">
          <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black bg-emerald-100/80 text-emerald-800 border border-emerald-200">
            ✓ 0% Commission on In-Store QR Orders
          </span>
          <h1 className="text-base sm:text-lg font-black leading-tight text-slate-950 pt-0.5 tracking-tight">
            Become a Trustit Merchant Partner
          </h1>
          <p className="text-[11px] text-slate-600 leading-relaxed max-w-xs mx-auto">
            Get your store online, accept contactless orders, double your 5★ Google reviews, and reach 42,000+ local customers in Bahraich.
          </p>
        </div>

        {/* 4 Pillars Grid (Warm White Cards with Amber/Orange Accents) */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-left">
          <div className="bg-white border border-amber-200/90 rounded-2xl p-2.5 shadow-2xs space-y-0.5 hover:border-amber-300 transition">
            <span className="text-base">🚀</span>
            <h3 className="text-xs font-black text-slate-900">Hyperlocal Delivery</h3>
            <p className="text-[10px] text-slate-500 leading-tight">
              Trustit rider fleet picks up from your shop and delivers in 25 mins.
            </p>
          </div>

          <div className="bg-white border border-amber-200/90 rounded-2xl p-2.5 shadow-2xs space-y-0.5 hover:border-amber-300 transition">
            <span className="text-base">⭐</span>
            <h3 className="text-xs font-black text-slate-900">Google 5★ Booster</h3>
            <p className="text-[10px] text-slate-500 leading-tight">
              Smart QR redirects happy customers directly to your Google Maps review.
            </p>
          </div>

          <div className="bg-white border border-amber-200/90 rounded-2xl p-2.5 shadow-2xs space-y-0.5 hover:border-amber-300 transition">
            <span className="text-base">💰</span>
            <h3 className="text-xs font-black text-slate-900">Daily 10 AM Payouts</h3>
            <p className="text-[10px] text-slate-500 leading-tight">
              Customer payments deposited directly into your bank via Cashfree Escrow.
            </p>
          </div>

          <div className="bg-white border border-amber-200/90 rounded-2xl p-2.5 shadow-2xs space-y-0.5 hover:border-amber-300 transition">
            <span className="text-base">🏆</span>
            <h3 className="text-xs font-black text-slate-900">Free Acrylic Standee</h3>
            <p className="text-[10px] text-slate-500 leading-tight">
              Complimentary counter QR standee delivered to your shop counter.
            </p>
          </div>
        </div>

        {/* Categories Supported Badge */}
        <div className="mt-2.5 bg-white/90 border border-amber-200/80 rounded-2xl p-2 text-center shadow-2xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 block mb-0.5">
            Tailored consoles for all business verticals:
          </span>
          <div className="flex justify-center items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <span>☕ Cafe</span>
            <span className="text-amber-400">•</span>
            <span>🛒 Kirana</span>
            <span className="text-amber-400">•</span>
            <span>💊 Chemist</span>
            <span className="text-amber-400">•</span>
            <span>✂️ Salon</span>
            <span className="text-amber-400">•</span>
            <span>🚗 Auto</span>
          </div>
        </div>
      </div>

      {/* Warm Action Footer */}
      <div className="pt-3 space-y-2">
        <button
          type="button"
          onClick={onStartRegistration}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>REGISTER MY SHOP NOW (FREE)</span>
          <span>→</span>
        </button>

        <p className="text-center text-[11px] text-slate-600 font-medium">
          Already Registered?{" "}
          <button
            type="button"
            onClick={onGoToLogin}
            className="text-amber-800 font-black hover:underline cursor-pointer"
          >
            Click Here to Login
          </button>
        </p>
      </div>
    </div>
  );
}
