"use client";

import React, { useState } from "react";

interface ScreenS02Props {
  onBack?: () => void;
  onCallNext?: () => void;
}

export default function ScreenS02LiveChairTokenQueue({
  onBack,
  onCallNext,
}: ScreenS02Props) {
  const [calledNotice, setCalledNotice] = useState(false);

  const chairs = [
    { chair: "Chair 1 (Men Haircut)", stylist: "Rohit", client: "Vikram Chauhan", service: "Fade Cut + Beard Styling", timeLeft: "08 mins" },
    { chair: "Chair 2 (Beard Station)", stylist: "Dinesh", client: "Siddharth Roy", service: "Charcoal Face D-Tan", timeLeft: "14 mins" },
    { chair: "Chair 3 (Styling)", stylist: "Ravi", client: "Harsh Vardhan", service: "Hair Wash & Setting", timeLeft: "Ready" },
  ];

  const waitingTokens = [
    { token: "Token #14", name: "Ankit Awasthi", service: "Executive Haircut", wait: "Est. 10 Mins" },
    { token: "Token #15", name: "Gaurav Singh", service: "Beard Trim & Head Massage", wait: "Est. 22 Mins" },
  ];

  const handleCall = () => {
    setCalledNotice(true);
    setTimeout(() => {
      setCalledNotice(false);
      onCallNext?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
              LOUNGE TOKEN DISPATCH
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Live Chairs &amp; Token Station
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Active Chairs */}
        <div className="mt-2.5 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Occupied Styling Chairs (3 Busy)
          </span>

          {chairs.map((c, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">{c.chair}</span>
                <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                  ⏳ {c.timeLeft}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">{c.client}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Stylist: <strong>{c.stylist}</strong></span>
                <span className="text-rose-700 font-semibold">{c.service}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Waiting Lounge Queue */}
        <div className="mt-3 bg-amber-50/70 border border-amber-300 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🛋️</span> Waiting in Lounge (2 Tokens)
            </span>
            <span className="text-[9px] font-bold bg-white text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              Chime Bell Active
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {waitingTokens.map((w, i) => (
              <div
                key={i}
                className="bg-white border border-amber-200 rounded-xl p-2 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-amber-800 mr-2">{w.token}</span>
                  <span className="font-bold text-slate-900">{w.name}</span>
                  <span className="text-[10px] text-slate-400 block">{w.service}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{w.wait}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Call Next */}
      <div className="pt-2">
        {calledNotice ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            🔔 Token #14 Chime Triggered! Displayed on Lounge Screen.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCall}
            className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>🔔 CALL NEXT TOKEN (#14) TO CHAIR 3</span>
          </button>
        )}
      </div>
    </div>
  );
}
