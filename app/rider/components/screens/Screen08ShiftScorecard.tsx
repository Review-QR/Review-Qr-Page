"use client";

import React from "react";

export interface ScorecardData {
  todayEarnings?: number;
  todayTrips?: number;
  monthEarnings?: number;
  monthTrips?: number;
  cashInHand?: number;
  cashCap?: number;
  rating?: number;
  tier?: string;
  shiftDuration?: string;
  gpsDistanceKm?: number;
  tipsReceived?: number;
}

interface Screen08Props {
  onBack?: () => void;
  onOpenCeiling?: () => void;
  data?: ScorecardData;
}

export default function Screen08ShiftScorecard({ onBack, onOpenCeiling, data = {} }: Screen08Props) {
  const todayEarnings = data.todayEarnings ?? 0;
  const todayTrips = data.todayTrips ?? 0;
  const monthEarnings = data.monthEarnings ?? 0;
  const monthTrips = data.monthTrips ?? 0;
  const cashInHand = data.cashInHand ?? 0;
  const cashCap = data.cashCap ?? 1500;
  const rating = data.rating ?? 5.0;
  const tier = data.tier ?? "Gold Partner";
  const shiftDuration = data.shiftDuration ?? "00h 00m";
  const gpsDistanceKm = data.gpsDistanceKm ?? 0;
  const tipsReceived = data.tipsReceived ?? 0;

  const avgPerTrip = todayTrips > 0 ? (todayEarnings / todayTrips).toFixed(1) : "0.0";
  const cashPercent = cashCap > 0 ? Math.min(100, Math.round((cashInHand / cashCap) * 100)) : 0;

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Cockpit</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shift Metrics</span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Rider Performance Scorecard</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Live shift telemetry, earnings ledger and odometer displacement.
          </p>
        </div>

        {/* 4-Card Scorecard Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {/* Card 1: Today */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Earnings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">₹{todayEarnings.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-emerald-600">{todayTrips} Trips</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Avg ₹{avgPerTrip} / trip</span>
          </div>

          {/* Card 2: This Month */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">This Month</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">₹{monthEarnings.toLocaleString("en-IN")}</span>
              <span className="text-[10px] font-bold text-blue-700">{monthTrips} Trips</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Settled to Wallet</span>
          </div>

          {/* Card 3: Cash in Hand (Clickable to Ceiling Screen) */}
          <div
            onClick={onOpenCeiling}
            className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3.5 shadow-xs space-y-1 cursor-pointer hover:bg-amber-50 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Cash in Hand</span>
              <span className="text-[9px] font-black text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">
                Cap ₹{cashCap.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">₹{cashInHand.toFixed(2)}</span>
              <span className="text-[10px] text-slate-500">/ {cashCap}</span>
            </div>
            <span className="text-[10px] font-bold text-amber-900 block">
              Remittance {cashPercent}% used
            </span>
          </div>

          {/* Card 4: Rating & Fleet Level */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Rating</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-slate-900">{rating.toFixed(2)}</span>
              <span className="text-amber-500 text-sm">★★★★★</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 block">{tier}</span>
          </div>
        </div>

        {/* Live Shift Telemetry */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
          <span className="text-[11px] font-bold text-slate-700 block">Shift Telemetry</span>
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-500">Current Shift Duration</span>
            <strong className="text-slate-900 font-mono">{shiftDuration}</strong>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
            <span className="text-slate-500">Haversine GPS Distance</span>
            <strong className="text-slate-900 font-mono">{gpsDistanceKm.toFixed(2)} km</strong>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-500">Customer Tips Received</span>
            <strong className="text-emerald-600 font-bold">+₹{tipsReceived.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 font-mono">
          Trustit Fleet Telemetry Engine · Verified GPS Distance
        </p>
      </div>
    </div>
  );
}
