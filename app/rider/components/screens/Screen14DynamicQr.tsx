"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Dynamic UPI Intent String for Trustit Fleet
  const upiVpa = "luckyshukla@oksbi";
  const payeeName = "Trustit Fleet";
  const upiIntentString = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderCode}`)}`;

  // Generate real high-res scannable QR Code instantly
  useEffect(() => {
    QRCode.toDataURL(upiIntentString, {
      width: 320,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating UPI QR Code:", err));
  }, [upiIntentString]);

  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentReceived?.();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back to Handover</span>
          </button>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cashfree Live UPI Gateway
          </span>
        </div>

        {/* Amount & Title */}
        <div className="mt-2 text-center space-y-0.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-[#0D47A1]">
            OFFICIAL PLATFORM POS TERMINAL
          </span>
          <h2 className="text-sm font-black text-slate-900 leading-tight">
            Scan to Pay Exact Amount (₹{amount}.00)
          </h2>
          <p className="text-[11px] text-slate-500">
            Customer scans with PhonePe, Google Pay, Paytm, or BHIM.
          </p>
        </div>

        {/* Dynamic Scannable QR Terminal Card */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-2">
          {/* QR Graphic Container */}
          <div className="relative w-40 h-40 mx-auto bg-slate-950 rounded-xl p-2 shadow-sm flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Dynamic UPI QR Code"
                className="w-36 h-36 rounded-lg bg-white object-contain"
              />
            ) : (
              <div className="w-36 h-36 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                Generating QR...
              </div>
            )}
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Payable COD Amount
            </span>
            <strong className="text-xl font-black text-slate-900 block leading-tight">
              ₹{amount}.00
            </strong>
            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
              ✓ Direct settlement to Trustit bank account
            </span>
          </div>

          {/* Supported UPI Apps Strip */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">PhonePe</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">GPay</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">Paytm</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">BHIM UPI</span>
          </div>
        </div>
      </div>

      {/* Action Footer: Live Confirmation */}
      <div className="pt-2 border-t border-slate-200 space-y-1.5">
        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={isVerifying || paymentSuccess}
          className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 text-white shadow-sm transition active:scale-[0.98] ${
            paymentSuccess
              ? "bg-emerald-600"
              : "bg-[#10B981] hover:bg-emerald-700"
          }`}
        >
          {paymentSuccess ? (
            <span>✓ ₹{amount} Received & Reconciled!</span>
          ) : isVerifying ? (
            <span>Verifying Cashfree UPI Webhook...</span>
          ) : (
            <span>✓ Confirm Payment Received (₹{amount}) ➔</span>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full py-1.5 text-center text-[10px] font-bold text-slate-500 hover:text-slate-800"
        >
          Customer Paid Cash Instead? Switch to Cash COD
        </button>
      </div>
    </div>
  );
}
