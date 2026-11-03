"use client";

import React, { useState } from "react";

interface ScreenK01Props {
  onOpenParcha?: () => void;
  onOpenRates?: () => void;
  onOpenStandee?: () => void;
  onBack?: () => void;
}

export default function ScreenK01KiranaCockpit({
  onOpenParcha,
  onOpenRates,
  onOpenStandee,
  onBack,
}: ScreenK01Props) {
  const [storeOpen, setStoreOpen] = useState(true);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center font-black text-sm shadow-xs">
              🛒
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight">
                  Shri Ram Kirana &amp; Supermart
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">ID: KIRANA-7721 • Galla Mandi Hub</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
            Kirana Partner
          </span>
        </div>

        {/* Greeting & Parcha Order Shortcut */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                Kirana Operations Console
              </span>
              <h1 className="text-sm font-black text-slate-900">Namaste, Rajesh ji! 🙏</h1>
              <p className="text-[11px] text-slate-500">Mandi daily prices updated at 08:00 AM.</p>
            </div>
            <button
              type="button"
              onClick={() => setStoreOpen(!storeOpen)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                storeOpen ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-500"
              }`}
            >
              {storeOpen ? "Dukaan: KHULI ✓" : "Dukaan: BAND ⏸"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenParcha}
              className="py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>📄 Live Parchas (4)</span>
            </button>
            <button
              type="button"
              onClick={onOpenRates}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1.5 transition"
            >
              <span>⚖️ Mandi Kg Rates</span>
            </button>
          </div>
        </div>

        {/* Kirana Pipeline Status */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>📦</span> Kirana Grocery Order Pipeline
            </span>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Auto-Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={onOpenParcha}
              className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-300 rounded-xl p-2 cursor-pointer transition"
            >
              <span className="text-[10px] font-bold text-amber-900 block">📝 New Parchas</span>
              <p className="text-base font-black text-amber-950 mt-0.5">4 Lists</p>
              <span className="text-[9px] font-bold text-amber-700">Photo lists to weigh</span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-blue-900 block">⚖️ Packing in Crate</span>
              <p className="text-base font-black text-blue-950 mt-0.5">3 Orders</p>
              <span className="text-[9px] font-medium text-blue-700">Atta, Dal, Oil packed</span>
            </div>

            <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-cyan-900 block">🛵 Out with Rider</span>
              <p className="text-base font-black text-cyan-950 mt-0.5">2 Orders</p>
              <span className="text-[9px] font-medium text-cyan-700">Delivery in Civil Lines</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">✅ Delivered Today</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">18 Orders</p>
              <span className="text-[9px] font-bold text-emerald-700">₹8,420 collected</span>
            </div>
          </div>
        </div>

        {/* Mandi Grain Stock Quick Alerts */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Critical Grain Stock Status
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Ashirvaad Atta</span>
              <span className="font-mono font-black text-slate-900">12 Sacks</span>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Arhar Dal</span>
              <span className="font-mono font-black text-slate-900">45 Kg</span>
            </div>
            <div className="bg-rose-50 p-2 rounded-xl border border-rose-200 text-rose-800">
              <span className="text-[10px] font-bold block">Mustard Oil</span>
              <span className="font-mono font-black">Low (4 Tins)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenStandee}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>🏆 View Kirana Counter Review QR Standee →</span>
        </button>
      </div>
    </div>
  );
}
