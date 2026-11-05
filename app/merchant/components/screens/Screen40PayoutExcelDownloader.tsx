"use client";

import React, { useState } from "react";

interface Screen40Props {
  onBack?: () => void;
}

export default function Screen40PayoutExcelDownloader({ onBack }: Screen40Props) {
  const [downloading, setDownloading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("oct_2026");

  const handleDownload = () => {
    setDownloading(true);
    try {
      const csvContent =
        "Settlement Date,Cycle UTR,Orders Count,Gross Customer Billing (INR),Payment Gateway MDR (INR),Platform Fee (INR),TDS 194-O (INR),Net Amount Deposited (INR),Bank Account Mask,Bank Name,NPCI Status\n" +
        "2026-10-31,CMS992144820,18,5840.00,102.20,0.00,5.84,5731.96,•••• •••• 4512,State Bank of India,CREDITED_SUCCESS\n" +
        "2026-10-30,CMS991823194,22,7410.00,129.68,0.00,7.41,7272.91,•••• •••• 4512,State Bank of India,CREDITED_SUCCESS\n" +
        "2026-10-29,CMS990714210,14,4620.00,80.85,0.00,4.62,4534.53,•••• •••• 4512,State Bank of India,CREDITED_SUCCESS\n" +
        "2026-10-28,CMS989412039,19,6120.00,107.10,0.00,6.12,6006.78,•••• •••• 4512,State Bank of India,CREDITED_SUCCESS\n";
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Trustit_Payout_Ledger_${selectedMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              FINANCIAL AUDIT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Payout Excel Statement Downloader
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

        {/* Info Card */}
        <div className="mt-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl p-3 shadow-xs space-y-1 text-xs">
          <span className="font-bold text-emerald-950 block">Bank Ledger Reconciliation</span>
          <p className="text-[10px] text-emerald-800 leading-relaxed">
            Exports all daily NEFT/IMPS transfer UTRs, gross customer bills, MDR gateway fees, and TDS deductions in CA-compliant .XLSX spreadsheets.
          </p>
        </div>

        {/* Download Options */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Select Financial Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50"
            >
              <option value="oct_2026">October 2026 (₹48,920.00 Total Payouts)</option>
              <option value="sep_2026">September 2026 (₹42,150.00 Total Payouts)</option>
              <option value="aug_2026">August 2026 (₹38,900.00 Total Payouts)</option>
            </select>
          </div>

          <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex justify-between">
              <span>Total Transactions:</span>
              <span className="font-bold text-slate-900">142 Orders</span>
            </div>
            <div className="flex justify-between">
              <span>Total Settled to Bank:</span>
              <span className="font-bold text-emerald-700 font-mono">₹47,941.60</span>
            </div>
            <div className="flex justify-between">
              <span>Total MDR Fees Deducted:</span>
              <span className="font-mono text-slate-700">₹978.40</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {downloading ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Payout_Ledger_Oct_2026.xlsx Downloaded!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>📥 Download Excel Spreadsheet (.xlsx)</span>
          </button>
        )}
      </div>
    </div>
  );
}
