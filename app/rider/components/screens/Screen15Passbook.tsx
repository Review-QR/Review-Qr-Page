"use client";

import React, { useState } from "react";
import { riderAudio } from "@/lib/audio/rider-siren";

interface Screen15Props {
  onBack?: () => void;
  onInstantPayout?: () => void;
  onRemitCash?: () => void;
  onClaimParking?: () => void;
  onDisputePenalty?: () => void;
  onMilestones?: () => void;
  walletBalanceProp?: number;
  todayEarningsProp?: number;
  todayTripsCountProp?: number;
  riderUpiProp?: string;
}

export default function Screen15Passbook({
  onBack,
  onInstantPayout,
  onRemitCash,
  onClaimParking,
  onDisputePenalty,
  onMilestones,
  walletBalanceProp = 350,
  todayEarningsProp = 520,
  todayTripsCountProp = 14,
  riderUpiProp,
}: Screen15Props) {
  const [currentBalance, setCurrentBalance] = useState<number>(walletBalanceProp);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [payoutSuccessData, setPayoutSuccessData] = useState<{ amount: number; utr: string; time: string } | null>(null);

  const activeUpi = riderUpiProp || (typeof window !== "undefined" ? localStorage.getItem("trustit_rider_upi") || "luckyshukla@hdfcbank" : "luckyshukla@hdfcbank");

  const handlePayoutTrigger = () => {
    if (currentBalance <= 0) {
      alert("⚠️ No withdrawable balance available.");
      return;
    }
    setIsProcessing(true);
    riderAudio.playCashChime();

    setTimeout(() => {
      const transferred = currentBalance;
      setCurrentBalance(0);
      setIsProcessing(false);
      setPayoutSuccessData({
        amount: transferred,
        utr: `CF${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
      riderAudio.playCashChime();
      if (onInstantPayout) {
        try { onInstantPayout(); } catch {}
      }
    }, 1200);
  };
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

        {/* Balance Hero Card (Slim, Compact Single-Line Balance & 1-Tap Transfer) */}
        <div className="mt-2.5 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-xl p-3 shadow-sm space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">
                Withdrawable Net Balance
              </span>
              <strong className="text-xl font-black block leading-tight">₹{currentBalance}.00</strong>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={handlePayoutTrigger}
                disabled={isProcessing || currentBalance <= 0}
                className="py-1 px-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-sm border border-amber-200/80 flex items-center gap-1 transition active:scale-95 disabled:opacity-50 whitespace-nowrap ml-auto"
              >
                <span>⚡</span>
                <span>1-Tap Transfer</span>
                <span className="text-[9px]">➔</span>
              </button>
              <span className="text-[8px] font-mono text-blue-200 block mt-0.5">
                to: {activeUpi}
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-blue-400/20 grid grid-cols-3 gap-1 text-center text-[9px]">
            <div>
              <span className="text-blue-200 block">Trips Today</span>
              <strong className="text-white text-xs font-mono">{todayTripsCountProp}</strong>
            </div>
            <div>
              <span className="text-blue-200 block">Today Earned</span>
              <strong className="text-emerald-300 text-xs font-mono">₹{todayEarningsProp}</strong>
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

          <div className="space-y-2 max-h-[240px] overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pr-1" style={{ scrollbarWidth: "none" }}>
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
            className="py-1.5 px-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 text-center transition"
          >
            💵 Remit (S26)
          </button>
          <button
            type="button"
            onClick={onClaimParking}
            className="py-1.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg border border-amber-200 text-center transition"
          >
            🎫 Toll (S47)
          </button>
          <button
            type="button"
            onClick={onDisputePenalty}
            className="py-1.5 px-1 bg-blue-50 hover:bg-blue-100 text-[#0D47A1] rounded-lg border border-blue-200 text-center transition"
          >
            ⚖️ Dispute (S31)
          </button>
          <button
            type="button"
            onClick={onMilestones}
            className="py-1.5 px-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 text-center transition"
          >
            🎯 Goal (S16)
          </button>
        </div>
      </div>

      {/* Cashfree Transfer Success Receipt Modal */}
      {payoutSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
              ✓
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Cashfree UPI Instant Transfer
              </span>
              <h3 className="text-2xl font-black text-slate-950 mt-1">₹{payoutSuccessData.amount}.00</h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">Successfully sent to your linked UPI bank account!</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 text-left space-y-1.5 border border-slate-200/80 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Bank Ref / UTR:</span>
                <span className="font-mono font-bold text-slate-800">{payoutSuccessData.utr}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Transfer Mode:</span>
                <span className="font-bold text-slate-800">Instant UPI Direct</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Time:</span>
                <span className="font-mono text-slate-800">{payoutSuccessData.time}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Settlement Status:</span>
                <span className="text-emerald-600 font-bold">100% Settled</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPayoutSuccessData(null)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm tracking-wide shadow-md transition"
            >
              Done / Return to Cockpit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
