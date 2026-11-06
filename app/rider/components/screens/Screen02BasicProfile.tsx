"use client";

import React, { useState } from "react";

interface Screen02BasicProfileProps {
  verifiedPhone: string;
  onSaveProfile: (data: {
    fullName: string;
    address: string;
    emergencyPhone?: string;
  }) => void;
  onBack?: () => void;
}

export default function Screen02BasicProfile({
  verifiedPhone,
  onSaveProfile,
  onBack,
}: Screen02BasicProfileProps) {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("कृपया अपना पूरा नाम दर्ज करें (Enter your full name)");
      return;
    }
    if (!address.trim() || address.trim().length < 5) {
      setError("कृपया बहराइच का अपना पता/मोहल्ला दर्ज करें (Enter your address in Bahraich)");
      return;
    }
    setError(null);
    onSaveProfile({
      fullName: fullName.trim(),
      address: address.trim(),
      emergencyPhone: emergencyPhone.trim() || undefined,
    });
  };

  return (
    <div className="w-full h-full max-h-[580px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none overflow-y-auto">
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
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-[#0D47A1] border border-blue-200">
              NEW REGISTRATION
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 2 of 6</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">Create Partner Profile</h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            Enter your real name and Bahraich residential address for order dispatches.
          </p>
        </div>

        {/* Verified Phone Badge */}
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <div>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                Verified WhatsApp Number
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                +91 {verifiedPhone || "Registered"}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
            ✓ Verified
          </span>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-3">
          {/* Full Name */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Full Name (पूरा नाम) *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Lucky Shukla"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
              autoFocus
            />
          </div>

          {/* Bahraich Address / Locality */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Locality / Address in Bahraich (बहराइच का पता / मोहल्ला) *
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError(null);
              }}
              placeholder="e.g. House No. 12, Nazipurwa (Near Anupam Sweets), Bahraich"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none resize-none"
            />
          </div>

          {/* Emergency / Alternate Phone */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Emergency Contact (वैकल्पिक/आपातकालीन नंबर - Optional)
            </label>
            <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2 py-1.5 focus-within:border-[#0D47A1] focus-within:bg-white">
              <span className="text-xs font-bold text-slate-500 font-mono pr-2 border-r border-slate-300">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number"
                className="w-full pl-2 text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-semibold">
              ⚠️ {error}
            </div>
          )}
        </form>
      </div>

      {/* Footer Submit Button */}
      <div className="pt-2 border-t border-slate-200 mt-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!fullName.trim() || !address.trim()}
          className={`w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] ${
            fullName.trim().length >= 3 && address.trim().length >= 5
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Save Profile &amp; Continue</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
