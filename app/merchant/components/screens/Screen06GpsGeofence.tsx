"use client";

import React, { useState } from "react";

interface Screen06Props {
  onBack?: () => void;
  onSave?: () => void;
}

export default function Screen06GpsGeofence({ onBack, onSave }: Screen06Props) {
  const [radius, setRadius] = useState<number>(5.0);
  const [detecting, setDetecting] = useState<boolean>(false);
  const [lat, setLat] = useState("27.5744");
  const [lng, setLng] = useState("81.5977");

  const handleDetect = () => {
    setDetecting(true);
    setTimeout(() => {
      setLat("27.5751");
      setLng("81.5982");
      setDetecting(false);
    }, 800);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              MY BUSINESS • LOCATION
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              GPS Location &amp; Geofence Radius
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

        {/* Map Preview Simulation */}
        <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-300 shadow-xs h-36 bg-slate-200 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
          
          {/* Circular Radius Zone */}
          <div className="w-28 h-28 rounded-full border-2 border-blue-500 bg-blue-500/15 flex items-center justify-center animate-pulse">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-md">
              📍
            </div>
          </div>

          <div className="absolute top-2 left-2 bg-white/95 px-2 py-1 rounded-lg border border-slate-200 shadow-2xs text-[10px] font-mono text-slate-700">
            GPS: {lat}° N, {lng}° E
          </div>

          <button
            type="button"
            onClick={handleDetect}
            className="absolute bottom-2 right-2 bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs transition"
          >
            {detecting ? "Locating..." : "📍 Re-Detect GPS"}
          </button>
        </div>

        {/* Address Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5 text-xs">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Store Address &amp; Street
            </label>
            <p className="font-bold text-slate-900">
              Shop #4, Opp. KDC Inter College, Civil Lines
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-500 block">Locality</span>
              <span className="font-bold text-slate-800">KDC Road</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">City &amp; Pincode</span>
              <span className="font-bold text-slate-800">Bahraich - 271801</span>
            </div>
          </div>
        </div>

        {/* Delivery Geofence Slider */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">Store Delivery Radius</span>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              {radius.toFixed(1)} KM
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="12.0"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1.0 km (Walk-in)</span>
            <span>6.0 km (Town)</span>
            <span>12.0 km (Max Outer)</span>
          </div>
          <p className="text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200 leading-tight">
            ✓ Covers ~42,000 households across Bahraich within an estimated 25-minute delivery window.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3">
        <button
          type="button"
          onClick={onSave}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          Update Location Coordinates
        </button>
      </div>
    </div>
  );
}
