"use client";

import React, { useState } from "react";

interface Screen29Props {
  onBack?: () => void;
  onInitiateReturn?: () => void;
  onConfirmMerchantReturn?: () => void;
}

export default function Screen29CustomerRefusalRto({
  onBack,
  onInitiateReturn,
  onConfirmMerchantReturn,
}: Screen29Props) {
  const [refusalReason, setRefusalReason] = useState<string>("Customer Refused COD Payment");
  const [returnStep, setReturnStep] = useState<"refusal" | "returning">("refusal");

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
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Doorstep Incident
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Order Refused (RTO Flow)</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-full py-0.5 border border-emerald-200">
            +₹25
          </span>
        </div>

        {/* Refusal Hero Banner */}
        <div className="mt-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Active COD Order</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
              Customer Refused
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-2 leading-relaxed">
            Do not leave the parcel. Return package intact to <strong>Original Merchant Store</strong> or nearest Trustit Hub.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
            <span>💰 Extra Return Allowance:</span>
            <span className="font-mono text-white bg-emerald-700/60 px-2 py-0.5 rounded">+₹25.00 Credited</span>
          </div>
        </div>

        {returnStep === "refusal" ? (
          /* Reason Selection */
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Select Customer Refusal Reason:
            </h4>
            <div className="space-y-1.5">
              {[
                "Customer Refused COD Payment",
                "Customer claims order was placed by mistake",
                "Customer angry due to cooking delay at merchant",
                "Wrong item / Seal damaged by restaurant",
              ].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRefusalReason(reason)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold border transition ${
                    refusalReason === reason
                      ? "bg-rose-50 border-rose-500 text-rose-900"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  {refusalReason === reason ? "✓ " : "○ "} {reason}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Returning Route to Merchant */
          <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900">Return Route Active</span>
              <span className="text-[10px] font-bold text-[#0D47A1]">ETA: 12 Mins (1.8 km)</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center text-lg shrink-0">
                🏪
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Return to: Merchant Store Partner</p>
                <p className="text-[10px] text-slate-500">Civil Lines, Bahraich · Counter Staff Contact: 9876543211</p>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              Merchant will enter return acknowledgement code upon receipt.
            </div>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {returnStep === "refusal" ? (
          <button
            type="button"
            onClick={() => {
              setReturnStep("returning");
              onInitiateReturn?.();
            }}
            className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
          >
            <span>Start Return Route to Merchant (+₹25)</span>
            <span>➔</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onConfirmMerchantReturn}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <span>Confirm Package Handover to Merchant</span>
            <span>✓</span>
          </button>
        )}
        <p className="text-center text-[10px] text-slate-400">
          Strict Audit · Sealed return prevents wrongful dispute deductions
        </p>
      </div>
    </div>
  );
}
