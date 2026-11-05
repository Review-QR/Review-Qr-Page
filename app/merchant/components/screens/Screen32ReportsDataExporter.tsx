"use client";

import React, { useState } from "react";

interface Screen32Props {
  onBack?: () => void;
}

export default function Screen32ReportsDataExporter({ onBack }: Screen32Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (filename: string) => {
    setDownloading(filename);
    try {
      let csvContent = "";
      if (filename.includes("Sales")) {
        csvContent = "Date,Order ID,Customer,Items,Gross Bill (INR),Tax GST (INR),Gateway Fee (INR),Net Settled (INR),Status\n" +
          "2026-10-31,TRU-8921,Aman Verma,2x Shahi Paneer 4x Naan,570.00,28.50,11.40,530.10,SETTLED\n" +
          "2026-10-31,TRU-8920,Rohit Gupta,1x Dal Makhani 2x Roti,290.00,14.50,5.80,269.70,SETTLED\n" +
          "2026-10-30,TRU-8919,Pooja Singh,3x Paneer Tikka,450.00,22.50,9.00,418.50,SETTLED\n" +
          "2026-10-30,TRU-8918,Kunal Mishra,1x Veg Thali,180.00,9.00,3.60,167.40,SETTLED\n";
      } else {
        csvContent = "Timestamp,Customer ID,QR Device,Visit Count,Source,Google Review Directed\n" +
          "2026-10-31 20:14:11,CUST-9118,Standee Counter A,4,Bahraich Local,YES (5 Star)\n" +
          "2026-10-31 19:42:05,CUST-9832,Standee Counter B,1,New Footfall,NO (Direct Khata)\n" +
          "2026-10-30 21:05:40,CUST-7741,Standee Counter A,2,Repeat Dine-in,YES (5 Star)\n";
      }
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename.endsWith(".xlsx") ? filename.replace(".xlsx", ".csv") : filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
    setTimeout(() => setDownloading(null), 1500);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              DATA VAULT &amp; AUDIT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Reports &amp; Data Exporter
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

        {/* Info Box */}
        <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-950 space-y-1">
          <span className="font-bold block">Tax &amp; CA Financial Export</span>
          <p className="text-[10px] text-blue-800 leading-relaxed">
            Download comprehensive customer visit records, itemized sales, GST collected, and platform fee reconciliations.
          </p>
        </div>

        {/* Report Cards */}
        <div className="mt-3 space-y-2.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">Monthly Sales &amp; GST Ledger</h4>
                <p className="text-[10px] text-slate-500">October 2026 • 142 Orders • ₹48,920 Gross</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                .XLSX / .CSV
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDownload("October_Sales.xlsx")}
                className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition text-center"
              >
                Download Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => handleDownload("October_Sales.csv")}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition"
              >
                CSV
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-900">Customer QR Footfall Logs</h4>
                <p className="text-[10px] text-slate-500">1,482 Scans • Timestamps &amp; Repeat Ratios</p>
              </div>
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                .CSV
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDownload("Customer_Footfall.csv")}
              className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition"
            >
              Export Footfall CSV →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {downloading && (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Exported {downloading} to Downloads!
          </div>
        )}
      </div>
    </div>
  );
}
