"use client";

import React, { useState } from "react";

interface Screen35Props {
  onBack?: () => void;
  onVerifyPrescription?: () => void;
  onConfirmPickup?: () => void;
}

export default function Screen35PharmacyRxPickup({
  onBack,
  onVerifyPrescription,
  onConfirmPickup,
}: Screen35Props) {
  const [rxChecked, setRxChecked] = useState<boolean>(true);
  const [sealIntact, setSealIntact] = useState<boolean>(true);
  const [coldInsulinCheck, setColdInsulinCheck] = useState<boolean>(true);

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
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
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Medical &amp; Chemist Run
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Pharmacy (Rx) Verification</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-teal-700 bg-teal-50 rounded-full py-0.5 border border-teal-200">
            💊
          </span>
        </div>

        {/* Chemist Card */}
        <div className="mt-4 bg-gradient-to-r from-teal-900 to-cyan-950 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-bold text-teal-200">Chemist: Sanjivani Medical Hall</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Schedule H Rx
            </span>
          </div>
          <p className="text-xs text-teal-100 mt-2">
            Civil Lines, Bahraich · Pharmacist: Dr. M. K. Pandey (B.Pharm)
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-teal-200">
            <span>Order #TR-MED-8819</span>
            <span className="font-bold text-amber-300">Confidential Sealed Pouch</span>
          </div>
        </div>

        {/* Cold Storage / Insulin Alert */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2.5 text-xs">
          <span className="text-xl">❄️</span>
          <div>
            <p className="font-extrabold text-blue-900">Cold Chain Item: Human Insulin Pen</p>
            <p className="text-[10px] text-blue-700">Must be kept inside the thermal bag with ice-gel pack.</p>
          </div>
        </div>

        {/* Mandatory Verification Checklist */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Mandatory Drug Compliance Checks:
          </h4>

          <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={rxChecked}
              onChange={(e) => setRxChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="font-bold block">1. Doctor Prescription Stamp Verified</span>
              <span className="text-[10px] text-slate-500">Pharmacist has matched doctor Rx with drug names.</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={sealIntact}
              onChange={(e) => setSealIntact(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="font-bold block">2. Tamper-Evident Medical Envelope</span>
              <span className="text-[10px] text-slate-500">Pouch is sealed. No patient medical details exposed.</span>
            </div>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={coldInsulinCheck}
              onChange={(e) => setColdInsulinCheck(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="font-bold block">3. Ice Gel Pack Placed in Bag</span>
              <span className="text-[10px] text-slate-500">Temperature kept below 8°C for insulin vials.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Footer Confirm Pickup */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={!rxChecked || !sealIntact || !coldInsulinCheck}
          onClick={onConfirmPickup}
          className="w-full py-3.5 rounded-xl bg-teal-700 text-white font-black text-sm shadow-md hover:bg-teal-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          <span>Confirm Pharmacy Pickup (Earn ₹50.00)</span>
          <span>➔</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Medical Priority Run · Deliver to patient within 20 mins
        </p>
      </div>
    </div>
  );
}
