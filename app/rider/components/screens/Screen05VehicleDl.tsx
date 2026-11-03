"use client";

import React, { useState } from "react";

interface Screen05Props {
  onVehicleSubmit?: (data: { vehicleType: string; vehicleNumber: string; dlNumber: string }) => void;
  onBack?: () => void;
}

export default function Screen05VehicleDl({ onVehicleSubmit, onBack }: Screen05Props) {
  const [vehicleType, setVehicleType] = useState<"bike" | "scooter" | "ev">("bike");
  const [vehicleNumber, setVehicleNumber] = useState("UP 40 AB 2345");
  const [dlNumber, setDlNumber] = useState("UP40 20210008492");

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
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 5 of 6</span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Vehicle &amp; Driving License</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter your Bahraich (UP 40) vehicle registration and active driving license.
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5">
          {/* Vehicle Type Segment */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Vehicle Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVehicleType("bike")}
                className={`py-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  vehicleType === "bike"
                    ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-base">🏍️</span>
                <span>Motorcycle</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType("scooter")}
                className={`py-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  vehicleType === "scooter"
                    ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1]"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-base">🛵</span>
                <span>Scooter</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType("ev")}
                className={`py-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  vehicleType === "ev"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-base">⚡</span>
                <span>Electric (EV)</span>
              </button>
            </div>
          </div>

          {/* Vehicle Number Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700">Vehicle Number (RC)</label>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Bahraich (UP 40)
              </span>
            </div>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g. UP 40 AB 2345"
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-black text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none uppercase tracking-wider"
            />
          </div>

          {/* Driving License Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Driving License (DL Number)</label>
            <input
              type="text"
              value={dlNumber}
              onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
              placeholder="e.g. UP40 20210008492"
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-black text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none uppercase tracking-wider"
            />
          </div>

          {/* Document Upload Status Ribbon */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Vehicle RC</span>
              <span className="text-emerald-600 font-bold">✓ Attached</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600 font-medium">DL Photo</span>
              <span className="text-emerald-600 font-bold">✓ Attached</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onVehicleSubmit?.({ vehicleType, vehicleNumber, dlNumber })}
          disabled={!vehicleNumber.trim() || !dlNumber.trim()}
          className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-[#0D47A1] hover:bg-[#082b66] text-white shadow-sm active:scale-[0.98] transition"
        >
          <span>Continue ➔ Setup Instant UPI Payout</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
