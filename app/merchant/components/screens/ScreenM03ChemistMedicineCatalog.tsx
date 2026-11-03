"use client";

import React, { useState } from "react";

interface ScreenM03Props {
  onBack?: () => void;
  onAddMedicine?: () => void;
}

export default function ScreenM03ChemistMedicineCatalog({
  onBack,
  onAddMedicine,
}: ScreenM03Props) {
  const [search, setSearch] = useState("");

  const drugs = [
    { name: "Augmentin 625 Duo", salt: "Amoxycillin (500mg) + Clavulanic Acid (125mg)", mfr: "GSK", price: 204, stock: "18 Strips", exp: "12/2028" },
    { name: "Pan 40 Tablet", salt: "Pantoprazole Sodium (40mg)", mfr: "Alkem", price: 155, stock: "45 Strips", exp: "04/2027" },
    { name: "Dolo 650 Tablet", salt: "Paracetamol (650mg)", mfr: "Micro Labs", price: 34, stock: "120 Strips", exp: "09/2028" },
    { name: "Montek-LC Tablet", salt: "Montelukast (10mg) + Levocetirizine (5mg)", mfr: "Sun Pharma", price: 198, stock: "32 Strips", exp: "11/2027" },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
              PHARMACY INVENTORY
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Medicine Salt &amp; Drug Master
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

        {/* Search Salt / Brand */}
        <div className="mt-2.5 relative">
          <input
            type="text"
            placeholder="Search brand (e.g. Dolo) or salt (e.g. Paracetamol)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-hidden focus:border-teal-600 shadow-2xs"
          />
          <span className="absolute left-2.5 top-2 text-xs text-slate-400">🔍</span>
        </div>

        {/* Drugs List */}
        <div className="mt-3 space-y-2">
          {drugs.map((d, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{d.name}</h4>
                  <p className="text-[10px] text-teal-800 font-semibold">{d.salt}</p>
                </div>
                <span className="font-mono text-xs font-black text-slate-900">₹{d.price}</span>
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Mfr: <strong>{d.mfr}</strong></span>
                <span className="text-emerald-700 font-bold">In Stock: {d.stock}</span>
                <span className="font-mono text-slate-400">Exp: {d.exp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddMedicine}
          className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>+ Add New Medicine / Barcode Scan</span>
        </button>
      </div>
    </div>
  );
}
