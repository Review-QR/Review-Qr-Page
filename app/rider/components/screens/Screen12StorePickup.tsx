"use client";

import React, { useState, useEffect } from "react";

interface Screen12Props {
  onPickupConfirmed?: () => void;
  onBack?: () => void;
  onMerchantDelay?: () => void;
  onCallShop?: () => void;
  shopPhone?: string;
}

export default function Screen12StorePickup({
  onPickupConfirmed,
  onBack,
  onMerchantDelay,
  onCallShop,
  shopPhone = "+919415011111",
}: Screen12Props) {
  const [itemsChecked, setItemsChecked] = useState({
    burger: true,
    fries: true,
    coffee: true,
  });
  const [kotOtp, setKotOtp] = useState("8821");
  const [waitTimerSeconds, setWaitTimerSeconds] = useState(240); // 4 mins

  useEffect(() => {
    const t = setInterval(() => setWaitTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const allItemsVerified =
    itemsChecked.burger && itemsChecked.fries && itemsChecked.coffee && kotOtp.length === 4;
  const waitMinutes = Math.floor(waitTimerSeconds / 60);
  const waitRemainderSeconds = waitTimerSeconds % 60;
  const compensationRupees = waitMinutes >= 5 ? waitMinutes - 5 + 1 : 0;

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3 text-[#0F172A] font-sans select-none overflow-hidden">
      <div>
        {/* Compact Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-[11px] font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Active Run</span>
          </button>
          <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
            Step 1 of 2 · Pickup
          </span>
        </div>

        {/* Store Detail Hero (Compact Font & Sizing) */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Merchant Store
              </span>
              <h3 className="text-xs font-black text-slate-900 leading-tight">
                Golden Blossom Café
              </h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Civil Lines, Near DM Residence, Bahraich
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onCallShop) onCallShop();
                else if (typeof window !== "undefined") window.location.href = `tel:${shopPhone}`;
              }}
              className="px-2 py-1 rounded-lg bg-blue-50 text-[#0D47A1] border border-blue-200 text-[10px] font-bold hover:bg-blue-100 active:scale-95 transition-all"
            >
              📞 Call Shop
            </button>
          </div>

          {/* Wait-Time Counter Timer Strip */}
          <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">⏱️</span>
              <div>
                <span className="text-[9px] font-bold text-amber-800 uppercase block leading-none">
                  Store Counter Timer
                </span>
                <strong className="text-[11px] font-mono font-black text-amber-950">
                  {String(waitMinutes).padStart(2, "0")}:{String(waitRemainderSeconds).padStart(2, "0")} mins
                </strong>
              </div>
            </div>
            <div>
              {onMerchantDelay ? (
                <button
                  type="button"
                  onClick={onMerchantDelay}
                  className="text-[9px] font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-2 py-0.5 rounded border border-amber-300 transition"
                >
                  {compensationRupees > 0 ? `+₹${compensationRupees} Claim Pay ➔` : "Report Delay ➔"}
                </button>
              ) : (
                <span className="text-[9px] font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                  {compensationRupees > 0 ? `+₹${compensationRupees} Compensating` : "+₹1/min after 5m"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Item-by-Item Verification Checklist (Fitted & Compact) */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
              Item Checklist (3 Items)
            </span>
            <span className="text-[9px] font-bold text-slate-400">Verify all</span>
          </div>

          <div className="space-y-1">
            <label className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemsChecked.burger}
                  onChange={(e) => setItemsChecked({ ...itemsChecked, burger: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-[#0D47A1] accent-[#0D47A1]"
                />
                <span className="font-bold text-slate-800 text-[10px]">1 × Crispy Veg Burger</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                Packed ✓
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemsChecked.fries}
                  onChange={(e) => setItemsChecked({ ...itemsChecked, fries: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-[#0D47A1] accent-[#0D47A1]"
                />
                <span className="font-bold text-slate-800 text-[10px]">1 × Peri Peri French Fries</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                Packed ✓
              </span>
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={itemsChecked.coffee}
                  onChange={(e) => setItemsChecked({ ...itemsChecked, coffee: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-[#0D47A1] accent-[#0D47A1]"
                />
                <span className="font-bold text-slate-800 text-[10px]">1 × Cold Coffee (500ml)</span>
              </div>
              <span
                className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                  itemsChecked.coffee ? "text-emerald-600 bg-emerald-50" : "text-amber-700 bg-amber-100"
                }`}
              >
                {itemsChecked.coffee ? "Packed ✓" : "Tap"}
              </span>
            </label>
          </div>
        </div>

        {/* Merchant KOT Handover OTP Verification (Compact) */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block">
              Enter 4-Digit KOT Slip Code:
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              Slip #8821
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={4}
              value={kotOtp}
              onChange={(e) => setKotOtp(e.target.value.replace(/\D/g, ""))}
              className="w-24 text-center text-sm font-black font-mono tracking-widest border border-slate-300 rounded-lg py-1 focus:border-[#0D47A1] focus:outline-none"
              placeholder="8821"
            />
            <span className="text-[9px] text-slate-500 leading-tight">
              Dukan ke thermal slip se verify karein.
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer (Compact) */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={onPickupConfirmed}
          disabled={!allItemsVerified}
          className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition ${
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
