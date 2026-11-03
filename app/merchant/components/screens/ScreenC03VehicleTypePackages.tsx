"use client";

import React, { useState } from "react";

interface ScreenC03Props {
  onBack?: () => void;
  onAddPackage?: () => void;
}

export default function ScreenC03VehicleTypePackages({
  onBack,
  onAddPackage,
}: ScreenC03Props) {
  const packages = [
    { type: "Hatchback (Alto, Swift, i10)", foamWash: 249, deepDetailing: 799, underbody: true },
    { type: "Sedan (Dzire, Verna, City)", foamWash: 349, deepDetailing: 999, underbody: true },
    { type: "Compact SUV (Brezza, Nexon, Venue)", foamWash: 449, deepDetailing: 1199, underbody: true },
    { type: "Full SUV (Scorpio, Safari, Fortuner)", foamWash: 599, deepDetailing: 1499, underbody: true },
    { type: "Motorcycle / Scooter (Bike)", foamWash: 120, deepDetailing: 299, underbody: false },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">
              AUTOMOBILE RATE CARD
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Vehicle Type &amp; Wash Packages
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

        {/* Packages List */}
        <div className="mt-3 space-y-2">
          {packages.map((p, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1"
            >
              <h4 className="text-xs font-black text-slate-900">{p.type}</h4>
              <div className="flex items-center justify-between pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Foam Wash:</span>
                  <span className="font-mono font-bold text-slate-900">₹{p.foamWash}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Full Detailing:</span>
                  <span className="font-mono font-bold text-cyan-800">₹{p.deepDetailing}</span>
                </div>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {p.underbody ? "Underbody Incl." : "Quick Lube"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddPackage}
          className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>+ Add Custom Detailing / Ceramic Coating Package</span>
        </button>
      </div>
    </div>
  );
}
