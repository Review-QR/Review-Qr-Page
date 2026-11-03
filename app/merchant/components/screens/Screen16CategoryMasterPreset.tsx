"use client";

import React, { useState } from "react";

interface Screen16Props {
  onBack?: () => void;
  onSeeded?: () => void;
}

export default function Screen16CategoryMasterPreset({ onBack, onSeeded }: Screen16Props) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("cafe");
  const [seededNotice, setSeededNotice] = useState<boolean>(false);

  const presets = [
    { id: "cafe", name: "Cafe & Coffee Shop", items: "45 Items • Cold Frappes, Sandwiches, Burgers", icon: "☕" },
    { id: "salon", name: "Salon, Barber & Spa", items: "28 Services • Haircut, Beard Trim, Facial, Spa", icon: "✂️" },
    { id: "grocery", name: "Kirana & Supermarket", items: "120 Items • Atta, Dal, Oil, Daily Provisions", icon: "🛒" },
    { id: "garage", name: "Automobile Car & Bike Wash", items: "18 Packages • Foam Wash, Detailing, Coating", icon: "🚗" },
    { id: "chemist", name: "Chemist & Medical Store", items: "Rx Prescription & OTC Personal Care", icon: "💊" },
  ];

  const handleSeed = () => {
    setSeededNotice(true);
    setTimeout(() => {
      setSeededNotice(false);
      onSeeded?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              INDUSTRY TEMPLATES
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              1-Click Catalog Starter Kit
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

        {/* Pitch Callout */}
        <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-xs text-blue-950 flex items-start gap-2">
          <span className="text-base">🚀</span>
          <div>
            <h3 className="font-bold">Instant Onboarding Catalog Preset</h3>
            <p className="text-[10px] text-blue-800 leading-relaxed mt-0.5">
              Select your business vertical to auto-populate standard categories, recommended pricing, and GST tax codes.
            </p>
          </div>
        </div>

        {/* Industry Cards */}
        <div className="mt-3 space-y-2">
          {presets.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedIndustry(p.id)}
              className={`p-3 rounded-2xl border transition cursor-pointer shadow-2xs flex items-center justify-between ${
                selectedIndustry === p.id
                  ? "bg-white border-blue-600 ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shadow-2xs">
                  {p.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">{p.name}</h4>
                  <p className="text-[10px] text-slate-500">{p.items}</p>
                </div>
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                selectedIndustry === p.id ? "border-blue-600 bg-blue-600" : "border-slate-300"
              }`}>
                {selectedIndustry === p.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {seededNotice ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Catalog Preset Imported Successfully!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSeed}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
          >
            Import Standard Catalog Template →
          </button>
        )}
      </div>
    </div>
  );
}
