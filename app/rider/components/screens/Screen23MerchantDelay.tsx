"use client";

import React, { useState, useEffect } from "react";

interface Screen23Props {
  onBack?: () => void;
  onConfirmReady?: () => void;
  onRequestReassign?: () => void;
}

export default function Screen23MerchantDelay({
  onBack,
  onConfirmReady,
  onRequestReassign,
}: Screen23Props) {
  const [waitMinutes, setWaitMinutes] = useState<number>(7);
  const [waitSeconds, setWaitSeconds] = useState<number>(34);
  const [compensationAccrued, setCompensationAccrued] = useState<number>(2.5);

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitSeconds((s) => {
        if (s >= 59) {
          setWaitMinutes((m) => m + 1);
          setCompensationAccrued((c) => c + 1.0);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
              Store Pickup Exception
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Merchant Delay Desk</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-full py-0.5 border border-emerald-200">
            +₹{compensationAccrued.toFixed(1)}
          </span>
        </div>

        {/* Live Wait Timer Box */}
        <div className="mt-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 text-center shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
            LIVE AT-RESTAURANT TIMER
          </span>
          <div className="mt-1 text-4xl font-black font-mono tracking-tight">
            {String(waitMinutes).padStart(2, "0")}:{String(waitSeconds).padStart(2, "0")}
          </div>
          <p className="text-xs text-amber-100 mt-1">
            Wait compensation starts automatically after 5 minutes at store.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-white">
            <span>⏱️ Current Compensation:</span>
            <span className="font-mono text-emerald-300 font-extrabold">+₹{compensationAccrued.toFixed(2)} credited</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0D47A1] flex items-center justify-center text-lg shrink-0">
              🏪
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Golden Blossom Café</h4>
              <p className="text-[11px] text-slate-500">Order #TR-4492 · Chef is preparing: Peri Peri Fries</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="font-bold text-slate-800">Customer Notified</span>
            </div>
            <span className="text-[10px] text-blue-700 font-medium">ETA extended +8 mins</span>
          </div>

          <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
            <p className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>Your acceptance rating is 100% protected.</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>Rate: ₹1.00 per minute verified geo-wait.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onConfirmReady}
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <span>Food Ready Now! Confirm Handover</span>
          <span>🛍️</span>
        </button>
        <button
          type="button"
          onClick={onRequestReassign}
          className="w-full py-2.5 rounded-xl bg-white border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition"
        >
          Order Taking &gt;20 mins? Request Reassignment
        </button>
      </div>
    </div>
  );
}
