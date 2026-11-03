"use client";

import React, { useState } from "react";

interface ScreenC01Props {
  onOpenBays?: () => void;
  onOpenPackages?: () => void;
  onOpenStandee?: () => void;
  onBack?: () => void;
}

export default function ScreenC01CarWashCockpit({
  onOpenBays,
  onOpenPackages,
  onOpenStandee,
  onBack,
}: ScreenC01Props) {
  const [garageOpen, setGarageOpen] = useState(true);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-800 text-cyan-200 flex items-center justify-center font-black text-sm shadow-xs">
              🚗
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight">
                  SpeedX Auto Foam &amp; Detailing
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">ID: CARWASH-9914 • Highway Bypass Hub</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-900 border border-cyan-200">
            Automobile Partner
          </span>
        </div>

        {/* Greeting & Bays Shortcut */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">
                Washing Bay Command Desk
              </span>
              <h1 className="text-sm font-black text-slate-900">Namaste, Virendra ji! 🙏</h1>
              <p className="text-[11px] text-slate-500">3 Bays Active • 2 Cars Waiting in Parking.</p>
            </div>
            <button
              type="button"
              onClick={() => setGarageOpen(!garageOpen)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                garageOpen ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-500"
              }`}
            >
              {garageOpen ? "Bays: OPEN ✓" : "Bays: FULL ⏸"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenBays}
              className="py-2 px-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>🚿 Live Bays (3)</span>
            </button>
            <button
              type="button"
              onClick={onOpenPackages}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1.5 transition"
            >
              <span>🚙 Wash Packages</span>
            </button>
          </div>
        </div>

        {/* Bays Activity Pipeline */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>🚗</span> Bay Allocation &amp; Vehicle Status
            </span>
            <span className="text-[9px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
              Live Pressure
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={onOpenBays}
              className="bg-cyan-50/70 hover:bg-cyan-100/70 border border-cyan-300 rounded-xl p-2 cursor-pointer transition"
            >
              <span className="text-[10px] font-bold text-cyan-900 block">🚿 Bay 1: Foam Wash</span>
              <p className="text-xs font-black text-cyan-950 mt-0.5">Hyundai i20 (White)</p>
              <span className="text-[9px] font-bold text-cyan-700">10 Mins remaining</span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-blue-900 block">✨ Bay 2: Detailing</span>
              <p className="text-xs font-black text-blue-950 mt-0.5">Creta (Black)</p>
              <span className="text-[9px] font-medium text-blue-700">Interior Vacuuming</span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-amber-900 block">🅿️ In Queue (Lot)</span>
              <p className="text-base font-black text-amber-950 mt-0.5">2 Vehicles</p>
              <span className="text-[9px] font-medium text-amber-700">Swift &amp; Royal Enfield</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">✅ Washed Today</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">14 Rides</p>
              <span className="text-[9px] font-bold text-emerald-700">₹5,400 Collected</span>
            </div>
          </div>
        </div>

        {/* Water Recycling & Pressure Sensor */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">💧</span>
            <div>
              <span className="font-bold text-slate-900 block">High Pressure Foam Gun: 180 Bar</span>
              <span className="text-[10px] text-slate-500">Recycled water tank: 84% Capacity</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Optimal
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenStandee}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>🏆 View Car Wash Lounge Review Standee →</span>
        </button>
      </div>
    </div>
  );
}
