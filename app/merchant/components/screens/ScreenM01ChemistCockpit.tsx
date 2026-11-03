"use client";

import React, { useState } from "react";

interface ScreenM01Props {
  onOpenRx?: () => void;
  onOpenMedicines?: () => void;
  onOpenStandee?: () => void;
  onBack?: () => void;
}

export default function ScreenM01ChemistCockpit({
  onOpenRx,
  onOpenMedicines,
  onOpenStandee,
  onBack,
}: ScreenM01Props) {
  const [storeOpen, setStoreOpen] = useState(true);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center font-black text-sm shadow-xs">
              💊
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight">
                  Sanjivani Medicos &amp; Chemist
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">DL No: UP-40-20B-8819 • Hospital Road</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-900 border border-teal-200">
            Chemist Partner
          </span>
        </div>

        {/* Greeting & Quick Action Row */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                Pharmacy Control Desk
              </span>
              <h1 className="text-sm font-black text-slate-900">Dr. Alok Verma, B.Pharm 🙏</h1>
              <p className="text-[11px] text-slate-500">Registered Pharmacist On Duty.</p>
            </div>
            <button
              type="button"
              onClick={() => setStoreOpen(!storeOpen)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                storeOpen ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-500"
              }`}
            >
              {storeOpen ? "Pharmacy: OPEN ✓" : "Pharmacy: PAUSED ⏸"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenRx}
              className="py-2 px-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>📄 Prescription Rx (3)</span>
            </button>
            <button
              type="button"
              onClick={onOpenMedicines}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1.5 transition"
            >
              <span>💊 Drug Inventory</span>
            </button>
          </div>
        </div>

        {/* Prescription Queue Status */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>🩺</span> Live Prescription Fulfillment Pipeline
            </span>
            <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Rx Compliant
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={onOpenRx}
              className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-300 rounded-xl p-2 cursor-pointer transition"
            >
              <span className="text-[10px] font-bold text-amber-900 block">📝 Pending Rx Doctor Slips</span>
              <p className="text-base font-black text-amber-950 mt-0.5">3 Orders</p>
              <span className="text-[9px] font-bold text-amber-700">Needs pharmacist verification</span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-blue-900 block">📦 Strip Packing</span>
              <p className="text-base font-black text-blue-950 mt-0.5">4 Orders</p>
              <span className="text-[9px] font-medium text-blue-700">Batch &amp; Expiry verified</span>
            </div>

            <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-cyan-900 block">🛵 Delivery Rider</span>
              <p className="text-base font-black text-cyan-950 mt-0.5">1 Order</p>
              <span className="text-[9px] font-medium text-cyan-700">Hospital Ward delivery</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">✅ Completed Today</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">22 Orders</p>
              <span className="text-[9px] font-bold text-emerald-700">₹6,180 Dispensed</span>
            </div>
          </div>
        </div>

        {/* Cold Storage & Schedule H Compliance */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">❄️</span>
            <div>
              <span className="font-bold text-slate-900 block">Vaccine &amp; Insulin Fridge</span>
              <span className="text-[10px] text-slate-500">Chilled at 4.2°C (Optimal Range)</span>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Normal
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
          <span>🏆 View Chemist Counter Review Standee →</span>
        </button>
      </div>
    </div>
  );
}
