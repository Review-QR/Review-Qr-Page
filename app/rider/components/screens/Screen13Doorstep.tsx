"use client";

import React, { useState } from "react";

interface Screen13Props {
  onShowDynamicQr?: () => void;
  onDelivered?: (otp: string) => void;
  onBack?: () => void;
  onDoorstepChangeRefund?: () => void;
  onCustomerUnreachable?: () => void;
  onContactlessPhotoPod?: () => void;
  onCallMasked?: () => void;
  customerPhone?: string;
  activeOrder?: {
    id: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: any;
    total_amount?: number;
    payment_mode?: string;
  } | null;
}

export default function Screen13Doorstep({
  onShowDynamicQr,
  onDelivered,
  onBack,
  onDoorstepChangeRefund,
  onCustomerUnreachable,
  onContactlessPhotoPod,
  onCallMasked,
  customerPhone,
  activeOrder,
}: Screen13Props) {
  // Empty 4-box OTP for genuine production verification
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const fullOtp = digits.join("");

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }
    const updated = [...digits];
    updated[index] = clean.slice(-1);
    setDigits(updated);

    if (index < 3 && clean) {
      const nextInput = document.getElementById(`doorstep-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const customerName = activeOrder?.customer_name || "Delivery Customer";
  const phoneToCall = activeOrder?.customer_phone || customerPhone || "";

  let dropAddress = "Customer Destination Address, Bahraich";
  let landmark = "Bahraich City Center";
  if (activeOrder?.customer_address) {
    if (typeof activeOrder.customer_address === "string") {
      dropAddress = activeOrder.customer_address;
    } else if (typeof activeOrder.customer_address === "object") {
      dropAddress =
        activeOrder.customer_address.address_line ||
        activeOrder.customer_address.formatted_address ||
        activeOrder.customer_address.area ||
        "Customer Doorstep Address";
      landmark = activeOrder.customer_address.landmark || "Bahraich Service Area";
    }
  }

  const isCod = activeOrder?.payment_mode?.toLowerCase() === "cod";
  const orderAmount = Number(activeOrder?.total_amount || 0);

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans overflow-y-auto">
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
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Destination</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">{customerName}</h3>
              <p className="text-[11px] text-slate-500">{dropAddress}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onCallMasked) onCallMasked();
                else if (typeof window !== "undefined" && phoneToCall) window.location.href = `tel:${phoneToCall}`;
              }}
              className="p-2 rounded-xl bg-blue-50 text-[#0D47A1] border border-blue-200 text-xs font-bold hover:bg-blue-100 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>📞</span>
              <span>Masked Call</span>
            </button>
          </div>

          {/* Payment & Offline Cache Indicator */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{isCod ? `Cash Collection: ₹${orderAmount.toFixed(2)}` : "Prepaid Online Order"}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Landmark: {landmark}</span>
          </div>
        </div>

        {/* 4-Digit Secret Handover OTP Box */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Anti-Fraud Delivery Verification
            </span>
            <p className="text-xs text-slate-700 font-semibold mt-0.5">
              Grahak se unke mobile app me aaya 4-digit OTP pooch kar dalein:
            </p>
          </div>

          {/* 4 Boxes */}
          <div className="flex justify-center gap-2.5">
            {digits.map((digit, i) => (
              <input
                key={i}
                id={`doorstep-otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                className="w-12 h-14 text-center text-xl font-black font-mono border-2 border-slate-300 rounded-xl focus:border-[#0D47A1] focus:bg-blue-50/30 focus:outline-none transition"
                placeholder="•"
              />
            ))}
          </div>

          {/* Secondary Actions: Dynamic UPI QR & Change Refund */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={onShowDynamicQr}
              className="py-2.5 px-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold hover:bg-purple-100 flex items-center justify-center gap-1 transition"
            >
              <span>⚡</span>
              <span>Dynamic UPI QR</span>
            </button>
            <button
              type="button"
              onClick={onDoorstepChangeRefund}
              className="py-2.5 px-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 flex items-center justify-center gap-1 transition"
            >
              <span>👛</span>
              <span>No Change Refund</span>
            </button>
          </div>

          {/* Safety Exception Actions */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
            <button
              type="button"
              onClick={onCustomerUnreachable}
              className="hover:text-red-600 transition"
            >
              Grahak phon nahi utha raha?
            </button>
            <button
              type="button"
              onClick={onContactlessPhotoPod}
              className="text-[#0D47A1] font-bold hover:underline"
            >
              📷 Photo PoD
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer: Complete Delivery */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onDelivered?.(fullOtp)}
          disabled={fullOtp.length !== 4}
          className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition ${
            fullOtp.length === 4
              ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>OTP Confirm Delivery ➔ Release Payout</span>
          <span>✓</span>
        </button>
      </div>
    </div>
  );
}
