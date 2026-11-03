"use client";

import React, { useState } from "react";

interface Screen41Props {
  onBack?: () => void;
  onContinueNavigation?: () => void;
}

export default function Screen41Last100mLandmark({
  onBack,
  onContinueNavigation,
}: Screen41Props) {
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

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
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Tier-3 Alleyway Guide
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Last 100-Meter Mohalla Rescue</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-amber-600 bg-amber-50 rounded-full py-0.5 border border-amber-200">
            ±1.8m
          </span>
        </div>

        {/* Warning Banner */}
        <div className="mt-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100">Main Road GPS Ended</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-black/20 text-white">
              Narrow 3-Ft Lane
            </span>
          </div>
          <p className="text-xs text-amber-100 mt-2 leading-relaxed">
            Google Maps cannot route inside this narrow gali. Follow the customer&apos;s verified gate photo and voice note below.
          </p>
        </div>

        {/* Customer Gate Photo Card */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              1. Customer House / Gate Photo:
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Landmark
            </span>
          </div>

          {/* Photo Frame Simulator */}
          <div className="relative w-full h-36 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
            <span className="text-4xl">🚪</span>
            <span className="text-xs font-black text-amber-300 mt-1">Yellow Iron Gate with #42/B Plate</span>
            <span className="text-[10px] text-slate-400 font-mono">Opposite Peepal Tree &amp; Water Cooler</span>

            <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400">
              Customer Uploaded
            </div>
          </div>
        </div>

        {/* 5-Second Voice Note Player */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              2. Customer Voice Note (5 Secs):
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">00:05</span>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleAudio}
              className="w-10 h-10 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center text-lg shadow-sm shrink-0 hover:bg-blue-800"
            >
              {isPlayingAudio ? "⏸" : "▶"}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                &quot;भैया, मेडिकल स्टोर के बगल वाली संकरी गली में तीसरा मकान...&quot;
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="w-1 h-3 bg-blue-600 rounded-full animate-pulse"></span>
                <span className="w-1 h-4 bg-blue-600 rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-2 bg-blue-600 rounded-full animate-pulse delay-100"></span>
                <span className="w-1 h-5 bg-blue-600 rounded-full animate-pulse"></span>
                <span className="w-1 h-3 bg-blue-600 rounded-full animate-pulse delay-150"></span>
                <span className="text-[10px] font-bold text-blue-800 ml-2">
                  {isPlayingAudio ? "Playing Audio..." : "Tap to Play Voice Clue"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Landmark Text Box */}
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 space-y-1">
          <p>
            <strong>📍 Written Landmark:</strong> Mohalla Qazipura, lane next to Sharma Medical Hall.
          </p>
          <p className="text-slate-500 text-[11px]">
            GPS Accuracy: <strong className="text-emerald-700 font-mono">±1.8 Meters (Exact Pin)</strong>
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2">
          <a
            href="tel:+919876543210"
            className="flex-1 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 text-center flex items-center justify-center gap-1.5"
          >
            <span>📞 Call for Directions</span>
          </a>
          <button
            type="button"
            onClick={onContinueNavigation}
            className="flex-1 py-3 rounded-xl bg-[#0D47A1] text-white font-extrabold text-xs shadow-md hover:bg-blue-800 text-center"
          >
            I Found the House ➔
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400">
          Last-100m guide eliminates wrong doorstep drops in district towns.
        </p>
      </div>
    </div>
  );
}
