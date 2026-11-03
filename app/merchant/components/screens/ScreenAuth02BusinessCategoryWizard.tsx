"use client";

import React, { useState } from "react";

interface ScreenAuth02Props {
  onBack?: () => void;
  onSelectCategory?: (category: string) => void;
}

export default function ScreenAuth02BusinessCategoryWizard({
  onBack,
  onSelectCategory,
}: ScreenAuth02Props) {
  const [selected, setSelected] = useState<string>("kirana");

  const categories = [
    {
      id: "kirana",
      name: "Kirana Mart & Supermarket",
      icon: "🛒",
      badge: "Parcha Orders & Weight Master",
      desc: "Specialized for grocery stores, grain depots, and marts. Handles handwritten photo parchis, kg/gram weight scales, and FMCG barcode catalog.",
    },
    {
      id: "chemist",
      name: "Medical Store & Pharmacy",
      icon: "💊",
      badge: "Rx Prescription & Schedule H",
      desc: "Specialized for licensed chemists. Handles doctor prescription photo review, dosage verification, generic substitutes, and medical compliance.",
    },
    {
      id: "salon",
      name: "Salon, Barber & Beauty Spa",
      icon: "✂️",
      badge: "Live Chair Queue & Token Cards",
      desc: "Specialized for men's barbers, unisex salons, and bridal spas. Live chair waiting queue, beautician assignment, and mirror review QR.",
    },
    {
      id: "carwash",
      name: "Car Wash & Detailing Garage",
      icon: "🚗",
      badge: "Bay Management & Vehicle Rates",
      desc: "Specialized for car & bike service centers. Bay 1/2/3 job cards, vehicle type rate matrix (Hatch/Sedan/SUV), and washing inspection checklists.",
    },
    {
      id: "restaurant",
      name: "Restaurant, Cafe & QSR",
      icon: "☕",
      badge: "Kitchen KOT & Food Prep Timers",
      desc: "Specialized for food eateries. Instant kitchen order tickets (58/80mm thermal print), dining table QR codes, and rider pickup alerts.",
    },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              REGISTRATION • STEP 1 OF 3
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Select Your Business Vertical
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

        {/* Instructions */}
        <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-xs text-blue-950">
          <p className="text-[11px] leading-relaxed font-medium">
            Your merchant console will automatically configure its <strong>Orders Queue, Catalog Manager, and Review QR Standee</strong> based on the business type you select below.
          </p>
        </div>

        {/* Vertical Options List */}
        <div className="mt-3 space-y-2.5">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`p-3 rounded-2xl border-2 transition cursor-pointer shadow-2xs space-y-1.5 ${
                selected === c.id
                  ? "bg-white border-blue-600 ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 leading-tight">{c.name}</h3>
                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-wider block">
                      {c.badge}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selected === c.id ? "border-blue-600 bg-blue-600" : "border-slate-300"
                  }`}
                >
                  {selected === c.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed pt-0.5">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onSelectCategory?.(selected)}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>CONTINUE WITH {selected.toUpperCase()} CONSOLE →</span>
        </button>
      </div>
    </div>
  );
}
