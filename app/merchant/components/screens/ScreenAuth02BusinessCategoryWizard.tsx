"use client";

import React, { useState } from "react";

interface ScreenAuth02Props {
  onBack?: () => void;
  onSelectCategory?: (category: string) => void;
}

/**
 * ScreenAuth02: Compact, single-screen Business Vertical Wizard.
 * 5 slim horizontal tiles (48px) fitting completely without vertical scroll.
 */
export default function ScreenAuth02BusinessCategoryWizard({
  onBack,
  onSelectCategory,
}: ScreenAuth02Props) {
  const [selected, setSelected] = useState<string>("kirana");

  const categories = [
    {
      id: "kirana",
      name: "Kirana Mart & General Store",
      hindi: "किराना & राशन दुकान",
      icon: "🛒",
      badge: "Parcha Orders & FMCG Catalog",
    },
    {
      id: "chemist",
      name: "Medical Store & Pharmacy",
      hindi: "दवा & मेडिकल स्टोर",
      icon: "💊",
      badge: "Doctor Rx Prescriptions",
    },
    {
      id: "restaurant",
      name: "Restaurant, Cafe & QSR",
      hindi: "होटल, कैफे & रेस्टोरेंट",
      icon: "☕",
      badge: "Kitchen KOT & Food Prep",
    },
    {
      id: "salon",
      name: "Salon, Barber & Beauty Spa",
      hindi: "सैलून, पार्लर & स्पा",
      icon: "✂️",
      badge: "Live Chair Queue Tokens",
    },
    {
      id: "carwash",
      name: "Car Wash & Detailing Garage",
      hindi: "वाशिंग, सर्विस & गैराज",
      icon: "🚗",
      badge: "Bay Management & Service Rates",
    },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider block">
              REGISTRATION • STEP 1 OF 3
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Select Your Business Vertical
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 active:scale-95 transition"
          >
            ← Back
          </button>
        </div>

        {/* Short Instruction Banner */}
        <p className="text-[10px] text-slate-600 mt-2 leading-tight">
          Choose your business type. Your console and catalog will be custom tailored for this vertical.
        </p>

        {/* 5 Compact Slim Tiles (Each ~48px - Fits on 1 Screen!) */}
        <div className="mt-2.5 space-y-1.5">
          {categories.map((c) => {
            const isSelected = selected === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-600 ring-1 ring-blue-500/30"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 shadow-2xs ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}>
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-black text-slate-900 truncate leading-tight">
                        {c.name}
                      </h3>
                      <span className="text-[9px] text-slate-400 font-bold shrink-0">
                        ({c.hindi})
                      </span>
                    </div>
                    <span className="text-[9px] text-blue-700 font-bold block truncate">
                      {c.badge}
                    </span>
                  </div>
                </div>

                {/* Radio selection circle */}
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                  isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                }`}>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slim Modern Navy Continue Button */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onSelectCategory?.(selected)}
          className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
        >
          <span>Continue With {categories.find((c) => c.id === selected)?.name.split(" ")[0]}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
