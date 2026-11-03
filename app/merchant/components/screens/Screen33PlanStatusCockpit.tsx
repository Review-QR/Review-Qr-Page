"use client";

import React, { useState } from "react";
import CashfreePaymentModal, { CashfreePlan } from "@/app/merchant/components/CashfreePaymentModal";

interface Screen33Props {
  onBack?: () => void;
  onUpgrade?: () => void;
  onViewInvoices?: () => void;
}

export default function Screen33PlanStatusCockpit({
  onBack,
  onUpgrade,
  onViewInvoices,
}: Screen33Props) {
  // Day lifecycle state:
  // - "trial_active": Days 1 - 30 (Full Access Free)
  // - "day_31_expired": Day 31+ (QR Active, Panel Prompts for Subscription)
  // - "subscribed": Paid Active (₹29 / ₹49 / ₹99)
  const [lifecycleState, setLifecycleState] = useState<"trial_active" | "day_31_expired" | "subscribed">("day_31_expired");
  const [selectedPlanId, setSelectedPlanId] = useState<"basic" | "standard" | "premium">("standard");
  const [isCashfreeOpen, setIsCashfreeOpen] = useState<boolean>(false);
  const [autoRenew, setAutoRenew] = useState<boolean>(true);

  const plans: Record<"basic" | "standard" | "premium", CashfreePlan> = {
    basic: { id: "basic", name: "Basic", price: 29, period: "month" },
    standard: { id: "standard", name: "Standard", price: 49, period: "month" },
    premium: { id: "premium", name: "Premium VIP", price: 99, period: "month" },
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                SUBSCRIPTION LIFECYCLE
              </span>
              <span
                className={`text-[9px] font-extrabold px-2 py-0.2 rounded-full border ${
                  lifecycleState === "trial_active"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : lifecycleState === "day_31_expired"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {lifecycleState === "trial_active"
                  ? "Day 1-30 Free Trial"
                  : lifecycleState === "day_31_expired"
                  ? "Day 31+ Expired"
                  : "Subscribed Active"}
              </span>
            </div>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Subscription &amp; Plan Cockpit
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Demo State Switcher */}
            <select
              value={lifecycleState}
              onChange={(e) => setLifecycleState(e.target.value as any)}
              className="text-[9px] font-bold px-2 py-1 rounded bg-white text-slate-700 border border-slate-300 shadow-2xs cursor-pointer focus:outline-hidden"
              title="Test Day 1-30 vs Day 31 Expired vs Subscribed"
            >
              <option value="trial_active">Day 1-30: Free Trial</option>
              <option value="day_31_expired">Day 31: Trial Over</option>
              <option value="subscribed">Subscribed (Active)</option>
            </select>

            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SCENARIO 1: DAY 31+ FREE TRIAL EXPIRED (As User Requested)     */}
        {/* QR Active on Desk, but Panel Prompts for Subscription           */}
        {/* ============================================================== */}
        {lifecycleState === "day_31_expired" && (
          <div className="mt-3 space-y-3">
            {/* Alert Banner */}
            <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200 rounded-2xl p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <div>
                  <h3 className="text-xs font-black text-rose-950">
                    Day 31: 30-Day Free VIP Access Expired
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Aapka 1st month free trial poora ho gaya hai. Uninterrupted service ke liye plan subscribe karein.
                  </p>
                </div>
              </div>

              {/* Free Standee Guarantee reassurance */}
              <div className="mt-2.5 pt-2 border-t border-rose-200/60 flex items-center justify-between text-[10px] text-emerald-800 font-bold bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1">
                  <span>🛡️</span>
                  <span>Counter QR Standee Hamesha Active Rahega!</span>
                </span>
                <span className="text-emerald-700">Scans Active ✓</span>
              </div>
            </div>

            {/* Choose from 3 Transparent Plans */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                Choose a Plan for Uninterrupted Business (Cancel Anytime)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Plan 1: Basic (₹29) */}
                <div
                  onClick={() => setSelectedPlanId("basic")}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                    selectedPlanId === "basic"
                      ? "border-blue-600 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-800">Basic</span>
                      {selectedPlanId === "basic" && (
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xl font-black text-slate-900">₹29</span>
                      <span className="text-[10px] text-slate-500"> / month</span>
                      <p className="text-[10px] font-bold text-blue-700">₹1 rozana se kam</p>
                    </div>
                    <ul className="mt-2 space-y-1 text-[10px] text-slate-600">
                      <li>✓ All Reviews Unlocked</li>
                      <li>✓ Public Owner Reply</li>
                      <li>✓ Negative Review Filter</li>
                    </ul>
                  </div>
                </div>

                {/* Plan 2: Standard (₹49) — RECOMMENDED */}
                <div
                  onClick={() => setSelectedPlanId("standard")}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                    selectedPlanId === "standard"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.2 rounded-full uppercase">
                    ⭐ Recommended
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-800">Standard</span>
                      {selectedPlanId === "standard" && (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xl font-black text-slate-900">₹49</span>
                      <span className="text-[10px] text-slate-500"> / month</span>
                      <p className="text-[10px] font-bold text-emerald-700">₹1.6/din · Chai se sasta</p>
                    </div>
                    <ul className="mt-2 space-y-1 text-[10px] text-slate-700">
                      <li className="font-bold">✓ Basic ke Saare Features</li>
                      <li>✓ WhatsApp Birthday CRM</li>
                      <li>✓ KOT / Smart Parcha</li>
                      <li>✓ 50 Menu Items</li>
                    </ul>
                  </div>
                </div>

                {/* Plan 3: Premium (₹99) */}
                <div
                  onClick={() => setSelectedPlanId("premium")}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                    selectedPlanId === "premium"
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-indigo-900">Premium VIP</span>
                      {selectedPlanId === "premium" && (
                        <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span className="text-xl font-black text-slate-900">₹99</span>
                      <span className="text-[10px] text-slate-500"> / month</span>
                      <p className="text-[10px] font-bold text-indigo-700">Full VIP OS</p>
                    </div>
                    <ul className="mt-2 space-y-1 text-[10px] text-slate-600">
                      <li className="font-bold">✓ Standard ke Saare Features</li>
                      <li>✓ Free Doorstep Acrylic Standee</li>
                      <li>✓ AI Festival Posters</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Pay via Cashfree Button */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Selected Plan:</span>
                <span className="text-sm font-black text-slate-900">
                  Trustit {plans[selectedPlanId].name} · ₹{plans[selectedPlanId].price} / month
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCashfreeOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡ Pay with Cashfree (UPI / GPay / PhonePe)</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCENARIO 2: DAY 1 - 30 FREE TRIAL ACTIVE                       */}
        {/* ============================================================== */}
        {lifecycleState === "trial_active" && (
          <div className="mt-3 space-y-3">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  1st Month 100% Free VIP Access
                </span>
                <span className="text-xs font-mono font-bold bg-white text-blue-900 px-2 py-0.5 rounded-md">
                  Day 6 of 30
                </span>
              </div>

              <h3 className="text-base font-black mt-2">Free VIP Trial Pass Active</h3>
              <p className="text-[11px] text-blue-100">
                Aapki dukan par KOT Live Orders, Full Menu Catalog, Customer Reviews, aur WhatsApp Birthday CRM sab unlocked hai!
              </p>

              <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-blue-200 block">
                    Free Days Remaining
                  </span>
                  <span className="font-mono font-black text-sm">24 Days Left</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-950/40 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/40">
                  ● 100% Free Full Access
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">After Day 30 Policy:</span>
                <span className="text-[10px] text-slate-500">
                  QR Code desk par hamesha free rahega. Subscription sirf ₹29 ya ₹49 me shuru hoga.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLifecycleState("day_31_expired")}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                Preview Day 31 Screen →
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCENARIO 3: SUBSCRIBED PAID ACTIVE                             */}
        {/* ============================================================== */}
        {lifecycleState === "subscribed" && (
          <div className="mt-3 space-y-3">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Subscription Active ✓
                </span>
                <span className="text-xs font-mono font-bold bg-white text-emerald-950 px-2 py-0.5 rounded-md">
                  ₹{plans[selectedPlanId].price} / month
                </span>
              </div>

              <h3 className="text-base font-black mt-2">
                Trustit {plans[selectedPlanId].name} Plan
              </h3>
              <p className="text-[11px] text-emerald-100">
                All features unlocked. Next monthly recharge on Dec 03, 2026.
              </p>

              <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-200 block">
                    Validity
                  </span>
                  <span className="font-mono font-black text-sm">30 Days Active</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-950/40 text-emerald-200 px-2.5 py-1 rounded-full border border-emerald-400/40">
                  ● Verified via Cashfree
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">UPI Auto-Renew Mandate</span>
                <span className="text-[10px] text-slate-500">Auto-renews on Dec 03 via Cashfree UPI</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoRenew(!autoRenew)}
                className={`w-10 h-6 rounded-full transition relative p-0.5 ${
                  autoRenew ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition shadow-xs ${
                    autoRenew ? "translate-x-4" : "translate-x-0"
                  }`}
                ></div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onViewInvoices}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition"
        >
          View Tax Invoices &amp; Billing History →
        </button>
      </div>

      {/* Cashfree Payment Gateway Simulator Modal */}
      <CashfreePaymentModal
        isOpen={isCashfreeOpen}
        onClose={() => setIsCashfreeOpen(false)}
        plan={plans[selectedPlanId]}
        shopName="Golden Blossom Cafe"
        onPaymentSuccess={() => {
          setLifecycleState("subscribed");
        }}
      />
    </div>
  );
}
