"use client";

import React, { useState } from "react";

export type UpgradeReason =
  | "reviews"
  | "standees"
  | "menu"
  | "occasions"
  | "orders"
  | "ai_posters"
  | "general";

interface UniversalUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: UpgradeReason;
  onSuccessPay?: (planId: "basic" | "standard" | "premium") => void;
}

export default function UniversalUpgradeModal({
  isOpen,
  onClose,
  reason = "general",
  onSuccessPay,
}: UniversalUpgradeModalProps) {
  // Pre-select the best plan based on the contextual trigger:
  // - Reviews / Standees -> Basic (₹29) or Standard (₹49)
  // - Occasions / Menu / Orders -> Standard (₹49)
  // - AI Posters / VIP -> Premium (₹99)
  const defaultPlan =
    reason === "ai_posters"
      ? "premium"
      : reason === "reviews" || reason === "standees"
      ? "basic"
      : "standard";

  const [selectedPlan, setSelectedPlan] = useState<"basic" | "standard" | "premium">(defaultPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Contextual messaging to eliminate merchant confusion
  const reasonHints: Record<UpgradeReason, { title: string; hint: string; recommendedPlan: string }> = {
    reviews: {
      title: "Unlock All Customer Reviews & Feedbacks",
      hint: "Grahakon ki feedback padhein aur public reply dekar dukan ki rating badhayein.",
      recommendedPlan: "Basic (₹29/mo) se sabhi reviews unlock ho jayenge! Ya sirf ₹20 extra dekar Standard lein jisme Birthday Wishes bhi shamil hain.",
    },
    standees: {
      title: "Unlock Premium Standee & Decal Templates",
      hint: "Gold Luxury, Neon Cafe, Wood Block aur Salon Mirror decals ke print templates.",
      recommendedPlan: "Basic (₹29/mo) me 3 Standees aur Standard (₹49/mo) me sabhi templates unlocked hain.",
    },
    menu: {
      title: "Add Unlimited Items & Mandi Commodities",
      hint: "Free plan me 5 items shamil hain. Poora menu aur items load karne ke liye upgrade karein.",
      recommendedPlan: "Standard (₹49/mo) me 50+ items aur Kirana Mandi Master Rates shamil hain.",
    },
    occasions: {
      title: "Automate WhatsApp Birthday & Anniversary Wishes",
      hint: "Rozana subah 09:30 AM par grahakon ko unke janamdin par dukan ka card aur discount coupon bhejhein.",
      recommendedPlan: "Yeh feature Standard (₹49/mo) aur Premium (₹99/mo) me shamil hai.",
    },
    orders: {
      title: "Unlock Live Orders, KOT & Smart Parcha",
      hint: "Customer ka handwritten parcha bill karna ya Kitchen KOT thermal slip print karna.",
      recommendedPlan: "Standard (₹49/mo) me Smart Orders aur Thermal Printer connection shamil hai.",
    },
    ai_posters: {
      title: "Unlock AI Festival Posters & Doorstep Acrylic Kit",
      hint: "Diwali, Eid, Holi ke personalized dukan posters aur 1 Free Acrylic Counter Standee doorstep delivery.",
      recommendedPlan: "Yeh VIP feature Premium (₹99/mo) plan me shamil hai.",
    },
    general: {
      title: "Choose the Perfect Plan for Your Shop",
      hint: "Ek hi simple subscription se aapki dukan ke sabhi digital tools unlock ho jate hain.",
      recommendedPlan: "90% dukaandar Standard Plan (₹49/mahina) chunte hain.",
    },
  };

  const currentHint = reasonHints[reason] || reasonHints.general;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const planAmount =
        selectedPlan === "basic"
          ? billingCycle === "yearly" ? 290 : 29
          : selectedPlan === "standard"
          ? billingCycle === "yearly" ? 490 : 49
          : billingCycle === "yearly" ? 990 : 99;

      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recharge_wallet",
          data: { amount: planAmount, planId: selectedPlan, billingCycle },
        }),
      });
      const data = await res.json().catch(() => null);

      if (data?.paymentUrl && typeof window !== "undefined") {
        window.location.href = data.paymentUrl;
        return;
      }

      if (onSuccessPay) onSuccessPay(selectedPlan);
      onClose();
    } catch {
      if (onSuccessPay) onSuccessPay(selectedPlan);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scaleUp">
        {/* Header with Trust Badges */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition font-bold text-sm"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider">
              No Hidden Charges · Cancel Anytime
            </span>
            <span className="text-xs text-blue-200">100% UPI Safe</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">{currentHint.title}</h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">{currentHint.hint}</p>

          {/* Context Banner */}
          <div className="mt-3.5 bg-blue-500/20 border border-blue-400/30 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-base">💡</span>
            <span className="text-xs text-blue-100 font-medium">{currentHint.recommendedPlan}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly Recharge
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Annual Saver</span>
                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>

          {/* 3 Plan Cards (Basic, Standard, Premium) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* PLAN 1: BASIC (₹29) */}
            <div
              onClick={() => setSelectedPlan("basic")}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition relative flex flex-col justify-between ${
                selectedPlan === "basic"
                  ? "border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">Basic</span>
                  {selectedPlan === "basic" && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {billingCycle === "monthly" ? "₹29" : "₹299"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {billingCycle === "monthly" ? "/mo" : "/yr"}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-blue-700 mt-0.5">
                    {billingCycle === "monthly" ? "₹1 rozana se kam!" : "₹25/mahina"}
                  </p>
                </div>

                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>All Customer Reviews Unlocked</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Public Reply to Reviews</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Negative Review Shield</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>3 Printable Standee PDFs</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-slate-300">✕</span>
                    <span className="line-through">WhatsApp Birthday CRM</span>
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-slate-300">✕</span>
                    <span className="line-through">Smart Orders &amp; KOT</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block text-center">
                  Reviews &amp; Trust ke liye
                </span>
              </div>
            </div>

            {/* PLAN 2: STANDARD (₹49) — MOST POPULAR */}
            <div
              onClick={() => setSelectedPlan("standard")}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition relative flex flex-col justify-between ${
                selectedPlan === "standard"
                  ? "border-emerald-600 bg-emerald-50/40 shadow-lg ring-2 ring-emerald-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                ⭐ Most Popular (78%)
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Standard</span>
                  {selectedPlan === "standard" && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {billingCycle === "monthly" ? "₹49" : "₹499"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {billingCycle === "monthly" ? "/mo" : "/yr"}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    {billingCycle === "monthly" ? "Sirf ₹1.6/din — Chai se sasta" : "₹41/mahina"}
                  </p>
                </div>

                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="text-emerald-600">✓</span>
                    <span>Basic ke Saare Features +</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>WhatsApp Birthday &amp; Anniv. CRM</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Smart Orders (KOT / Parcha)</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Mandi Rates / 50 Menu Items</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>All 6 Standee Designs</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Priority WhatsApp Support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-emerald-800 block text-center">
                  Grahak aur Dhandha Badhane ke liye
                </span>
              </div>
            </div>

            {/* PLAN 3: PREMIUM (₹99) */}
            <div
              onClick={() => setSelectedPlan("premium")}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition relative flex flex-col justify-between ${
                selectedPlan === "premium"
                  ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900">Premium VIP</span>
                  {selectedPlan === "premium" && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {billingCycle === "monthly" ? "₹99" : "₹999"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {billingCycle === "monthly" ? "/mo" : "/yr"}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-indigo-700 mt-0.5">
                    {billingCycle === "monthly" ? "₹3.3 rozana — Pura System" : "Includes Free Physical Standee"}
                  </p>
                </div>

                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="text-indigo-600">✓</span>
                    <span>Standard ke Saare Features +</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>1 Free Acrylic Standee Delivered</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>AI Festival Posters Creator</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>High-Attention Loud Siren</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>Cashfree Instant Bank Settlement</span>
                  </li>
                  <li className="flex items-center gap-1.5 font-medium">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span>Dedicated Account Manager</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-indigo-800 block text-center">
                  VIP Brand &amp; Badi Dukaan
                </span>
              </div>
            </div>
          </div>

          {/* Dukaandar Trust & Assurance Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">🛡️ Free Standee Guarantee:</span>
              <span>Aapka QR Code counter par hamesha kaam karega, plan expire hone par bhi band nahi hoga.</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-slate-700">
              <span>✓ No Auto-Debit</span>
              <span>✓ Instant UPI (GPay/PhonePe/Paytm)</span>
              <span>✓ GST Tax Invoice</span>
            </div>
          </div>

          {/* Action Trigger / Cashfree UPI Checkout */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs text-slate-500 font-medium">Selected Plan Total:</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {selectedPlan === "basic"
                    ? billingCycle === "monthly"
                      ? "₹29"
                      : "₹299"
                    : selectedPlan === "standard"
                    ? billingCycle === "monthly"
                      ? "₹49"
                      : "₹499"
                    : billingCycle === "monthly"
                    ? "₹99"
                    : "₹999"}
                </span>
                <span className="text-xs text-slate-600 font-bold uppercase">
                  ({selectedPlan.toUpperCase()} · {billingCycle})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
              >
                Baad me dekhein
              </button>

              <button
                type="button"
                disabled={isProcessing || paymentSuccess}
                onClick={handlePay}
                className="w-2/3 sm:w-auto flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/25 hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Opening Cashfree UPI...</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <span className="text-base">🎉</span>
                    <span>Recharge Successful! Unlocking...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Pay via UPI (GPay / PhonePe)</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
