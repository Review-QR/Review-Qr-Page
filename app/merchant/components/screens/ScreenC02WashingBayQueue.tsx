"use client";

import React, { useState } from "react";

interface ScreenC02Props {
  onBack?: () => void;
  onCompleteWash?: () => void;
}

export default function ScreenC02WashingBayQueue({
  onBack,
  onCompleteWash,
}: ScreenC02Props) {
  const [completeNotice, setCompleteNotice] = useState(false);

  const bays = [
    { bay: "Bay 1 (High-Pressure Foam)", vehicle: "Hyundai i20 (UP-40-AQ-9912)", service: "Super Foam Wash + Underbody Spray", timeLeft: "08 Mins", washer: "Raju" },
    { bay: "Bay 2 (Dry Vacuuming)", vehicle: "Hyundai Creta (UP-32-BZ-1120)", service: "Full Interior Deep Vacuum & Dashboard Polish", timeLeft: "15 Mins", washer: "Kailash" },
    { bay: "Bay 3 (Two-Wheeler Platform)", vehicle: "Royal Enfield Classic 350", service: "Chain Lube & Engine Degrease", timeLeft: "05 Mins", washer: "Amit" },
  ];

  const handleFinish = () => {
    setCompleteNotice(true);
    setTimeout(() => {
      setCompleteNotice(false);
      onCompleteWash?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">
              BAY DISPATCH &amp; JOB CARDS
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Live Washing Bays Station
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

        {/* Bays List */}
        <div className="mt-2.5 space-y-2">
          {bays.map((b, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{b.bay}</span>
                <span className="text-[9px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-full border border-cyan-200">
                  ⏳ {b.timeLeft}
                </span>
              </div>

              <div className="text-xs">
                <p className="font-bold text-slate-900">{b.vehicle}</p>
                <p className="text-[10px] text-cyan-800 font-semibold">{b.service}</p>
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Technician: <strong>{b.washer}</strong></span>
                <span className="text-emerald-700 font-bold">● Wash in Progress</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Inspection Checklist */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">
            Quality Inspection Gate
          </span>
          <div className="flex items-center gap-2 text-slate-700 pt-1">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Tire shine dressing applied</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Windshield glass water-repellent wiped</span>
          </div>
        </div>
      </div>

      {/* Footer Complete Bay 1 */}
      <div className="pt-2">
        {completeNotice ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Bay 1 Handover Complete! Customer notified via SMS to pick car.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>✓ PASS BAY 1 INSPECTION &amp; HANDOVER CAR</span>
          </button>
        )}
      </div>
    </div>
  );
}
