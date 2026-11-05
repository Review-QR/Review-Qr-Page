"use client";

import React, { useState, useRef } from "react";

interface Screen17Props {
  onBack?: () => void;
  onCallOps?: () => void;
}

export default function Screen17SafetySos({ onBack, onCallOps }: Screen17Props) {
  const [holding, setHolding] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = () => {
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setTriggered(true);
      setHolding(false);
    }, 1500);
  };

  const endHold = () => {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
            24x7 Rider Safety Shield
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Emergency Assistance &amp; SOS</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Accident, road dispute ya emergency ke waqt live location broadcast aur direct police help.
          </p>
        </div>

        {/* SOS Hold-to-Arm Hero Button */}
        <div className="mt-5 text-center space-y-3">
          <div
            onMouseDown={startHold}
            onMouseUp={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className={`w-36 h-36 mx-auto rounded-full flex flex-col items-center justify-center cursor-pointer select-none shadow-xl border-4 transition-transform active:scale-95 ${
              triggered
                ? "bg-red-700 border-red-900 text-white animate-bounce"
                : holding
                ? "bg-red-600 border-red-400 text-white scale-105"
                : "bg-red-500 hover:bg-red-600 border-red-300 text-white"
            }`}
          >
            <span className="text-3xl">🚨</span>
            <strong className="text-xl font-black tracking-wider mt-1">SOS</strong>
            <span className="text-[9px] font-bold uppercase tracking-widest text-red-100">
              {triggered ? "BROADCASTING" : holding ? "KEEP HOLDING..." : "PRESS & HOLD 1.5s"}
            </span>
          </div>

          <p className="text-[10px] text-slate-500">
            {triggered
              ? "🚨 Emergency Alert Active! Live GPS sent to Police 112 & Admin Desk."
              : "Pocket friction se bachne ke liye 1.5 seconds tak daba ke rakhein."}
          </p>
        </div>

        {/* Direct Action Emergency Grid */}
        <div className="mt-5 space-y-2 text-xs">
          <a
            href="tel:112"
            className="p-3 rounded-2xl bg-white border border-red-200 shadow-xs flex items-center justify-between hover:bg-red-50/50 transition block"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                📞
              </span>
              <div>
                <strong className="text-slate-900 font-bold block">Call UP Police (112)</strong>
                <span className="text-[10px] text-slate-500">Immediate emergency response</span>
              </div>
            </div>
            <span className="text-xs font-black text-red-600 font-mono">Dial 112 ➔</span>
          </a>

          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-[#0D47A1] flex items-center justify-center font-bold text-sm">
                🛡️
              </span>
              <div>
                <strong className="text-slate-900 font-bold block">Trustit Admin Fleet Hotline</strong>
                <span className="text-[10px] text-slate-500">Bahraich Ops Desk · Real-time monitoring</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onCallOps) onCallOps();
                else if (typeof window !== "undefined") window.location.href = "tel:+919415099999";
              }}
              className="text-xs font-bold text-[#0D47A1] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all"
            >
              Call Ops
            </button>
          </div>
        </div>
      </div>

      {/* Safety Policy Note */}
      <div className="pt-3 border-t border-slate-200 text-center">
        <span className="text-[10px] text-slate-400">
          Your live GPS coordinates are continuously monitored for fleet safety.
        </span>
      </div>
    </div>
  );
}
