"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

interface Screen14Props {
  amount?: number;
  orderCode?: string;
  upiVpa?: string;
  onPaymentReceived?: () => void;
  onBack?: () => void;
}

export default function Screen14DynamicQr({
  amount = 0,
  orderCode = "TR-LIVE",
  upiVpa = "trustit@icici",
  onPaymentReceived,
  onBack,
}: Screen14Props) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const payeeName = "Trustit Technologies";
  const validAmount = Number(amount || 0);
  const upiIntentString = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${validAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderCode}`)}`;

  // Generate high-res scannable QR Code
  useEffect(() => {
    if (validAmount <= 0) return;
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
  }, [upiIntentString, validAmount]);

  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentReceived?.();
      }, 800);
    }, 1000);
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none overflow-y-auto">
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
            Dynamic UPI POS
          </span>
        </div>

        {/* Amount & Title */}
        <div className="mt-2 text-center space-y-0.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-[#0D47A1]">
            OFFICIAL PLATFORM POS TERMINAL
          </span>
          <h2 className="text-sm font-black text-slate-900 leading-tight">
            Scan to Pay Exact Amount (₹{validAmount.toFixed(2)})
          </h2>
          <p className="text-[11px] text-slate-500">
            Customer scans with PhonePe, Google Pay, Paytm, or BHIM.
          </p>
        </div>

        {/* Dynamic Scannable QR Terminal Card */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-2">
          {/* QR Graphic Container */}
          <div className="relative w-40 h-40 mx-auto bg-slate-950 rounded-xl p-2 shadow-xs flex flex-col items-center justify-center">
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

          {/* VPA Details */}
          <div className="text-center">
            <p className="text-xs font-mono font-bold text-slate-800">{upiVpa}</p>
            <p className="text-[10px] text-slate-400">Order Ref: {orderCode}</p>
          </div>
        </div>
      </div>

      {/* Confirmation Button */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={isVerifying || paymentSuccess}
          className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition ${
            paymentSuccess
              ? "bg-emerald-600 text-white"
              : isVerifying
              ? "bg-blue-300 text-white cursor-wait"
              : "bg-[#0D47A1] hover:bg-[#082b66] text-white active:scale-[0.98]"
          }`}
        >
          {paymentSuccess ? (
            <span>Payment Verified ✓</span>
          ) : isVerifying ? (
            <span>Verifying UPI Receipt...</span>
          ) : (
            <span>Confirm UPI Payment Received</span>
          )}
        </button>
      </div>
    </div>
  );
}
