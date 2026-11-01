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
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

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
      setIsOutletOpen(!nextState);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleToggleOrders() {
    if (!allowTakingOrders) {
      setAccessDeniedMessage("Access Denied (Admin permission required)");
      // Clear after 4 seconds
      setTimeout(() => {
        setAccessDeniedMessage(null);
      }, 4000);
      return;
    }

    setAccessDeniedMessage(null);
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
    <div className="flex flex-col items-start lg:items-end gap-1 select-none pt-0.5">
      {/* 2 Small Compact Toggles Side by Side */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle 1: Outlet Open / Closed */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggleOutlet}
          title="Click to toggle Outlet Open / Closed"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
            isOutletOpen
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOutletOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <span>Outlet: {isOutletOpen ? "OPEN" : "CLOSED"}</span>
          <span
            className={`w-5 h-3 rounded-full p-0.5 flex items-center transition-colors ${
              isOutletOpen ? "bg-emerald-600 justify-end" : "bg-slate-300 justify-start"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
          </span>
        </button>

        {/* Toggle 2: Taking Orders / Paused */}
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggleOrders}
          title={
            allowTakingOrders
              ? "Click to toggle Taking Orders / Paused"
              : "Online order intake requires admin permission"
          }
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${
            isTakingOrders && allowTakingOrders
              ? "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
              : "bg-amber-50/80 border-amber-200 text-amber-800 hover:bg-amber-100"
          }`}
        >
          <span className="text-[10px]">
            {isTakingOrders && allowTakingOrders ? "🛵" : "⏸"}
          </span>
          <span>
            Orders: {isTakingOrders && allowTakingOrders ? "Taking Orders" : "PAUSED"}
          </span>
          <span
            className={`w-5 h-3 rounded-full p-0.5 flex items-center transition-colors ${
              isTakingOrders && allowTakingOrders
                ? "bg-blue-600 justify-end"
                : "bg-slate-300 justify-start"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
          </span>
        </button>
      </div>

      {/* Small inline Access Denied notice placed directly below when clicked */}
      {accessDeniedMessage && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md animate-in fade-in duration-200">
          <span>⚠️</span>
          <span>{accessDeniedMessage}</span>
        </span>
      )}
    </div>
  );
}
