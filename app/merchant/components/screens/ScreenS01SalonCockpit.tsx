"use client";

import React, { useState } from "react";

interface ScreenS01Props {
  onOpenQueue?: () => void;
  onOpenServices?: () => void;
  onOpenStandee?: () => void;
  onBack?: () => void;
}

export default function ScreenS01SalonCockpit({
  onOpenQueue,
  onOpenServices,
  onOpenStandee,
  onBack,
}: ScreenS01Props) {
  const [salonOpen, setSalonOpen] = useState(true);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-800 text-rose-200 flex items-center justify-center font-black text-sm shadow-xs">
              ✂️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight">
                  Looks Unisex Salon &amp; Spa
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">ID: SALON-4412 • Civil Lines Hub</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-900 border border-rose-200">
            Salon Partner
          </span>
        </div>

        {/* Greeting & Chairs Shortcut */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
                Styling &amp; Token Station
              </span>
              <h1 className="text-sm font-black text-slate-900">Namaste, Manish ji! 🙏</h1>
              <p className="text-[11px] text-slate-500">4 Chairs Occupied • 2 Waiting in Lounge.</p>
            </div>
            <button
              type="button"
              onClick={() => setSalonOpen(!salonOpen)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                salonOpen ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-500"
              }`}
            >
              {salonOpen ? "Salon: OPEN ✓" : "Salon: PAUSED ⏸"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenQueue}
              className="py-2 px-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>💺 Chairs Queue (6)</span>
            </button>
            <button
              type="button"
              onClick={onOpenServices}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1.5 transition"
            >
              <span>💇 Rates &amp; Menu</span>
            </button>
          </div>
        </div>

        {/* Chair & Stylist Realtime Status */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>✂️</span> Live Styling Station Activity
            </span>
            <span className="text-[9px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Live Lounge
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={onOpenQueue}
              className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-300 rounded-xl p-2 cursor-pointer transition"
            >
              <span className="text-[10px] font-bold text-amber-900 block">💺 Waiting Tokens</span>
              <p className="text-base font-black text-amber-950 mt-0.5">2 in Lounge</p>
              <span className="text-[9px] font-bold text-amber-700">Token #14, #15 waiting</span>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-rose-900 block">💇 Active Hair Styling</span>
              <p className="text-base font-black text-rose-950 mt-0.5">3 Chairs Busy</p>
              <span className="text-[9px] font-medium text-rose-700">Rohit &amp; Dinesh cutting</span>
            </div>

            <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-purple-900 block">💆 Facial &amp; D-Tan</span>
              <p className="text-base font-black text-purple-950 mt-0.5">1 Spa Room</p>
              <span className="text-[9px] font-medium text-purple-700">20 Mins remaining</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">✅ Clients Today</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">16 Groomed</p>
              <span className="text-[9px] font-bold text-emerald-700">₹4,950 Collected</span>
            </div>
          </div>
        </div>

        {/* Mirror Review Incentive Banner */}
        <div className="mt-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-3 shadow-xs flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-rose-950 block">Mirror QR Review Promotion</span>
            <span className="text-[10px] text-rose-700">₹50 discount coupon auto-sent for Google review</span>
          </div>
          <span className="text-xl">🪞</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenStandee}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>🏆 View Salon Mirror &amp; Reception QR Standee →</span>
        </button>
      </div>
    </div>
  );
}
