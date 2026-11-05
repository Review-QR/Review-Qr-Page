"use client";

import React, { useState, useEffect, useRef } from "react";
import type { RiderRemoteConfig } from "@/lib/hyperlocal/remote-config";
import { riderAudio } from "@/lib/audio/rider-siren";

interface Screen07Props {
  riderProp?: {
    full_name?: string;
    vehicle_number?: string;
    vehicle_type?: string;
    profile_image_url?: string | null;
  };
  onGoOnline?: (online: boolean) => void;
  onOpenRadar?: () => void;
  onOpenPassbook?: () => void;
  onOpenScorecard?: () => void;
  onOpenCeiling?: () => void;
  onOpenShiftBooking?: () => void;
  onOpenHeatmap?: () => void;
  onOpenProfile?: () => void;
  onOpenSos?: () => void;
  onOpenRemit?: () => void;
  onOpenTargetScreen?: (screenId: number) => void;
  isOnlineProp?: boolean;
  cashInHandProp?: number;
  cashCeilingProp?: number;
  remoteConfig?: RiderRemoteConfig;
}

export default function Screen07DutyCockpit({
  riderProp,
  onGoOnline,
  onOpenRadar,
  onOpenPassbook,
  onOpenScorecard,
  onOpenCeiling,
  onOpenShiftBooking,
  onOpenHeatmap,
  onOpenProfile,
  onOpenSos,
  onOpenRemit,
  onOpenTargetScreen,
  isOnlineProp = false,
  cashInHandProp = 0,
  cashCeilingProp = 1500,
  remoteConfig,
}: Screen07Props) {
  const [isOnline, setIsOnline] = useState(isOnlineProp);

  useEffect(() => {
    setIsOnline(isOnlineProp);
  }, [isOnlineProp]);

  // Direct 1-tap Duty Toggle
  const toggleDutyTap = () => {
    const next = !isOnline;
    setIsOnline(next);
    if (next) riderAudio.playCashChime();
    onGoOnline?.(next);
  };

  const isCeilingBreached = cashInHandProp >= cashCeilingProp;
  const riderName = riderProp?.full_name?.trim() || "Delivery Partner";
  const vehicleText = riderProp?.vehicle_number?.trim()
    ? `${riderProp.vehicle_number} · SCOOTER`
    : "UP 40 BV 1001 · SCOOTER";
  const initials = riderName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TP";

  return (
    <div className="w-full flex-1 bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none pb-4">
      <div className="space-y-2.5">
        {/* Top Rider Cockpit Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D47A1] to-[#1565C0] text-white flex items-center justify-center font-black text-xs shadow-2xs overflow-hidden shrink-0">
              {riderProp?.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={riderProp.profile_image_url} alt="Selfie" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <strong className="text-xs font-black text-slate-900 leading-tight">{riderName}</strong>
                <span className="text-emerald-600 text-xs font-bold leading-none">✓</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono block leading-none">{vehicleText}</span>
            </div>
          </div>

          {/* Real-time Duty Status Pill */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition ${
              isOnline
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs"
                : "bg-rose-100 text-rose-800 border border-rose-200"
            }`}
          >
            {isOnline ? "🟢 ON DUTY" : "🔴 OFF DUTY"}
          </span>
        </div>

        {/* 1. COMPACT SLEEK 1-TAP DUTY DONGLE */}
        <div
          className={`border rounded-xl p-2.5 shadow-2xs transition-all ${
            isOnline
              ? "bg-emerald-950/20 border-emerald-500/40"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isOnline ? "bg-emerald-500 animate-ping" : "bg-rose-500"
                }`}
              ></span>
              <strong className="text-xs font-black text-slate-900 leading-tight">
                {isOnline ? "DUTY ON · Active for Orders" : "DUTY OFF · Offline"}
              </strong>
            </div>

            <button
              type="button"
              onClick={toggleDutyTap}
              className={`px-3 py-1 rounded-full font-black text-[11px] transition-all active:scale-95 shadow-2xs flex items-center gap-1.5 ${
                isOnline
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
              }`}
            >
              <span>{isOnline ? "🛑 Go Offline" : "⚡ Go Online"}</span>
            </button>
          </div>
        </div>

        {/* Cash Ceiling Warning (Blinkit Escrow Safety) */}
        {isCeilingBreached && (
          <div className="p-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center justify-between">
            <div>
              <strong className="text-[11px] font-black block">⚠️ Cash Limit Exceeded</strong>
              <span className="text-[10px] text-rose-700">
                ₹{cashInHandProp} collected (Limit: ₹{cashCeilingProp}).
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenRemit}
              className="px-2 py-1 bg-rose-600 text-white font-black text-[10px] rounded-lg hover:bg-rose-700 transition shrink-0 shadow-2xs"
            >
              Deposit Cash ➔
            </button>
          </div>
        )}

        {/* Active Hub Zone & Telemetry Strip */}
        <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#0D47A1] text-sm">📍</span>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block leading-none">Active Zone</span>
              <strong className="text-slate-900 text-[11px] block leading-tight">Civil Lines, Bahraich (UP 40)</strong>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              GPS ±4.2m
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Live Telemetry</span>
          </div>
        </div>

        {/* Shift Stopwatch & Cash Ceiling Metric Cards (Blinkit Clean Surfaces) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenScorecard}
            className="text-left bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs hover:border-blue-400 transition"
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Shift Stopwatch</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-black font-mono text-slate-900">03:42:15</span>
              <span className="text-[9px] font-bold text-emerald-600">Active</span>
            </div>
          </button>
          <button
            type="button"
            onClick={onOpenCeiling}
            className={`text-left rounded-xl p-2.5 shadow-2xs transition border ${
              isCeilingBreached
                ? "bg-rose-50 border-rose-300"
                : "bg-white border-slate-200 hover:border-amber-400"
            }`}
          >
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cash in Hand</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-sm font-black font-mono ${isCeilingBreached ? "text-rose-700" : "text-amber-700"}`}>
                ₹{cashInHandProp}
              </span>
              <span className="text-[9px] text-slate-400">/ ₹{cashCeilingProp}</span>
            </div>
          </button>
        </div>

        {/* Quick Action Badges */}
        <div className="flex items-center justify-between gap-1.5 text-[10px] font-bold">
          <button
            type="button"
            onClick={onOpenShiftBooking}
            className="flex-1 py-1.5 px-2 bg-blue-50 text-[#0D47A1] rounded-lg border border-blue-100 hover:bg-blue-100 text-center transition"
          >
            📅 Book Slots
          </button>
          <button
            type="button"
            onClick={onOpenHeatmap}
            className="flex-1 py-1.5 px-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100 text-center transition"
          >
            🔥 Heatmap
          </button>
          <button
            type="button"
            onClick={onOpenSos}
            className="py-1.5 px-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-100 text-center transition"
          >
            🛡️ SOS
          </button>
        </div>

        {/* Concentric Proximity Radar Card (Zomato Dispatch Sound Radar) */}
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs text-center space-y-1.5">
          <div className="relative w-10 h-10 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-60"></div>
            <div className="absolute w-8 h-8 rounded-full bg-blue-200/50"></div>
            <div className="relative w-7 h-7 rounded-full bg-[#0D47A1] text-white flex items-center justify-center text-xs shadow-2xs">
              🛵
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-900 leading-tight">Proximity Radar Active (0–3.5 km)</h3>
            <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">
              Listening for incoming dispatches across Bahraich food &amp; grocery hubs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
