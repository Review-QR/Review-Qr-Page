"use client";

import React, { useState } from "react";

interface Screen15Props {
  onBack?: () => void;
  onInstantPayout?: () => void;
  onRemitCash?: () => void;
  onClaimParking?: () => void;
  onDisputePenalty?: () => void;
  onMilestones?: () => void;
}

export default function Screen15Passbook({
  onBack,
  onInstantPayout,
  onRemitCash,
  onClaimParking,
  onDisputePenalty,
  onMilestones,
}: Screen15Props) {
  const [trips] = useState([
    {
      id: "TR-4492",
      merchant: "Golden Blossom Café",
      destination: "Civil Lines",
      distanceKm: 2.4,
      basePay: 30,
      surgePay: 15,
      tip: 20,
      total: 65,
      time: "03:45 PM",
      status: "completed",
    },
    {
      id: "TR-4488",
      merchant: "Deepak Sweets & Bakers",
      destination: "Medical Road",
      distanceKm: 3.1,
      basePay: 30,
      surgePay: 20,
      tip: 0,
      total: 50,
      time: "02:18 PM",
      status: "completed",
    },
    {
      id: "TR-4481",
      merchant: "Al-Baike Biryani",
      destination: "Kachehri Road",
      distanceKm: 1.8,
      basePay: 30,
      surgePay: 10,
      tip: 10,
      total: 50,
      time: "01:05 PM",
      status: "completed",
    },
    {
      id: "TR-4470",
      merchant: "Royal Dine Restaurant",
      destination: "Chauraha",
      distanceKm: 2.0,
      basePay: 30,
      surgePay: 0,
      tip: 0,
      total: 30,
      time: "11:40 AM",
      status: "refused_protected", // Protected trip credit
    },
  ]);

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Cockpit</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passbook Ledger</span>
        </div>

        {/* Balance Hero Card */}
        <div className="mt-3 bg-[#0D47A1] text-white rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">
                Withdrawable Net Balance
              </span>
              <strong className="text-2xl font-black block mt-0.5">₹840.00</strong>
            </div>
            <button
              type="button"
              onClick={onInstantPayout}
              className="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition active:scale-95"
            >
              ⚡ 1-Tap Transfer
            </button>
          </div>

          <div className="pt-2 border-t border-blue-800/80 grid grid-cols-3 gap-1 text-center text-[10px]">
            <div>
              <span className="text-blue-200 block">Trips Today</span>
              <strong className="text-white text-xs font-mono">14</strong>
            </div>
            <div>
              <span className="text-blue-200 block">Customer Tips</span>
              <strong className="text-emerald-300 text-xs font-mono">₹60</strong>
            </div>
            <div>
              <span className="text-blue-200 block">Wait Comp.</span>
              <strong className="text-amber-300 text-xs font-mono">₹15</strong>
            </div>
          </div>
        </div>

        {/* Itemized Trip Ledger */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
              Today&apos;s Run Breakdown
            </span>
            <span className="text-[10px] font-bold text-blue-700">Detailed Ledger</span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pr-1" style={{ scrollbarWidth: "none" }}>
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">{trip.merchant}</strong>
                    <span className="text-[10px] text-slate-500">
                      {trip.destination} · {trip.distanceKm} km · {trip.time}
                    </span>
                  </div>
                  <strong className="text-sm font-black text-emerald-600">₹{trip.total}.00</strong>
                </div>

                {/* Micro Itemized Breakdown Ribbon */}
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-700 font-bold">Base: ₹{trip.basePay}</span>
                  <span>+</span>
                  <span className="text-blue-700 font-bold">Surge: ₹{trip.surgePay}</span>
                  {trip.tip > 0 && (
                    <>
                      <span>+</span>
                      <span className="text-emerald-700 font-bold">Tip: ₹{trip.tip}</span>
                    </>
                  )}
                  {trip.status === "refused_protected" && (
                    <span className="ml-auto text-[8px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                      Customer Refusal Credit
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet Claims & Milestones Bar */}
        <div className="mt-3 grid grid-cols-4 gap-1 text-[9px] font-bold">
          <button
            type="button"
            onClick={onRemitCash}
            className="py-1 px-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 text-center"
          >
            💵 Remit (S26)
          </button>
          <button
            type="button"
            onClick={onClaimParking}
            className="py-1 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 text-center"
          >
            🎫 Toll (S47)
          </button>
          <button
            type="button"
            onClick={onDisputePenalty}
            className="py-1 px-1 bg-blue-50 hover:bg-blue-100 text-[#0D47A1] rounded-lg border border-blue-200 text-center"
          >
            ⚖️ Dispute (S31)
          </button>
          <button
            type="button"
            onClick={onMilestones}
            className="py-1 px-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 text-center"
          >
            🎯 Goal (S16)
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onInstantPayout}
          className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-[#10B981] hover:bg-emerald-700 text-white shadow-sm transition"
        >
          <span>⚡ Cashfree Instant Payout to arjun.singh@okhdfcbank</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
