"use client";

import React, { useState } from "react";

interface Screen01Props {
  onOpenOrders?: () => void;
  onOpenMenu?: () => void;
  onOpenSiren?: () => void;
  onOpenOccasion?: () => void;
}

export default function Screen01MainCockpit({
  onOpenOrders,
  onOpenMenu,
  onOpenSiren,
  onOpenOccasion,
}: Screen01Props) {
  const [outletOpen, setOutletOpen] = useState(true);
  const [ordersPaused, setOrdersPaused] = useState(false);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Top Header & Store Identity */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800 text-amber-300 flex items-center justify-center font-black text-sm shadow-xs">
              ☕
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight">Golden Blossom Cafe</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">ID: QR-77837892 • Civil Lines</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active Merchant
          </span>
        </div>

        {/* Welcome Greeting & Quick Toggles */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-700 block uppercase tracking-wider">Business Control Center</span>
              <h1 className="text-sm font-black text-slate-900">Namaste, Supriya ji! 🙏</h1>
              <p className="text-[11px] text-slate-500">Welcome to Golden Blossom Cafe console.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${outletOpen ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                {outletOpen ? "Outlet: OPEN" : "Outlet: CLOSED"}
              </span>
            </div>
          </div>

          {/* Action Row & Switches */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOutletOpen(!outletOpen)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition ${
                outletOpen ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-slate-100 border-slate-300 text-slate-600"
              }`}
            >
              <span>Store Open</span>
              <span className={`w-3.5 h-3.5 rounded-full ${outletOpen ? "bg-emerald-600" : "bg-slate-400"}`}></span>
            </button>

            <button
              type="button"
              onClick={() => setOrdersPaused(!ordersPaused)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition ${
                ordersPaused ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <span>Pause Orders</span>
              <span className={`w-3.5 h-3.5 rounded-full ${ordersPaused ? "bg-amber-500" : "bg-slate-300"}`}></span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenOrders}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-xs transition"
            >
              <span>📋 View Orders (3)</span>
            </button>
            <button
              type="button"
              onClick={onOpenMenu}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs transition"
            >
              <span>🍽️ Rates &amp; Menu</span>
            </button>
          </div>
        </div>

        {/* Live Order Pipeline (Auto-sync 4s) */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚡</span>
              <span className="text-xs font-black text-slate-900">Live Order Pipeline</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Auto-sync 4s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div 
              onClick={onOpenSiren}
              className="cursor-pointer bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-xl p-2 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-900">⏳ New Pending</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              <p className="text-base font-black text-amber-950 mt-0.5">3 Orders</p>
              <span className="text-[9px] font-medium text-amber-700">Click to preview siren</span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-blue-900 block">🍳 In Prep / Packing</span>
              <p className="text-base font-black text-blue-950 mt-0.5">2 Orders</p>
              <span className="text-[9px] font-medium text-blue-700">Kitchen timer live</span>
            </div>

            <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-cyan-900 block">🛵 Out for Delivery</span>
              <p className="text-base font-black text-cyan-950 mt-0.5">1 Order</p>
              <span className="text-[9px] font-medium text-cyan-700">Rider on route</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">✅ Delivered Today</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">8 Orders</p>
              <span className="text-[9px] font-medium text-emerald-700">₹2,840 collected</span>
            </div>
          </div>
        </div>

        {/* Automated Occasion CRM & AI Greetings */}
        <div className="mt-3 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/80 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
              🎂 Occasion CRM &amp; AI Greetings
            </span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              09:30 AM Daily
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 my-2.5 text-center">
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">🎂</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">2</p>
              <span className="text-[8px] font-bold text-slate-500 uppercase block">Birthdays</span>
            </div>
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">💍</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">1</p>
              <span className="text-[8px] font-bold text-slate-500 uppercase block">Anniversary</span>
            </div>
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">📢</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">14</p>
              <span className="text-[8px] font-bold text-slate-500 uppercase block">Promos</span>
            </div>
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">🪙</span>
              <p className="text-xs font-black text-amber-900 mt-0.5">100</p>
              <span className="text-[8px] font-bold text-amber-700 uppercase block">Credits</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenOccasion}
            className="w-full py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-100 text-[11px] font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>🎨 Open Greeting Card &amp; Draft Studio →</span>
          </button>
        </div>
      </div>

      {/* Persistent Bottom Urgent Queue Bar */}
      <div 
        onClick={onOpenSiren}
        className="mt-3 cursor-pointer bg-slate-900 text-white rounded-2xl p-2.5 flex items-center justify-between shadow-md border border-slate-800"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <div>
            <p className="text-[11px] font-extrabold leading-tight">Urgent Incoming Orders Queue</p>
            <p className="text-[9px] text-slate-400">3 Orders needing acceptance (01:45 remaining)</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition">
          Accept Orders →
        </span>
      </div>
    </div>
  );
}
