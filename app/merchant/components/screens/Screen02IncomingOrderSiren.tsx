"use client";

import React, { useState, useEffect } from "react";
import { TrustitNative } from "@/lib/native/trustit-native-service";

interface Screen02Props {
  onAccept?: (prepMins: number) => void;
  onDecline?: () => void;
  onBack?: () => void;
}

export default function Screen02IncomingOrderSiren({
  onAccept,
  onDecline,
  onBack,
}: Screen02Props) {
  const [selectedPrep, setSelectedPrep] = useState<number>(20);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (!isMuted) {
      TrustitNative.playOrderSiren();
    } else {
      TrustitNative.stopOrderSiren();
    }
    return () => {
      TrustitNative.stopOrderSiren();
    };
  }, [isMuted]);

  return (
    <div className="w-full h-full bg-gradient-to-b from-rose-50 via-red-50/60 to-amber-50/40 text-slate-900 flex flex-col justify-between p-3.5 sm:p-4 font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative">
      {/* High Attention Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping"></span>
            <span className="text-xs font-black tracking-wider uppercase text-rose-800">
              URGENT INCOMING ORDER
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs transition"
          >
            {isMuted ? "🔇 Unmute" : "🔊 Siren Active"}
          </button>
        </div>

        {/* Attentive High-Contrast Alert Card */}
        <div className="mt-2.5 bg-white border-2 border-rose-500 rounded-3xl p-3.5 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-mono font-bold animate-pulse">
            ⏳ 01:42 Left
          </div>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center text-2xl shadow-xs animate-bounce">
            🔔
          </div>
          <h1 className="text-base font-black mt-2 text-slate-950">New Confirmed Order!</h1>
          <p className="text-xs text-rose-700 font-mono font-bold mt-0.5">Order #ORD-7783-09</p>

          <div className="mt-2.5 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-bold">
            <span>✅ Paid Online (Cashfree UPI)</span>
            <span>•</span>
            <span className="font-extrabold text-slate-950 text-xs">₹340.00</span>
          </div>
        </div>

        {/* Customer & Items Brief */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-100">
            <div>
              <p className="font-extrabold text-slate-900">Aman Sharma</p>
              <p className="text-[10px] text-slate-500">Civil Lines (1.4 km from cafe)</p>
            </div>
            <span className="text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-bold border border-rose-200">
              3 Items
            </span>
          </div>

          {/* Item details */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-800">
              <span className="font-bold">2 × Hazelnut Cold Frappe</span>
              <span className="font-mono text-slate-700">₹240</span>
            </div>
            <div className="flex justify-between items-center text-slate-800">
              <span className="font-bold">1 × Paneer Grilled Sandwich</span>
              <span className="font-mono text-slate-700">₹100</span>
            </div>
          </div>

          {/* Cooking instruction banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-2 text-[10px] text-amber-900 flex items-center gap-1.5 font-medium">
            <span>📝</span>
            <span>"Please pack extra napkins and keep frappe well chilled."</span>
          </div>
        </div>

        {/* Kitchen Preparation Time Selector */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
          <label className="text-[11px] font-bold text-slate-700 block mb-1.5 text-center">
            Select Kitchen Prep Duration:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 25, 40].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setSelectedPrep(mins)}
                className={`py-1.5 rounded-xl text-xs font-black transition border ${
                  selectedPrep === mins
                    ? "bg-rose-600 text-white border-rose-700 shadow-md scale-102"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                +{mins} Mins
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision CTAs */}
      <div className="pt-2 space-y-1.5">
        <button
          type="button"
          onClick={() => {
            TrustitNative.stopOrderSiren();
            onAccept?.(selectedPrep);
          }}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition"
        >
          <span>✓ ACCEPT ORDER (+{selectedPrep} MINS)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              TrustitNative.stopOrderSiren();
              onDecline?.();
            }}
            className="py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold transition"
          >
            Decline Order ✕
          </button>
          <button
            type="button"
            onClick={() => {
              TrustitNative.stopOrderSiren();
              onBack?.();
            }}
            className="py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition"
          >
            Close Siren
          </button>
        </div>
      </div>
    </div>
  );
}
