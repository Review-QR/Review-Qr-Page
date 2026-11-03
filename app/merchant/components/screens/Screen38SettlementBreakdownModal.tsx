"use client";

import React from "react";

interface Screen38Props {
  onBack?: () => void;
}

export default function Screen38SettlementBreakdownModal({ onBack }: Screen38Props) {
  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              SETTLEMENT VOUCHER
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Payout Breakdown (Nov 03)
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ✕ Close
          </button>
        </div>

        {/* Transparent Calculation Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">
            Escrow Reconciliation Summary
          </span>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-800">
              <span>Gross Customer Collections (8 Orders)</span>
              <span className="font-mono font-bold text-slate-900">₹2,840.00</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Trustit Hyperlocal Platform Fee (0% Promo)</span>
              <span className="font-mono text-emerald-700">₹0.00</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Cashfree Gateway MDR (1.75% + GST)</span>
              <span className="font-mono text-rose-700">-₹56.80</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Customer Tips Passed 100% to Merchant</span>
              <span className="font-mono text-emerald-700">+₹0.00</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-950">
              <span>Net Amount Credited to Bank:</span>
              <span className="font-mono text-emerald-700">₹2,783.20</span>
            </div>
          </div>
        </div>

        {/* Bank Wire Details */}
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">
            Wire Information
          </span>
          <div className="flex justify-between text-[11px] text-slate-700">
            <span>Beneficiary:</span>
            <span className="font-bold text-slate-900">Golden Blossom Cafe</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-700">
            <span>Bank:</span>
            <span className="font-bold text-slate-900">HDFC Bank, Civil Lines Bahraich</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-700">
            <span>Account Number:</span>
            <span className="font-mono text-slate-900">•••• •••• 4091</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-700">
            <span>IFSC Code:</span>
            <span className="font-mono text-slate-900">HDFC0001892</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          Close Breakdown Sheet
        </button>
      </div>
    </div>
  );
}
