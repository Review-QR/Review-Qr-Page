"use client";

import React, { useState } from "react";

interface Screen11Props {
  order?: any;
  storeName?: string;
  onBack?: () => void;
  onPrintDone?: () => void;
}

export default function Screen11KotThermalReceipt({
  order,
  storeName = "Shri Balaji Daily Needs & General Store",
  onBack,
  onPrintDone,
}: Screen11Props) {
  const [printPaper, setPrintPaper] = useState<"80mm" | "58mm">("80mm");
  const [printed, setPrinted] = useState(false);

  const orderId = order?.id || "ORD-7783-09";
  const customerName = order?.customer_name || "Aman Sharma";
  const rawItems = order?.hyperlocal_order_items || order?.items || [];
  const items = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : [
    { item_name: "Madhur Pure Sugar (5kg)", quantity: 1, unit_price: 215, total_price: 215 },
    { item_name: "Aashirvaad Shudh Chakki Atta (10kg)", quantity: 1, unit_price: 410, total_price: 410 },
  ];
  const totalAmount = order?.total_amount || items.reduce((acc: number, it: any) => acc + (it.total_price || 0), 0);

  const handlePrint = () => {
    setPrinted(true);
    if (typeof window !== "undefined") {
      try {
        window.print();
      } catch {}
    }
    setTimeout(() => {
      setPrinted(false);
      onPrintDone?.();
    }, 1500);
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
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
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
              className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition cursor-pointer ${
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
              className={`px-3 py-1 rounded-lg font-mono font-bold text-xs transition cursor-pointer ${
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
              <h2 className="text-xs font-black tracking-wider uppercase">
                {storeName}
              </h2>
              <p className="text-[9px] mt-0.5">CIVIL LINES, BAHRAICH - 271801</p>
              <p className="text-[9px] font-bold">TRUSTIT VERIFIED MERCHANT</p>
            </div>

            {/* Token & Order ID */}
            <div className="py-2 border-b border-black text-center">
              <span className="text-[9px] uppercase block tracking-widest font-black">
                KITCHEN ORDER TICKET (KOT)
              </span>
              <div className="my-1 py-1 bg-black text-white text-sm font-black tracking-widest">
                ORDER #{orderId.slice(-6)}
              </div>
              <div className="flex justify-between text-[9px] font-bold">
                <span>CUSTOMER: {customerName}</span>
                <span>TABLE: DELIVERY</span>
              </div>
              <div className="flex justify-between text-[9px] text-gray-700">
                <span>STATUS: {order?.payment_status === "paid" ? "PAID ONLINE" : "COD"}</span>
                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b-2 border-dashed border-black">
              <div className="flex justify-between text-[9px] font-black pb-1 border-b border-gray-400">
                <span>QTY &amp; ITEM</span>
                <span>PRICE</span>
              </div>

              <div className="space-y-1.5 pt-1.5 text-xs font-black">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <span>{it.quantity || 1} × {it.item_name || it.name || "Item"}</span>
                    </div>
                    <span>₹{it.total_price || (it.unit_price || it.price) * (it.quantity || 1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-2 text-right">
              <div className="text-xs font-black">
                TOTAL: ₹{totalAmount}
              </div>
              <div className="text-[8px] text-gray-500 mt-1 text-center">
                *** THANK YOU • POWERED BY TRUSTIT ***
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{printed ? "🖨️ Printing Dispatched..." : "🖨️ Print Hardware KOT Slip"}</span>
        </button>
      </div>
    </div>
  );
}
