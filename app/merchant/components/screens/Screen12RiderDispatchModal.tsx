"use client";

import React, { useState } from "react";

interface Screen12Props {
  onBack?: () => void;
  onConfirmDispatch?: () => void;
  onRiderAssigned?: () => void;
}

export default function Screen12RiderDispatchModal({
  onBack,
  onConfirmDispatch,
  onRiderAssigned,
}: Screen12Props) {
  const [dispatchMode, setDispatchMode] = useState<"fleet" | "self">("fleet");
  const [dispatched, setDispatched] = useState<boolean>(true);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              DELIVERY FULFILLMENT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Rider Dispatch • #ORD-7783-09
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

        {/* Mode Selector */}
        <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDispatchMode("fleet")}
            className={`py-2 rounded-xl transition ${
              dispatchMode === "fleet"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛵 Trustit Fleet (Auto)
          </button>
          <button
            type="button"
            onClick={() => setDispatchMode("self")}
            className={`py-2 rounded-xl transition ${
              dispatchMode === "self"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🚶 Self / In-House Boy
          </button>
        </div>

        {dispatchMode === "fleet" ? (
          /* Trustit Fleet Assigned Card */
          <div className="mt-3 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ● Rider Assigned &amp; En-Route
                </span>
                <span className="text-xs font-mono font-black text-blue-600">
                  ETA: 3 Mins
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-base shadow-xs">
                    🛵
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">Vikram Singh</h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Hero Splendor • UP-40-AB-1234
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-amber-700">
                      <span>⭐ 4.9 Rating</span>
                      <span>•</span>
                      <span className="text-slate-500">140+ Deliveries</span>
                    </div>
                  </div>
                </div>

                <a
                  href="tel:+919118643415"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  📞 Call
                </a>
              </div>
            </div>

            {/* Handover OTP Verification Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-blue-900 tracking-wider block">
                Food Handover Verification OTP
              </span>
              <p className="text-[10px] text-blue-700/80">
                Ask Vikram for this 4-digit OTP when handing over the food package:
              </p>
              <div className="flex justify-center gap-2 pt-1 font-mono text-base font-black text-slate-950">
                <span className="w-8 h-9 rounded-lg bg-white border border-blue-300 flex items-center justify-center shadow-xs">
                  7
                </span>
                <span className="w-8 h-9 rounded-lg bg-white border border-blue-300 flex items-center justify-center shadow-xs">
                  4
                </span>
                <span className="w-8 h-9 rounded-lg bg-white border border-blue-300 flex items-center justify-center shadow-xs">
                  9
                </span>
                <span className="w-8 h-9 rounded-lg bg-white border border-blue-300 flex items-center justify-center shadow-xs">
                  2
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Self Delivery Staff Option */
          <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900">In-House Staff Delivery</h3>
            <p className="text-[10px] text-slate-500">
              Deliver directly using your cafe's waiter or delivery staff. No platform rider fee applied.
            </p>
            <input
              type="text"
              placeholder="Staff Member Name (e.g., Ramesh)"
              defaultValue="Ramesh Kumar (Cafe Staff)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50"
            />
            <input
              type="text"
              placeholder="Staff Mobile Number"
              defaultValue="+91 94501 23456"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 font-mono"
            />
          </div>
        )}
      </div>

      {/* Confirmation CTA */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => {
            onConfirmDispatch?.();
            onRiderAssigned?.();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          Confirm Package Handover &amp; Dispatch
        </button>
      </div>
    </div>
  );
}
