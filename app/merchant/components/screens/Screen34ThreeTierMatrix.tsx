"use client";

import React, { useState } from "react";
import CashfreePaymentModal, { CashfreePlan } from "@/app/merchant/components/CashfreePaymentModal";

interface Screen34Props {
  onBack?: () => void;
  onSelectTier?: (tier: string) => void;
}

export default function Screen34ThreeTierMatrix({ onBack, onSelectTier }: Screen34Props) {
  const [selected, setSelected] = useState<"standard" | "premium">("premium");
  const [isCashfreeOpen, setIsCashfreeOpen] = useState<boolean>(false);
  const [activePlanActivated, setActivePlanActivated] = useState<string | null>(null);

  const plans: Record<"standard" | "premium", CashfreePlan> = {
    standard: { id: "standard", name: "Standard", price: 49, period: "month" },
    premium: { id: "premium", name: "Premium VIP", price: 99, period: "month" },
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              MEMBERSHIP TIERS
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Compare Plan Features
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
          >
            ← Back
          </button>
        </div>

        {/* 3-Tier Cards */}
        <div className="mt-3 space-y-2.5">
          {/* Tier 1: Basic */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs opacity-80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase text-slate-400">Starter</span>
                <h4 className="text-xs font-bold text-slate-900">Basic Tier</h4>
              </div>
              <span className="font-mono text-xs font-bold text-slate-500">Free Forever</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Single counter QR, basic review intake, view reviews.</p>
          </div>

          {/* Tier 2: Standard */}
          <div
            onClick={() => setSelected("standard")}
            className={`p-3 rounded-2xl border-2 transition cursor-pointer shadow-2xs ${
              selected === "standard"
                ? "bg-amber-50/50 border-amber-500 ring-2 ring-amber-400/20"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-amber-700">Current Plan</span>
                <h4 className="text-xs font-black text-slate-900">Standard Tier</h4>
              </div>
              <span className="font-mono text-xs font-black text-amber-800">₹49 / month</span>
            </div>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-600">
              <li className="flex items-center gap-1.5 font-medium">✓ Full Menu &amp; Items Manager</li>
              <li className="flex items-center gap-1.5 font-medium">✓ Live Orders &amp; KOT Thermal Printing</li>
              <li className="flex items-center gap-1.5 font-medium">✓ 5 Designer Standee Templates</li>
              <li className="flex items-center gap-1.5 font-medium">✓ 30-Day Scan &amp; Peak Hour Analytics</li>
            </ul>
          </div>

          {/* Tier 3: Premium */}
          <div
            onClick={() => setSelected("premium")}
            className={`p-3 rounded-2xl border-2 transition cursor-pointer shadow-md ${
              selected === "premium"
                ? "bg-purple-50/70 border-purple-600 ring-2 ring-purple-500/20"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                  ★ RECOMMENDED
                </span>
                <h4 className="text-xs font-black text-slate-900 mt-0.5">Premium Tier</h4>
              </div>
              <span className="font-mono text-sm font-black text-purple-700">₹99 / month</span>
            </div>
            <ul className="mt-2 space-y-1 text-[10px] text-slate-700">
              <li className="flex items-center gap-1.5 font-bold text-purple-950">
                ✓ Everything in Standard Plan
              </li>
              <li className="flex items-center gap-1.5 font-bold text-purple-950">
                ✓ AI Occasion CRM &amp; 09:30 AM Birthday Wishes
              </li>
              <li className="flex items-center gap-1.5 font-bold text-purple-950">
                ✓ AI Festival &amp; Seasonal Social Poster Creator
              </li>
              <li className="flex items-center gap-1.5 font-bold text-purple-950">
                ✓ Multi-Staff Roles (Manager, Cashier, Chef)
              </li>
              <li className="flex items-center gap-1.5 font-bold text-purple-950">
                ✓ 24x7 Priority Operational Hotline Support
              </li>
            </ul>
          </div>
        </div>

        {/* Success Feedback Toast */}
        {activePlanActivated && (
          <div className="mt-2.5 text-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-xl animate-fadeIn">
            🎉 {activePlanActivated} Activated via Cashfree!
          </div>
        )}
      </div>

      {/* Footer With Official Cashfree Style Checkout Button */}
      <div className="pt-2 space-y-1.5">
        <button
          type="button"
          onClick={() => {
            setIsCashfreeOpen(true);
            onSelectTier?.(selected);
          }}
          className="w-full py-3 rounded-2xl bg-[#002244] hover:bg-[#001730] text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-950/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🔒 Pay ₹{selected === "premium" ? "99" : "49"} with Cashfree</span>
          <span>→</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-semibold">
          <span>🛡️ Cashfree 256-bit Secure</span>
          <span>•</span>
          <span>UPI / GPay / PhonePe / Cards</span>
          <span>•</span>
          <span>No Auto-Debit</span>
        </div>
      </div>

      {/* Cashfree Payment Gateway Modal */}
      <CashfreePaymentModal
        isOpen={isCashfreeOpen}
        onClose={() => setIsCashfreeOpen(false)}
        plan={plans[selected]}
        shopName="Golden Blossom Cafe"
        onPaymentSuccess={(planId) => {
          setActivePlanActivated(planId.toUpperCase());
        }}
      />
    </div>
  );
}
