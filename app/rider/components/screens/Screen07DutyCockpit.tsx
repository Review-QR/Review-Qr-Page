"use client";

import React, { useState, useEffect } from "react";
import type { RiderRemoteConfig } from "@/lib/hyperlocal/remote-config";

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
  const [gpsAccuracy] = useState(4.2); // meters

  useEffect(() => {
    setIsOnline(isOnlineProp);
  }, [isOnlineProp]);

  const toggleDuty = () => {
    const next = !isOnline;
    setIsOnline(next);
    onGoOnline?.(next);
  };

  const isCeilingBreached = cashInHandProp >= cashCeilingProp;
  const riderName = riderProp?.full_name?.trim() || "New Delivery Partner";
  const vehicleText = riderProp?.vehicle_number?.trim()
    ? `${riderProp.vehicle_number} · ${(riderProp.vehicle_type || "bike").toUpperCase()}`
    : "UP 40 · Bahraich Fleet";
  const initials = riderName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TP";

  return (
    <div className="w-full h-full max-h-[600px] bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none">
      <div className="space-y-2">
        {/* Top Rider Cockpit Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center font-black text-xs shadow-2xs overflow-hidden shrink-0">
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
              <span className="text-[10px] text-slate-500 font-mono block leading-tight">{vehicleText}</span>
            </div>
          </div>

          {/* Duty Switch Button (Trust Navy #0D47A1 when ON) */}
          <button
            type="button"
            onClick={toggleDuty}
            className={`py-1.5 px-3 rounded-full text-xs font-black flex items-center gap-1.5 shadow-2xs transition active:scale-95 ${
              isOnline
                ? "bg-[#0D47A1] text-white hover:bg-[#082b66]"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : "bg-slate-400"}`}></span>
            <span>{isOnline ? "ONLINE DUTY" : "GO ONLINE"}</span>
          </button>
        </div>

        {/* Cash Ceiling Breach Warning */}
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
              className="px-2 py-1 bg-rose-600 text-white font-black text-[10px] rounded-lg hover:bg-rose-700 transition shrink-0"
            >
              Deposit Cash ➔
            </button>
          </div>
        )}

        {/* Live Hub Location & GPS Anti-Spoof Bar */}
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
              GPS ±{gpsAccuracy}m
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Live Telemetry</span>
          </div>
        </div>

        {/* Shift Stopwatch & Cash Ceiling Metric Cards */}
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

        {/* Quick Hub Badges */}
        <div className="flex items-center justify-between gap-1.5 text-[10px] font-bold">
          <button
            type="button"
            onClick={onOpenShiftBooking}
            className="flex-1 py-1 px-2 bg-blue-50 text-[#0D47A1] rounded-lg border border-blue-100 hover:bg-blue-100 text-center transition"
          >
            📅 Book Slots
          </button>
          <button
            type="button"
            onClick={onOpenHeatmap}
            className="flex-1 py-1 px-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 hover:bg-purple-100 text-center transition"
          >
            🔥 Heatmap
          </button>
          <button
            type="button"
            onClick={onOpenSos}
            className="py-1 px-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-100 text-center transition"
          >
            🛡️ SOS
          </button>
        </div>

        {/* Concentric Proximity Radar Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs text-center space-y-2">
          <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-60"></div>
            <div className="absolute w-9 h-9 rounded-full bg-blue-200/50"></div>
            <div className="relative w-8 h-8 rounded-full bg-[#0D47A1] text-white flex items-center justify-center text-sm shadow-2xs">
              🛵
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-900 leading-tight">Proximity Radar Active (0–3.5 km)</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Listening for incoming dispatches across Bahraich food &amp; grocery hubs.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenRadar}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-98"
          >
            <span>⚡ Test 30s Incoming Order Radar (🚨 Siren)</span>
          </button>
        </div>
      </div>

      {/* Docked 4-Tab Bottom Bar */}
      <div className="pt-2 border-t border-slate-200 flex items-center justify-around text-[10px] font-bold text-slate-500">
        <span className="text-[#0D47A1] font-black flex items-center gap-1">
          <span>🛵</span>
          <span>Cockpit</span>
        </span>
        <button type="button" onClick={onOpenPassbook} className="hover:text-slate-900 flex items-center gap-1">
          <span>💰</span>
          <span>Passbook</span>
        </button>
        <button type="button" onClick={onOpenScorecard} className="hover:text-slate-900 flex items-center gap-1">
          <span>📊</span>
          <span>Scorecard</span>
        </button>
        <button type="button" onClick={onOpenProfile} className="hover:text-slate-900 flex items-center gap-1">
          <span>👤</span>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}
