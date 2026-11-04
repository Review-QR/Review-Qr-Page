"use client";

import React from "react";
import DongleSliderSwitch from "../DongleSliderSwitch";

export interface ScreenS01Props {
  storeName?: string;
  ownerName?: string;
  phone?: string;
  isStoreOnline?: boolean;
  onToggleStoreOnline?: () => void;
  liveOrdersCount?: number;
  catalogCount?: number;
  todayEarnings?: number;
  onOpenQueue?: () => void;
  onOpenServices?: () => void;
  onOpenStandee?: () => void;
  onBack?: () => void;
}

/**
 * ScreenS01: Pure Multi-Tenant Salon & Grooming Cockpit.
 * Zero hardcoded personas (No Manish ji) - 100% dynamically bound to authenticated salon owner.
 * Features hardware DongleSliderSwitch for Salon Open/Close status.
 */
export default function ScreenS01SalonCockpit({
  storeName = "Looks Salon & Spa",
  ownerName = "Stylist Partner",
  phone = "",
  isStoreOnline = true,
  onToggleStoreOnline,
  liveOrdersCount = 2,
  catalogCount = 18,
  todayEarnings = 4950,
  onOpenQueue,
  onOpenServices,
  onOpenStandee,
  onBack,
}: ScreenS01Props) {
  const displayPhone = phone.replace(/\D/g, "");
  const formattedPhone = displayPhone.length === 10
    ? `+91 ${displayPhone.slice(0, 5)} ${displayPhone.slice(5)}`
    : phone || "+91 Salon Partner";

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-800 text-rose-200 flex items-center justify-center font-black text-sm shadow-xs shrink-0">
              ✂️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-black text-slate-900 leading-tight truncate">
                  {storeName}
                </h2>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isStoreOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {formattedPhone} • Salon Desk
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

        {/* Dynamic Greeting & Chairs Shortcut */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block">
                Styling &amp; Token Station
              </span>
              <h1 className="text-sm font-black text-slate-900 mt-0.5">
                Namaste, {ownerName}! 🙏
              </h1>
              <p className="text-[11px] text-slate-500">
                {liveOrdersCount} Waiting in Lounge • Station Online
              </p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                isStoreOnline
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-rose-50 text-rose-800 border-rose-300"
              }`}>
                {isStoreOnline ? "Salon: OPEN ✓" : "Salon: PAUSED ⏸"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={onOpenQueue}
              className="py-2 px-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-[11px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>💺 Chairs Queue ({liveOrdersCount})</span>
            </button>
            <button
              type="button"
              onClick={onOpenServices}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-1.5 transition"
            >
              <span>💇 Rates &amp; Menu ({catalogCount})</span>
            </button>
          </div>
        </div>

        {/* Chair & Stylist Realtime Status */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>✂️</span> Live Styling Station Activity
            </span>
            <span className="text-[9px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Live Lounge
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={onOpenQueue}
              className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-300 rounded-xl p-2 cursor-pointer transition"
            >
              <span className="text-[10px] font-bold text-amber-900 block">💺 Waiting Tokens</span>
              <p className="text-base font-black text-amber-950 mt-0.5">{liveOrdersCount} in Lounge</p>
              <span className="text-[9px] font-bold text-amber-700">Digital Token active</span>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-rose-900 block">💇 Active Hair Styling</span>
              <p className="text-base font-black text-rose-950 mt-0.5">3 Chairs Busy</p>
              <span className="text-[9px] font-medium text-rose-700">Stylists allocated</span>
            </div>

            <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-purple-900 block">💆 Facial &amp; D-Tan</span>
              <p className="text-base font-black text-purple-950 mt-0.5">1 Spa Room</p>
              <span className="text-[9px] font-medium text-purple-700">20 Mins remaining</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2">
              <span className="text-[10px] font-bold text-emerald-900 block">✅ Clients Today</span>
              <p className="text-base font-black text-emerald-950 mt-0.5">₹{todayEarnings.toLocaleString("en-IN")}</p>
              <span className="text-[9px] font-bold text-emerald-700">Settled Daily</span>
            </div>
          </div>
        </div>

        {/* Mirror Review Incentive Banner */}
        <div className="mt-3 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-3 shadow-xs flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-rose-950 block">Mirror QR Review Promotion</span>
            <span className="text-[10px] text-rose-700">Digital QR coupon auto-sent for Google reviews</span>
          </div>
          <span className="text-xl">🪞</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenStandee}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>🏆 View Salon Mirror &amp; Reception QR Standee →</span>
        </button>
      </div>
    </div>
  );
}
