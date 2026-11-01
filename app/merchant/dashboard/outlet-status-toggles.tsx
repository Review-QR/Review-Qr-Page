"use client";

import { useState } from "react";

export default function OutletStatusToggles({
  businessId,
  initialIsOutletOpen = true,
  allowTakingOrders = false,
  initialIsTakingOrders = false,
}: {
  businessId: string;
  initialIsOutletOpen?: boolean;
  allowTakingOrders?: boolean;
  initialIsTakingOrders?: boolean;
}) {
  const [isOutletOpen, setIsOutletOpen] = useState(initialIsOutletOpen);
  const [isTakingOrders, setIsTakingOrders] = useState(initialIsTakingOrders);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deniedModalOpen, setDeniedModalOpen] = useState(false);

  async function handleToggleOutlet() {
    const nextState = !isOutletOpen;
    setIsOutletOpen(nextState);
    setIsUpdating(true);
    try {
      await fetch("/api/merchant/outlet-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          isOutletOpen: nextState,
        }),
      });
    } catch {
      // Revert on failure
      setIsOutletOpen(!nextState);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleToggleOrders() {
    if (!allowTakingOrders) {
      setDeniedModalOpen(true);
      return;
    }

    const nextState = !isTakingOrders;
    setIsTakingOrders(nextState);
    setIsUpdating(true);
    try {
      const res = await fetch("/api/merchant/outlet-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          isTakingOrders: nextState,
        }),
      });
      if (!res.ok) {
        setIsTakingOrders(!nextState);
      }
    } catch {
      setIsTakingOrders(!nextState);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 items-end select-none">
        {/* Toggle 1: Outlet Open / Closed */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggleOutlet}
          title="Click to toggle Outlet Open / Closed"
          className={`group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all shadow-2xs border cursor-pointer hover:shadow-xs active:scale-95 ${
            isOutletOpen
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100"
          }`}
        >
          {/* Tick / Switch Indicator */}
          <span
            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-black text-white transition-colors ${
              isOutletOpen ? "bg-emerald-600" : "bg-rose-500"
            }`}
          >
            {isOutletOpen ? "✓" : "✕"}
          </span>
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOutletOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span>Outlet: {isOutletOpen ? "OPEN" : "CLOSED"}</span>
          </span>
        </button>

        {/* Toggle 2: Orders Taking Orders / Paused */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggleOrders}
          title={
            allowTakingOrders
              ? "Click to toggle Taking Orders / Paused"
              : "Online order intake requires admin approval"
          }
          className={`group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all shadow-2xs border cursor-pointer hover:shadow-xs active:scale-95 ${
            isTakingOrders && allowTakingOrders
              ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
              : "bg-amber-50/80 border-amber-200 text-amber-800 hover:bg-amber-100"
          }`}
        >
          {/* Tick / Pause Switch Indicator */}
          <span
            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-black text-white transition-colors ${
              isTakingOrders && allowTakingOrders ? "bg-blue-600" : "bg-amber-500"
            }`}
          >
            {isTakingOrders && allowTakingOrders ? "✓" : "⏸"}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[10px]">
              {isTakingOrders && allowTakingOrders ? "🛵" : "🛑"}
            </span>
            <span>
              Orders: {isTakingOrders && allowTakingOrders ? "TAKING ORDERS" : "PAUSED"}
            </span>
          </span>
        </button>
      </div>

      {/* Access Denied Modal when online order intake is disabled by admin */}
      {deniedModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-2xs"
          onClick={() => setDeniedModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 text-xl font-bold">
                ⚠️
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">Access Denied</h3>
                <p className="text-xs text-rose-600 font-semibold">Online Order Intake Paused</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4 font-medium">
              Aapke outlet ke liye <strong>Online Order Intake</strong> feature abhi admin panel se allow nahi kiya gaya hai.
              <br /><br />
              Admin approval ke baad hi aap <strong>Taking Orders</strong> toggle ko live kar sakte hain. Please Trustit support desk se sampark karein.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeniedModalOpen(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Theek Hai (OK)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
