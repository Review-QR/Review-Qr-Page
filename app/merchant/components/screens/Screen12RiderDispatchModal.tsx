"use client";

import React, { useState } from "react";

interface Screen12Props {
  order?: any;
  onBack?: () => void;
  onConfirmDispatch?: () => void;
  onRiderAssigned?: (orderId: string, riderName: string) => void;
}

export default function Screen12RiderDispatchModal({
  order,
  onBack,
  onConfirmDispatch,
  onRiderAssigned,
}: Screen12Props) {
  const [dispatchMode, setDispatchMode] = useState<"fleet" | "self">("fleet");
  const [selectedRider, setSelectedRider] = useState("Ramesh Verma (Trustit Electric)");

  const orderId = order?.id || "ORD-7783-09";
  const customerName = order?.customer_name || "Aman Sharma";
  const customerAddress = order?.customer_address || "Civil Lines, Bahraich";

  const availableRiders = [
    { name: "Ramesh Verma", bike: "Trustit EV Bike", eta: "3 mins", rating: "4.9 ★" },
    { name: "Sunil Yadav", bike: "Hero Splendor", eta: "5 mins", rating: "4.8 ★" },
    { name: "Mohit Kashyap", bike: "Honda Activa", eta: "8 mins", rating: "4.7 ★" },
  ];

  const handleAssign = (riderName: string) => {
    setSelectedRider(riderName);
    if (onRiderAssigned) {
      onRiderAssigned(orderId, riderName);
    } else if (onConfirmDispatch) {
      onConfirmDispatch();
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              DELIVERY FULFILLMENT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Rider Dispatch • #{orderId.slice(-6)}
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
          >
            ← Back
          </button>
        </div>

        {/* Order Info Strip */}
        <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-xs">
          <span className="text-[10px] uppercase font-bold text-blue-900 block">Deliver To:</span>
          <span className="font-bold text-slate-900">{customerName}</span>
          <p className="text-[10px] text-slate-600 truncate">{customerAddress}</p>
        </div>

        {/* Mode Selector */}
        <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setDispatchMode("fleet")}
            className={`py-2 rounded-xl transition cursor-pointer ${
              dispatchMode === "fleet"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛵 Trustit Fleet (Auto)
          </button>
          <button
            type="button"
            onClick={() => setDispatchMode("self")}
            className={`py-2 rounded-xl transition cursor-pointer ${
              dispatchMode === "self"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🚶 Self / In-House Boy
          </button>
        </div>

        {/* Available Riders List */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            {dispatchMode === "fleet" ? "Nearby Active Trustit Riders:" : "Assign In-House Staff:"}
          </span>

          {dispatchMode === "fleet" ? (
            availableRiders.map((r) => (
              <div
                key={r.name}
                className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm">
                    🛵
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{r.name}</h3>
                    <p className="text-[10px] text-slate-500">{r.bike} • {r.rating}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {r.eta}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAssign(r.name)}
                    className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 text-xs">
              <p className="text-[11px] text-slate-700 font-medium">
                Dukaan ke kisi bhi boy ko order handover karein. Delivery OTP customer se verify karwana anivarya hai.
              </p>
              <button
                type="button"
                onClick={() => handleAssign("Self Store Delivery Boy")}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Mark Out for Delivery (Self Rider)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
        Active GPS Tracking enabled across Bahraich town
      </div>
    </div>
  );
}
