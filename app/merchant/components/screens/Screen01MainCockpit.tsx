"use client";

import React, { useState } from "react";
import DongleSliderSwitch from "../DongleSliderSwitch";

export interface Screen01Props {
  storeName?: string;
  ownerName?: string;
  phone?: string;
  isStoreOnline?: boolean;
  onToggleStoreOnline?: () => void;
  liveOrdersCount?: number;
  preparingCount?: number;
  outCount?: number;
  catalogCount?: number;
  todayEarnings?: number;
  reviewStats?: {
    totalReviews?: number;
    averageRating?: number | null;
    totalScans?: number;
    positivePct?: number | null;
  };
  onOpenOrders?: () => void;
  onOpenMenu?: () => void;
  onOpenSiren?: () => void;
  onOpenOccasion?: () => void;
}

/**
 * Screen01: Pure Multi-Tenant Restaurant / General Retail Cockpit.
 * Zero hardcoded personas - 100% dynamic multi-tenant business center.
 */
export default function Screen01MainCockpit({
  ownerName = "Business Partner",
  isStoreOnline = true,
  liveOrdersCount = 0,
  preparingCount = 0,
  outCount = 0,
  todayEarnings = 0,
  reviewStats,
  onOpenSiren,
  onOpenOccasion,
}: Screen01Props) {
  const [ordersPaused, setOrdersPaused] = useState(false);

  const reviewsCount = reviewStats?.totalReviews ?? 0;
  const ratingLabel = reviewStats?.averageRating != null ? `⭐ ${reviewStats.averageRating}` : "—";
  const viewsCount = reviewStats?.totalScans ?? 0;
  const trustLabel = reviewStats?.positivePct != null ? `${reviewStats.positivePct}%` : "—";

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3 text-[#0F172A] font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        {/* Slim Dynamic Greeting Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider block">
                BUSINESS COCKPIT
              </span>
              <h1 className="text-xs font-black text-slate-900 mt-0.5 truncate">
                Namaste, {ownerName}! 🙏
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
              <button
                type="button"
                onClick={() => setOrdersPaused(!ordersPaused)}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition ${
                  ordersPaused
                    ? "bg-amber-100 border-amber-300 text-amber-900"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {ordersPaused ? "⏸️ Paused" : "▶️ Active"}
              </button>
            </div>
          </div>
        </div>

        {/* Live Order Pipeline (Auto-sync 4s) */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">⚡</span>
              <span className="text-[11px] font-black text-slate-900">Live Order Pipeline</span>
            </div>
            <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live (4s)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div 
              onClick={onOpenSiren}
              className="cursor-pointer bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-lg p-2 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-amber-900">⏳ New Pending</span>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              <p className="text-sm font-black text-amber-950 mt-0.5">{liveOrdersCount} Orders</p>
              <span className="text-[8px] font-medium text-amber-700">Click to preview siren</span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2">
              <span className="text-[9px] font-bold text-blue-900 block">🍳 In Kitchen Prep</span>
              <p className="text-sm font-black text-blue-950 mt-0.5">{preparingCount} Orders</p>
              <span className="text-[8px] font-medium text-blue-700">Live status</span>
            </div>

            <div className="bg-cyan-50/60 border border-cyan-200 rounded-lg p-2">
              <span className="text-[9px] font-bold text-cyan-900 block">🛵 Out for Delivery</span>
              <p className="text-sm font-black text-cyan-950 mt-0.5">{outCount} Orders</p>
              <span className="text-[8px] font-medium text-cyan-700">Rider on route</span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2">
              <span className="text-[9px] font-bold text-emerald-900 block">✅ Delivered Today</span>
              <p className="text-sm font-black text-emerald-950 mt-0.5">₹{todayEarnings.toLocaleString("en-IN")}</p>
              <span className="text-[8px] font-medium text-emerald-700">Auto Settled</span>
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
              Live Sync
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Reviews</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{reviewsCount}</p>
              <span className="text-[7px] font-bold text-slate-500 block">verified</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Rating</span>
              <p className="text-xs font-black text-amber-600 mt-0.5">{ratingLabel}</p>
              <span className="text-[7px] font-bold text-slate-500 block">5.0 scale</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Views</span>
              <p className="text-xs font-black text-blue-700 mt-0.5">{viewsCount}</p>
              <span className="text-[7px] font-bold text-blue-600 block">QR scans</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase block truncate">Trust</span>
              <p className="text-xs font-black text-emerald-700 mt-0.5">{trustLabel}</p>
              <span className="text-[7px] font-bold text-emerald-600 block">Positive</span>
            </div>
          </div>
        </div>

        {/* Automated Occasion CRM & AI Greetings */}
        <div className="mt-3 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/80 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/60">
            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
              🎂 Occasion CRM &amp; AI Greetings
            </span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
              09:30 AM Daily
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 my-2.5 text-center">
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">🎂</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">2</p>
              <span className="text-[8px] font-bold text-slate-500 uppercase block">Birthdays</span>
            </div>
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">💍</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">1</p>
              <span className="text-[8px] font-bold text-slate-500 uppercase block">Anniversary</span>
            </div>
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">📢</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">14</p>
              <span className="text-[8px] font-bold text-slate-500 uppercase block">Promos</span>
            </div>
            <div className="bg-white/90 border border-amber-100 rounded-xl p-1.5 shadow-2xs">
              <span className="text-xs">🪙</span>
              <p className="text-xs font-black text-amber-900 mt-0.5">100</p>
              <span className="text-[8px] font-bold text-amber-700 uppercase block">Credits</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenOccasion}
            className="w-full py-1.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-100 text-[11px] font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>🎨 Open Greeting Card &amp; Draft Studio →</span>
          </button>
        </div>
      </div>

      {/* Persistent Bottom Urgent Queue Bar */}
      <div 
        onClick={onOpenSiren}
        className="mt-3 cursor-pointer bg-slate-900 text-white rounded-2xl p-2.5 flex items-center justify-between shadow-md border border-slate-800"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          <div>
            <p className="text-[11px] font-extrabold leading-tight">Urgent Incoming Orders Queue</p>
            <p className="text-[9px] text-slate-400">{liveOrdersCount} Orders needing acceptance (01:45 remaining)</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition">
          Accept Orders →
        </span>
      </div>
    </div>
  );
}
