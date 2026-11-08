"use client";

import React, { useState, useEffect } from "react";

interface Screen21Props {
  onAccept?: () => void;
  onDecline?: () => void;
}

export default function Screen21LockscreenOrderPop({
  onAccept,
  onDecline,
}: Screen21Props) {
  const [countdown, setCountdown] = useState<number>(29);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(true);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="w-full h-full bg-[#0F172A] flex flex-col justify-between p-4 sm:p-5 text-white font-sans relative overflow-hidden select-none">
      {/* Background Animated Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-96 h-96 rounded-full border-4 border-amber-400 animate-ping"></div>
        <div className="w-72 h-72 rounded-full border-4 border-blue-400 animate-pulse"></div>
      </div>

      {/* Lockscreen System Bar */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-[11px] font-black tracking-wider uppercase text-amber-400">
            LOCKSCREEN PRIORITY OVERLAY
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSirenActive(!isSirenActive)}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"
          >
            <span>{isSirenActive ? "🔊 100% Vol" : "🔈 Muted"}</span>
          </button>
          <span className="text-xs font-mono font-bold text-slate-400">12:44 PM</span>
        </div>
      </div>

      {/* Voice Alert Banner */}
      <div className="relative z-10 mt-3 bg-red-500/20 border border-red-500/40 rounded-xl p-2.5 flex items-center gap-2.5">
        <span className="text-xl animate-bounce">📢</span>
        <div>
          <p className="text-[11px] font-extrabold text-red-300">
            Audio Alert: &quot;New Order! Nearby Store — Guaranteed Earnings&quot;
          </p>
          <p className="text-[9px] text-slate-400">
            Screen Wakeup &amp; Media Volume Overridden (Dual-Tone 880Hz Siren)
          </p>
        </div>
      </div>

      {/* Center Radar Timer Ring */}
      <div className="relative z-10 my-auto text-center py-4">
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
          {/* Radial Circular Progress */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="62"
              stroke="#334155"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="62"
              stroke="#F59E0B"
              strokeWidth="10"
              strokeDasharray={390}
              strokeDashoffset={390 - (390 * countdown) / 30}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {countdown}s
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Remaining
            </span>
          </div>
        </div>

        {/* Payout & Store Card */}
        <div className="mt-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-left shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Guaranteed Pay: ₹45.00
            </span>
            <span className="text-xs font-bold text-slate-300">COD: ₹340.00</span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl shrink-0">
              🍔
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Verified Merchant Partner</h3>
              <p className="text-xs text-slate-300">Bahraich Commercial Center · Nearby</p>
              <p className="text-[11px] text-amber-300 font-medium mt-0.5">
                Drop: Customer Doorstep Destination
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lockscreen Action Buttons */}
      <div className="relative z-10 pt-3 border-t border-slate-700/60 space-y-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="w-1/3 py-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs hover:bg-slate-700 transition"
          >
            ✕ Pass Order
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-sm shadow-lg hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <span>Slide / Tap to Accept</span>
            <span>👉</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-500">
          Anti-Pocket Trigger Active · Swipe slider prevents accidental pocket clicks
        </p>
      </div>
    </div>
  );
}
