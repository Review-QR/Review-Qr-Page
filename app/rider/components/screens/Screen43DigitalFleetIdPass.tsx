"use client";

import React from "react";

interface Screen43Props {
  riderProp?: {
    full_name?: string | null;
    vehicle_number?: string | null;
    driving_license_number?: string | null;
    profile_image_url?: string | null;
  };
  onBack?: () => void;
  onCallPolice?: () => void;
  onCallFleetLead?: () => void;
}

export default function Screen43DigitalFleetIdPass({
  riderProp,
  onBack,
  onCallPolice,
  onCallFleetLead,
}: Screen43Props) {
  const riderName = riderProp?.full_name?.trim() || "Verified Partner";
  const vehicleText = riderProp?.vehicle_number?.trim() || "Pending Registration";
  const dlText = riderProp?.driving_license_number?.trim() || "Pending Verification";
  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              UP Police &amp; RTO Pass
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Digital Fleet ID &amp; Night Pass</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-emerald-600 bg-emerald-50 rounded-full py-0.5 border border-emerald-200">
            ✓ PASS
          </span>
        </div>

        {/* Official Identity Card Frame */}
        <div className="mt-4 bg-white border-2 border-[#0D47A1] rounded-3xl p-4 shadow-xl relative overflow-hidden">
          {/* Card Top Brand Strip */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center text-base">
                🛵
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-[#0D47A1] block">
                  TRUSTIT LOGISTICS FLEET
                </span>
                <span className="text-xs font-extrabold text-slate-900 leading-none">
                  Authorized Delivery Partner
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
              Active Shift
            </span>
          </div>

          {/* Rider Profile & Photo */}
          <div className="mt-3 flex items-start gap-3.5">
            <div className="w-16 h-20 rounded-2xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center text-white shrink-0 overflow-hidden shadow-xs">
              {riderProp?.profile_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={riderProp.profile_image_url} alt="Rider" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="text-3xl">🧑‍🚀</span>
                  <span className="text-[8px] font-bold text-emerald-400 mt-1 uppercase">Verified</span>
                </>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <h3 className="text-base font-black text-slate-900">{riderName}</h3>
              <p className="text-xs font-mono font-bold text-[#0D47A1]">ID: #TR-BHR-4091</p>
              <p className="text-[11px] text-slate-600 font-medium">Vehicle: {vehicleText}</p>
              <p className="text-[10px] text-slate-500">DL No: {dlText}</p>
            </div>
          </div>

          {/* Active Order Verification QR Box */}
          <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                Police / Checkpoint QR
              </span>
              <p className="text-xs font-bold text-slate-900">Active Duty Partner Pass</p>
              <p className="text-[10px] text-slate-500">Bahraich Hyperlocal Delivery Network</p>
              <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Essential Goods Courier
              </span>
            </div>

            {/* Simulated Police QR */}
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 p-1 flex items-center justify-center shadow-2xs shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-[9px] font-mono font-bold text-center p-1 leading-tight">
                [POLICE SCAN]
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <p className="mt-2 text-[9px] text-slate-400 text-center">
            Authorized by District Magistrate Bahraich &amp; Trustit Logistics Pvt Ltd under Motor Vehicles Act.
          </p>
        </div>
      </div>

      {/* Emergency Hotline Buttons */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCallPolice}
            className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 text-center flex items-center justify-center gap-1.5"
          >
            <span>👮 Dial 112 Police</span>
          </button>
          <button
            type="button"
            onClick={onCallFleetLead}
            className="flex-1 py-3 rounded-xl bg-[#0D47A1] text-white font-extrabold text-xs shadow-md hover:bg-blue-800 text-center flex items-center justify-center gap-1.5"
          >
            <span>📞 Call Fleet Lead</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400">
          24x7 Night Shift Protection · Police Hotline: 1800-TRUSTIT-SOS
        </p>
      </div>
    </div>
  );
}
