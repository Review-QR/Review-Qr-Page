"use client";

import React, { useState } from "react";

interface Screen27Props {
  onBack?: () => void;
  onSendTest?: () => void;
}

export default function Screen27WhatsAppComposer({ onBack, onSendTest }: Screen27Props) {
  const [couponCode, setCouponCode] = useState("CAFE-BDAY-20");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [testSent, setTestSent] = useState(false);

  const handleTest = () => {
    setTestSent(true);
    setTimeout(() => {
      setTestSent(false);
      onSendTest?.();
    }, 1500);
  };

  return (
    <div className="w-full h-full bg-[#FAF5FF] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-purple-200">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
              WHATSAPP CLOUD DISPATCH
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Greeting Message Composer
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

        {/* Live WhatsApp Bubble Preview Simulation */}
        <div className="mt-2.5 bg-[#EFEAE2] rounded-2xl p-3 border border-emerald-300 shadow-inner">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 pb-1.5 border-b border-slate-300">
            <span>WhatsApp Preview • +91 98765 43210</span>
            <span>09:30 AM</span>
          </div>

          <div className="mt-2 bg-white rounded-xl p-2.5 shadow-xs space-y-1.5 text-xs text-slate-800 relative">
            <p className="font-bold text-slate-950">
              🎂 Happy Birthday Rahul! Wishing you an extraordinary year ahead from Golden Blossom Cafe!
            </p>
            <p className="text-[11px] text-slate-600">
              To celebrate your special day, enjoy a special birthday treat on us!
            </p>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-2 text-center">
              <span className="text-[9px] font-bold text-amber-800 uppercase block">
                Exclusive Birthday Gift Coupon
              </span>
              <p className="font-mono font-black text-amber-950 text-sm mt-0.5">
                {couponCode}
              </p>
              <span className="text-[9px] text-amber-700">
                Flat {discountPercent}% OFF on your table or online order
              </span>
            </div>

            <div className="text-[9px] text-slate-400 text-right">
              Delivered • Read ✓✓
            </div>
          </div>
        </div>

        {/* Customization Inputs */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Coupon Code
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Discount Percentage
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-600">%</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500">
            Automated message costs <strong>1 Connect Credit</strong> per successful WhatsApp delivery.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {testSent ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Test WhatsApp Message Sent to Your Phone!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleTest}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>📱 Send Test Message to My Phone (+91 9118643415)</span>
          </button>
        )}
      </div>
    </div>
  );
}
