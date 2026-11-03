"use client";

import React, { useState } from "react";

interface ScreenK03Props {
  onBack?: () => void;
  onSave?: () => void;
}

export default function ScreenK03KiranaMasterRates({ onBack, onSave }: ScreenK03Props) {
  const [rates, setRates] = useState([
    { item: "Sharbati Chakki Atta", unit: "Per Kg", rate: 42, mandiTrend: "Stable" },
    { item: "Madhur Sugar (Cheeni)", unit: "Per Kg", rate: 44, mandiTrend: "↑ +₹1" },
    { item: "Engine Kacchi Ghani Mustard Oil", unit: "Per Litre", rate: 165, mandiTrend: "↓ -₹2" },
    { item: "Desi Arhar Dal (Tuvar)", unit: "Per Kg", rate: 156, mandiTrend: "Stable" },
    { item: "India Gate Basmati Rice", unit: "Per Kg", rate: 95, mandiTrend: "Stable" },
  ]);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
              MANDI PRICE MASTER
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Kirana Commodity Rates (Per Kg/Ltr)
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Mandi Sync Notice */}
        <div className="mt-2.5 bg-amber-50 border border-amber-300 rounded-2xl p-2.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-amber-950 block">Bahraich Galla Mandi Sync</span>
            <span className="text-[10px] text-amber-800">Auto-updates customer parcha price calculator</span>
          </div>
          <span className="text-[9px] font-bold bg-white text-amber-900 px-2 py-0.5 rounded border border-amber-200">
            Today 08:00 AM
          </span>
        </div>

        {/* Commodity Rates Table */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Loose Grain &amp; Oil Daily Price List
          </span>

          <div className="space-y-2 text-xs">
            {rates.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-b-0"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{r.item}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>{r.unit}</span>
                    <span>•</span>
                    <span className="text-amber-800 font-semibold">{r.mandiTrend}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-mono">
                  <span className="text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    defaultValue={r.rate}
                    className="w-14 px-2 py-1 rounded-lg border border-slate-300 font-bold text-slate-900 text-right bg-slate-50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSave}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          Update Mandi Rates for All Online Parchas
        </button>
      </div>
    </div>
  );
}
