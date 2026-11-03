"use client";

import React, { useState } from "react";

interface Screen35Props {
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function Screen35SubscriptionAutoPay({ onBack, onSuccess }: Screen35Props) {
  const [subscribing, setSubscribing] = useState(false);

  const handleAuthorize = () => {
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      onSuccess?.();
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[#FAF5FF] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-purple-200">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
              RECURRING AUTOPAY MANDATE
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Authorize UPI AutoPay
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

        {/* Plan Upgrade Summary */}
        <div className="mt-3 bg-white border border-purple-200 rounded-3xl p-4 shadow-sm text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shadow-2xs">
            ⭐
          </div>
          <h2 className="text-sm font-black text-slate-900">Trustit Premium Membership</h2>
          <div className="inline-flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-black text-purple-700">₹99</span>
            <span className="text-xs text-slate-500 font-bold">/ month</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Recurring monthly subscription with zero lock-in period. Cancel anytime in 1 click from console.
          </p>
        </div>

        {/* Mandate Details */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">
            Mandate Configuration (Cashfree Subscriptions)
          </span>

          <div className="space-y-1.5 text-[11px] text-slate-700">
            <div className="flex justify-between">
              <span>Merchant Entity:</span>
              <span className="font-bold text-slate-900">Trustit Tech Pvt Ltd</span>
            </div>
            <div className="flex justify-between">
              <span>Debit Frequency:</span>
              <span className="font-bold text-slate-900">Monthly on 3rd</span>
            </div>
            <div className="flex justify-between">
              <span>Max AutoPay Limit:</span>
              <span className="font-mono text-slate-900">₹99.00</span>
            </div>
            <div className="flex justify-between">
              <span>Preferred VPA:</span>
              <span className="font-mono font-bold text-blue-700">9118643415@paytm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Authorize CTA */}
      <div className="pt-2">
        {subscribing ? (
          <div className="w-full py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs text-center shadow-xs animate-pulse">
            Connecting Cashfree UPI Mandate...
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAuthorize}
            className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>🔒 AUTHORIZE ₹99 / MO AUTOPAY</span>
          </button>
        )}
      </div>
    </div>
  );
}
