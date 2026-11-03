"use client";

import React, { useState } from "react";

export type CashfreePlan = {
  id: "basic" | "standard" | "premium";
  name: string;
  price: number;
  period: "month" | "year";
};

interface CashfreePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: CashfreePlan;
  shopName?: string;
  onPaymentSuccess?: (planId: "basic" | "standard" | "premium") => void;
}

export default function CashfreePaymentModal({
  isOpen,
  onClose,
  plan,
  shopName = "Golden Blossom Cafe",
  onPaymentSuccess,
}: CashfreePaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"upi_apps" | "upi_qr" | "cards">("upi_apps");
  const [selectedApp, setSelectedApp] = useState<"phonepe" | "gpay" | "paytm" | "bhim">("phonepe");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onPaymentSuccess) onPaymentSuccess(plan.id);
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto animate-scaleUp">
        {/* Cashfree Official Header Banner */}
        <div className="bg-[#1C1D38] p-4 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition font-bold text-xs"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              Cashfree Payments · 100% Encrypted Checkout
            </span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <span className="text-xs text-slate-300 block">{shopName}</span>
              <h3 className="text-lg font-black text-white">Trustit {plan.name} Plan</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-300 block">Amount to Pay</span>
              <span className="text-2xl font-black text-emerald-400">₹{plan.price}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* SDK Clarification Info Pill (Answers User Question) */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-blue-900">
            <span className="text-base leading-none">⚡</span>
            <div>
              <p className="font-bold">No Pre-Downloaded File Needed!</p>
              <p className="text-[11px] text-blue-700 leading-tight mt-0.5">
                Cashfree Web SDK browser me hi secure UPI overlay kholta hai. Mobile par direct PhonePe/GPay khul jayega aur Desktop par QR code scan hoga.
              </p>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab("upi_apps")}
              className={`py-2 rounded-xl transition text-[11px] font-bold ${
                activeTab === "upi_apps"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📱 UPI Apps
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upi_qr")}
              className={`py-2 rounded-xl transition text-[11px] font-bold ${
                activeTab === "upi_qr"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📷 Scan QR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cards")}
              className={`py-2 rounded-xl transition text-[11px] font-bold ${
                activeTab === "cards"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💳 Cards / Net
            </button>
          </div>

          {/* TAB 1: UPI APPS (INTENT FLOW) */}
          {activeTab === "upi_apps" && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Select Your Preferred UPI App (1-Click Open)
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* PhonePe */}
                <div
                  onClick={() => setSelectedApp("phonepe")}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-2.5 transition ${
                    selectedApp === "phonepe"
                      ? "border-purple-600 bg-purple-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-700 text-white font-black text-sm flex items-center justify-center">
                    पे
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">PhonePe</h4>
                    <span className="text-[10px] text-emerald-700 font-bold">Fastest</span>
                  </div>
                </div>

                {/* Google Pay */}
                <div
                  onClick={() => setSelectedApp("gpay")}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-2.5 transition ${
                    selectedApp === "gpay"
                      ? "border-blue-600 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    GPay
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Google Pay</h4>
                    <span className="text-[10px] text-slate-500 font-medium">1-Tap Intent</span>
                  </div>
                </div>

                {/* Paytm */}
                <div
                  onClick={() => setSelectedApp("paytm")}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-2.5 transition ${
                    selectedApp === "paytm"
                      ? "border-sky-500 bg-sky-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center">
                    Paytm
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Paytm UPI</h4>
                    <span className="text-[10px] text-slate-500 font-medium">Auto-verify</span>
                  </div>
                </div>

                {/* BHIM / Any UPI */}
                <div
                  onClick={() => setSelectedApp("bhim")}
                  className={`cursor-pointer p-3 rounded-2xl border-2 flex items-center gap-2.5 transition ${
                    selectedApp === "bhim"
                      ? "border-orange-500 bg-orange-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                    BHIM
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">BHIM / Any</h4>
                    <span className="text-[10px] text-slate-500 font-medium">UPI ID</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCAN UPI QR CODE */}
          {activeTab === "upi_qr" && (
            <div className="text-center py-2 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Scan with any UPI App on your phone
              </span>

              {/* Dynamic QR Box */}
              <div className="w-36 h-36 mx-auto bg-white border-2 border-slate-900 rounded-2xl p-2 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-lg p-1.5 flex flex-col justify-between text-white">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 bg-white rounded-xs"></div>
                    <div className="w-6 h-6 bg-white rounded-xs"></div>
                  </div>
                  <div className="text-center text-[7px] font-black uppercase tracking-wider text-emerald-400">
                    UPI: ₹{plan.price}
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 bg-white rounded-xs"></div>
                    <div className="text-[8px] font-mono">BHARAT-QR</div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-medium">
                Open GPay, PhonePe, or Paytm camera to scan and pay ₹{plan.price}.
              </p>
            </div>
          )}

          {/* TAB 3: CARDS & NETBANKING */}
          {activeTab === "cards" && (
            <div className="space-y-2.5 text-left">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4532 •••• •••• 9821"
                  readOnly
                  value="4532 •••• •••• 9821"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="12/28"
                    readOnly
                    value="12/28"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="•••"
                    readOnly
                    value="•••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security & Assurance Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-bold text-slate-800">
              <span>🔒</span>
              <span>256-bit SSL</span>
            </span>
            <span>No Auto-Debit · Merchant Authorized</span>
          </div>

          {/* Pay Button / Processing */}
          <div className="pt-1">
            <button
              type="button"
              disabled={isProcessing || isSuccess}
              onClick={handleSimulatePayment}
              className="w-full py-3.5 rounded-2xl bg-[#002244] hover:bg-[#001730] text-white font-black text-sm shadow-lg shadow-blue-950/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying via Cashfree Gateway...</span>
                </>
              ) : isSuccess ? (
                <>
                  <span className="text-base">🎉</span>
                  <span>Payment Verified! Activating Plan...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{plan.price} via Cashfree</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
