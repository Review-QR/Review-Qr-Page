"use client";

import React, { useState } from "react";

interface Screen48Props {
  onBack?: () => void;
  onSendSmsBackup?: () => void;
  batteryLevelProp?: number;
  activeOrder?: {
    id: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: any;
    total_amount?: number;
    payment_mode?: string;
  } | null;
}

export default function Screen48LowBatterySafeMode({
  onBack,
  onSendSmsBackup,
  batteryLevelProp = 15,
  activeOrder,
}: Screen48Props) {
  const [batteryLevel] = useState<number>(batteryLevelProp);
  const [isSmsSent, setIsSmsSent] = useState<boolean>(true);

  const orderCode = activeOrder?.id ? `#${activeOrder.id.slice(-6).toUpperCase()}` : "#TR-LIVE";
  const isCod = activeOrder?.payment_mode?.toLowerCase() === "cod";
  const amountStr = isCod ? `Collect ₹${Number(activeOrder?.total_amount || 0).toFixed(2)} COD` : "Prepaid Online";
  const customerName = activeOrder?.customer_name || "Customer";
  const customerPhone = activeOrder?.customer_phone || "";

  let addressStr = "Customer Delivery Destination, Bahraich";
  if (activeOrder?.customer_address) {
    if (typeof activeOrder.customer_address === "string") {
      addressStr = activeOrder.customer_address;
    } else if (typeof activeOrder.customer_address === "object") {
      addressStr =
        activeOrder.customer_address.address_line ||
        activeOrder.customer_address.formatted_address ||
        activeOrder.customer_address.area ||
        "Bahraich Delivery Address";
    }
  }

  return (
    <div className="w-full min-h-full bg-[#000000] text-white flex flex-col justify-between p-4 sm:p-5 font-mono select-none overflow-y-auto pb-28">
      {/* High-Contrast Top Bar */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white text-xs hover:bg-white/20"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              CRITICAL BATTERY SAFE MODE
            </span>
            <h2 className="text-xs font-bold text-white mt-0.5">Ultra Power Saving ({batteryLevel}% Left)</h2>
          </div>
          <span className="text-xs font-bold text-red-400 font-mono">
            🪫 {batteryLevel}%
          </span>
        </div>

        {/* Dispatch Hub Alert Notification */}
        <div className="mt-4 p-3 rounded-xl border border-red-500/40 bg-red-950/30 text-red-200 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <strong className="text-white">Central Dispatch Hub Notified</strong>
          </div>
          <p className="text-[11px] text-red-300">
            Ops team knows your phone is at {batteryLevel}%. GPS throttle active to extend battery life.
          </p>
        </div>

        {/* Offline Emergency Delivery Sheet */}
        <div className="mt-4 bg-white/5 border border-white/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400">Offline Fallback Sheet</span>
            <span className="text-[10px] text-emerald-400 font-bold">Screenshot This Now</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Order ID:</span>
              <p className="text-sm font-black text-amber-300">{orderCode} ({amountStr})</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Customer Address:</span>
              <p className="font-bold text-white leading-snug">
                {customerName} · {addressStr}
              </p>
            </div>

            {customerPhone && (
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Customer Phone:</span>
                <a
                  href={`tel:${customerPhone}`}
                  className="font-bold text-blue-400 underline block"
                >
                  Call Customer: {customerPhone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/20 space-y-2">
        <button
          type="button"
          onClick={() => {
            setIsSmsSent(true);
            onSendSmsBackup?.();
          }}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            isSmsSent ? "bg-white/10 text-white/60" : "bg-white text-black"
          }`}
        >
          <span>{isSmsSent ? "Emergency SMS Sent to Customer" : "Send Emergency SMS Backup"}</span>
          <span>✉️</span>
        </button>
      </div>
    </div>
  );
}
