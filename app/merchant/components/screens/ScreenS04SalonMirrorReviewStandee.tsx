"use client";

import React from "react";

interface ScreenS04Props {
  storeName?: string;
  ownerName?: string;
  phone?: string;
  onBack?: () => void;
  onDownloadStandee?: () => void;
}

export default function ScreenS04SalonMirrorReviewStandee({
  storeName = "Looks Salon & Spa",
  ownerName = "Stylist Partner",
  phone = "",
  onBack,
  onDownloadStandee,
}: ScreenS04Props) {
  const displayPhone = phone.replace(/\D/g, "");
  const formattedPhone = displayPhone.length === 10
    ? `+91 ${displayPhone.slice(0, 5)} ${displayPhone.slice(5)}`
    : phone || "+91 Salon Desk";

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
          <div className="w-48 bg-rose-950 text-white rounded-2xl p-3 border-4 border-rose-400 shadow-xl space-y-2">
            <div>
              <div className="w-7 h-7 mx-auto rounded-lg bg-rose-800 flex items-center justify-center text-sm shadow-xs">
                ✂️
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-rose-200 mt-1 leading-tight truncate">
                {storeName}
              </h3>
              <p className="text-[8px] text-rose-300 truncate">{formattedPhone} • Salon Desk</p>
            </div>

            {/* QR Pattern on Standee */}
            <div className="w-24 h-24 mx-auto bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center text-white text-[8px] font-mono font-bold text-center p-1">
                [ SCAN MIRROR QR FOR ₹50 OFF ]
              </div>
            </div>

            {/* Review Incentive Box */}
            <div className="bg-rose-900/80 rounded-xl p-1.5 border border-rose-500/50 text-[8px] text-rose-100">
              <span className="font-bold text-rose-200 block">5-Star Google Rating</span>
              Review dekar payein ₹50 agle haircut par
            </div>

            {/* Partner Branding Footer */}
            <div className="pt-0.5 border-t border-rose-800/80 flex items-center justify-between text-[7px] text-rose-400 font-mono">
              <span>Trustit Style</span>
              <span>NPCI UPI 2.0</span>
            </div>
          </div>
        </div>

        {/* Specifications List */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px]">
            <span className="text-slate-500">Material Specification</span>
            <span className="font-bold text-slate-800">Static Cling Mirror Decal + Acrylic Stand</span>
          </div>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px]">
            <span className="text-slate-500">Print Quality</span>
            <span className="font-bold text-slate-800">Waterproof Metallic Foiling</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Standee Status</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
              Active &amp; Ready
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onDownloadStandee}
          className="w-full py-2.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>📥 Download Print-Ready High-Res PDF Standee</span>
        </button>
      </div>
    </div>
  );
}
