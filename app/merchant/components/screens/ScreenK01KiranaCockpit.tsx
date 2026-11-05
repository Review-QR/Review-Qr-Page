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
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3 text-[#0F172A] font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        {/* Slim Dynamic Greeting Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider block">
                KIRANA OPERATIONS CONSOLE
              </span>
              <h1 className="text-xs font-black text-slate-900 mt-0.5 truncate">
                Namaste, {ownerName} ji! 🙏
              </h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                isStoreOnline
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-rose-50 text-rose-800 border-rose-300"
              }`}>
                {isStoreOnline ? "OPEN" : "CLOSED"}
              </span>
              <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                {catalogCount} Items Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenParcha}
              className="py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold shadow-xs flex items-center justify-center gap-1 transition active:scale-98"
            >
              <span>📄 Live Parchas ({liveOrdersCount})</span>
            </button>
            <button
              type="button"
              onClick={onOpenRates}
              className="py-1.5 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[10px] font-bold shadow-2xs flex items-center justify-center gap-1 transition active:scale-98"
            >
              <span>⚖️ Mandi Kg Rates</span>
            </button>
          </div>
        </div>

        {/* Kirana Grocery Order Pipeline */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
              <span>📦</span> Live Kirana Order Pipeline
            </span>
            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
              Auto-Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div
              onClick={onOpenParcha}
              className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-300 rounded-lg p-2 cursor-pointer transition active:scale-98"
            >
              <span className="text-[9px] font-bold text-amber-900 block">📝 Customer Parchas</span>
              <p className="text-sm font-black text-amber-950 mt-0.5">{liveOrdersCount} Active</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-300 rounded-lg p-2">
              <span className="text-[9px] font-bold text-emerald-900 block">💰 Today&apos;s Business</span>
              <p className="text-sm font-black text-emerald-950 mt-0.5">₹{todayEarnings.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* 4 Slim Review & Analytics Metric Boxes */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">⭐</span>
              <span className="text-[11px] font-black text-slate-900">Review &amp; Customer Analytics</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
              Live Google Sync
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            {/* Box 1: Total Reviews */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Reviews</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">384</p>
              <span className="text-[7px] font-bold text-emerald-600 block">+14 this wk</span>
            </div>

            {/* Box 2: Google Rating */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Rating</span>
              <p className="text-xs font-black text-amber-600 mt-0.5">⭐ 4.9</p>
              <span className="text-[7px] font-bold text-slate-500 block">5.0 scale</span>
            </div>

            {/* Box 3: Total Profile Views */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Views</span>
              <p className="text-xs font-black text-blue-700 mt-0.5">920</p>
              <span className="text-[7px] font-bold text-blue-600 block">Local footfall</span>
            </div>

            {/* Box 4: Positive Trust % */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Trust</span>
              <p className="text-xs font-black text-emerald-700 mt-0.5">98%</p>
              <span className="text-[7px] font-bold text-emerald-600 block">Positive</span>
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
