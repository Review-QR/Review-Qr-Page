"use client";

import React, { useState, useEffect } from "react";
import { riderAudio } from "@/lib/audio/rider-siren";

interface Screen15Props {
  riderId?: string;
  walletBalanceProp?: number;
  todayEarningsProp?: number;
  todayTripsCountProp?: number;
  upiIdProp?: string;
  riderUpiProp?: string;
  tripsProp?: Array<{
    id: string;
    orderId: string;
    shopName: string;
    amount: number;
    deliveredAt: string;
    paymentMode: string;
  }>;
  onInstantPayout?: () => Promise<{ success: boolean; utr?: string; error?: string } | void> | void;
  onRemitCash?: () => void;
  onClaimParking?: () => void;
  onDisputePenalty?: () => void;
  onMilestones?: () => void;
  onBack?: () => void;
}

export default function Screen15Passbook({
  riderId,
  walletBalanceProp = 0,
  todayEarningsProp = 0,
  todayTripsCountProp = 0,
  upiIdProp,
  riderUpiProp,
  tripsProp,
  onInstantPayout,
  onRemitCash,
  onClaimParking,
  onDisputePenalty,
  onMilestones,
  onBack,
}: Screen15Props) {
  const [currentBalance, setCurrentBalance] = useState<number>(walletBalanceProp);
  const [trips, setTrips] = useState<any[]>(tripsProp || []);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [payoutSuccessData, setPayoutSuccessData] = useState<{ amount: number; utr: string; time: string } | null>(null);

  const activeUpi = upiIdProp || riderUpiProp || (typeof window !== "undefined" ? localStorage.getItem("trustit_rider_upi") || "" : "");

  useEffect(() => {
    setCurrentBalance(walletBalanceProp);
  }, [walletBalanceProp]);

  // Load genuine trips from scorecard API if not passed via props
  useEffect(() => {
    if (tripsProp && tripsProp.length > 0) {
      setTrips(tripsProp);
      return;
    }

    async function loadTrips() {
      if (!riderId || riderId === "rider_new_partner") return;
      try {
        const res = await fetch(`/api/hyperlocal/rider?riderId=${riderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.scorecard?.recentTrips) {
            setTrips(data.scorecard.recentTrips);
          }
        }
      } catch {}
    }

    loadTrips();
  }, [riderId, tripsProp]);

  const handlePayoutTrigger = async () => {
    if (currentBalance <= 0) {
      alert("⚠️ No withdrawable balance available.");
      return;
    }
    if (!activeUpi) {
      alert("⚠️ Please configure your UPI ID in Profile first.");
      return;
    }

    setIsProcessing(true);
    try {
      if (onInstantPayout) {
        const result: any = await onInstantPayout();
        if (result && result.success === false) {
          alert(`⚠️ ${result.error || "Withdrawal failed."}`);
          setIsProcessing(false);
          return;
        }
        const transferred = currentBalance;
        setCurrentBalance(0);
        setIsProcessing(false);
        setPayoutSuccessData({
          amount: transferred,
          utr: result?.utr || `TR-UPI-${Date.now().toString().slice(-6)}`,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        });
        riderAudio.playCashChime();
        return;
      }

      // Direct fallback to API
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_payout",
          riderId,
          destinationUpi: activeUpi,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`⚠️ ${data.error || "Withdrawal request could not be processed."}`);
        setIsProcessing(false);
        return;
      }
      const transferred = currentBalance;
      setCurrentBalance(0);
      setIsProcessing(false);
      setPayoutSuccessData({
        amount: transferred,
        utr: data.utr || data.referenceId || "Pending Verification",
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      });
      riderAudio.playCashChime();
    } catch (e: any) {
      alert(`⚠️ ${e?.message || "Network error. Please try again."}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline cursor-pointer"
          >
            <span>← Cockpit</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Passbook &amp; Earnings Ledger</span>
        </div>

        {/* Balance Hero Card */}
        <div className="mt-2.5 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">
                Net Withdrawable Balance
              </span>
              <strong className="text-2xl font-black block leading-tight">₹{currentBalance}.00</strong>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={handlePayoutTrigger}
                disabled={isProcessing || currentBalance <= 0}
                className="py-1.5 px-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-sm border border-amber-200/80 flex items-center gap-1 transition active:scale-95 disabled:opacity-50 whitespace-nowrap ml-auto cursor-pointer"
              >
                <span>⚡</span>
                <span>{isProcessing ? "Transferring..." : "1-Tap Transfer"}</span>
                <span className="text-[9px]">➔</span>
              </button>
              <span className="text-[9px] font-mono text-blue-200 block mt-1">
                UPI: {activeUpi || "Not Configured"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-400/20 grid grid-cols-2 gap-2 text-center text-[10px]">
            <div>
              <span className="text-blue-200 block font-semibold">Today&apos;s Completed Trips</span>
              <strong className="text-white text-sm font-mono">{todayTripsCountProp}</strong>
            </div>
            <div>
              <span className="text-blue-200 block font-semibold">Today&apos;s Real Earnings</span>
              <strong className="text-emerald-300 text-sm font-mono">₹{todayEarningsProp}.00</strong>
            </div>
          </div>
        </div>

        {/* Payout Success Toast Banner */}
        {payoutSuccessData && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-800 flex items-center gap-1">
                <span>✅</span> Instant UPI Transfer Successful!
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{payoutSuccessData.time}</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              ₹{payoutSuccessData.amount}.00 transferred directly to your bank account. UTR: <strong className="font-mono">{payoutSuccessData.utr}</strong>
            </p>
          </div>
        )}

        {/* Itemized Trip Ledger */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
              Today&apos;s Trip Breakdown
            </span>
            <span className="text-[10px] font-bold text-blue-700">Live Ledger</span>
          </div>

          {trips.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-1.5 shadow-2xs">
              <span className="text-3xl block">📦</span>
              <h4 className="text-xs font-black text-slate-800">No Delivery Trips Recorded Today</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                When you accept and deliver orders, itemized trip payouts and customer payment modes will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden pr-1" style={{ scrollbarWidth: "none" }}>
              {trips.map((trip: any, idx: number) => (
                <div
                  key={trip.id || idx}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{trip.shopName || trip.merchant || "Merchant"}</strong>
                      <span className="text-[10px] text-slate-500">
                        {trip.deliveredAt ? new Date(trip.deliveredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Delivered"} · {trip.paymentMode ? String(trip.paymentMode).toUpperCase() : "PAID"}
                      </span>
                    </div>
                    <strong className="text-sm font-black text-emerald-600">₹{trip.amount || 35}.00</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-3 border-t border-slate-200 mt-3 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-center cursor-pointer"
        >
          Back to Cockpit
        </button>
      </div>
    </div>
  );
}
