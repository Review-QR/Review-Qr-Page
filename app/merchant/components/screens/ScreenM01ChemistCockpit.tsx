"use client";

import React from "react";
import DongleSliderSwitch from "../DongleSliderSwitch";

export interface ScreenM01Props {
  storeName?: string;
  ownerName?: string;
  phone?: string;
  isStoreOnline?: boolean;
  onToggleStoreOnline?: () => void;
  onOpenRx?: () => void;
  onOpenMedicines?: () => void;
  onOpenStandee?: () => void;
  onBack?: () => void;
}

/**
 * ScreenM01: Pure Multi-Tenant Chemist & Pharmacy Cockpit.
 * Zero hardcoded names (No Dr. Alok Verma) - 100% dynamic binding to the authenticated pharmacist.
 */
export default function ScreenM01ChemistCockpit({
  storeName = "Medical Store & Pharmacy",
  ownerName = "Pharmacist",
  phone = "",
  isStoreOnline = true,
  onToggleStoreOnline,
  onOpenRx,
  onOpenMedicines,
  onOpenStandee,
  onBack,
}: ScreenM01Props) {
  const displayPhone = phone.replace(/\D/g, "");
  const formattedPhone = displayPhone.length === 10
    ? `+91 ${displayPhone.slice(0, 5)} ${displayPhone.slice(5)}`
    : phone || "+91 Medical Partner";

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              💊
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight truncate">
                  {storeName}
                </h2>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isStoreOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {formattedPhone} • Pharmacy Desk
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <DongleSliderSwitch
              isOn={isStoreOnline}
              onToggle={() => onToggleStoreOnline?.()}
            />
          </div>
        </div>

        {/* Dynamic Greeting & Quick Action Row */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider block">
                Pharmacy Control Desk
              </span>
              <h1 className="text-sm font-black text-slate-900 mt-0.5">
                Namaste, {ownerName} ji! 🙏
              </h1>
              <p className="text-[11px] text-slate-500">Registered Pharmacist On Duty.</p>
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
              Rx Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenRx}
              className="py-2 px-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>📋 Doctor Prescriptions (3)</span>
            </button>
            <button
              type="button"
              onClick={onOpenMedicines}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>💊 Medicine Catalog</span>
            </button>
          </div>
        </div>

        {/* Prescription Pipeline Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>🩺</span> Prescription Verification Pipeline
            </span>
            <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Active Queue
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={onOpenRx}
              className="bg-teal-50/70 hover:bg-teal-100/70 border border-teal-300 rounded-xl p-2 cursor-pointer transition active:scale-98"
            >
              <span className="text-[10px] font-bold text-teal-900 block">📥 New Rx Uploads</span>
              <p className="text-base font-black text-teal-950 mt-0.5">3 Pending</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">✓ Dispensed Today</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">14 Patients</p>
            </div>
          </div>
        </div>

        {/* Fast Action Cards */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div
            onClick={onOpenStandee}
            className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🪧</span>
              <span className="text-xs font-black text-slate-900">Rx Review Standee</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">Patient Trust QR Standee</p>
          </div>

          <div
            onClick={onOpenMedicines}
            className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💊</span>
              <span className="text-xs font-black text-slate-900">Generic Search</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">Alternative Salt Finder</p>
          </div>
        </div>
      </div>

      {onBack && (
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-900 text-center"
          >
            Switch Console Mode
          </button>
        </div>
      )}
    </div>
  );
}
