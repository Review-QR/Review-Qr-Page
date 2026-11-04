"use client";

import React, { useState } from "react";

interface Screen23Props {
  storeName?: string;
  ownerName?: string;
  phone?: string;
  onBack?: () => void;
  onPaySuccess?: () => void;
}

export default function Screen23CartCheckout({
  storeName = "Verified Store Outlet",
  ownerName = "Merchant Partner",
  phone = "+91 Verified Contact",
  onBack,
  onPaySuccess,
}: Screen23Props) {
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      onPaySuccess?.();
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              CHECKOUT &amp; FULFILLMENT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Order Standee Merchandise
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

        {/* Shipping Address Confirmation */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">
              Delivery Destination (Store Address)
            </span>
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
          <p className="font-bold text-slate-900">{storeName} (Attn: {ownerName})</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Bahraich Market Center, Uttar Pradesh - 271801
          </p>
          <p className="text-[10px] text-slate-700 font-mono font-bold">Contact: {phone}</p>
        </div>

        {/* Cart Item Summary */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">
            Order Items (1 Product)
          </span>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <div>
                <p className="font-bold text-slate-900">Premium Acrylic A5 Standee</p>
                <span className="text-[10px] text-slate-500">Theme: Cafe Gold • Laser QR Embedded</span>
              </div>
            </div>
            <span className="font-mono font-bold text-slate-900">₹299.00</span>
          </div>

          {/* Pricing Math */}
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-mono">₹299.00</span>
            </div>
            <div className="flex justify-between">
              <span>GST Tax (18% Input Credit)</span>
              <span className="font-mono">₹53.82</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Courier Delivery</span>
              <span>FREE (Standard)</span>
            </div>
            <div className="flex justify-between text-xs font-black text-slate-950 pt-1.5 border-t border-slate-200">
              <span>Net Payable (Cashfree Gateway)</span>
              <span className="font-mono text-sm text-blue-700">₹352.82</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🔒</span>
            <span className="text-[11px] font-bold text-slate-800">100% Secure via Cashfree Gateway</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">UPI / GPay / Cards</span>
        </div>
      </div>

      {/* Pay CTA */}
      <div className="pt-2">
        {paying ? (
          <div className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs text-center shadow-xs animate-pulse">
            Connecting Cashfree UPI Escrow...
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePay}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-2"
          >
            <span>✓ PAY ₹352.82 VIA UPI / CASHFREE</span>
          </button>
        )}
      </div>
    </div>
  );
}
