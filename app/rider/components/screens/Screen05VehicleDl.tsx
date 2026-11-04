"use client";

import React, { useState } from "react";

interface Screen05Props {
  initialVehicleType?: "bike" | "scooter" | "ev";
  onVehicleSubmit?: (data: { vehicleType: string; vehicleNumber: string; dlNumber: string }) => void;
  onBack?: () => void;
}

export default function Screen05VehicleDl({
  initialVehicleType = "bike",
  onVehicleSubmit,
  onBack,
}: Screen05Props) {
  const [vehicleType, setVehicleType] = useState<"bike" | "scooter" | "ev">(initialVehicleType);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [dlNumber, setDlNumber] = useState("");

  const isFormValid = vehicleNumber.trim().length >= 4;

  const handleSubmit = () => {
    const vNum = vehicleNumber.trim() || "UP 40 BV 1001";
    const dl = dlNumber.trim() || "UP40 2024009182";
    onVehicleSubmit?.({ vehicleType, vehicleNumber: vNum, dlNumber: dl });
  };

  return (
    <div className="w-full h-full max-h-[580px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 5 of 6</span>
        </div>

        {/* Title */}
        <div className="mt-2.5 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">Vehicle RC &amp; Driving License</h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            Enter your Bahraich (UP 40) vehicle registration and active driving license.
          </p>
        </div>

        {/* Form Card (Compact Zero-Scroll Spacing) */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
          {/* Vehicle Type Segment Chips */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Fleet Vehicle Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setVehicleType("bike")}
                className={`py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  vehicleType === "bike"
                    ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>🏍️</span>
                <span>Bike</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType("scooter")}
                className={`py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  vehicleType === "scooter"
                    ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>🛵</span>
                <span>Scooter</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleType("ev")}
                className={`py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  vehicleType === "ev"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>⚡</span>
                <span>EV</span>
              </button>
            </div>
          </div>

          {/* Vehicle Number (RC) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Vehicle Registration (RC)
              </label>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Bahraich UP 40
              </span>
            </div>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              placeholder="e.g. UP 40 BV 1001"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none uppercase tracking-wider"
            />
          </div>

          {/* DL Number */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Driving License Number (DL)
            </label>
            <input
              type="text"
              value={dlNumber}
              onChange={(e) => setDlNumber(e.target.value.toUpperCase())}
              placeholder="e.g. UP40 2024009182"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none uppercase tracking-wider"
            />
          </div>

          {/* Document Attached Status Strip */}
          <div className="grid grid-cols-2 gap-2 pt-0.5 text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Vehicle RC</span>
              <span className="text-emerald-700 font-bold">✓ Validated</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">DL Card</span>
              <span className="text-emerald-700 font-bold">✓ Validated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slim 40px Action Footer */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-2 bg-[#0D47A1] hover:bg-[#082b66] text-white shadow-xs active:scale-[0.99] transition"
        >
          <span>Continue ➔ Setup Instant UPI Payout</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
