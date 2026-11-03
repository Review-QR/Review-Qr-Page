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
    `🛵 *Trustit Delivery Partner बनें — बहराइच (UP 40)*\n` +
    `रोज़ाना ₹600 से ₹1,100 तक कमाएं। सीधे बैंक UPI में डेली पेआउट!\n` +
    `✅ कोई बॉस नहीं · अपनी मर्जी का टाइम\n` +
    `✅ बारिश व शाम को +₹20 एक्स्ट्रा सर्ज\n` +
    `अभी जॉइन करने के लिए यहाँ टैप करें: ${typeof window !== "undefined" ? window.location.origin : "https://trustit.in"}/rider`
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
            अपनी बाइक चलाएं, <br />
            <span className="text-amber-300">रोज़ाना ₹600–₹1,100 कमाएं</span>
          </h1>

          <p className="text-xs text-blue-100 leading-relaxed">
            दीपक स्वीट्स, अल-बाइके, अपोलो फार्मेसी और सिविल लाइन्स के स्टोर्स से 2-3 किमी के अंदर डिलीवरी करें। 1-टैप डेली UPI पेआउट!
          </p>

          <div className="pt-2 flex items-center gap-2">
            <Link
              href="/rider"
              className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs text-center shadow-lg transition active:scale-98"
            >
              🚀 अभी ऑनलाइन जॉइन करें
            </Link>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-lg transition active:scale-98"
              title="Share on WhatsApp"
            >
              <span>💬</span>
              <span>शेयर</span>
            </a>
          </div>
        </div>

        {/* Interactive Daily Earning Calculator */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily Income Calculator</span>
              <h3 className="text-sm font-black text-slate-900">आप कितना कमा सकते हैं?</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ₹45 / डिलीवरी औसतन
            </span>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">दिन में ट्रिप्स:</span>
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
              <span>5 ट्रिप्स (Part-time)</span>
              <span>15 ट्रिप्स (Regular)</span>
              <span>25 ट्रिप्स (Pro Rush)</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 grid grid-cols-2 gap-3 text-center">
            <div className="border-r border-emerald-200/80 pr-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">प्रतिदिन कमाई</span>
              <span className="text-2xl font-black text-emerald-700 font-mono block mt-0.5">
                ₹{estimatedDailyEarning}
              </span>
              <span className="text-[9px] text-emerald-600">बोनस शामिल</span>
            </div>
            <div className="pl-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">मासिक कमाई (26 दिन)</span>
              <span className="text-2xl font-black text-emerald-950 font-mono block mt-0.5">
                ₹{estimatedMonthlyEarning.toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] text-emerald-700">सीधे बैंक UPI में</span>
            </div>
          </div>
        </div>

        {/* 6 Core Perks */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
            ट्रस्टिट राइडर पार्टनर बनने के 6 बड़े फायदे:
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">⚡</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Daily Instant Payout</strong>
              <p className="text-[10px] text-slate-500 leading-tight">रात 10 बजे का इंतज़ार नहीं, काम खत्म होते ही 1-क्लिक बैंक ट्रांसफर।</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🪙</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Zero Chutta Friction</strong>
              <p className="text-[10px] text-slate-500 leading-tight">₹500 के नोट पर छुट्टे न होने पर कस्टमर वॉलेट में डायरेक्ट रिफंड।</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">⏱️</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Store Wait Pay</strong>
              <p className="text-[10px] text-slate-500 leading-tight">दुकानदार 5 मिनट से ज्यादा लेट करे तो +₹1/मिनट का मुआवजा।</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🌧️</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Monsoon Rush Surge</strong>
              <p className="text-[10px] text-slate-500 leading-tight">शाम के पीक आवर्स व बारिश में हर ऑर्डर पर +₹15 से ₹20 एक्स्ट्रा।</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🦺</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Rider-First Safety</strong>
              <p className="text-[10px] text-slate-500 leading-tight">सुरक्षित स्पीड 35 km/h, कोई स्पीडिंग पेनल्टी नहीं। जान पहले!</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
              <span className="text-xl">🤝</span>
              <strong className="text-slate-900 block font-bold text-[11px]">Refer &amp; Earn ₹500</strong>
              <p className="text-[10px] text-slate-500 leading-tight">अपने दोस्त को जोड़ें और उसकी पहली 20 ट्रिप्स पर ₹500 पाएं।</p>
            </div>
          </div>
        </div>

        {/* Documents Required */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            📋 क्या-क्या डॉक्यूमेंट चाहिए? (Only 4 Things)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">🪪</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">1. आधार कार्ड (Aadhaar Card)</strong>
                <span className="text-[10px] text-slate-500">उम्र 18 वर्ष या उससे अधिक होनी चाहिए</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">📜</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">2. ड्राइविंग लाइसेंस (DL / Learning)</strong>
                <span className="text-[10px] text-slate-500">टू-व्हीलर (MCWG) वैध लाइसेंस</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">🛵</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">3. गाड़ी की RC (Bike / Scooter)</strong>
                <span className="text-[10px] text-slate-500">UP 40 या उत्तर प्रदेश का वाहन रजिस्ट्रेशन</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-base">🏦</span>
              <div>
                <strong className="text-slate-900 block text-[11px]">4. बैंक खाता या PhonePe / GPay UPI</strong>
                <span className="text-[10px] text-slate-500">जिसमें रोज़ाना आपकी कमाई ट्रांसफर होगी</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Share Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-3">
          <span className="text-3xl block">💬</span>
          <div>
            <h4 className="text-sm font-black text-emerald-950">अपने दोस्तों के साथ शेयर करें</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              बहराइच के अपने दोस्तों को वॉट्सऐप पर इनवाइट करें और पाएं ₹500 रेफरल बोनस।
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
