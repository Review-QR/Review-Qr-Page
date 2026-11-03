"use client";

import React, { useState } from "react";

interface Screen36Props {
  onBack?: () => void;
}

export default function Screen36GstTaxInvoices({ onBack }: Screen36Props) {
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const invoices = [
    { id: "INV-2026-10-881", month: "October 2026", amount: "₹49.00", gst: "₹7.47", status: "Paid" },
    { id: "INV-2026-09-412", month: "September 2026", amount: "₹49.00", gst: "₹7.47", status: "Paid" },
    { id: "INV-2026-08-109", month: "August 2026", amount: "₹49.00", gst: "₹7.47", status: "Paid" },
  ];

  const handleDownload = (invId: string) => {
    setDownloaded(invId);
    setTimeout(() => setDownloaded(null), 1500);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              TAX COMPLIANCE &amp; BILLS
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              GST Tax Invoices
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

        {/* GST Registration Info */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Billed To
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Input Credit Eligible
            </span>
          </div>
          <p className="font-bold text-slate-900">Golden Blossom Cafe (GSTIN: 09AAAFG1234F1Z5)</p>
          <p className="text-[10px] text-slate-500">Civil Lines, Bahraich, UP</p>
        </div>

        {/* Invoice List */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Billing History
          </span>

          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{inv.month}</h4>
                  <span className="font-mono text-[10px] text-slate-500">{inv.id}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-black text-slate-900">{inv.amount}</span>
                  <span className="text-[9px] text-slate-400 block">(GST: {inv.gst})</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ● {inv.status} via UPI AutoPay
                </span>
                <button
                  type="button"
                  onClick={() => handleDownload(inv.id)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  📥 Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {downloaded && (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Downloaded {downloaded}.pdf to device!
          </div>
        )}
      </div>
    </div>
  );
}
