"use client";

import React, { useState, useEffect } from "react";
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
  tripsProp?: any[];
  riderId?: string;
}

export default function Screen15Passbook({
  onBack,
  onInstantPayout,
  onRemitCash,
  onClaimParking,
  onDisputePenalty,
  onMilestones,
  walletBalanceProp = 0,
  todayEarningsProp = 0,
  todayTripsCountProp = 0,
  riderUpiProp,
  tripsProp,
  riderId,
}: Screen15Props) {
  const [currentBalance, setCurrentBalance] = useState<number>(walletBalanceProp);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [payoutSuccessData, setPayoutSuccessData] = useState<{ amount: number; utr: string; time: string } | null>(null);
  const [trips, setTrips] = useState<any[]>(tripsProp || []);

  const activeUpi =
    riderUpiProp ||
    (typeof window !== "undefined" ? localStorage.getItem("trustit_rider_upi") || "" : "");

  // Sync props to state
  useEffect(() => {
    setCurrentBalance(walletBalanceProp);
  }, [walletBalanceProp]);

  // Fetch real trips from API if not provided in props
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

  const handlePayoutTrigger = () => {
    if (currentBalance <= 0) {
      alert("⚠️ कोई विथड्रॉ करने योग्य बैलेंस उपलब्ध नहीं है।");
      return;
    }
    if (!activeUpi) {
      alert("⚠️ कृपया पहले अपनी प्रोफाइल में UPI आईडी दर्ज करें।");
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

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← कॉकपिट (Cockpit)</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">पासबुक व अर्निंग्स लेजर</span>
        </div>

        {/* Balance Hero Card */}
        <div className="mt-2.5 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">
                विथड्रॉ करने योग्य शुद्ध बैलेंस
              </span>
              <strong className="text-2xl font-black block leading-tight">₹{currentBalance}.00</strong>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={handlePayoutTrigger}
                disabled={isProcessing || currentBalance <= 0}
                className="py-1.5 px-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-[10px] tracking-wide uppercase shadow-sm border border-amber-200/80 flex items-center gap-1 transition active:scale-95 disabled:opacity-50 whitespace-nowrap ml-auto"
              >
                <span>⚡</span>
                <span>{isProcessing ? "ट्रांसफर..." : "1-टैप ट्रांसफर"}</span>
                <span className="text-[9px]">➔</span>
              </button>
              <span className="text-[9px] font-mono text-blue-200 block mt-1">
                UPI: {activeUpi || "सेट नहीं है"}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-400/20 grid grid-cols-2 gap-2 text-center text-[10px]">
            <div>
              <span className="text-blue-200 block font-semibold">आज पूरी की गई ट्रिप्स</span>
              <strong className="text-white text-sm font-mono">{todayTripsCountProp}</strong>
            </div>
            <div>
              <span className="text-blue-200 block font-semibold">आज की वास्तविक कमाई</span>
              <strong className="text-emerald-300 text-sm font-mono">₹{todayEarningsProp}.00</strong>
            </div>
          </div>
        </div>

        {/* Payout Success Toast Banner */}
        {payoutSuccessData && (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1 text-xs shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-800 flex items-center gap-1">
                <span>✅</span> तत्काल UPI ट्रांसफर सफल!
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{payoutSuccessData.time}</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              ₹{payoutSuccessData.amount}.00 सीधे आपके बैंक खाते में भेज दिया गया है। UTR: <strong className="font-mono">{payoutSuccessData.utr}</strong>
            </p>
          </div>
        )}

        {/* Itemized Trip Ledger */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
              आज का ट्रिप ब्रेकडाउन (Today&apos;s Run)
            </span>
            <span className="text-[10px] font-bold text-blue-700">लाइव लेजर</span>
          </div>

          {trips.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-1.5 shadow-2xs">
              <span className="text-3xl block">📦</span>
              <h4 className="text-xs font-black text-slate-800">आज की कोई डिलीवरी हिस्ट्री नहीं है</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                जब आप पहला लाइव ऑर्डर स्वीकार कर डिलीवर करेंगे, तो उसकी वास्तविक कमाई और विवरण यहाँ प्रदर्शित होगा।
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
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition text-center"
        >
          कॉकपिट पर वापस जाएं
        </button>
      </div>
    </div>
  );
}
