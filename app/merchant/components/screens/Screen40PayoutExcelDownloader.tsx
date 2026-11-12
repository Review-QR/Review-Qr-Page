"use client";

import React, { useState } from "react";

interface Screen40Props {
  onBack?: () => void;
  orders?: Array<{
    id: string;
    created_at?: string;
    total_amount?: number;
    payment_mode?: string;
    payment_status?: string;
    status?: string;
  }>;
}

export default function Screen40PayoutExcelDownloader({ onBack, orders = [] }: Screen40Props) {
  const [downloading, setDownloading] = useState(false);
  const completedOrders = orders.filter((o) => o.status === "delivered" || o.status === "completed");
  const totalGross = completedOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  const handleDownload = () => {
    if (completedOrders.length === 0) return;
    setDownloading(true);
    try {
      const header = "Order ID,Created At,Total Amount (INR),Payment Mode,Payment Status,Order Status\n";
      const rows = completedOrders
        .map(
          (o) =>
            `${o.id},${o.created_at || ""},${Number(o.total_amount || 0).toFixed(2)},${o.payment_mode || ""},${o.payment_status || ""},${o.status || ""}`,
        )
        .join("\n");
      const csvContent = `${header}${rows}\n`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Trustit_Live_Orders_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
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

        {/* Download Summary */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex justify-between">
              <span>Completed Live Orders:</span>
              <span className="font-bold text-slate-900">{completedOrders.length} Orders</span>
            </div>
            <div className="flex justify-between">
              <span>Total Gross Order Value:</span>
              <span className="font-bold text-emerald-700 font-mono">₹{totalGross.toFixed(2)}</span>
            </div>
          </div>
          {completedOrders.length === 0 && (
            <p className="text-[10px] text-slate-500 text-center">
              No completed orders recorded yet for export.
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {downloading ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Live CSV Downloaded!
          </div>
        ) : (
          <button
            type="button"
            disabled={completedOrders.length === 0}
            onClick={handleDownload}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>📥 Download Live Statement (.csv)</span>
          </button>
        )}
      </div>
    </div>
  );
}
