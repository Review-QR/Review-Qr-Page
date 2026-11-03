"use client";

import React, { useState } from "react";

interface Screen13Props {
  onShowDynamicQr?: () => void;
  onDelivered?: (otp: string) => void;
  onBack?: () => void;
  onDoorstepChangeRefund?: () => void;
  onCustomerUnreachable?: () => void;
  onContactlessPhotoPod?: () => void;
}

export default function Screen13Doorstep({
  onShowDynamicQr,
  onDelivered,
  onBack,
  onDoorstepChangeRefund,
  onCustomerUnreachable,
  onContactlessPhotoPod,
}: Screen13Props) {
  const [digits, setDigits] = useState(["4", "4", "9", "2"]);
  const fullOtp = digits.join("");

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = clean;
    setDigits(updated);
  };

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
            <span>← Store Route</span>
          </button>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Step 2 of 2 · Doorstep Handover
          </span>
        </div>

        {/* Customer Location & Offline Dead-Zone Cache Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Destination</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">Riya Sharma</h3>
              <p className="text-[11px] text-slate-500">Flat 204, Gayatri Complex, Civil Lines, Bahraich</p>
            </div>
            <button className="p-2 rounded-xl bg-blue-50 text-[#0D47A1] border border-blue-200 text-xs font-bold hover:bg-blue-100 flex items-center gap-1">
              <span>📞</span>
              <span>Masked Call</span>
            </button>
          </div>

          {/* Offline Cache Indicator */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Offline Dead-Zone Cache Active</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Landmark: Near Water Tank</span>
          </div>
        </div>

        {/* 4-Digit Secret Handover OTP Box */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Anti-Fraud Delivery Verification
            </span>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">
              Grahak se unke mobile app me aaya 4-digit code pooch kar dalein:
            </p>
          </div>

          {/* 4 Boxes */}
          <div className="flex justify-center gap-2.5">
            {digits.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                className="w-12 h-14 text-center text-xl font-black text-slate-900 border-2 border-slate-200 rounded-2xl focus:border-[#0D47A1] focus:bg-blue-50/20 focus:outline-none shadow-xs transition"
              />
            ))}
          </div>

          <div className="p-2 rounded-xl bg-emerald-50 text-[10px] text-emerald-800 border border-emerald-200">
            🔒 Code #4492 proves customer is physically present at the doorstep.
          </div>
        </div>

        {/* COD Cash vs Dynamic Cashfree QR Selection */}
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Payment Mode: COD</span>
              <strong className="text-xs font-black text-slate-900">Collect Cash: ₹340.00</strong>
            </div>
            <span className="text-2xl">💵</span>
          </div>

          <p className="text-[10px] text-amber-800 leading-tight">
            Customer ke pass cash nahi hai ya UPI scanner maang rahe hain?
          </p>

          <button
            type="button"
            onClick={onShowDynamicQr}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            <span>📱 Show Dynamic Cashfree UPI QR (₹340)</span>
          </button>

          {/* Ground Rescue Shortcuts */}
          <div className="pt-2 border-t border-amber-200/70 grid grid-cols-3 gap-1.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={onDoorstepChangeRefund}
              className="py-1.5 px-1 bg-white hover:bg-amber-100 text-slate-900 rounded-lg border border-amber-300 text-center shadow-2xs"
            >
              🪙 Chutta Deficit (S45)
            </button>
            <button
              type="button"
              onClick={onCustomerUnreachable}
              className="py-1.5 px-1 bg-white hover:bg-amber-100 text-slate-900 rounded-lg border border-amber-300 text-center shadow-2xs"
            >
              ⏳ Unreachable (S24)
            </button>
            <button
              type="button"
              onClick={onContactlessPhotoPod}
              className="py-1.5 px-1 bg-white hover:bg-amber-100 text-slate-900 rounded-lg border border-amber-300 text-center shadow-2xs"
            >
              📸 Photo POD (S30)
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onDelivered?.(fullOtp)}
          disabled={fullOtp.length < 4}
          className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition ${
            fullOtp.length === 4
              ? "bg-[#10B981] hover:bg-emerald-700 text-white active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Complete Handover (OTP: {fullOtp})</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
