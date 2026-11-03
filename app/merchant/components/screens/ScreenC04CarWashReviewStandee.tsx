"use client";

import React from "react";

interface ScreenC04Props {
  onBack?: () => void;
  onDownloadStandee?: () => void;
}

export default function ScreenC04CarWashReviewStandee({
  onBack,
  onDownloadStandee,
}: ScreenC04Props) {
  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">
              GARAGE BRANDING
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Customer Lounge Standee &amp; Bay QR
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

        {/* Standee Mockup Preview for Car Wash */}
        <div className="mt-3 bg-gradient-to-b from-cyan-50 to-blue-100/60 border border-cyan-300 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-inner relative">
          <span className="text-[9px] font-black uppercase text-cyan-800 bg-white px-2 py-0.5 rounded-full border border-cyan-200 shadow-2xs mb-2">
            Waiting Lounge Table &amp; Key Counter Model
          </span>

          {/* Standee Body */}
          <div className="w-44 bg-cyan-950 text-white rounded-2xl p-3 border-4 border-cyan-400 shadow-xl space-y-2">
            <div>
              <div className="w-7 h-7 mx-auto rounded-lg bg-cyan-800 flex items-center justify-center text-sm shadow-xs">
                🚗
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-200 mt-1 leading-tight">
                SpeedX Detailing
              </h3>
              <p className="text-[8px] text-cyan-300">Highway Bypass • Bahraich</p>
            </div>

            {/* QR Pattern on Standee */}
            <div className="w-24 h-24 mx-auto bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center text-white text-[8px] font-mono font-bold text-center p-1">
                [ SCAN TO PAY &amp; REVIEW ]
              </div>
            </div>

            {/* Slogan */}
            <div className="space-y-0.5 text-[8px] text-cyan-100 font-medium">
              <p className="font-bold text-cyan-300 uppercase tracking-wide">
                "Car Shining Like New?"
              </p>
              <p className="text-[7px] text-white/80">Scan for UPI Bill &amp; get ₹100 off next foam wash!</p>
            </div>

            {/* Google Rating Emblem */}
            <div className="pt-1 border-t border-cyan-800/80 flex items-center justify-center gap-1 text-[8px] text-cyan-300 font-bold">
              <span>⭐ 4.9 on Google Maps (95+ Car Owners)</span>
            </div>
          </div>

          {/* Standee Base Plate */}
          <div className="w-48 h-3.5 bg-cyan-300/60 rounded-full border border-cyan-400 shadow-md -mt-1.5"></div>
        </div>

        {/* Counter Placement Guide */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1.5 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block text-[10px] uppercase">
            Where to place this in Garage / Car Wash:
          </span>
          <p className="text-[11px] leading-relaxed">
            Place in the air-conditioned customer waiting lounge where car owners sit while their car is being washed and dried.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onDownloadStandee}
          className="w-full py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>📥 Download Car Wash Lounge Standee PDF</span>
        </button>
      </div>
    </div>
  );
}
