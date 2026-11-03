"use client";

import React, { useState } from "react";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

interface Screen25Props {
  onBack?: () => void;
  onOpenComposer?: () => void;
  onOpenPoster?: () => void;
}

export default function Screen25OccasionsCrmBoard({
  onBack,
  onOpenComposer,
  onOpenPoster,
}: Screen25Props) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [autoWish, setAutoWish] = useState<boolean>(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  const celebrants = [
    { name: "Rahul Verma", occasion: "Birthday 🎂", date: "Today (Nov 03)", coupon: "BDAY-RAHUL", status: "Sent 09:30 AM" },
    { name: "Dr. Sumit Rastogi", occasion: "Birthday 🎂", date: "Tomorrow (Nov 04)", coupon: "BDAY-SUMIT", status: "Queued" },
    { name: "Neha & Rohit Saxena", occasion: "Anniversary 💍", date: "Nov 06", coupon: "ANNIV-NEHA", status: "Queued" },
  ];

  return (
    <div className="w-full h-full bg-[#FAF5FF] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-purple-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                CUSTOMER RETENTION CRM
              </span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full border ${
                  isSubscribed
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-amber-50 text-amber-900 border-amber-300"
                }`}
              >
                {isSubscribed ? "Standard Active ✓" : "Free Plan Teaser"}
              </span>
            </div>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Occasions &amp; Auto-Wishes
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Demo Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsSubscribed(!isSubscribed)}
              className="text-[9px] font-bold px-2 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs"
            >
              {isSubscribed ? "Test Free Mode" : "Test VIP Mode"}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Automated Blast Banner */}
        <div className="mt-2.5 bg-white border border-purple-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-slate-900">09:30 AM Daily WhatsApp Auto-Blast</span>
            </div>
            {isSubscribed ? (
              <button
                type="button"
                onClick={() => setAutoWish(!autoWish)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                  autoWish ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-slate-100 border-slate-300 text-slate-500"
                }`}
              >
                {autoWish ? "Running ✓" : "Paused ⏸"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition shadow-2xs flex items-center gap-1"
              >
                <span>🔒 Locked</span>
                <span>(₹49/mo)</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Customers who scan your counter QR enter your private CRM. Trustit automatically sends rich branded WhatsApp greeting cards with a gift discount coupon.
          </p>
        </div>

        {/* Occasions Queue List */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
              Upcoming Celebrations (3 Detected)
            </span>
            {!isSubscribed && (
              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                1 Sample Visible · 2 Locked
              </span>
            )}
          </div>

          {celebrants.map((c, i) => {
            const isLocked = !isSubscribed && i > 0;

            if (isLocked) {
              return (
                <div
                  key={i}
                  className="relative bg-white border border-amber-200 rounded-2xl p-3 shadow-2xs overflow-hidden"
                >
                  <div className="filter blur-xs select-none opacity-30 pointer-events-none flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Celebrant #{i + 1}</h4>
                      <span className="text-[10px] text-purple-700 font-bold">{c.occasion}</span>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {c.date}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs flex items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎂</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {c.occasion} Alert ({c.date})
                        </p>
                        <p className="text-[10px] text-slate-500">Customer details masked</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition"
                    >
                      Unlock with ₹49/mo →
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{c.name}</h4>
                    <span className="text-[10px] text-purple-700 font-bold">{c.occasion}</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {c.date}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <span>Gift:</span>
                    <span className="font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {c.coupon}
                    </span>
                  </div>
                  <span className="text-emerald-700 font-bold">{c.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            if (!isSubscribed) setIsUpgradeModalOpen(true);
            else onOpenPoster?.();
          }}
          className="py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1"
        >
          <span>🎨 AI Poster Studio</span>
          {!isSubscribed && <span className="text-[10px] opacity-80">🔒</span>}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isSubscribed) setIsUpgradeModalOpen(true);
            else onOpenComposer?.();
          }}
          className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1"
        >
          <span>💬 WhatsApp Blast</span>
          {!isSubscribed && <span className="text-[10px] opacity-80">🔒</span>}
        </button>
      </div>

      {/* Universal Upgrade Modal */}
      <UniversalUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="occasions"
        onSuccessPay={() => {
          setIsSubscribed(true);
        }}
      />
    </div>
  );
}
