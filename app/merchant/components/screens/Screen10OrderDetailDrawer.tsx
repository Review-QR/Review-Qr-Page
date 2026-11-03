"use client";

import React from "react";

interface Screen10Props {
  onBack?: () => void;
  onPrintKot?: () => void;
  onDispatchRider?: () => void;
}

export default function Screen10OrderDetailDrawer({
  onBack,
  onPrintKot,
  onDispatchRider,
}: Screen10Props) {
  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              ORDER INSPECTOR
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Order #ORD-7783-09
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

        {/* Customer & Address Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm">Aman Sharma</h2>
              <p className="text-[10px] text-slate-500">Regular Customer • 5th Order</p>
            </div>
            <a
              href="tel:+919876543210"
              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1"
            >
              📞 Call
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 block">Delivery Address:</span>
            <span>House #14, Civil Lines, Behind Indira Gandhi Stadium, Bahraich (1.4 km)</span>
          </div>
        </div>

        {/* Cooking Note */}
        <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-2.5 text-xs text-amber-900 flex items-start gap-2">
          <span className="text-base">📝</span>
          <div>
            <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-800">
              Kitchen Preparation Note
            </span>
            <p className="text-[11px] font-medium leading-relaxed mt-0.5">
              "Please pack extra napkins and keep cold frappe well chilled. Less sugar in 1 frappe."
            </p>
          </div>
        </div>

        {/* Itemized Order Table */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
            Itemized Bill (3 Items)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-900">2 × Hazelnut Cold Frappe</p>
                <span className="text-[10px] text-slate-500">Size: Large (400ml) • Less Sugar</span>
              </div>
              <span className="font-mono font-bold text-slate-800">₹240.00</span>
            </div>

            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-900">1 × Paneer Grilled Sandwich</p>
                <span className="text-[10px] text-slate-500">Brown Bread • Peri-Peri Dip</span>
              </div>
              <span className="font-mono font-bold text-slate-800">₹100.00</span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-2 space-y-1 text-[11px] text-slate-600 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-mono">₹340.00</span>
            </div>
            <div className="flex justify-between">
              <span>Packaging Charges</span>
              <span className="font-mono">₹15.00</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee (Hyperlocal)</span>
              <span className="font-mono">₹25.00</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Merchant Welcome Discount</span>
              <span className="font-mono">-₹40.00</span>
            </div>
            <div className="flex justify-between text-xs font-black text-slate-950 pt-1.5 border-t border-slate-200">
              <span>Total Bill (Cashfree UPI Paid)</span>
              <span className="font-mono text-sm text-emerald-700">₹340.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onPrintKot}
          className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
        >
          <span>🖨️ Print KOT</span>
        </button>
        <button
          type="button"
          onClick={onDispatchRider}
          className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
        >
          <span>🛵 Assign Rider</span>
        </button>
      </div>
    </div>
  );
}
