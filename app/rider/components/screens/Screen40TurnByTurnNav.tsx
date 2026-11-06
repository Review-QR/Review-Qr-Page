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
  const [progress, setProgress] = useState<number>(38); // 0 to 100 percentage
  const [speed, setSpeed] = useState<number>(28);

  // Galli-wise navigation animation: Moves step by step through turns
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 95 ? 8 : p + 2.5));
      setSpeed((s) => Math.floor(24 + Math.random() * 8));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Compute exact coordinates along the Galli-Wise 90° Turn Grid (Matching Image 2)
  // Waypoints:
  // Point 0 (Store): (45, 30)
  // Point 1 (Turn 1): (45, 85) -> Vertical down along Kachehri Marg
  // Point 2 (Turn 2): (165, 85) -> 90° Right along Civil Lines Main Road
  // Point 3 (Turn 3): (165, 155) -> 90° Down into Peepal Chauraha Galli
  // Point 4 (Home):   (255, 155) -> 90° Right to Customer Gate
  let riderX = 45;
  let riderY = 30;
  let riderRotation = 90; // degrees
  let currentStreet = "Kachehri Marg (कचहरी मार्ग)";
  let turnInstruction = "सीधे जाएं, आगे 50m बाद दाहिने मोड़ें ➡️";
  let etaMins = 6;

  if (progress < 22) {
    // Segment 1: Store -> Turn 1 (downwards)
    const t = progress / 22;
    riderX = 45;
    riderY = 30 + t * 55;
    riderRotation = 90;
    currentStreet = "Kachehri Marg (कचहरी मार्ग)";
    turnInstruction = "कचहरी मार्ग पर सीधे चलें, आगे मोड़ है ➡️";
    etaMins = 7;
  } else if (progress < 55) {
    // Segment 2: Turn 1 -> Turn 2 (rightwards along Main Road)
    const t = (progress - 22) / 33;
    riderX = 45 + t * 120;
    riderY = 85;
    riderRotation = 0;
    currentStreet = "Civil Lines Main Road (सिविल लाइंस)";
    turnInstruction = "मेन रोड पर 300m सीधा चलें, फिर पीपल चौराहा गली ↩️";
    etaMins = 5;
  } else if (progress < 80) {
    // Segment 3: Turn 2 -> Turn 3 (downwards into Galli)
    const t = (progress - 55) / 25;
    riderX = 165;
    riderY = 85 + t * 70;
    riderRotation = 90;
    currentStreet = "Peepal Chauraha Galli (पीपल चौराहा गली)";
    turnInstruction = "गली में अंदर जाएं, कस्टमर का घर 100m दूर है 🏠";
    etaMins = 2;
  } else {
    // Segment 4: Turn 3 -> Home (rightwards to Customer Home)
    const t = Math.min(1, (progress - 80) / 20);
    riderX = 165 + t * 90;
    riderY = 155;
    riderRotation = 0;
    currentStreet = "Customer Gate · Amit Home (दरवाजा)";
    turnInstruction = "गेट नंबर 4 पर पहुंचे, OTP हैंडओवर तैयार करें 🏁";
    etaMins = 1;
  }

  const handleLaunchGoogleMaps = () => {
    if (onOpenGoogleMaps) {
      onOpenGoogleMaps();
      return;
    }
    // Launch Google Maps navigation directly from rider's live GPS location (origin omitted)
    const destination = "27.5760,81.5980"; // Customer Home, Peepal Chauraha
    const travelmode = vehicleMode === "bike" ? "two_wheeler" : "driving";
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${travelmode}`;
    window.open(mapsUrl, "_blank");
  };

  return (
    <div className="w-full flex-1 bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-3 select-none font-sans min-h-[520px]">
      {/* 1. Header Bar: LIVE GPS TRACKING & Telemetry Strip */}
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

        {/* Fleet Mode: Ultra-Compact Inline Pill (Bike & Electric Bike only) */}
        <div className="flex items-center justify-between mt-1.5 px-1 text-[10px]">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Fleet Mode:</span>
          <div className="flex items-center gap-1 bg-slate-200/80 rounded-lg p-0.5 text-[9.5px]">
            <button
              type="button"
              onClick={() => setVehicleMode("bike")}
              className={`px-2 py-0.5 rounded font-black transition ${
                vehicleMode === "bike"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🏍️ Bike
            </button>
            <button
              type="button"
              onClick={() => setVehicleMode("cab")}
              className={`px-2 py-0.5 rounded font-black transition ${
                vehicleMode === "cab"
                  ? "bg-white text-emerald-800 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ⚡ EV Bike
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real City Street & Galli Grid Map Viewport (Matching Image 2 Reference) */}
      <div className="relative my-2 rounded-2xl bg-slate-100 border border-slate-300/80 overflow-hidden shadow-xs flex flex-col justify-between">
        
        {/* Galli Turn Milestone Banner (Pleasure & Reward Step Indicator) */}
        <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs z-30">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-ping"></span>
            <span className="text-[10px] font-black text-slate-900 truncate">
              {currentStreet}
            </span>
          </div>
          <span className="text-[9.5px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full shrink-0 font-bold ml-1">
            ETA: {etaMins} mins
          </span>
        </div>

        {/* Interactive Street Grid Canvas */}
        <div className="relative h-[230px] w-full overflow-hidden bg-[#F1F5F9]">
          
          {/* Real City Blocks Background Grid (Streets & Galli corridors between blocks) */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Block 1 (Top Left) */}
            <div className="absolute top-2 left-2 w-[30px] h-[45px] bg-white rounded-lg border border-slate-300 shadow-2xs"></div>
            {/* Block 2 (Top Center) */}
            <div className="absolute top-2 left-[58px] w-[95px] h-[68px] bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col justify-center items-center">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">City Block 1</span>
              <div className="w-16 h-3 bg-slate-100 rounded mt-1"></div>
            </div>
            {/* Block 3 (Top Right) */}
            <div className="absolute top-2 left-[180px] right-2 h-[68px] bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col justify-center items-center">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">Market Complex</span>
              <div className="w-16 h-3 bg-slate-100 rounded mt-1"></div>
            </div>
            {/* Block 4 (Bottom Left) */}
            <div className="absolute top-[102px] left-2 w-[145px] h-[80px] bg-white rounded-xl border border-slate-300 shadow-2xs flex flex-col justify-center items-center">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">Residential Sector</span>
              <div className="w-24 h-3 bg-slate-100 rounded mt-1"></div>
              <div className="w-20 h-2 bg-slate-50 rounded mt-0.5"></div>
            </div>
            {/* Block 5 (Bottom Center Galli) */}
            <div className="absolute top-[102px] left-[180px] right-2 h-[40px] bg-white rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center">
              <span className="text-[7px] font-bold text-slate-400 uppercase">Peepal Homes</span>
            </div>
            {/* Block 6 (Bottom Right) */}
            <div className="absolute top-[170px] left-[180px] right-2 bottom-2 bg-white rounded-lg border border-slate-300 shadow-2xs"></div>
          </div>

          {/* SVG Street Paths & Turns (90-Degree Real Turn Grid) */}
          <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 300 210">
            {/* Street Base Underlay (Road asphalt with curbs) */}
            <path
              d="M 45 30 L 45 85 L 165 85 L 165 155 L 255 155"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner Road Surface */}
            <path
              d="M 45 30 L 45 85 L 165 85 L 165 155 L 255 155"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Active Turn-by-Turn Route Highlight (Vibrant Emerald with Animated Glow) */}
            <path
              d="M 45 30 L 45 85 L 165 85 L 165 155 L 255 155"
              fill="none"
              stroke="#059669"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 4"
            />

            {/* Turn Corner Indicator Arrows */}
            {/* Turn 1 (Right turn 90°) */}
            <circle cx="45" cy="85" r="5" fill="#10B981" />
            <path d="M 43 83 L 47 85 L 43 87" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Turn 2 (Down turn 90°) */}
            <circle cx="165" cy="85" r="5" fill="#10B981" />
            <path d="M 163 83 L 165 87 L 167 83" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            {/* Turn 3 (Right turn into Home 90°) */}
            <circle cx="165" cy="155" r="5" fill="#10B981" />
            <path d="M 163 153 L 167 155 L 163 157" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          {/* Origin Store Pin: Deepak Sweets & Bakers (Civil Lines) */}
          <div
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            style={{ left: "45px", top: "18px", transform: "translate(-50%, -50%)" }}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white border-2 border-white shadow-md flex items-center justify-center text-sm">
              🏬
            </div>
            <span className="mt-0.5 px-1.5 py-0.2 rounded text-[7.5px] font-black bg-slate-900 text-white shadow whitespace-nowrap">
              Deepak Sweets
            </span>
          </div>

          {/* Destination Pin: Customer Home (Amit, Peepal Chauraha) */}
          <div
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            style={{ left: "255px", top: "155px", transform: "translate(-50%, -50%)" }}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white border-2 border-white shadow-md flex items-center justify-center text-sm animate-bounce">
              🏠
            </div>
            <span className="mt-0.5 px-1.5 py-0.2 rounded text-[7.5px] font-black bg-amber-700 text-white shadow whitespace-nowrap">
              Amit (Doorstep)
            </span>
          </div>

          {/* Dynamic Moving Delivery Rider Pin (Authentic Trustit Rider on Bike with Delivery Box!) */}
          <div
            className="absolute z-30 pointer-events-none flex flex-col items-center transition-all duration-1000 ease-linear"
            style={{
              left: `${(riderX / 300) * 100}%`,
              top: `${(riderY / 210) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Rider Tooltip */}
            <span className="mb-0.5 px-2 py-0.2 rounded-full text-[8px] font-black bg-slate-950 text-emerald-300 border border-emerald-400 shadow-md whitespace-nowrap">
              🛵 Amit ({etaMins}m)
            </span>

            {/* Custom Trustit Delivery Rider Vector (Man on Scooter with Orange Trustit Box) */}
            <div
              className="relative transition-transform duration-300"
              style={{ transform: `rotate(${riderRotation === 90 ? "45deg" : "0deg"})` }}
            >
              {/* Pulse Radar Glow */}
              <div className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping"></div>

              {/* Rider SVG Illustration matching Trustit Logo */}
              <svg width="36" height="36" viewBox="0 0 48 48" className="drop-shadow-md">
                {/* Wheels */}
                <circle cx="12" cy="36" r="6" fill="#0F172A" />
                <circle cx="12" cy="36" r="2.5" fill="#E2E8F0" />
                <circle cx="36" cy="36" r="6" fill="#0F172A" />
                <circle cx="36" cy="36" r="2.5" fill="#E2E8F0" />
                {/* Bike Frame */}
                <path d="M 12 36 L 22 36 L 27 28 L 36 36" stroke="#0F172A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                {/* Orange Trustit Delivery Box */}
                <rect x="4" y="16" width="13" height="13" rx="3" fill="#F97316" stroke="#EA580C" strokeWidth="1.2" />
                <path d="M 10.5 19 L 14 21.5 L 10.5 25.5 L 7 21.5 Z" fill="#FFFFFF" />
                {/* Rider Torso & Head */}
                <circle cx="27" cy="11" r="5.5" fill="#0F172A" />
                {/* Helmet Orange Shield */}
                <path d="M 29 10 L 32 11.5 L 29 13 Z" fill="#F97316" />
                {/* Rider Jacket */}
                <path d="M 22 17 L 29 17 L 31 27 L 21 27 Z" fill="#0D47A1" />
                {/* Rider Arms */}
                <path d="M 26 19 L 34 24" stroke="#0D47A1" strokeWidth="3" strokeLinecap="round" />
                {/* Headlight Beam */}
                <polygon points="38,26 47,21 47,31" fill="#FDE047" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Live Rider Tracking Status Strip (Matching Image 2 Reference) */}
        <div className="bg-white px-3 py-2 border-t border-slate-200 flex items-center justify-between text-xs z-20">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <span className="text-[10px] font-black text-slate-900 block leading-none">
                Live Rider Tracking
              </span>
              <span className="text-[8.5px] text-slate-500 block mt-0.5">
                {turnInstruction}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
            GPS: Every 5s
          </span>
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
            Live 2W Navigation ➔
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

        {/* Primary CTA: Arrived at Doorstep */}
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
