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
    <div className="w-full flex-1 bg-[#0A0F1D] text-white flex flex-col justify-between p-3 select-none font-sans min-h-[520px]">
      {/* 1. Header Bar: LIVE GPS TRACKING & Telemetry Strip */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  LIVE GPS TRACKING
                </span>
                <span className="text-[10px] text-slate-400 font-hindi">(बहराइच)</span>
              </div>
            </div>
          </div>

          {/* Speed & Distance Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-full text-[11px] font-mono">
            <span className="text-amber-400 font-bold">⚡ {speed} km/h</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-bold">1.1 km</span>
          </div>
        </div>

        {/* Vehicle Switcher: Bike vs Cab (Requested by user) */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Fleet Mode</span>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setVehicleMode("bike")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                vehicleMode === "bike"
                  ? "bg-emerald-500 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🏍️ Bike (2W)
            </button>
            <button
              type="button"
              onClick={() => setVehicleMode("cab")}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                vehicleMode === "cab"
                  ? "bg-amber-400 text-slate-950 font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🚖 Cab (4W)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Street Route Viewport (Bahraich In-App Map) */}
      <div className="relative my-2 h-[220px] rounded-2xl bg-[#0F172A] border border-slate-800 overflow-hidden shadow-inner flex flex-col justify-between p-3">
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Curved Street Route SVG */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 320 200">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="40%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Road Outline */}
          <path
            d="M 45 155 Q 110 160, 160 115 T 275 45"
            fill="none"
            stroke="#1E293B"
            strokeWidth="20"
            strokeLinecap="round"
          />
          {/* Active Street Route */}
          <path
            d="M 45 155 Q 110 160, 160 115 T 275 45"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="6 3"
          />
        </svg>

        {/* Origin Store Pin: Deepak Sweets & Bakers (Civil Lines, Bahraich) */}
        <div className="relative z-10 self-start mt-auto flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-600 border border-blue-400 shadow-md flex items-center justify-center text-sm">
            🏬
          </div>
          <div>
            <strong className="text-[11px] font-black text-white block leading-tight">
              Deepak Sweets &amp; Bakers
            </strong>
            <span className="text-[9px] text-blue-300 font-medium block">Civil Lines, Bahraich</span>
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
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50"></div>
            <div className="relative w-10 h-10 rounded-full bg-[#10B981] text-white border-2 border-white shadow-xl flex items-center justify-center text-lg">
              {vehicleMode === "bike" ? "🏍️" : "🚖"}
            </div>
          </div>
          <span className="mt-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-950/90 text-emerald-300 border border-emerald-500/40 shadow backdrop-blur-xs">
            Amit (6 mins)
          </span>
        </div>

        {/* Destination Pin: Customer Home (Peepal Chauraha) */}
        <div className="relative z-10 self-end mb-auto flex items-center gap-2 text-right">
          <div>
            <strong className="text-[11px] font-black text-amber-400 block leading-tight">
              Customer Home
            </strong>
            <span className="text-[9px] text-slate-300 font-medium block">Peepal Chauraha</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500 border border-amber-300 shadow-md flex items-center justify-center text-sm">
            🏠
          </div>
        </div>

        {/* 4-Step Progress Ribbon (Matching Customer App Tracking) */}
        <div className="relative z-10 mt-auto pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold">
            <div className="text-emerald-400 border-t-2 border-emerald-500 pt-0.5">1. Placed</div>
            <div className="text-emerald-400 border-t-2 border-emerald-500 pt-0.5">2. Packed</div>
            <div className="text-emerald-300 font-black border-t-2 border-emerald-400 pt-0.5 flex items-center justify-center gap-0.5">
              <span>3. On Road</span>
              <span>🛵</span>
            </div>
            <div className="text-slate-500 border-t-2 border-slate-700 pt-0.5">4. Doorstep</div>
          </div>
        </div>
      </div>

      {/* 3. Action Deck: Google Maps Launcher & Road Assist Pills */}
      <div className="space-y-2">
        {/* Prominent Google Maps 1-Tap Launcher Button (Sleek 1-Line Compact Emerald Design - OTA Update) */}
        <button
          type="button"
          onClick={handleLaunchGoogleMaps}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[10.5px] shadow-md flex items-center justify-between whitespace-nowrap active:scale-[0.99] transition border border-emerald-400/40"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm leading-none shrink-0">🗺️</span>
            <span className="truncate">Open in Google Maps (गूगल मैप्स में खोलें)</span>
          </div>
          <span className="text-[9.5px] bg-white/20 px-2 py-0.5 rounded font-mono shrink-0 ml-2 tracking-wide uppercase">2W Navigation ➔</span>
        </button>

        {/* 4 Road Assist Pills */}
        <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold">
          <button
            type="button"
            onClick={onViewLandmarks}
            className="py-1.5 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 text-center transition"
          >
            📍 Gate Clue
          </button>
          <button
            type="button"
            onClick={onTrafficReroute}
            className="py-1.5 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 text-center transition"
          >
            🚆 Reroute
          </button>
          <button
            type="button"
            onClick={onInAppChat}
            className="py-1.5 px-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 text-center transition"
          >
            💬 Chat
          </button>
          <button
            type="button"
            onClick={onLowBattery}
            className="py-1.5 px-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-lg border border-rose-900/40 text-center transition"
          >
            🪫 Safe
          </button>
        </div>

        {/* Slim Primary CTA: Arrived at Doorstep */}
        <button
          type="button"
          onClick={onArrivedAtLocation}
          className="w-full py-2.5 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] transition"
        >
          <span>I Have Arrived at Doorstep</span>
          <span>🏁</span>
        </button>
      </div>
    </div>
  );
}
