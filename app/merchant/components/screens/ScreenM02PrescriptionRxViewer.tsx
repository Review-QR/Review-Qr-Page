"use client";

import React, { useState } from "react";

interface ScreenM02Props {
  onBack?: () => void;
  onApproveRx?: () => void;
}

export default function ScreenM02PrescriptionRxViewer({
  onBack,
  onApproveRx,
}: ScreenM02Props) {
  const [medicines, setMedicines] = useState([
    { name: "Augmentin 625 Duo (Amoxycillin + Clavulanate)", dosage: "1 Tab BD x 5 Days", strips: 1, price: 204, inStock: true },
    { name: "Pan-D (Pantoprazole + Domperidone)", dosage: "1 Cap OD Before Food", strips: 1, price: 145, inStock: true },
    { name: "Dolo 650 (Paracetamol 650mg)", dosage: "SOS in fever", strips: 1, price: 34, inStock: true },
  ]);

  const total = medicines.reduce((acc, m) => acc + m.price, 0);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
              PRESCRIPTION VERIFICATION
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Rx #MED-8812 • Patient: Amit Srivastava
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

        {/* Doctor Prescription Slip Photo Simulation */}
        <div className="mt-2.5 bg-teal-50 border-2 border-teal-300 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-teal-950">
              <span className="text-base">🩺</span>
              <span>Dr. R. K. Saxena, MD (Medicine)</span>
            </div>
            <span className="text-[9px] font-mono text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200 font-bold">
              Reg: MCI-40912
            </span>
          </div>

          <div className="bg-white border border-teal-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-800 shadow-inner space-y-1">
            <span className="text-teal-700 font-black text-sm block">℞</span>
            <div className="space-y-0.5 text-xs text-slate-700 font-sans">
              <p>1. Tab. Augmentin 625 Duo — 1x BD (After food) x 5 days</p>
              <p>2. Cap. Pan-D — 1x OD (Empty stomach) x 5 days</p>
              <p>3. Tab. Dolo 650mg — 1x SOS in high fever</p>
            </div>
          </div>
        </div>

        {/* Pharmacist Dispensing Checklist */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Pharmacist Dispensing Review (Batch &amp; Expiry Check)
          </span>

          <div className="space-y-2 text-xs">
            {medicines.map((m, i) => (
              <div
                key={i}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{m.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                    <span>{m.dosage}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">Exp: 08/2028</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900">₹{m.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bill & Approval Footer */}
      <div className="pt-2 space-y-1.5">
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600">Dispensing Total (3 Strips):</span>
          <span className="font-mono font-black text-base text-teal-800">₹{total}.00</span>
        </div>

        <button
          type="button"
          onClick={onApproveRx}
          className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>✓ PHARMACIST SIGN-OFF &amp; DISPATCH TO PATIENT</span>
        </button>
      </div>
    </div>
  );
}
