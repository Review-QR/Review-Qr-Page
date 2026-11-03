"use client";

import React, { useState } from "react";

interface Screen33Props {
  onBack?: () => void;
  onNavigateToSurgeZone?: (zone: string) => void;
}

export default function Screen33HeatmapSurge({
  onBack,
  onNavigateToSurgeZone,
}: Screen33Props) {
  const [filter, setFilter] = useState<"all" | "surge" | "alerts">("surge");

  const surgeZones = [
    { name: "Kachehri & Court Compound", surge: "+₹15 / trip", demand: "Super High", dist: "1.1 km", orders: "14 waiting" },
    { name: "Dargah Sharif Road", surge: "+₹20 / trip", demand: "High Demand", dist: "2.4 km", orders: "9 waiting" },
    { name: "Civil Lines & Medical College", surge: "+₹10 / trip", demand: "Steady Rush", dist: "0.5 km", orders: "21 waiting" },
    { name: "Station Road & Ghanta Ghar", surge: "Normal", demand: "Moderate", dist: "1.8 km", orders: "5 waiting" },
  ];

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans no-scrollbar scrollbar-none">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Live Fleet Intelligence
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Bahraich Demand Heatmap</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            🔥
          </span>
        </div>

        {/* Live Admin Broadcast Ticker */}
        <div className="mt-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-2.5 shadow-xs flex items-center gap-2">
          <span className="text-base animate-pulse">📢</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold truncate">
              Admin Alert: Evening Monsoon Rush active! +₹20 extra bonus per order after 6 PM.
            </p>
          </div>
        </div>

        {/* Bahraich Interactive Heatmap Mockup Card */}
        <div className="mt-3 relative w-full h-44 rounded-2xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-sm flex items-center justify-center p-3">
          {/* Simulated Map Grid */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>

          {/* Surge Bubbles */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 max-w-xs">
            <div className="px-3 py-1.5 rounded-xl bg-red-600/90 text-white border border-red-400 text-center shadow-lg animate-pulse">
              <span className="text-[10px] font-black block">Kachehri Court</span>
              <span className="text-xs font-black text-amber-300">+₹15 Surge 🔥</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-600/90 text-white border border-purple-400 text-center shadow-lg">
              <span className="text-[10px] font-black block">Dargah Road</span>
              <span className="text-xs font-black text-amber-300">+₹20 Surge 🔥</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-blue-600/80 text-white border border-blue-400 text-center">
              <span className="text-[10px] font-bold block">Civil Lines</span>
              <span className="text-[11px] font-bold text-blue-200">+₹10 Surge</span>
            </div>
          </div>

          <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
            Live GPS Sync · Bahraich District Fleet
          </div>
        </div>

        {/* Hotspots List */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              High Earning Hotspots Nearby:
            </h4>
            <span className="text-[10px] text-slate-500 font-bold">Auto-Refreshes 30s</span>
          </div>

          {surgeZones.map((z, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-bold text-slate-900">{z.name}</h5>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {z.demand}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{z.orders} · <strong className="text-blue-700">{z.dist}</strong></p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-xs font-black text-emerald-600 font-mono">{z.surge}</span>
                <button
                  type="button"
                  onClick={() => onNavigateToSurgeZone?.(z.name)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-200"
                >
                  Go Here ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400">
          Position yourself inside red zones to catch incoming orders before other riders.
        </p>
      </div>
    </div>
  );
}
