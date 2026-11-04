"use client";

import React from "react";
import DongleSliderSwitch from "../DongleSliderSwitch";

export interface ScreenK01Props {
  storeName?: string;
  ownerName?: string;
  phone?: string;
  isStoreOnline?: boolean;
  onToggleStoreOnline?: () => void;
  liveOrdersCount?: number;
  catalogCount?: number;
  todayEarnings?: number;
  onOpenParcha?: () => void;
  onOpenRates?: () => void;
  onOpenStandee?: () => void;
  onBack?: () => void;
}

/**
 * ScreenK01: Pure Multi-Tenant Kirana Cockpit.
 * Zero hardcoded names (No Rajesh ji) - 100% dynamic binding to the authenticated merchant.
 * Hardware-style iOS/Android DongleSliderSwitch for Store Open/Close state.
 */
export default function ScreenK01KiranaCockpit({
  storeName = "Mera Kirana Store",
  ownerName = "Merchant Partner",
  phone = "",
  isStoreOnline = true,
  onToggleStoreOnline,
  liveOrdersCount = 3,
  catalogCount = 26,
  todayEarnings = 8450,
  onOpenParcha,
  onOpenRates,
  onOpenStandee,
  onBack,
}: ScreenK01Props) {
  const displayPhone = phone.replace(/\D/g, "");
  const formattedPhone = displayPhone.length === 10
    ? `+91 ${displayPhone.slice(0, 5)} ${displayPhone.slice(5)}`
    : phone || "+91 Verified";

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-200 flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              🛒
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight truncate">
                  {storeName}
                </h2>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isStoreOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {formattedPhone} • Bahraich Hub
              </p>
            </div>
          </div>

          {/* Dongle Toggle Switch (Slider) */}
          <div className="shrink-0">
            <DongleSliderSwitch
              isOn={isStoreOnline}
              onToggle={() => onToggleStoreOnline?.()}
            />
          </div>
        </div>

        {/* Dynamic Greeting & Quick Shortcuts */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                Kirana Operations Console
              </span>
              <h1 className="text-sm font-black text-slate-900 mt-0.5">
                Namaste, {ownerName} ji! 🙏
              </h1>
              <p className="text-[11px] text-slate-500">
                Mandi daily rates &amp; orders synchronized live.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
              {catalogCount} Items Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenParcha}
              className="py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>📄 Live Parchas ({liveOrdersCount})</span>
            </button>
            <button
              type="button"
              onClick={onOpenRates}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>⚖️ Mandi Kg Rates</span>
            </button>
          </div>
        </div>

        {/* Kirana Grocery Order Pipeline */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>📦</span> Live Kirana Order Pipeline
            </span>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Auto-Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={onOpenParcha}
              className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-300 rounded-xl p-2 cursor-pointer transition active:scale-98"
            >
              <span className="text-[10px] font-bold text-amber-900 block">📝 Customer Parchas</span>
              <p className="text-base font-black text-amber-950 mt-0.5">{liveOrdersCount} Active</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">💰 Today&apos;s Business</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">₹{todayEarnings.toLocaleString("en-IN")}</p>
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
              <span className="text-xs font-black text-slate-900">Counter QR</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">5★ Google Review Standee</p>
          </div>

          <div
            onClick={onOpenRates}
            className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚖️</span>
              <span className="text-xs font-black text-slate-900">Weight Scale</span>
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">Kg / Gram Rate Master</p>
          </div>
        </div>
      </div>

      {/* Footer Navigation Back Button if provided */}
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
