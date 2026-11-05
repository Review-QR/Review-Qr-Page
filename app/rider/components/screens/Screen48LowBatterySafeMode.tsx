"use client";

import React, { useState } from "react";

interface Screen48Props {
  onBack?: () => void;
  onSendSmsBackup?: () => void;
  batteryLevelProp?: number;
}

export default function Screen48LowBatterySafeMode({
  onBack,
  onSendSmsBackup,
  batteryLevelProp = 13,
}: Screen48Props) {
  const [batteryLevel] = useState<number>(batteryLevelProp);
  const [isSmsSent, setIsSmsSent] = useState<boolean>(true);

  return (
    <div className="w-full min-h-full bg-[#000000] text-white flex flex-col justify-between p-4 sm:p-5 font-mono select-none overflow-y-auto pb-28">
      {/* High-Contrast Top Bar */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white text-xs hover:bg-white/20"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              CRITICAL BATTERY SAFE MODE
            </span>
            <h2 className="text-xs font-bold text-white mt-0.5">Ultra Power Saving ({batteryLevel}% Left)</h2>
          </div>
          <span className="text-xs font-bold text-red-400 font-mono">
            🪫 {batteryLevel}%
          </span>
        </div>

        {/* Dispatch Hub Alert Notification */}
        <div className="mt-4 p-3 rounded-xl border border-red-500/40 bg-red-950/30 text-red-200 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <strong className="text-white">Central Dispatch Hub Notified</strong>
          </div>
          <p className="text-[11px] text-red-300">
            Ops team knows your phone is at {batteryLevel}%. GPS throttle active to extend battery life by +35 mins.
          </p>
        </div>

        {/* Offline Emergency Delivery Sheet */}
        <div className="mt-4 bg-white/5 border border-white/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400">Offline Fallback Sheet</span>
            <span className="text-[10px] text-emerald-400 font-bold">Screenshot This Now</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Order ID:</span>
              <p className="text-sm font-black text-amber-300">#TR-4492 (Collect ₹340 COD)</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Customer Address:</span>
              <p className="font-bold text-white leading-snug">
                Riya Sharma · House 42/B, Civil Lines, Behind Peepal Tree (Opposite Primary School)
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Customer Phone (Backup):</span>
              <p className="text-sm font-bold text-emerald-300">9876543210</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Handover Secret OTP:</span>
              <p className="text-base font-black text-white tracking-widest bg-white/10 p-1.5 rounded text-center">
                4492
              </p>
            </div>
          </div>
        </div>

        {/* SMS Backup Status */}
        <div className="mt-3 p-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between text-xs">
          <span>📲 SMS Copy Sent to Your Phone</span>
          <span className="text-emerald-400 font-bold">{isSmsSent ? "✓ Received" : "Sending..."}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/20 space-y-2">
        <a
          href="tel:+919876543210"
          className="w-full py-3 rounded-xl bg-white text-black font-black text-xs hover:bg-slate-200 text-center flex items-center justify-center gap-1.5"
        >
          <span>📞 Direct Call Customer Before Phone Shuts Down</span>
        </a>
        <p className="text-center text-[10px] text-slate-500">
          Zero Failure Guarantee · Handover verified even with zero phone battery.
        </p>
      </div>
    </div>
  );
}
