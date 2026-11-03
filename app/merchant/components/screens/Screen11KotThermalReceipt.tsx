"use client";

import React, { useState } from "react";

interface Screen11Props {
  onBack?: () => void;
}

export default function Screen11KotThermalReceipt({ onBack }: Screen11Props) {
  const [printPaper, setPrintPaper] = useState<"80mm" | "58mm">("80mm");
  const [printed, setPrinted] = useState(false);

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => setPrinted(false), 2000);
  };

  return (
    <div className="w-full h-full bg-[#1E293B] text-slate-100 flex flex-col justify-between p-4 font-sans overflow-y-auto">
      {/* Top Header & Printer Controls */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              HARDWARE PRINT SIMULATION
            </span>
            <h1 className="text-xs font-black text-white leading-tight">
              KOT Receipt (Kitchen Slip)
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 border border-slate-700"
          >
            ← Back
          </button>
        </div>

        {/* Paper Width Selector */}
        <div className="mt-3 flex items-center justify-between bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-xs">
          <span className="font-bold text-slate-300">Roll Format:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPrintPaper("80mm")}
              className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition ${
                printPaper === "80mm"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              80mm Standard
            </button>
            <button
              type="button"
              onClick={() => setPrintPaper("58mm")}
              className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition ${
                printPaper === "58mm"
                  ? "bg-amber-400 text-slate-950 shadow-xs"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              58mm Compact
            </button>
          </div>
        </div>

        {/* Thermal Slip Simulation Container (Jagged paper effect) */}
        <div className="mt-3 flex justify-center">
          <div
            className={`bg-[#FFFEF9] text-black font-mono p-4 rounded-sm shadow-2xl border-x border-slate-300 transition-all ${
              printPaper === "80mm" ? "w-full max-w-[320px]" : "w-full max-w-[240px]"
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-dashed border-black">
              <h2 className="text-sm font-black tracking-wider uppercase">
                GOLDEN BLOSSOM CAFE
              </h2>
              <p className="text-[10px] mt-0.5">KDC ROAD, CIVIL LINES, BAHRAICH</p>
              <p className="text-[10px] font-bold">GSTIN: 09AAAFG1234F1Z5</p>
            </div>

            {/* Token & Order ID */}
            <div className="py-2 border-b border-black text-center">
              <span className="text-[10px] uppercase block tracking-widest font-black">
                KITCHEN ORDER TICKET (KOT)
              </span>
              <div className="my-1 py-1 bg-black text-white text-base font-black tracking-widest">
                TOKEN #09
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span>ORDER: ORD-7783-09</span>
                <span>TABLE: DELIVERY</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-700">
                <span>SERVER: Web KDS</span>
                <span>12:45 PM TODAY</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b-2 border-dashed border-black">
              <div className="flex justify-between text-[10px] font-black pb-1 border-b border-gray-400">
                <span>QTY &amp; ITEM</span>
                <span>PRICE</span>
              </div>
              
              <div className="space-y-1.5 pt-1.5 text-xs font-black">
                <div className="flex justify-between items-start">
                  <div>
                    <span>2 × HAZELNUT FRAFFE</span>
                    <span className="block text-[9px] font-normal text-gray-700">
                      &gt; Large (400ml) • Less Sugar
                    </span>
                  </div>
                  <span>₹240</span>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <span>1 × PANEER GRILLED SANDWICH</span>
                    <span className="block text-[9px] font-normal text-gray-700">
                      &gt; Peri-Peri Dip
                    </span>
                  </div>
                  <span>₹100</span>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="py-2 border-b border-black text-[10px] font-black">
              <span>SPECIAL INSTRUCTION:</span>
              <p className="font-normal text-[9px] italic mt-0.5">
                *** Extra napkins and keep frappe extra chilled ***
              </p>
            </div>

            {/* Bill Summary */}
            <div className="pt-2 text-[10px] space-y-0.5">
              <div className="flex justify-between font-bold">
                <span>ITEMS SUBTOTAL:</span>
                <span>₹340.00</span>
              </div>
              <div className="flex justify-between font-black text-xs pt-1 border-t border-black">
                <span>PAID VIA CASHFREE UPI</span>
                <span>₹340.00</span>
              </div>
            </div>

            <div className="text-center pt-3 text-[9px] text-gray-600">
              === POWERED BY TRUSTIT HYPERLOCAL ===
            </div>
          </div>
        </div>
      </div>

      {/* Print Action Footer */}
      <div className="pt-3">
        {printed ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Sent to Thermal ESC/POS Printer!
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>🖨️ TEST PRINT TO PRINTER ({printPaper})</span>
          </button>
        )}
      </div>
    </div>
  );
}
