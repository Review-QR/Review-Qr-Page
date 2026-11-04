"use client";

import React, { useState, useEffect } from "react";
import type { RiderRemoteConfig } from "@/lib/hyperlocal/remote-config";

interface Screen07Props {
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
  isOnlineProp = true,
  cashInHandProp = 680,
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

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div className="space-y-3">
        {/* Top Rider Cockpit Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0D47A1] text-white flex items-center justify-center font-black text-sm shadow-sm">
              AS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <strong className="text-xs font-black text-slate-900">Arjun Singh</strong>
                <span className="text-emerald-600 text-xs font-bold">✓</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">UP 40 AB 2345 · Pulsar 150</span>
            </div>
          </div>

          {/* Duty Switch Button (Trust Navy when ON) */}
          <button
            type="button"
            onClick={toggleDuty}
            className={`py-1.5 px-3 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
              isOnline
                ? "bg-[#0D47A1] text-white hover:bg-[#082b66]"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : "bg-slate-400"}`}></span>
            <span>{isOnline ? "ONLINE DUTY" : "GO ONLINE"}</span>
          </button>
        </div>

        {/* ── OTA Real-Time Admin Broadcast Ticker ── */}
        {remoteConfig?.adminBroadcastTicker?.enabled && (
          <div
            onClick={() => {
              if (remoteConfig.adminBroadcastTicker.targetScreenId && onOpenTargetScreen) {
                onOpenTargetScreen(remoteConfig.adminBroadcastTicker.targetScreenId);
              }
            }}
            className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-between shadow-xs cursor-pointer hover:brightness-105 transition border border-amber-400"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm shrink-0">📢</span>
              <p className="text-[11px] font-black truncate leading-tight">
                {remoteConfig.adminBroadcastTicker.message}
              </p>
            </div>
            {remoteConfig.adminBroadcastTicker.actionLabel && (
              <span className="shrink-0 text-[10px] font-black bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md ml-2 uppercase">
                {remoteConfig.adminBroadcastTicker.actionLabel} ➔
              </span>
            )}
          </div>
        )}

        {/* Cash Ceiling Breach Warning (Zero Dummy Clicks) */}
        {isCeilingBreached && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center justify-between">
            <div>
              <strong className="text-[11px] font-black block">⚠️ Cash Limit Exceeded</strong>
              <span className="text-[10px] text-rose-700">
                ₹{cashInHandProp} collected (Limit: ₹{cashCeilingProp}). Duty locked.
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

        {/* Live Shift Location & GPS Anti-Spoof Bar */}
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 text-sm">📍</span>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Hub Zone</span>
              <strong className="text-slate-900 text-[11px] block">Civil Lines, Bahraich (UP 40)</strong>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              GPS ±{gpsAccuracy}m (Verified)
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Live Dispatch Radar</span>
          </div>
        </div>

        {/* Shift Stopwatch & Cash Ceiling Metric Cards */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenScorecard}
            className="text-left bg-white border border-slate-200 rounded-2xl p-3 shadow-xs hover:border-blue-400 transition"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shift Stopwatch</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-black font-mono text-slate-900">03:42:15</span>
              <span className="text-[9px] font-bold text-emerald-600">Active</span>
            </div>
          </button>
          <button
            type="button"
            onClick={onOpenCeiling}
            className={`text-left rounded-2xl p-3 shadow-xs transition border ${
              isCeilingBreached
                ? "bg-rose-50 border-rose-300"
                : "bg-white border-slate-200 hover:border-amber-400"
            }`}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cash in Hand</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-base font-black font-mono ${isCeilingBreached ? "text-rose-700" : "text-amber-700"}`}>
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
            className="flex-1 py-1.5 px-2 bg-blue-50 text-[#0D47A1] rounded-xl border border-blue-100 hover:bg-blue-100 text-center transition"
          >
            📅 Book Slots
          </button>
          <button
            type="button"
            onClick={onOpenHeatmap}
            className="flex-1 py-1.5 px-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 hover:bg-purple-100 text-center transition"
          >
            🔥 Heatmap
          </button>
          <button
            type="button"
            onClick={onOpenSos}
            className="py-1.5 px-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-100 text-center transition"
          >
            🛡️ SOS
          </button>
        </div>

        {/* ── OTA Dynamic Action Banner (e.g., Target Challenge) ── */}
        {remoteConfig?.dynamicActionBanner?.enabled && (
          <div
            onClick={() => {
              if (remoteConfig.dynamicActionBanner?.targetScreenId && onOpenTargetScreen) {
                onOpenTargetScreen(remoteConfig.dynamicActionBanner.targetScreenId);
              }
            }}
            className="p-3 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shadow-md cursor-pointer hover:brightness-110 transition border border-blue-700"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black">{remoteConfig.dynamicActionBanner.title}</span>
                {remoteConfig.dynamicActionBanner.badgeText && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                    {remoteConfig.dynamicActionBanner.badgeText}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-blue-200">{remoteConfig.dynamicActionBanner.subtitle}</p>
            </div>
            <span className="px-2 py-1 rounded-lg bg-white/20 text-white text-[10px] font-black shrink-0">
              {remoteConfig.dynamicActionBanner.ctaLabel} ➔
            </span>
          </div>
        )}

        {/* Concentric Radar Live Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-2.5">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-60"></div>
            <div className="absolute w-12 h-12 rounded-full bg-blue-200/50"></div>
            <div className="relative w-10 h-10 rounded-full bg-[#0D47A1] text-white flex items-center justify-center text-lg shadow-md">
              🛵
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-900">Proximity Radar Active (0–3.5 km)</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Listening for dispatch requests across Bahraich food &amp; grocery hubs.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenRadar}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
          >
            <span>⚡ Test 30s Incoming Order Radar (🚨 Siren)</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-around text-[10px] font-bold text-slate-500">
        <span className="text-[#0D47A1] font-black">🛵 Cockpit</span>
        <button type="button" onClick={onOpenPassbook} className="hover:text-slate-900">💰 Passbook</button>
        <button type="button" onClick={onOpenScorecard} className="hover:text-slate-900">📊 Scorecard</button>
        <button type="button" onClick={onOpenProfile} className="hover:text-slate-900">👤 Profile</button>
      </div>
    </div>
  );
}
