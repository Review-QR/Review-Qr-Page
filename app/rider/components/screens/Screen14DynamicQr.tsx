"use client";

import React, { useState } from "react";

interface Screen14Props {
  amount?: number;
  orderCode?: string;
  onPaymentReceived?: () => void;
  onBack?: () => void;
}

export default function Screen14DynamicQr({
  amount = 340,
  orderCode = "TR-4492",
  onPaymentReceived,
  onBack,
}: Screen14Props) {
  const [isVerifying, setIsVerifying] = useState(false);

  const simulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentReceived?.();
    }, 1500);
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
            <span>← Back to Handover</span>
          </button>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Cashfree Verified QR
          </span>
        </div>

        <div className="mt-3 text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#0D47A1]">
            OFFICIAL PLATFORM POS TERMINAL
          </span>
          <h2 className="text-base font-black text-slate-900 leading-tight">
            Scan to Pay Exact Amount (₹{amount}.00)
          </h2>
          <p className="text-xs text-slate-500">
            Customer scans with PhonePe, Google Pay, Paytm or any UPI app.
          </p>
        </div>

        {/* Dynamic Cashfree QR Terminal Card */}
        <div className="mt-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-center space-y-3.5">
          {/* QR Graphic Container */}
          <div className="relative w-44 h-44 mx-auto bg-slate-950 rounded-2xl p-2.5 shadow-md flex flex-col items-center justify-center text-white">
            <div className="w-36 h-36 bg-white rounded-xl p-2 flex flex-col items-center justify-center">
              <span className="text-4xl">🏁</span>
              <span className="text-[10px] font-mono font-black text-slate-900 mt-1">
                upi://pay?pa=trustit...
              </span>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                Order #{orderCode}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payable Amount</span>
            <strong className="text-2xl font-black text-slate-900 block mt-0.5">₹{amount}.00</strong>
            <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
              ✓ Direct settlement to Trustit bank account
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 leading-tight">
            🛡️ <strong>Anti-Drift Guarantee:</strong> Is dynamic QR se payment aane par Cashfree platform automatic order reconcile kar leta hai. Rider ko personal QR dikhane ki koi zarurat nahi.
          </div>
        </div>
      </div>

      {/* Action Footer: Webhook Simulation */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={simulatePayment}
          disabled={isVerifying}
          className="w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-[#10B981] hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98] transition"
        >
          <span>{isVerifying ? "Verifying Cashfree Webhook..." : `Simulate Customer UPI Payment (₹${amount})`}</span>
          <span>➔</span>
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          Customer will pay in paper cash instead
        </button>
      </div>
    </div>
  );
}
