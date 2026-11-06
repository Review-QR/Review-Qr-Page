"use client";

import React, { useState, useEffect } from "react";

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
  const [vehicleMode, setVehicleMode] = useState<"bike" | "cab">("bike");
  const [progress, setProgress] = useState<number>(45); // percentage along the route (0 - 100)
  const [speed, setSpeed] = useState<number>(28);

  // Subtle speed & position animation to simulate street movement
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 88 ? 30 : p + 2));
      setSpeed((s) => Math.floor(26 + Math.random() * 8));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchGoogleMaps = () => {
    if (onOpenGoogleMaps) {
      onOpenGoogleMaps();
      return;
    }
    // Deep-link to native Google Maps navigation with two-wheeler mode
    const origin = "27.5745,81.5965"; // Deepak Sweets & Bakers, Civil Lines
    const destination = "27.5760,81.5980"; // Customer Home, Peepal Chauraha
    const travelmode = vehicleMode === "bike" ? "two_wheeler" : "driving";
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelmode}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="w-full flex-1 bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-3 select-none font-sans min-h-[520px]">
      {/* 1. Header Bar: LIVE GPS TRACKING & Telemetry Strip (Light & Fresh Option A) */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  LIVE GPS TRACKING
                </span>
                <span className="text-[10px] text-slate-500 font-hindi">(बहराइच)</span>
              </div>
            </div>
          </div>

          {/* Speed & Distance Pill */}
          <div className="flex items-center gap-2 bg-white border border-slate-200/90 px-2.5 py-1 rounded-full text-[11px] font-mono shadow-xs">
            <span className="text-amber-600 font-bold">⚡ {speed} km/h</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700 font-bold">1.1 km</span>
          </div>
        </div>

        {/* Vehicle Switcher: Bike vs Cab (Requested by user) */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fleet Mode</span>
          <div className="flex items-center gap-1 bg-slate-200/70 border border-slate-300/60 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setVehicleMode("bike")}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition ${
                vehicleMode === "bike"
                  ? "bg-white text-emerald-800 font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏍️ Bike (2W)
            </button>
            <button
              type="button"
              onClick={() => setVehicleMode("cab")}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition ${
                vehicleMode === "cab"
                  ? "bg-white text-amber-700 font-black shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🚖 Cab (4W)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Street Route Viewport (Ultra-Modern Light Google Maps / Swiggy Style) */}
      <div className="relative my-2 h-[220px] rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40 border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between p-3">
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>

        {/* Curved Street Route SVG */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 320 200">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Road Base Underlay */}
          <path
            d="M 45 155 Q 110 160, 160 115 T 275 45"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Active Street Route with Pulse */}
          <path
            d="M 45 155 Q 110 160, 160 115 T 275 45"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="6 3"
          />
        </svg>

        {/* Origin Store Pin: Deepak Sweets & Bakers (Civil Lines, Bahraich) */}
        <div className="relative z-10 self-start mt-auto flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white border border-blue-300 shadow-sm flex items-center justify-center text-sm">
            🏬
          </div>
          <div>
            <strong className="text-[11px] font-black text-slate-900 block leading-tight">
              Deepak Sweets &amp; Bakers
            </strong>
            <span className="text-[9px] text-blue-700 font-semibold block">Civil Lines, Bahraich</span>
          </div>
        </div>

        {/* Dynamic Moving Vehicle Pin (Bike / Cab) */}
        <div
          className="absolute z-20 pointer-events-none flex flex-col items-center transition-all duration-1000 ease-out"
          style={{
            left: `${progress}%`,
            top: `${Math.max(25, 80 - progress * 0.65)}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            {/* Glowing Pulse Ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40"></div>
            <div className="relative w-10 h-10 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-lg">
              {vehicleMode === "bike" ? "🏍️" : "🚖"}
            </div>
          </div>
          <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-white text-emerald-800 border border-emerald-300 shadow-sm">
            Amit (6 mins)
          </span>
        </div>

        {/* Destination Pin: Customer Home (Peepal Chauraha) */}
        <div className="relative z-10 self-end mb-auto flex items-center gap-2 text-right">
          <div>
            <strong className="text-[11px] font-black text-amber-800 block leading-tight">
              Customer Home
            </strong>
            <span className="text-[9px] text-slate-500 font-medium block">Peepal Chauraha</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white border border-amber-400 shadow-sm flex items-center justify-center text-sm">
            🏠
          </div>
        </div>

        {/* 4-Step Progress Ribbon (Matching Customer App Tracking) */}
        <div className="relative z-10 mt-auto pt-2 border-t border-slate-200">
          <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold">
            <div className="text-emerald-700 border-t-2 border-emerald-600 pt-0.5">1. Placed</div>
            <div className="text-emerald-700 border-t-2 border-emerald-600 pt-0.5">2. Packed</div>
            <div className="text-emerald-800 font-black border-t-2 border-emerald-600 pt-0.5 flex items-center justify-center gap-0.5">
              <span>3. On Road</span>
              <span>🛵</span>
            </div>
            <div className="text-slate-400 border-t-2 border-slate-300 pt-0.5">4. Doorstep</div>
          </div>
        </div>
      </div>

      {/* 3. Action Deck: Google Maps Launcher & Road Assist Pills */}
      <div className="space-y-2">
        {/* Prominent Google Maps 1-Tap Launcher Button (Ultra-Attractive Modern Blue/Indigo 1-Line Design) */}
        <button
          type="button"
          onClick={handleLaunchGoogleMaps}
          className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[11px] shadow-sm flex items-center justify-between whitespace-nowrap active:scale-[0.99] transition border border-blue-400/30"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm leading-none shrink-0">🗺️</span>
            <span className="truncate">Open in Google Maps (गूगल मैप्स में खोलें)</span>
          </div>
          <span className="text-[9.5px] bg-white/20 text-white px-2 py-0.5 rounded font-mono shrink-0 ml-2 tracking-wide uppercase">
            2W Navigation ➔
          </span>
        </button>

        {/* 4 Road Assist Pills */}
        <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold">
          <button
            type="button"
            onClick={onViewLandmarks}
            className="py-1.5 px-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-center transition shadow-xs"
          >
            📍 Gate Clue
          </button>
          <button
            type="button"
            onClick={onTrafficReroute}
            className="py-1.5 px-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-center transition shadow-xs"
          >
            🚆 Reroute
          </button>
          <button
            type="button"
            onClick={onInAppChat}
            className="py-1.5 px-1 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-center transition shadow-xs"
          >
            💬 Chat
          </button>
          <button
            type="button"
            onClick={onLowBattery}
            className="py-1.5 px-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-center transition shadow-xs"
          >
            🪫 Safe
          </button>
        </div>

        {/* Slim Primary CTA: Arrived at Doorstep */}
        <button
          type="button"
          onClick={onArrivedAtLocation}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] transition"
        >
          <span>I Have Arrived at Doorstep</span>
          <span>🏁</span>
        </button>
      </div>
    </div>
  );
}
