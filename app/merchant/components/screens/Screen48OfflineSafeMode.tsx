"use client";

import React, { useState } from "react";

interface Screen48Props {
  onBack?: () => void;
}

export default function Screen48OfflineSafeMode({ onBack }: Screen48Props) {
  const [offlineSafeActive, setOfflineSafeActive] = useState(false);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
              GROUND ZERO FAILSAFE
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Store Offline Emergency Safe Mode
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

        {/* Emergency Pitch Card */}
        <div className="mt-2.5 bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 text-center shadow-xs space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl shadow-xs">
            ⚡
          </div>
          <h2 className="text-sm font-black text-slate-900">Internet / Power Blackout Protection</h2>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            If your cafe loses Wi-Fi connection, broadband fiber is cut, or there is an unannounced power outage in Civil Lines, activate Emergency Safe Mode.
          </p>
        </div>

        {/* Protection Protocols Checklist */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">
            What Happens When Activated:
          </span>

          <ul className="space-y-1.5 text-[11px] text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Zero Penalty:</strong> Pauses incoming orders immediately on consumer app to avoid unaccepted order auto-cancel penalties.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>SMS Notification:</strong> Owner mobile receives critical SMS with active order statuses.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span><strong>Rider Safeguard:</strong> Active riders on road are notified to deliver directly using customer phone numbers.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Big Action Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setOfflineSafeActive(!offlineSafeActive)}
          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 ${
            offlineSafeActive
              ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {offlineSafeActive ? (
            <span>🛑 EMERGENCY SAFE MODE ACTIVE (CLICK TO RESUME)</span>
          ) : (
            <span>⚡ ACTIVATE EMERGENCY SAFE MODE</span>
          )}
        </button>
      </div>
    </div>
  );
}
