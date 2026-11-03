"use client";

import React from "react";

interface ScreenK04Props {
  onBack?: () => void;
  onDownloadStandee?: () => void;
}

export default function ScreenK04KiranaReviewStandee({
  onBack,
  onDownloadStandee,
}: ScreenK04Props) {
  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
              KIRANA DIGITAL ASSET
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Counter QR Standee &amp; Google Review
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

        {/* Physical Standee Mockup Preview for Kirana */}
        <div className="mt-3 bg-gradient-to-b from-amber-50 to-orange-100/60 border border-amber-300 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-inner relative">
          <span className="text-[9px] font-black uppercase text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-200 shadow-2xs mb-2">
            A5 Acrylic Standee • Billing Counter Model
          </span>

          {/* Standee Body */}
          <div className="w-44 bg-amber-950 text-white rounded-2xl p-3 border-4 border-amber-500 shadow-xl space-y-2">
            <div>
              <div className="w-7 h-7 mx-auto rounded-lg bg-amber-800 flex items-center justify-center text-sm shadow-xs">
                🛒
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 mt-1 leading-tight">
                Shri Ram Kirana
              </h3>
              <p className="text-[8px] text-amber-200">Galla Mandi • Bahraich</p>
            </div>

            {/* QR Pattern on Standee */}
            <div className="w-24 h-24 mx-auto bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center text-white text-[8px] font-mono font-bold text-center p-1">
                [ SCAN TO PAY &amp; REVIEW ]
              </div>
            </div>

            {/* Slogan */}
            <div className="space-y-0.5 text-[8px] text-amber-100 font-medium">
              <p className="font-bold text-amber-300 uppercase tracking-wide">
                "Shuddh Samagri &amp; Sahi Daam"
              </p>
              <p className="text-[7px] text-white/80">Scan for Instant UPI &amp; Google 5★ Review</p>
            </div>

            {/* Google Rating Emblem */}
            <div className="pt-1 border-t border-amber-800/80 flex items-center justify-center gap-1 text-[8px] text-amber-300 font-bold">
              <span>⭐ 4.9 on Google Maps</span>
            </div>
          </div>

          {/* Acrylic Standee Base Plate */}
          <div className="w-48 h-3.5 bg-amber-300/60 rounded-full border border-amber-400 shadow-md -mt-1.5"></div>
        </div>

        {/* Counter Placement Guide */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1.5 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block text-[10px] uppercase">
            Where to place this standee in Kirana store:
          </span>
          <p className="text-[11px] leading-relaxed">
            Place right next to the electronic weighing scale and cash drawer so customers scan while you pack their grains.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onDownloadStandee}
          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>📥 Download Print-Ready PDF for Counter Standee</span>
        </button>
      </div>
    </div>
  );
}
