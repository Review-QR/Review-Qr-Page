"use client";

import React, { useState } from "react";

interface Screen38Props {
  onBack?: () => void;
  onConfirmCakePickup?: () => void;
}

export default function Screen38FragileCakeGuard({
  onBack,
  onConfirmCakePickup,
}: Screen38Props) {
  const [photoSnapped, setPhotoSnapped] = useState<boolean>(true);
  const [bagBaseLevel, setBagBaseLevel] = useState<boolean>(true);

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
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
              Fragile &amp; Delicate Goods
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Bakery Cake Inspection</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-pink-700 bg-pink-50 rounded-full py-0.5 border border-pink-200">
            🎂
          </span>
        </div>

        {/* Speed Warning Banner */}
        <div className="mt-4 bg-gradient-to-r from-pink-600 to-rose-700 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/20">
            <span className="text-xs font-bold text-pink-100">Crown Bakery, Civil Lines</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white text-pink-800">
              Cake Order
            </span>
          </div>
          <p className="text-xs text-white font-extrabold mt-2">
            ⚠️ 1 KG Fresh Pineapple Birthday Cake inside box!
          </p>
          <p className="text-[11px] text-pink-100 mt-0.5">
            Ride smoothly. Maximum speed 30 km/h. Avoid sharp bike turns and sudden braking.
          </p>
        </div>

        {/* Pre-Pickup Photo POD Simulator */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              1. Open-Box Counter Photo:
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {photoSnapped ? "✓ Verified Intact" : "Pending Photo"}
            </span>
          </div>

          <div className="relative w-full h-36 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-white overflow-hidden">
            <span className="text-4xl">🎂</span>
            <span className="text-xs font-bold text-pink-300 mt-1">Pre-Pickup Counter Photo</span>
            <span className="text-[9px] text-slate-400 font-mono">Proof: Cream &amp; Design 100% Intact</span>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={bagBaseLevel}
              onChange={(e) => setBagBaseLevel(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="font-bold block">2. Delivery Bag Base Kept Flat</span>
              <span className="text-[10px] text-slate-500">
                Box is placed on horizontal flat surface, not tilted on bike petrol tank.
              </span>
            </div>
          </label>
        </div>

        {/* Protection Note */}
        <div className="mt-3 bg-pink-50 border border-pink-200 rounded-xl p-2.5 text-[11px] text-pink-900">
          🛡️ Taking this pre-pickup photo protects you from false customer damage claims.
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={!photoSnapped || !bagBaseLevel}
          onClick={onConfirmCakePickup}
          className="w-full py-3.5 rounded-xl bg-pink-700 text-white font-black text-sm shadow-md hover:bg-pink-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          <span>Confirm Cake Pickup (Earn ₹55.00)</span>
          <span>➔</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Handle With Extreme Care · Doorstep photo required at delivery
        </p>
      </div>
    </div>
  );
}
