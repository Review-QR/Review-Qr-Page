"use client";

import React, { useState } from "react";

interface ScreenK02Props {
  onBack?: () => void;
  onConfirmBill?: () => void;
}

export default function ScreenK02ParchaOrderViewer({ onBack, onConfirmBill }: ScreenK02Props) {
  const [items, setItems] = useState([
    { name: "Chakki Atta (MP Sharbati)", qty: "5 Kg", price: 210, checked: true },
    { name: "Madhur Sugar (Cheeni)", qty: "2 Kg", price: 88, checked: true },
    { name: "Engine Mustard Oil (Sarso)", qty: "1 Litre", price: 165, checked: true },
    { name: "Unpolished Arhar Dal", qty: "500 Grams", price: 78, checked: false },
    { name: "Tata Salt Lite", qty: "1 Packet", price: 28, checked: true },
  ]);

  const toggleCheck = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  };

  const total = items.reduce((acc, it) => acc + (it.checked ? it.price : 0), 0);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
              PARCHA INSPECTION &amp; PACKING
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Order #PARCHA-9410 • Mrs. Sunita Sharma
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

        {/* Customer Handwritten Photo Card */}
        <div className="mt-2.5 bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-900">
              Customer Uploaded List (Parcha Photo)
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
              Click to Zoom
            </span>
          </div>

          {/* Paper Parchi Simulation */}
          <div className="bg-[#FFFDF7] border border-amber-200 rounded-xl p-2.5 font-handwriting shadow-inner text-xs text-slate-800 space-y-1">
            <p className="font-bold text-[11px] text-amber-950 font-sans pb-1 border-b border-amber-100">
              "Sunita Sharma - Civil Lines Near Stadium (Ph: 9876543210)"
            </p>
            <div className="space-y-0.5 text-xs text-slate-700 italic">
              <p>1. 5 kg chakki ka atta</p>
              <p>2. 2 kg cheeni</p>
              <p>3. 1 liter sarso ka tel (Engine marka)</p>
              <p>4. 500 gm arhar dal</p>
              <p>5. 1 packet tata namak</p>
            </div>
          </div>
        </div>

        {/* Weight & Price Checklist */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Digital Weight &amp; Price Verification (Tick to Pack)
          </span>

          <div className="space-y-1.5 text-xs">
            {items.map((it, i) => (
              <div
                key={i}
                onClick={() => toggleCheck(i)}
                className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  it.checked ? "bg-emerald-50/60 border-emerald-300 text-slate-900" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-bold ${
                    it.checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {it.checked ? "✓" : ""}
                  </span>
                  <div>
                    <p className="font-bold text-xs">{it.name}</p>
                    <span className="text-[10px] text-slate-500 font-mono">Weighed: {it.qty}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900">₹{it.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bill & Packing Action Footer */}
      <div className="pt-2 space-y-1.5">
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600">Total Weighed Grocery Bill:</span>
          <span className="font-mono font-black text-base text-emerald-700">₹{total}.00</span>
        </div>

        <button
          type="button"
          onClick={onConfirmBill}
          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>✓ PACK IN BAG &amp; SEND PAYMENT LINK TO CUSTOMER</span>
        </button>
      </div>
    </div>
  );
}
