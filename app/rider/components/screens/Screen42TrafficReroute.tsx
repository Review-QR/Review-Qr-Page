"use client";

import React, { useState } from "react";

interface Screen42Props {
  onBack?: () => void;
  onAcceptReroute?: () => void;
  onStayOnCurrentRoute?: () => void;
}

export default function Screen42TrafficReroute({
  onBack,
  onAcceptReroute,
  onStayOnCurrentRoute,
}: Screen42Props) {
  const [selectedRoute, setSelectedRoute] = useState<"bypass" | "railway">("bypass");

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Smart Dynamic Routing
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Railway Halt Detected</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-rose-600 bg-rose-50 rounded-full py-0.5 border border-rose-200">
            🚦
          </span>
        </div>

        {/* Traffic Alert Banner */}
        <div className="mt-4 bg-gradient-to-r from-rose-700 to-red-800 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-200">Station Road Crossing</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black/30 text-white">
              Gate Closed 🚂
            </span>
          </div>
          <h3 className="text-sm font-black text-white mt-1">
            Zero Movement Detected for 6.2 Minutes
          </h3>
          <p className="text-xs text-rose-100 mt-1 leading-relaxed">
            Goods train crossing in progress. Staying on this road will cause 15+ minutes delay.
          </p>
        </div>

        {/* Route Alternatives Comparison */}
        <div className="mt-4 space-y-2.5">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Choose Your Route:
          </h4>

          {/* Option 1: Circuit House Bypass (Recommended) */}
          <button
            type="button"
            onClick={() => setSelectedRoute("bypass")}
            className={`w-full text-left p-3.5 rounded-2xl border-2 transition ${
              selectedRoute === "bypass"
                ? "bg-emerald-50 border-emerald-500 shadow-xs"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-600 text-white">
                  FASTEST · RECOMMENDED
                </span>
                <span className="text-xs font-bold text-emerald-800">Circuit House Bypass</span>
              </div>
              <span className="text-sm font-black font-mono text-emerald-700">9 Mins</span>
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
              <span>Distance: <strong>2.9 KM (+1.1 km extra)</strong></span>
              <span className="text-emerald-700 font-bold">🟢 Clear Traffic</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Saves ~9 minutes compared to waiting at the railway gate.
            </p>
          </button>

          {/* Option 2: Current Route (Wait at Gate) */}
          <button
            type="button"
            onClick={() => setSelectedRoute("railway")}
            className={`w-full text-left p-3.5 rounded-2xl border transition ${
              selectedRoute === "railway"
                ? "bg-slate-100 border-slate-500 shadow-xs"
                : "bg-white border-slate-200 text-slate-500"
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-800">Wait at Station Road Gate</span>
              <span className="text-sm font-black font-mono text-red-600">18+ Mins</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>Distance: 1.8 KM (Shortest)</span>
              <span className="text-red-600 font-bold">🔴 Heavy Jam</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              High risk of customer complaint and late penalty deduction.
            </p>
          </button>
        </div>

        {/* Customer Auto-Notification Pill */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-900 flex items-center gap-2">
          <span>📲</span>
          <span>
            Customer ETA automatically updated to <strong>1:32 PM</strong> so you don&apos;t get penalized.
          </span>
        </div>
      </div>

      {/* Footer Confirm */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={selectedRoute === "bypass" ? onAcceptReroute : onStayOnCurrentRoute}
          className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
        >
          <span>{selectedRoute === "bypass" ? "Reroute via Circuit House (Save 9 Mins)" : "Continue Waiting at Gate"}</span>
          <span>➔</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Smart Reroute Engine · Live Bahraich Traffic Telemetry
        </p>
      </div>
    </div>
  );
}
