"use client";

import React, { useState } from "react";

interface Screen45Props {
  onBack?: () => void;
  onConfirmChangeRefund?: (amount: number, method: "wallet" | "upi") => void;
}

export default function Screen45DoorstepChangeWallet({
  onBack,
  onConfirmChangeRefund,
}: Screen45Props) {
  const [billAmount] = useState<number>(340);
  const [cashGiven, setCashGiven] = useState<number>(500);
  const [refundMethod, setRefundMethod] = useState<"wallet" | "upi">("wallet");
  const [customerUpi, setCustomerUpi] = useState<string>("riya.sharma@okaxis");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const changeDue = Math.max(0, cashGiven - billAmount);

  const handleRefund = () => {
    setIsSuccess(true);
    onConfirmChangeRefund?.(changeDue, refundMethod);
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Zero Doorstep Friction
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">No Cash Change Resolution</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-full py-0.5 border border-emerald-200">
            ₹{changeDue}
          </span>
        </div>

        {/* Calculation Banner */}
        <div className="mt-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/20">
            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-bold">Order #TR-4492 (COD)</span>
              <p className="text-xs text-white">Bill: ₹{billAmount} · Customer Paid: ₹{cashGiven}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-200 font-bold block uppercase">Change Due</span>
              <span className="text-2xl font-black text-amber-300">₹{changeDue}.00</span>
            </div>
          </div>
          <p className="text-[11px] text-emerald-100 mt-2">
            No physical cash change? Credit the balance instantly to customer&apos;s Trustit Wallet or UPI.
          </p>
        </div>

        {/* Method Selector */}
        <div className="mt-4 space-y-2.5">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Choose Return Method:
          </h4>

          {/* Option 1: Trustit Customer Wallet */}
          <button
            type="button"
            onClick={() => setRefundMethod("wallet")}
            className={`w-full text-left p-3 rounded-xl border-2 transition ${
              refundMethod === "wallet"
                ? "bg-emerald-50 border-emerald-500 shadow-xs"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">👛</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Add to Customer Trustit Wallet</h5>
                  <p className="text-[10px] text-slate-500">Auto-applies as discount on customer&apos;s next order</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">Recommended</span>
            </div>
          </button>

          {/* Option 2: Customer UPI */}
          <button
            type="button"
            onClick={() => setRefundMethod("upi")}
            className={`w-full text-left p-3 rounded-xl border-2 transition ${
              refundMethod === "upi"
                ? "bg-emerald-50 border-emerald-500 shadow-xs"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Send to Customer UPI Address</h5>
                  <p className="text-[10px] text-slate-500">Transfers ₹{changeDue} directly to customer bank</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700">Bank Transfer</span>
            </div>
          </button>

          {refundMethod === "upi" && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase block">Customer UPI VPA:</label>
              <input
                type="text"
                value={customerUpi}
                onChange={(e) => setCustomerUpi(e.target.value)}
                className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
            <span className="text-lg">🎉</span>
            <p className="text-xs font-black text-emerald-900">₹{changeDue}.00 Refunded Successfully!</p>
            <p className="text-[10px] text-emerald-700">SMS confirmation sent to customer Riya Sharma (+91 9876543210).</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={changeDue <= 0 || isSuccess}
          onClick={handleRefund}
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-md hover:bg-emerald-700 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          <span>{isSuccess ? "Change Settled ✓" : `Send ₹${changeDue} Change & Complete Delivery`}</span>
          <span>➔</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Eliminates 100% of doorstep cash change disputes.
        </p>
      </div>
    </div>
  );
}
