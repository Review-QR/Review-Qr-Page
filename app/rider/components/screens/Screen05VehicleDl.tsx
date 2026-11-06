"use client";

import React, { useState, useEffect } from "react";

interface Screen05Props {
  initialVehicleType?: string;
  initialData?: {
    vehicleType?: string;
    vehicleNumber?: string;
    dlNumber?: string;
  };
  onVehicleSubmit?: (data: { vehicleType: string; vehicleNumber: string; dlNumber: string }) => void;
  onBack?: () => void;
}

export default function Screen05VehicleDl({
  initialVehicleType,
  initialData,
  onVehicleSubmit,
  onBack,
}: Screen05Props) {
  const [vehicleType, setVehicleType] = useState<string>(
    initialData?.vehicleType || initialVehicleType || "bike"
  );
  const [vehicleNumber, setVehicleNumber] = useState(initialData?.vehicleNumber || "");
  const [dlNumber, setDlNumber] = useState(initialData?.dlNumber || "");
  const [error, setError] = useState<string | null>(null);

  // Restore draft from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined" && !initialData?.vehicleNumber) {
      try {
        const draft = localStorage.getItem("trustit_rider_vehicle_draft");
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.vehicleType) setVehicleType(parsed.vehicleType);
          if (parsed.vehicleNumber) setVehicleNumber(parsed.vehicleNumber);
          if (parsed.dlNumber) setDlNumber(parsed.dlNumber);
        }
      } catch {}
    }
  }, [initialData]);

  // Auto-save draft on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trustit_rider_vehicle_draft",
          JSON.stringify({ vehicleType, vehicleNumber, dlNumber })
        );
      } catch {}
    }
  }, [vehicleType, vehicleNumber, dlNumber]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const vNum = vehicleNumber.trim().toUpperCase();
    const dl = dlNumber.trim().toUpperCase();

    if (!vNum || vNum.length < 4) {
      setError("कृपया अपनी सही वाहन संख्या दर्ज करें (उदा. UP 40 AB 1234)");
      return;
    }
    if (!dl || dl.length < 5) {
      setError("कृपया अपना वैध ड्राइविंग लाइसेंस नंबर दर्ज करें");
      return;
    }

    setError(null);
    onVehicleSubmit?.({ vehicleType, vehicleNumber: vNum, dlNumber: dl });
  };

  const isFormValid = vehicleNumber.trim().length >= 4 && dlNumber.trim().length >= 5;

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← वापस (Back)</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-[#0D47A1] border border-blue-200 uppercase tracking-wider">
              वाहन विवरण
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">चरण 5 / 6</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">
            वाहन एवं ड्राइविंग लाइसेंस विवरण
          </h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            बहराइच फ्लीट डिलीवरी के लिए अपने वाहन और ड्राइविंग लाइसेंस की जानकारी भरें।
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-3.5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          {/* 1. Dropdown: वाहन प्रकार चुनें */}
          <div>
            <label className="text-[10px] font-black text-slate-700 block mb-1.5 uppercase tracking-wider">
              वाहन प्रकार चुनें (Choose Vehicle Type) *
            </label>
            <div className="relative">
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#0D47A1] focus:ring-2 focus:ring-[#0D47A1]/20 focus:outline-none pr-10 shadow-xs cursor-pointer"
              >
                <option value="bike">🏍️ मोटरसाइकिल / बाइक (Motorcycle / Bike)</option>
                <option value="scooter">🛵 स्कूटर / एक्टिवा (Scooter / Activa)</option>
                <option value="ev">⚡ इलेक्ट्रिक बाइक / ई-स्कूटर (Electric EV)</option>
                <option value="cycle">🚲 साइकिल (Bicycle - Local Courier)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <span className="text-xs">▼</span>
              </div>
            </div>
          </div>

          {/* 2. Blank Input: वाहन संख्या (Vehicle Number) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                वाहन संख्या (Vehicle Number) *
              </label>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                UP 40
              </span>
            </div>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="UP 40 AB 1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:border-[#0D47A1] focus:outline-none uppercase"
            />
          </div>

          {/* 3. Blank Input: ड्राइविंग लाइसेंस नंबर (Driving License Number) */}
          <div>
            <label className="text-[10px] font-black text-slate-700 block mb-1.5 uppercase tracking-wider">
              ड्राइविंग लाइसेंस नंबर (Driving License Number) *
            </label>
            <input
              type="text"
              value={dlNumber}
              onChange={(e) => {
                setDlNumber(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="UP40 20230001234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:border-[#0D47A1] focus:outline-none uppercase"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Submit Button */}
      <div className="pt-3 border-t border-slate-200 mt-3">
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!isFormValid}
          className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] ${
            isFormValid
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>वाहन विवरण सहेजें और आगे बढ़ें (Save &amp; Next)</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
