"use client";

import React, { useState, useEffect } from "react";

interface ScreenAuth01Props {
  onStartRegistration?: () => void;
  onGoToLogin?: () => void;
  initialVariant?: string;
  onVariantChange?: (v: string) => void;
}

export default function ScreenAuth01LandingBecomePartner({
  onStartRegistration,
  onGoToLogin,
  initialVariant = "opt1_bharatpe",
  onVariantChange,
}: ScreenAuth01Props) {
  // Normalize legacy "A", "B", "C" to option IDs
  const normalizeVariant = (v: string) => {
    if (v === "A") return "opt1_bharatpe";
    if (v === "B") return "opt2_swiggy";
    if (v === "C") return "opt3_minimal";
    return v;
  };

  const [activeVariant, setActiveVariant] = useState<string>(normalizeVariant(initialVariant));

  useEffect(() => {
    if (initialVariant) {
      setActiveVariant(normalizeVariant(initialVariant));
    }
  }, [initialVariant]);

  return (
    <div className="w-full h-full flex flex-col justify-between font-sans select-none overflow-y-auto [scrollbar-width:none] relative">
      {/* ========================================================================= */}
      {/* 1. BHARATPE & RETAIL TRUST HERO (Warm Cream & Physical QR Standee) */}
      {/* ========================================================================= */}
      {(activeVariant === "opt1_bharatpe" || activeVariant === "A") && (
        <div className="flex-1 bg-[#FAF9F6] text-slate-900 flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                  T
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block leading-tight">
                    TRUSTIT PARTNER
                  </span>
                  <h2 className="text-xs font-black text-slate-900 leading-none">
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

            <div className="mt-2.5 text-center space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                🛡️ Fair Transparent Pricing • Direct UPI Settlements
              </span>
              <h1 className="text-base font-black leading-tight text-slate-950 tracking-tight">
                Grow Your Business With Brand Trust
              </h1>
              <p className="text-[10px] text-slate-600 leading-tight max-w-xs mx-auto">
                Get your store online, accept contactless orders, build 5★ customer trust, and reach local buyers in Bahraich.
              </p>
            </div>

            {/* Official Physical QR Standee Card */}
            <div className="mt-3 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-2 border-amber-300 rounded-2xl p-3 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white border border-amber-300 rounded-xl flex flex-col items-center justify-center p-1 shadow-inner shrink-0 text-center">
                  <span className="text-xl">🪪</span>
                  <span className="text-[7px] font-black text-slate-700 uppercase">OFFICIAL QR</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[9px] font-black text-amber-700 uppercase">
                    <span>⭐ OFFICIAL VERIFIED STANDEE</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    Free Counter Standee Delivered
                  </h4>
                  <p className="text-[9px] text-slate-600 leading-tight mt-0.5">
                    Customers scan to pay with any UPI app &amp; leave instant 5-star Google reviews.
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[9px]">
                <span className="text-slate-600 flex items-center gap-1">
                  <span>🏪</span> <span>Bahraich Hub:</span>
                </span>
                <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Avg. ₹35,000+ Extra Monthly Sales
                </span>
              </div>
            </div>

            {/* 4 Pillars Grid */}
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

            <div className="mt-2.5 bg-white/90 border border-amber-200/70 rounded-xl p-1.5 text-center shadow-2xs">
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

          <div className="pt-3 border-t border-amber-200/50 space-y-1.5">
            <button
              type="button"
              onClick={onStartRegistration}
              className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>🚀 Dukaan Register Karein (Naya Merchant)</span>
              <span>→</span>
            </button>
            <p className="text-[9px] text-center text-slate-500 leading-none">
              Trusted by 500+ local verified merchants across UP
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SWIGGY & ZEPTO MODERN STACK (Dark Slate & 10-Min Fleet) */}
      {/* ========================================================================= */}
      {(activeVariant === "opt2_swiggy" || activeVariant === "B") && (
        <div className="flex-1 bg-slate-950 text-white flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-md">
                  T
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                      TRUSTIT PARTNER
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h2 className="text-xs font-black text-white leading-none">
                    Hyperlocal Merchant OS
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToLogin}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-blue-300 border border-slate-700 transition"
              >
                Sign In →
              </button>
            </div>

            <div className="mt-3 space-y-1">
              <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2.5 py-0.5 rounded-full text-[9px] font-black">
                <span>⚡</span> <span>10-Minute Dispatch &amp; Instant Cashout</span>
              </div>
              <h1 className="text-lg font-black leading-tight text-white tracking-tight">
                Dukaan Online Kholo,<br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Direct UPI Bank Payouts Pe Kamao.
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 leading-normal">
                Join 500+ Bahraich merchants receiving direct online customer orders with free delivery fleet.
              </p>
            </div>

            <div className="mt-3 space-y-2">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg shrink-0">
                  🛍️
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white">Digital Catalog &amp; Menu</h4>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Add products in 2 minutes. Out-of-stock toggle anytime.
                  </p>
                </div>
                <span className="text-[9px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  Free
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
                  🛵
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white">Trustit Rider Fleet</h4>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Riders pick up orders from your counter &amp; deliver in 10 mins.
                  </p>
                </div>
                <span className="text-[9px] font-black text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
                  Live GPS
                </span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
                  💸
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white">Instant UPI Settlement</h4>
                  <p className="text-[9px] text-slate-400 leading-tight">
                    Direct bank deposits every evening. No deductions, no hidden charges.
                  </p>
                </div>
                <span className="text-[9px] font-black text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                  T+0 Payout
                </span>
              </div>
            </div>

            <div className="mt-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between text-center text-[8px] font-bold text-slate-400">
              <div className="flex-1">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white inline-flex items-center justify-center font-black mb-0.5">1</span>
                <div>OTP Sign In</div>
              </div>
              <span className="text-slate-600">→</span>
              <div className="flex-1">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white inline-flex items-center justify-center font-black mb-0.5">2</span>
                <div>Dukaan Profile</div>
              </div>
              <span className="text-slate-600">→</span>
              <div className="flex-1">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center font-black mb-0.5">3</span>
                <div>Order Live</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <button
              type="button"
              onClick={onStartRegistration}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>🚀 Start Free Merchant Registration</span>
              <span>→</span>
            </button>
            <p className="text-[9px] text-center text-slate-400">
              ⚡ Instant Approval in 5 Minutes • Free QR Standee
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. APPLE & STRIPE MINIMAL CLEAN (Pure White & Numbered Rows) */}
      {/* ========================================================================= */}
      {(activeVariant === "opt3_minimal" || activeVariant === "C") && (
        <div className="flex-1 bg-white text-slate-950 flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                  T
                </div>
                <span className="text-xs font-black tracking-tight text-black">
                  Trustit Partner
                </span>
              </div>
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-xs font-bold text-slate-600 hover:text-black underline transition"
              >
                Log In
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                Local Commerce Platform
              </span>
              <h1 className="text-xl font-black text-black tracking-tight leading-tight">
                The modern retail stack for your city.
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Accept contactless orders, grow customer trust with 5-star reviews, and manage your inventory on a unified merchant app.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base text-slate-800 font-bold">01</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Transparent Pricing Policy</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    Fair, transparent rates starting at ₹49/mo. Direct UPI settlements with zero hidden charges.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base text-slate-800 font-bold">02</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Official Smart Standee</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    Physical acrylic counter standee with QR gating for 5-star Google reviews.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-base text-slate-800 font-bold">03</span>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Dedicated Courier Fleet</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    Fast hyperlocal pickup from your counter with OTP verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={onStartRegistration}
              className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              Become a Partner Today →
            </button>
            <p className="text-[10px] text-center text-slate-400">
              No subscription fee • Cancel anytime
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ZOMATO BUSINESS & DATA METRICS FIRST (Revenue & Growth Dashboard) */}
      {/* ========================================================================= */}
      {activeVariant === "opt4_analytics" && (
        <div className="flex-1 bg-slate-900 text-white flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  📊
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    MERCHANT REVENUE SUITE
                  </span>
                  <h2 className="text-xs font-black text-white">Trustit Partner Hub</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToLogin}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-emerald-300 border border-emerald-500/30"
              >
                Sign In →
              </button>
            </div>

            {/* Live Gross Metrics Card */}
            <div className="mt-3 bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Monthly Extra Revenue</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">+28% Growth</span>
              </div>
              <div className="text-2xl font-black text-emerald-400">₹42,850.00</div>
              <p className="text-[10px] text-slate-400">
                Calculated on 30 daily orders in Bahraich with direct UPI settlements.
              </p>
            </div>

            {/* Metric Counters 3-Column */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-base block">👥</span>
                <div className="text-xs font-black text-white mt-0.5">42,000+</div>
                <div className="text-[8px] text-slate-400 uppercase">Bahraich Buyers</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-base block">⚡</span>
                <div className="text-xs font-black text-white mt-0.5">10 Mins</div>
                <div className="text-[8px] text-slate-400 uppercase">Avg Delivery</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <span className="text-base block">🛡️</span>
                <div className="text-xs font-black text-emerald-400 mt-0.5">₹49/mo</div>
                <div className="text-[8px] text-slate-400 uppercase">Base Plan</div>
              </div>
            </div>

            {/* Live Order Simulation Strip */}
            <div className="mt-3 bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-slate-200 text-[11px]">Live Scanner: 184 shops active right now</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-mono font-bold">ONLINE</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <button
              type="button"
              onClick={onStartRegistration}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>📈 Claim Your Store's Daily Orders</span>
              <span>→</span>
            </button>
            <p className="text-[9px] text-center text-slate-400">
              Instant Setup in 3 Minutes • Daily Evening Bank Payouts
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. COMPACT CASHIER POWER-ACTION (Single Viewport Zero-Scroll) */}
      {/* ========================================================================= */}
      {activeVariant === "opt5_compact" && (
        <div className="flex-1 bg-slate-100 text-slate-900 flex flex-col justify-between p-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🏪</span>
                <span className="text-xs font-black text-slate-950">Trustit Merchant Quick-Board</span>
              </div>
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
              >
                Login →
              </button>
            </div>

            <div className="mt-2 text-center">
              <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                1-TAP DUKAAN ONBOARDING
              </span>
              <h2 className="text-sm font-black text-slate-950 mt-1">Select Store Category:</h2>
            </div>

            {/* Quick Category Buttons */}
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onStartRegistration}
                className="p-2 bg-white rounded-xl border border-slate-300 hover:border-blue-500 flex items-center gap-2 shadow-2xs"
              >
                <span className="text-lg">🛒</span>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900">Kirana &amp; Daily</div>
                  <div className="text-[8px] text-slate-500">Mandi daily rates</div>
                </div>
              </button>

              <button
                type="button"
                onClick={onStartRegistration}
                className="p-2 bg-white rounded-xl border border-slate-300 hover:border-blue-500 flex items-center gap-2 shadow-2xs"
              >
                <span className="text-lg">☕</span>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900">Cafe &amp; Food</div>
                  <div className="text-[8px] text-slate-500">KOT receipt print</div>
                </div>
              </button>

              <button
                type="button"
                onClick={onStartRegistration}
                className="p-2 bg-white rounded-xl border border-slate-300 hover:border-blue-500 flex items-center gap-2 shadow-2xs"
              >
                <span className="text-lg">💊</span>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900">Pharmacy</div>
                  <div className="text-[8px] text-slate-500">Prescription Rx</div>
                </div>
              </button>

              <button
                type="button"
                onClick={onStartRegistration}
                className="p-2 bg-white rounded-xl border border-slate-300 hover:border-blue-500 flex items-center gap-2 shadow-2xs"
              >
                <span className="text-lg">✂️</span>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900">Salon &amp; Spa</div>
                  <div className="text-[8px] text-slate-500">Chair token queue</div>
                </div>
              </button>
            </div>

            {/* 3 Quick Guarantees */}
            <div className="mt-2.5 bg-white p-2 rounded-xl border border-slate-200 space-y-1 text-[9px] font-bold text-slate-700">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span>✓</span> <span>Transparent Platform Pricing • Zero Hidden Cuts</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-700">
                <span>✓</span> <span>Free Acrylic QR Standee Shipped in 48 Hrs</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700">
                <span>✓</span> <span>Direct Evening Bank Settlements</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onStartRegistration}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5"
            >
              <span>Instant WhatsApp / OTP Setup</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GLASSMORPHISM LUXURY VIP (Vibrant Mesh & 3D Gold Standee) */}
      {/* ========================================================================= */}
      {activeVariant === "opt6_glass" && (
        <div className="flex-1 bg-gradient-to-br from-slate-950 via-purple-950/70 to-slate-950 text-white flex flex-col justify-between p-4 relative overflow-hidden">
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-lg shadow-amber-500/20">
                  👑
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                    TRUSTIT VIP PARTNER
                  </span>
                  <h2 className="text-xs font-black text-white">Elite Merchant Suite</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onGoToLogin}
                className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition"
              >
                Sign In
              </button>
            </div>

            <div className="mt-3 text-center space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs">
                ✨ PREMIUM MERCHANT PASS
              </span>
              <h1 className="text-base font-black leading-tight text-white tracking-tight">
                Turn Your Counter Into A Luxury Digital Store
              </h1>
              <p className="text-[10px] text-slate-300 leading-tight max-w-xs mx-auto">
                Official Google 5-star smart standee, dedicated VIP rider routing, and VIP concierge onboarding.
              </p>
            </div>

            {/* Glowing Frosted Glass Card */}
            <div className="mt-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 shadow-2xl relative space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shrink-0">
                  💎
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white">Official Vector Acrylic Standee</h4>
                  <p className="text-[9px] text-slate-300 leading-tight mt-0.5">
                    Laser-cut acrylic standee customized with your shop name &amp; instant review gating.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px]">
                <span className="text-amber-300 font-bold">★ 100% Free Lifetime Delivery</span>
                <span className="text-emerald-400 font-mono font-bold">0% UPI CHARGES</span>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-xl">
                <div className="text-amber-400 font-bold text-[10px]">🚀 Priority Rider</div>
                <div className="text-[8px] text-slate-300 mt-0.5">Pickups in under 5 minutes</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-xl">
                <div className="text-blue-400 font-bold text-[10px]">📊 AI Khata</div>
                <div className="text-[8px] text-slate-300 mt-0.5">Automated GST &amp; CA ledger</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-3 border-t border-white/10 space-y-1.5">
            <button
              type="button"
              onClick={onStartRegistration}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-xl shadow-amber-900/50 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>👑 Activate VIP Merchant Membership</span>
              <span>→</span>
            </button>
            <p className="text-[9px] text-center text-slate-400">
              Verified by Google Review Gateway • Bahraich Exclusive
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
