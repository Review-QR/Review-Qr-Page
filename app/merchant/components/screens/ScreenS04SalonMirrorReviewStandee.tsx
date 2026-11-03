"use client";

import React from "react";

interface ScreenS04Props {
  onBack?: () => void;
  onDownloadStandee?: () => void;
}

export default function ScreenS04SalonMirrorReviewStandee({
  onBack,
  onDownloadStandee,
}: ScreenS04Props) {
  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
              SALON MIRROR BRANDING
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Mirror Decal &amp; Reception QR Standee
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

        {/* Physical Standee Mockup Preview for Salon */}
        <div className="mt-3 bg-gradient-to-b from-rose-50 to-pink-100/60 border border-rose-300 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-inner relative">
          <span className="text-[9px] font-black uppercase text-rose-800 bg-white px-2 py-0.5 rounded-full border border-rose-200 shadow-2xs mb-2">
            Mirror Corner &amp; Reception Desk Acrylic Standee
          </span>

          {/* Standee Body */}
          <div className="w-44 bg-rose-950 text-white rounded-2xl p-3 border-4 border-rose-400 shadow-xl space-y-2">
            <div>
              <div className="w-7 h-7 mx-auto rounded-lg bg-rose-800 flex items-center justify-center text-sm shadow-xs">
                ✂️
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-200 mt-1 leading-tight">
                Looks Salon &amp; Spa
              </h3>
              <p className="text-[8px] text-rose-300">Civil Lines • Bahraich</p>
            </div>

            {/* QR Pattern on Standee */}
            <div className="w-24 h-24 mx-auto bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center text-white text-[8px] font-mono font-bold text-center p-1">
                [ SCAN MIRROR QR FOR ₹50 OFF ]
              </div>
            </div>

            {/* Slogan */}
            <div className="space-y-0.5 text-[8px] text-rose-100 font-medium">
              <p className="font-bold text-rose-300 uppercase tracking-wide">
                "Loved Your New Look?"
              </p>
              <p className="text-[7px] text-white/80">Scan to post 5★ Google Review &amp; get ₹50 off next cut!</p>
            </div>

            {/* Google Rating Emblem */}
            <div className="pt-1 border-t border-rose-800/80 flex items-center justify-center gap-1 text-[8px] text-rose-300 font-bold">
              <span>⭐ 4.9 on Google Maps (180+ Reviews)</span>
            </div>
          </div>

          {/* Standee Base Plate */}
          <div className="w-48 h-3.5 bg-rose-300/60 rounded-full border border-rose-400 shadow-md -mt-1.5"></div>
        </div>

        {/* Counter Placement Guide */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1.5 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block text-[10px] uppercase">
            Where to stick this in Salon:
          </span>
          <p className="text-[11px] leading-relaxed">
            Stick at eye-level on the bottom right corner of each haircut mirror so clients scan while admiring their fresh haircut.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onDownloadStandee}
          className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>📥 Download Mirror Decal &amp; Standee PDF</span>
        </button>
      </div>
    </div>
  );
}
