"use client";

import React, { useState } from "react";

interface Screen36Props {
  onBack?: () => void;
  onConfirmCratePickup?: () => void;
}

export default function Screen36HeavyGroceryCrate({
  onBack,
  onConfirmCratePickup,
}: Screen36Props) {
  const [itemsChecked, setItemsChecked] = useState<{ [key: string]: boolean }>({
    atta: true,
    oil: true,
    sugar: true,
    pulses: false,
  });

  const toggleItem = (key: string) => {
    setItemsChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(itemsChecked).every(Boolean);

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
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Bulk Quick Commerce
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Heavy Grocery Checklist</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-amber-700 bg-amber-50 rounded-full py-0.5 border border-amber-200">
            🛒
          </span>
        </div>

        {/* Weight Gauge & Heavy Payload Bonus Card */}
        <div className="mt-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/20">
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-200">Verified Payload Scale</span>
              <h3 className="text-lg font-black">⚖️ 8.5 KG Total Weight</h3>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white text-orange-800">
                +₹20 Heavy Bonus
              </span>
              <p className="text-[10px] text-amber-100 mt-0.5">Total Pay: ₹55.00</p>
            </div>
          </div>
          <p className="text-xs text-amber-100 mt-2">
            Store: <strong>Deepak Kirana &amp; Supermart</strong>, Civil Lines. 4 items in 2 heavy bags.
          </p>
        </div>

        {/* Crate Verification Checklist */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Verify Crate Items Before Loading:
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">4 Items</span>
          </div>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer">
            <span className="font-bold text-slate-800">1x Aashirvaad Shudh Chakki Atta (5 kg)</span>
            <input
              type="checkbox"
              checked={itemsChecked.atta}
              onChange={() => toggleItem("atta")}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer">
            <span className="font-bold text-slate-800">2x Fortune Kachi Ghani Mustard Oil (1L)</span>
            <input
              type="checkbox"
              checked={itemsChecked.oil}
              onChange={() => toggleItem("oil")}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer">
            <span className="font-bold text-slate-800">1x Madhur Pure &amp; Hygienic Sugar (1 kg)</span>
            <input
              type="checkbox"
              checked={itemsChecked.sugar}
              onChange={() => toggleItem("sugar")}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer">
            <span className="font-bold text-slate-800">1x Tata Sampann Arhar Dal (1 kg)</span>
            <input
              type="checkbox"
              checked={itemsChecked.pulses}
              onChange={() => toggleItem("pulses")}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
            />
          </label>

          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
            <span>🛵</span>
            <span>Place heavy 5kg atta at the base of the bag to keep motorcycle balanced.</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={!allChecked}
          onClick={onConfirmCratePickup}
          className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          <span>Load Bags &amp; Start Delivery (Earn ₹55)</span>
          <span>➔</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Heavy Payload Allowance included · Zero Bag Damage Protection
        </p>
      </div>
    </div>
  );
}
