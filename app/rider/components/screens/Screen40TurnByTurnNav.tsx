"use client";

import React, { useState } from "react";

interface Screen40Props {
  onBack?: () => void;
  onOpenGoogleMaps?: () => void;
  onArrivedAtLocation?: () => void;
  onViewLandmarks?: () => void;
  onTrafficReroute?: () => void;
  onInAppChat?: () => void;
  onPolicePass?: () => void;
  onLowBattery?: () => void;
}

export default function Screen40TurnByTurnNav({
  onBack,
  onOpenGoogleMaps,
  onArrivedAtLocation,
  onViewLandmarks,
  onTrafficReroute,
  onInAppChat,
  onPolicePass,
  onLowBattery,
}: Screen40Props) {
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [speed] = useState<number>(34);

  return (
    <div
      className={`w-full h-full flex flex-col justify-between font-sans transition-colors duration-300 ${
        isNightMode ? "bg-[#090D16] text-white" : "bg-[#FAF8FF] text-[#0F172A]"
      }`}
    >
      {/* 1. Top Green Maneuver Card (Turn-by-Turn Header) */}
      <div className="p-3 sm:p-4 pb-0 z-20">
        <div className="bg-[#15803D] text-white rounded-2xl p-3.5 shadow-lg flex items-center justify-between border border-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl font-black shrink-0">
              ↱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-emerald-200 uppercase tracking-wider">
                  In 200 Meters
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/20 text-white">
                  Kachehri Road
                </span>
              </div>
              <h3 className="text-sm font-black text-white leading-tight mt-0.5">
                Turn Right at Peepal Tiraha (पीपल तिराहे से दाएं मुड़ें)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsVoiceMuted(!isVoiceMuted)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs hover:bg-white/30 shrink-0"
            title="Toggle Voice Navigation"
          >
            {isVoiceMuted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* 2. Interactive Map Viewport Simulator */}
      <div className="relative flex-1 m-3 sm:m-4 my-2 rounded-3xl overflow-hidden border-2 border-slate-700/30 shadow-inner flex flex-col justify-between p-3 select-none">
        {/* Simulated Map Canvas Background */}
        <div
          className={`absolute inset-0 ${
            isNightMode
              ? "bg-[#0B132B] opacity-95"
              : "bg-[#E2E8F0] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px]"
          }`}
        >
          {/* Simulated Street Polyline */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none">
            {/* Street Lines */}
            <path
              d="M 60 480 Q 120 320, 180 260 T 260 120"
              fill="none"
              stroke={isNightMode ? "#1E293B" : "#CBD5E1"}
              strokeWidth="24"
              strokeLinecap="round"
            />
            {/* Active Route Polyline (Green = Clear Traffic) */}
            <path
              d="M 60 480 Q 120 320, 180 260 T 260 120"
              fill="none"
              stroke="#22C55E"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Top Controls Overlay on Map */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Speedometer Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl border shadow-md flex items-center gap-2 ${
              isNightMode ? "bg-slate-900/90 border-slate-700 text-white" : "bg-white/95 border-slate-200 text-slate-900"
            }`}
          >
            <div className="text-center">
              <span className="text-base font-black font-mono leading-none block">{speed}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">KM/H</span>
            </div>
            <div className="h-5 w-px bg-slate-300"></div>
            <span className="text-[10px] font-bold text-emerald-600">Limit 40</span>
          </div>

          {/* Quick Map Action Pills */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsNightMode(!isNightMode)}
              className={`p-2 rounded-xl text-xs font-bold border shadow-xs transition ${
                isNightMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white"
              }`}
              title="Toggle Night / Day OLED Map"
            >
              {isNightMode ? "☀️ Day" : "🌙 OLED"}
            </button>
            <button
              type="button"
              onClick={onOpenGoogleMaps}
              className="px-2.5 py-1.5 rounded-xl bg-white/95 text-slate-800 text-[11px] font-bold border border-slate-200 shadow-xs hover:bg-white flex items-center gap-1"
            >
              <span>🗺️ Google Maps</span>
            </button>
          </div>
        </div>

        {/* Moving Motorcycle Marker on Center */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-[#0D47A1] text-white border-2 border-white shadow-2xl flex items-center justify-center text-xl animate-bounce">
            🛵
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-black/70 text-white backdrop-blur-xs">
            Arjun (You)
          </span>
        </div>

        {/* Floating Alleyway Warning Banner */}
        <div className="relative z-10 space-y-1.5">
          <button
            type="button"
            onClick={onViewLandmarks}
            className="w-full p-2.5 rounded-xl bg-amber-500/95 text-white font-black text-xs shadow-md flex items-center justify-between border border-amber-400 hover:brightness-105 transition"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <div className="text-left">
                <span className="block text-[11px]">Approaching Narrow Alleyway!</span>
                <span className="text-[9px] text-amber-100 font-medium">Tap to view Customer Gate Photo &amp; Audio Clue</span>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">View ➔</span>
          </button>

          {/* Quick Road Assist Hub */}
          <div className="grid grid-cols-4 gap-1 text-[9px] font-bold">
            <button
              type="button"
              onClick={onTrafficReroute}
              className="py-1 px-1 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs border border-white/20 text-center"
            >
              🚆 Reroute (S42)
            </button>
            <button
              type="button"
              onClick={onInAppChat}
              className="py-1 px-1 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs border border-white/20 text-center"
            >
              💬 Chat (S44)
            </button>
            <button
              type="button"
              onClick={onPolicePass}
              className="py-1 px-1 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs border border-white/20 text-center"
            >
              🪪 Pass (S43)
            </button>
            <button
              type="button"
              onClick={onLowBattery}
              className="py-1 px-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-lg backdrop-blur-xs border border-red-500/30 text-center"
            >
              🪫 Safe (S48)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom ETA & Handover Action Cockpit */}
      <div
        className={`p-3 sm:p-4 pt-2 border-t transition-colors ${
          isNightMode ? "bg-[#090D16] border-slate-800" : "bg-white border-slate-200"
        } space-y-2.5`}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-emerald-600 font-mono">1.8 KM · 6 Mins</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Smooth Traffic
              </span>
            </div>
            <p className={`text-xs font-bold mt-0.5 ${isNightMode ? "text-slate-300" : "text-slate-700"}`}>
              Drop: Riya Sharma · Civil Lines, Bahraich
            </p>
          </div>
          <a
            href="tel:+919876543210"
            className="px-3 py-2 rounded-xl bg-blue-50 text-[#0D47A1] font-bold text-xs border border-blue-200 flex items-center gap-1.5"
          >
            <span>📞 Call</span>
          </a>
        </div>

        {/* Slide to Arrived Slider */}
        <button
          type="button"
          onClick={onArrivedAtLocation}
          className="w-full py-3.5 rounded-2xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <span>I Have Arrived at Doorstep</span>
          <span>🏁</span>
        </button>
      </div>
    </div>
  );
}
