"use client";

import React from "react";

interface Screen24Props {
  onBack?: () => void;
  onRaiseComplaint?: () => void;
}

export default function Screen24OrderTrackingWaybill({
  onBack,
  onRaiseComplaint,
}: Screen24Props) {
  const steps = [
    { label: "Order Placed & Paid", time: "Today, 10:15 AM", done: true },
    { label: "Vector Artwork Approved", time: "Today, 11:30 AM", done: true },
    { label: "Laser UV Printing in Progress", time: "Today, 02:45 PM", done: true },
    { label: "Handed to BlueDart Express", time: "Expected Tomorrow", done: false },
    { label: "Delivered at Cafe Counter", time: "Thursday, Nov 05", done: false },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              SHIPMENT TRACKER
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Order #KIT-9821-BLOSSOM
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

        {/* Courier Waybill Card */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Courier Partner
            </span>
            <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              BlueDart / Shiprocket Air
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-500 block">Waybill / AWB No:</span>
              <span className="font-mono font-bold text-slate-900">BD-8849-2041-UP</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● In Production
            </span>
          </div>
        </div>

        {/* Timeline Progression */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2.5">
            Production &amp; Dispatch Timeline
          </h3>

          <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((st, i) => (
              <div key={i} className="relative flex items-start gap-2.5 text-xs">
                <span
                  className={`absolute -left-4 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                    st.done
                      ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                      : "bg-white border-slate-300 text-slate-300"
                  }`}
                >
                  {st.done ? "✓" : ""}
                </span>
                <div>
                  <h4 className={`font-bold ${st.done ? "text-slate-900" : "text-slate-400"}`}>
                    {st.label}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{st.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Artwork Proof */}
        <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span className="font-bold text-slate-800">Final Laser UV Artwork Proof</span>
          </div>
          <button
            type="button"
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
          >
            Inspect PDF →
          </button>
        </div>
      </div>

      {/* Footer Support */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onRaiseComplaint}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition"
        >
          Raise Issue / Request Replacement
        </button>
      </div>
    </div>
  );
}
