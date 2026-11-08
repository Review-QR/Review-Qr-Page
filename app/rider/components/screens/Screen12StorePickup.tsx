"use client";

import React, { useState, useEffect } from "react";

export interface HyperlocalOrderItem {
  id?: string;
  item_name?: string;
  product_name?: string;
  name?: string;
  quantity?: number;
  price?: number;
}

interface Screen12Props {
  onPickupConfirmed?: () => void;
  onBack?: () => void;
  onMerchantDelay?: () => void;
  onCallShop?: () => void;
  shopPhone?: string;
  activeOrder?: {
    id: string;
    businesses?: {
      name?: string;
      address?: string;
      phone?: string;
    } | null;
    hyperlocal_order_items?: HyperlocalOrderItem[];
  } | null;
}

export default function Screen12StorePickup({
  onPickupConfirmed,
  onBack,
  onMerchantDelay,
  onCallShop,
  shopPhone,
  activeOrder,
}: Screen12Props) {
  const storeName = activeOrder?.businesses?.name || "Verified Store Partner";
  const storeAddress = activeOrder?.businesses?.address || "Bahraich Commercial Center";
  const phoneToCall = activeOrder?.businesses?.phone || shopPhone || "+919118643415";

  // Dynamic items list
  const rawItems = activeOrder?.hyperlocal_order_items || [];
  const normalizedItems: { id: string; label: string }[] =
    rawItems.length > 0
      ? rawItems.map((item, idx) => ({
          id: item.id || `item_${idx}`,
          label: `${item.quantity || 1} × ${item.item_name || item.product_name || item.name || "Item"}`,
        }))
      : [
          { id: "def_1", label: "1 × Order Package (Standard Merchant Pack)" },
        ];

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    normalizedItems.forEach((item) => {
      initial[item.id] = false;
    });
    return initial;
  });

  const [kotOtp, setKotOtp] = useState<string>("");
  const [waitTimerSeconds, setWaitTimerSeconds] = useState(0); // Starts at 0s for genuine run

  useEffect(() => {
    const t = setInterval(() => setWaitTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const allItemsChecked = normalizedItems.every((item) => checkedMap[item.id]);
  const allItemsVerified = allItemsChecked;

  const waitMinutes = Math.floor(waitTimerSeconds / 60);
  const waitRemainderSeconds = waitTimerSeconds % 60;
  const compensationRupees = waitMinutes >= 5 ? waitMinutes - 5 + 1 : 0;

  const toggleItem = (id: string) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3 text-[#0F172A] font-sans select-none overflow-y-auto">
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

        {/* Store Detail Hero */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Merchant Store
              </span>
              <h3 className="text-xs font-black text-slate-900 leading-tight">
                {storeName}
              </h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                {storeAddress}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onCallShop) onCallShop();
                else if (typeof window !== "undefined") window.location.href = `tel:${phoneToCall}`;
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

        {/* Item-by-Item Verification Checklist */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
              Item Checklist ({normalizedItems.length} Items)
            </span>
            <button
              type="button"
              onClick={() => {
                const updated: Record<string, boolean> = {};
                normalizedItems.forEach((i) => (updated[i.id] = true));
                setCheckedMap(updated);
              }}
              className="text-[9px] font-bold text-[#0D47A1] hover:underline"
            >
              Check all
            </button>
          </div>

          <div className="space-y-1">
            {normalizedItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(checkedMap[item.id])}
                    onChange={() => toggleItem(item.id)}
                    className="w-3.5 h-3.5 rounded text-[#0D47A1] accent-[#0D47A1]"
                  />
                  <span className="font-bold text-slate-800 text-[10px]">{item.label}</span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                    checkedMap[item.id] ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"
                  }`}
                >
                  {checkedMap[item.id] ? "Packed ✓" : "Tap"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Merchant Package Handover Verification */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider block">
              Merchant Receipt / Slip Code (Optional):
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {activeOrder?.id ? `#${activeOrder.id.slice(-4).toUpperCase()}` : "Ready"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              value={kotOtp}
              onChange={(e) => setKotOtp(e.target.value.replace(/\D/g, ""))}
              className="w-24 text-center text-sm font-black font-mono tracking-widest border border-slate-300 rounded-lg py-1 focus:border-[#0D47A1] focus:outline-none"
              placeholder="Code"
            />
            <span className="text-[9px] text-slate-500 leading-tight">
              Match with parcel tag or merchant slip before loading.
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
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
