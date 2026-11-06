"use client";

import React, { useState } from "react";

interface Screen05Props {
  initialVehicleType?: string;
  onVehicleSubmit?: (data: { vehicleType: string; vehicleNumber: string; dlNumber: string }) => void;
  onBack?: () => void;
}

export default function Screen05VehicleDl({
  initialVehicleType,
  onVehicleSubmit,
  onBack,
}: Screen05Props) {
  const [vehicleType, setVehicleType] = useState<string>(initialVehicleType || "bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [dlNumber, setDlNumber] = useState("");

  const vehicleOptions = [
    { id: "bike", name: "Motorcycle / Bike (बाइक)", icon: "🏍️", badge: "Petrol" },
    { id: "activa", name: "Scooter / Activa (एक्टिवा/स्कूटर)", icon: "🛵", badge: "Scooter" },
    { id: "ev_bike", name: "Electric Bike (इलेक्ट्रिक बाइक)", icon: "⚡", badge: "EV 0% Emission" },
    { id: "ev_scooter", name: "Electric Scooter (ई-स्कूटर)", icon: "🔋", badge: "EV Green" },
    { id: "electric_car", name: "Electric Car / Eco-Cab", icon: "🚗", badge: "4W Eco" },
  ];

  const handleSubmit = () => {
    const vNum = vehicleNumber.trim();
    if (!vNum) return;
    const dl = dlNumber.trim();
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
            Bahraich (UP 40) vehicle registration and active driving license.
          </p>
        </div>

        {/* Form Card (Single Clean Vehicle Option: Scooter Only) */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
          {/* Fleet Vehicle Options (Bike, Activa, EV Bike, EV Scooter, Electric Car) */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Fleet Vehicle (वाहन प्रकार चुनें)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {vehicleOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setVehicleType(opt.id)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-1.5 transition ${
                    vehicleType === opt.id
                      ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <div className="overflow-hidden">
                    <span className="block text-[10px] font-black truncate">{opt.name}</span>
                    <span className="text-[8px] font-bold text-slate-400 block">{opt.badge}</span>
                  </div>
                </button>
              ))}
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
              placeholder="e.g. UP 40 AB 1234"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-black text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none uppercase tracking-wider"
              autoFocus
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
              placeholder="e.g. UP40 2024000123"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono font-black text-slate-900 focus:border-[#0D47A1] focus:bg-white focus:outline-none uppercase tracking-wider"
            />
          </div>

          {/* Document Status */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Vehicle RC</span>
              <span className={`font-bold ${vehicleNumber.trim() ? "text-emerald-700" : "text-slate-400"}`}>
                {vehicleNumber.trim() ? "✓ Entered" : "Pending"}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">DL Card</span>
              <span className={`font-bold ${dlNumber.trim() ? "text-emerald-700" : "text-slate-400"}`}>
                {dlNumber.trim() ? "✓ Entered" : "Optional"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Slim 40px Action Footer */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!vehicleNumber.trim()}
          className={`w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition ${
            vehicleNumber.trim().length >= 4
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Continue ➔ Setup Instant UPI Payout</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
