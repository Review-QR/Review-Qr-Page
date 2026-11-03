"use client";

import React, { useState, useEffect } from "react";

interface Screen12Props {
  onPickupConfirmed?: () => void;
  onBack?: () => void;
  onMerchantDelay?: () => void;
}

export default function Screen12StorePickup({ onPickupConfirmed, onBack, onMerchantDelay }: Screen12Props) {
  const [itemsChecked, setItemsChecked] = useState({
    burger: true,
    fries: true,
    coffee: false,
  });
  const [waitTimerSeconds, setWaitTimerSeconds] = useState(240); // 4 mins

  useEffect(() => {
    const t = setInterval(() => setWaitTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const allItemsVerified = itemsChecked.burger && itemsChecked.fries && itemsChecked.coffee;
  const waitMinutes = Math.floor(waitTimerSeconds / 60);
  const waitRemainderSeconds = waitTimerSeconds % 60;
  const compensationRupees = waitMinutes >= 5 ? waitMinutes - 5 + 1 : 0;

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Active Run</span>
          </button>
          <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
            Step 1 of 2 · Pickup
          </span>
        </div>

        {/* Store Detail Hero */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Merchant Store</span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">Golden Blossom Café</h3>
              <p className="text-[11px] text-slate-500">Civil Lines, Near DM Residence, Bahraich</p>
            </div>
            <button className="p-2 rounded-xl bg-blue-50 text-[#0D47A1] border border-blue-200 text-xs font-bold hover:bg-blue-100">
              📞 Call Shop
            </button>
          </div>

          {/* Wait-Time Compensation Timer */}
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⏱️</span>
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">At Store Counter Timer</span>
                <strong className="text-xs font-mono font-black text-amber-950">
                  {String(waitMinutes).padStart(2, "0")}:{String(waitRemainderSeconds).padStart(2, "0")} mins
                </strong>
              </div>
            </div>
            <div className="text-right">
              {onMerchantDelay ? (
                <button
                  type="button"
                  onClick={onMerchantDelay}
                  className="text-[10px] font-black text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2 py-1 rounded-lg border border-amber-300 block transition"
                >
                  {compensationRupees > 0 ? `+₹${compensationRupees} Claim Wait Pay ➔` : "Report Delay ➔"}
                </button>
              ) : (
                <span className="text-[10px] font-bold text-amber-900 bg-white px-2 py-1 rounded-lg border border-amber-200 block">
                  {compensationRupees > 0 ? `+₹${compensationRupees} Compensating` : "+₹1/min after 5m"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Item-by-Item Mandatory Verification Checklist */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
              Item Verification Checklist (3 Items)
            </span>
            <span className="text-[10px] font-bold text-slate-400">Must verify all</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemsChecked.burger}
                  onChange={(e) => setItemsChecked({ ...itemsChecked, burger: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0D47A1] accent-[#0D47A1]"
                />
                <span className="font-bold text-slate-800 text-[11px]">1 × Crispy Veg Burger</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Packed ✓
              </span>
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemsChecked.fries}
                  onChange={(e) => setItemsChecked({ ...itemsChecked, fries: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0D47A1] accent-[#0D47A1]"
                />
                <span className="font-bold text-slate-800 text-[11px]">1 × Peri Peri French Fries</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Packed ✓
              </span>
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemsChecked.coffee}
                  onChange={(e) => setItemsChecked({ ...itemsChecked, coffee: e.target.checked })}
                  className="w-4 h-4 rounded text-[#0D47A1] accent-[#0D47A1]"
                />
                <span className="font-bold text-slate-800 text-[11px]">1 × Cold Coffee (500ml)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  itemsChecked.coffee ? "text-emerald-600 bg-emerald-50" : "text-amber-700 bg-amber-100"
                }`}
              >
                {itemsChecked.coffee ? "Packed ✓" : "Tap to Verify"}
              </span>
            </label>
          </div>

          <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 text-[10px] text-blue-900 flex items-center gap-2">
            <span>🔒</span>
            <span>Security Seal: Ensure restaurant paper tamper seal is intact.</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onPickupConfirmed}
          disabled={!allItemsVerified}
          className={`w-full py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition ${
            allItemsVerified
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Confirm Pickup ➔ Start Customer Route</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
