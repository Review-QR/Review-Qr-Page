"use client";

import React, { useState } from "react";

interface Screen26Props {
  onBack?: () => void;
  onPayViaUpi?: () => void;
  onNavigateHub?: (hubName: string) => void;
  cashDueProp?: number;
  cashCeilingProp?: number;
}

export default function Screen26CashRemittanceHubs({
  onBack,
  onPayViaUpi,
  onNavigateHub,
  cashDueProp = 680,
  cashCeilingProp = 1500,
}: Screen26Props) {
  const [method, setMethod] = useState<"upi" | "cash_hub">("upi");
  const cashDue = cashDueProp;

  const hubs = [
    { name: "Deepak Sweets Cash Hub", distance: "0.6 km away", area: "Civil Lines, Bahraich", timing: "Open till 10 PM" },
    { name: "Trustit Central Fleet Desk", distance: "1.4 km away", area: "Kachehri Road Hub", timing: "24x7 Active" },
    { name: "Al-Baike Cash Counter", distance: "2.1 km away", area: "Dargah Road", timing: "Open till 11 PM" },
  ];

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
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              COD Remittance Gate
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Remit Cash &amp; Unlock Duty</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-red-600 bg-red-50 rounded-full py-0.5 border border-red-200">
            ₹{cashDue}
          </span>
        </div>

        {/* Warning Banner */}
        <div className="mt-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-100">Cash in Hand</span>
            <span className="text-xl font-black text-amber-300">₹{cashDue}.00</span>
          </div>
          <div className="mt-2 w-full bg-black/30 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (cashDue / cashCeilingProp) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-red-100 mt-2">
            ⚠️ Hard Ceiling: ₹{cashCeilingProp}.00. {cashDue >= cashCeilingProp ? "Duty is currently LOCKED until remitted." : `Duty will lock once cash exceeds ₹${cashCeilingProp}.`}
          </p>
        </div>

        {/* Remittance Mode Toggle */}
        <div className="mt-4 flex border border-slate-200 rounded-xl p-1 bg-slate-100">
          <button
            type="button"
            onClick={() => setMethod("upi")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              method === "upi" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            ⚡ Instant Self-Pay (UPI)
          </button>
          <button
            type="button"
            onClick={() => setMethod("cash_hub")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              method === "cash_hub" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            🏪 Cash Drop Hubs (Bahraich)
          </button>
        </div>

        {/* Mode Content */}
        {method === "upi" ? (
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900">Transfer from PhonePe / GPay</p>
                <p className="text-[11px] text-slate-500">Amount debited directly from your bank</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                0% Fee
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trustit Escrow VPA</span>
                <p className="font-mono text-xs font-black text-slate-800">trustit.remit@hdfcbank</p>
              </div>
              <span className="text-lg">🛡️</span>
            </div>

            <button
              type="button"
              onClick={onPayViaUpi}
              className="w-full py-3 rounded-xl bg-[#0D47A1] text-white font-extrabold text-xs shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <span>Pay ₹{cashDue} via UPI Now (Clear Ceiling)</span>
              <span>⚡</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {hubs.map((h, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{h.name}</h4>
                  <p className="text-[10px] text-slate-500">{h.area} · <strong className="text-emerald-700">{h.distance}</strong></p>
                  <p className="text-[9px] text-slate-400">{h.timing}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateHub?.(h.name)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold hover:bg-slate-200"
                >
                  🗺️ Route
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400">
          Remitting cash immediately resets your cash ceiling back to ₹0.00 and restores full order flow.
        </p>
      </div>
    </div>
  );
}
