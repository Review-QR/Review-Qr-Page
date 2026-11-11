"use client";

import React, { useState, useEffect } from "react";

interface Screen02BasicProfileProps {
  verifiedPhone: string;
  initialData?: {
    fullName?: string;
    residentialAddress?: string;
    emergencyContactName?: string;
    emergencyPhone?: string;
  };
  onSaveProfile: (data: {
    fullName: string;
    address: string;
    emergencyContactName: string;
    emergencyPhone: string;
  }) => void;
  onBack?: () => void;
  noticeMessage?: string | null;
}

export default function Screen02BasicProfile({
  verifiedPhone,
  initialData,
  onSaveProfile,
  onBack,
  noticeMessage,
}: Screen02BasicProfileProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [houseAndStreet, setHouseAndStreet] = useState("");
  const [villageAndPost, setVillageAndPost] = useState("");
  const [districtAndCity, setDistrictAndCity] = useState("Bahraich");
  const [pincode, setPincode] = useState("271801");
  const [emergencyContactName, setEmergencyContactName] = useState(initialData?.emergencyContactName || "");
  const [emergencyPhone, setEmergencyPhone] = useState(initialData?.emergencyPhone || "");
  const [error, setError] = useState<string | null>(null);

  // Restore draft from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined" && !initialData?.fullName) {
      try {
        const draft = localStorage.getItem("trustit_rider_profile_draft");
        if (draft) {
          const p = JSON.parse(draft);
          if (p.fullName) setFullName(p.fullName);
          if (p.houseAndStreet) setHouseAndStreet(p.houseAndStreet);
          if (p.villageAndPost) setVillageAndPost(p.villageAndPost);
          if (p.districtAndCity) setDistrictAndCity(p.districtAndCity);
          if (p.pincode) setPincode(p.pincode);
          if (p.emergencyContactName) setEmergencyContactName(p.emergencyContactName);
          if (p.emergencyPhone) setEmergencyPhone(p.emergencyPhone);
        }
      } catch {}
    }
  }, [initialData]);

  // Auto-save draft on changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "trustit_rider_profile_draft",
          JSON.stringify({
            fullName,
            houseAndStreet,
            villageAndPost,
            districtAndCity,
            pincode,
            emergencyContactName,
            emergencyPhone,
          })
        );
      } catch {}
    }
  }, [fullName, houseAndStreet, villageAndPost, districtAndCity, pincode, emergencyContactName, emergencyPhone]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("Please enter your legal full name (at least 3 characters).");
      return;
    }
    if (!houseAndStreet.trim()) {
      setError("Please enter house/flat number and street name.");
      return;
    }
    if (!villageAndPost.trim()) {
      setError("Please enter area, locality or village and post office.");
      return;
    }
    if (!districtAndCity.trim()) {
      setError("Please enter city or district (e.g. Bahraich, Shravasti).");
      return;
    }
    if (!emergencyContactName.trim()) {
      setError("Emergency contact person name is mandatory (Father, Brother, or Relative).");
      return;
    }
    const cleanEmergencyPhone = emergencyPhone.replace(/\D/g, "");
    if (!cleanEmergencyPhone || cleanEmergencyPhone.length < 10) {
      setError("Please enter a valid 10-digit emergency contact number.");
      return;
    }
    const cleanRiderPhone = verifiedPhone.replace(/\D/g, "").slice(-10);
    if (cleanEmergencyPhone.slice(-10) === cleanRiderPhone) {
      setError("Emergency contact number cannot be the same as your own registered phone number.");
      return;
    }

    const fullAddress = `${houseAndStreet.trim()}, ${villageAndPost.trim()}, ${districtAndCity.trim()} - ${pincode.trim()}`;
    setError(null);

    onSaveProfile({
      fullName: fullName.trim(),
      address: fullAddress,
      emergencyContactName: emergencyContactName.trim(),
      emergencyPhone: cleanEmergencyPhone,
    });
  };

  const isFormValid =
    fullName.trim().length >= 3 &&
    houseAndStreet.trim().length >= 2 &&
    villageAndPost.trim().length >= 2 &&
    districtAndCity.trim().length >= 2 &&
    emergencyContactName.trim().length >= 2 &&
    emergencyPhone.replace(/\D/g, "").length === 10;

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline cursor-pointer"
          >
            <span>← Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-[#0D47A1] border border-blue-200 uppercase tracking-wider">
              Rider Registration
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 1 of 6</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">
            Basic Profile
          </h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            Enter your legal name, residential address, and emergency contact for fleet verification.
          </p>
        </div>

        {noticeMessage && (
          <div className="mt-2.5 rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-[11px] font-bold text-amber-900 leading-snug">
            ℹ️ {noticeMessage}
          </div>
        )}

        {/* Verified Phone Badge */}
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <div>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                Registered Mobile Number
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                +91 {verifiedPhone || "Registered Mobile"}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
            Verified ✓
          </span>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              placeholder="Enter legal full name as per Aadhaar/PAN"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
              autoFocus
            />
          </div>

          {/* House No & Street */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              House No. / Flat &amp; Street Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={houseAndStreet}
              onChange={(e) => {
                setHouseAndStreet(e.target.value);
                setError(null);
              }}
              placeholder="House/Flat number, street, or building name"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* Village & Post Office */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              Area / Landmark / Village &amp; Post <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={villageAndPost}
              onChange={(e) => {
                setVillageAndPost(e.target.value);
                setError(null);
              }}
              placeholder="Area, locality, landmark or post office"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* District & Pincode */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                City / District <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={districtAndCity}
                onChange={(e) => {
                  setDistrictAndCity(e.target.value);
                  setError(null);
                }}
                placeholder="Bahraich / Shravasti / Gonda"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                Pincode <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="271801"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
              />
            </div>
          </div>

          {/* Emergency Contact Name (Mandatory) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              Emergency Contact Person Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={emergencyContactName}
              onChange={(e) => {
                setEmergencyContactName(e.target.value);
                setError(null);
              }}
              placeholder="Father, Brother, or Relative Name"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* Emergency Contact Number (Mandatory) */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              Emergency Contact Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 focus-within:border-[#0D47A1] focus-within:bg-white">
              <span className="text-xs font-bold text-slate-500 font-mono pr-2 border-r border-slate-300">+91</span>
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                pattern="[0-9]*"
                value={emergencyPhone}
                onChange={(e) => {
                  setEmergencyPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError(null);
                }}
                placeholder="10-digit mobile number"
                className="w-full pl-2 text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Footer Submit Button - Sleek enterprise height */}
      <div className="pt-3 border-t border-slate-200 mt-3">
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!isFormValid}
          className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] ${
            isFormValid
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Save &amp; Continue</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
