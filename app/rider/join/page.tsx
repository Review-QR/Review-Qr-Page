"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function RiderJoinOnboardingPage() {
  const [dailyTrips, setDailyTrips] = useState<number>(14);

  // Earning calculation based on Bahraich fleet rates:
  // Base pay: ₹30/trip + avg surge ₹10/trip + customer tip ₹5/trip = ₹45/trip
  const estimatedDailyEarning = dailyTrips * 45 + (dailyTrips >= 15 ? 150 : dailyTrips >= 10 ? 80 : 0);
  const estimatedMonthlyEarning = estimatedDailyEarning * 26;

  const shareText = encodeURIComponent(
    `🛵 *Become a Trustit Delivery Partner — Bahraich (UP 40)*\n` +
    `Earn ₹600 to ₹1,100 daily. Direct daily bank UPI payouts!\n` +
    `✅ Flexible hours · No boss\n` +
    `✅ Extra surge bonuses on evening rush & rain\n` +
    `Tap here to register: ${typeof window !== "undefined" ? window.location.origin : "https://trustitreview.com"}/rider`
  );

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] font-sans selection:bg-[#0D47A1] selection:text-white">
      {/* ── Top Brand Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3.5 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center font-black text-sm shadow-sm">
              🛡️
            </div>
            <div>
              <strong className="text-sm font-black text-slate-900 block leading-tight">Trustit Fleet</strong>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Bahraich (UP 40) Partner Hub</span>
            </div>
          </div>

          <Link
            href="/rider"
            className="py-1.5 px-3 rounded-xl bg-blue-50 text-[#0D47A1] border border-blue-200 font-black text-xs hover:bg-blue-100 transition"
          >
            Rider Login ➔
          </Link>
        </div>
      </header>

      {/* ── Main Container (Mobile First) ── */}
      <main className="max-w-md mx-auto p-4 sm:p-5 space-y-5 pb-24">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#0D47A1] via-blue-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10 text-9xl font-black select-none pointer-events-none">
            🛵
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-amber-300 border border-white/10">
            <span>⭐</span>
            <span>Bahraich Local Fleet Recruitment · Open Now</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight leading-tight">
            Ride Your Two-Wheeler, <br />
            <span className="text-amber-300">Earn ₹600–₹1,100 Daily</span>
          </h1>

          <p className="text-xs text-blue-100 leading-relaxed">
            Deliver local orders from top stores across Bahraich within 2-3 km radiuses. Enjoy 1-tap instant daily bank UPI payouts!
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/rider"
              className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs text-center shadow-lg transition active:scale-98"
            >
              🚀 Register Online Now
            </Link>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg transition active:scale-98"
              title="Share on WhatsApp"
            >
              <span>💬</span>
              <span>Share</span>
            </a>
          </div>
        </div>

        {/* Interactive Daily Earning Calculator */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Income Calculator</span>
              <h3 className="text-sm font-black text-slate-900">How much can you earn?</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ₹45 / trip average
            </span>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">Daily Trips:</span>
              <span className="text-base font-black text-[#0D47A1] font-mono">{dailyTrips} Orders / Day</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={dailyTrips}
              onChange={(e) => setDailyTrips(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D47A1]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5 Trips (Part-time)</span>
              <span>15 Trips (Regular)</span>
              <span>25 Trips (Pro Rush)</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 grid grid-cols-2 gap-3 text-center">
            <div className="border-r border-emerald-200/80 pr-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Daily Estimated</span>
              <span className="text-2xl font-black text-emerald-700 font-mono block mt-0.5">
                ₹{estimatedDailyEarning}
              </span>
              <span className="text-[9px] text-emerald-600">Includes Bonuses</span>
            </div>
            <div className="pl-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Monthly (26 Days)</span>
              <span className="text-2xl font-black text-emerald-950 font-mono block mt-0.5">
                ₹{estimatedMonthlyEarning.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-emerald-700">Direct Bank UPI</span>
            </div>
          </div>
        </div>

        {/* 6 Core Perks */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            6 Key Benefits for Trustit Delivery Partners:
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">⚡</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Daily Instant Payout</strong>
              <p className="text-[10px] text-slate-500 leading-tight">No waiting for weekly settlement; 1-click transfer to your bank UPI.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🪙</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Zero Chutta Friction</strong>
              <p className="text-[10px] text-slate-500 leading-tight">No change for ₹500 notes? Direct balance refund to customer wallet in 1 tap.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">⏱️</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Store Wait Pay</strong>
              <p className="text-[10px] text-slate-500 leading-tight">If merchant takes more than 5 mins, receive wait compensation.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🌧️</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Monsoon Rush Surge</strong>
              <p className="text-[10px] text-slate-500 leading-tight">+₹15 to +₹20 extra surge pay per order during rain and evening peaks.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🦺</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Rider-First Safety</strong>
              <p className="text-[10px] text-slate-500 leading-tight">Safe 35 km/h city speed limit with zero speeding penalties. Safety first!</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🤝</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Refer &amp; Earn ₹500</strong>
              <p className="text-[10px] text-slate-500 leading-tight">Invite fellow riders and receive ₹500 bonus after their first 20 completed trips.</p>
            </div>
          </div>
        </div>

        {/* Documents Required */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            📋 What Documents Are Needed? (Only 4 Items)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">🪪</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">1. Aadhaar Card</strong>
                <span className="text-[10px] text-slate-500">Age must be 18 years or older</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">📜</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">2. Driving License (DL)</strong>
                <span className="text-[10px] text-slate-500">Valid Two-Wheeler (MCWG) license</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">🛵</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">3. Vehicle Registration (RC)</strong>
                <span className="text-[10px] text-slate-500">UP 40 or Uttar Pradesh bike/scooter registration</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">🏦</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">4. Bank Account or UPI (PhonePe / GPay)</strong>
                <span className="text-[10px] text-slate-500">For daily instant automated earnings transfer</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Share Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-3">
          <span className="text-3xl block">💬</span>
          <div>
            <h4 className="text-sm font-black text-emerald-950">Share with Friends &amp; Fleet Mates</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              Invite friends in Bahraich via WhatsApp and receive a ₹500 referral bonus.
            </p>
          </div>
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <span>Share via WhatsApp</span>
            <span>➔</span>
          </a>
        </div>
      </main>

      {/* ── Fixed Bottom Sticky Bar ── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-30">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs flex items-center gap-1"
          >
            <span>💬 Share</span>
          </a>
          <Link
            href="/rider"
            className="flex-1 py-3.5 rounded-2xl bg-[#0D47A1] hover:bg-blue-800 text-white font-black text-xs text-center shadow-md active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            <span>Start Registration Now (2 Mins)</span>
            <span>➔</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
