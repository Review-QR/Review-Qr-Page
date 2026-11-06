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
}

export default function Screen02BasicProfile({
  verifiedPhone,
  initialData,
  onSaveProfile,
  onBack,
}: Screen02BasicProfileProps) {
  // Completely blank inputs - NO prefilled text, NO confusing "उदा." in values
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [houseAndStreet, setHouseAndStreet] = useState("");
  const [villageAndPost, setVillageAndPost] = useState("");
  const [districtAndCity, setDistrictAndCity] = useState("बहराइच");
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
      setError("कृपया अपना पूरा नाम दर्ज करें (Enter Full Name)");
      return;
    }
    if (!houseAndStreet.trim()) {
      setError("कृपया मकान नंबर और गली / मोहल्ला दर्ज करें");
      return;
    }
    if (!villageAndPost.trim()) {
      setError("कृपया गाँव / कस्बा और पोस्ट ऑफिस दर्ज करें");
      return;
    }
    if (!districtAndCity.trim()) {
      setError("कृपया अपना जिला / शहर दर्ज करें (उदा. बहराइच / श्रावस्ती)");
      return;
    }
    if (!emergencyContactName.trim()) {
      setError("आपातकालीन संपर्क व्यक्ति का नाम अनिवार्य है (पिता / भाई / मित्र का नाम)");
      return;
    }
    const cleanEmergencyPhone = emergencyPhone.replace(/\D/g, "");
    if (!cleanEmergencyPhone || cleanEmergencyPhone.length < 10) {
      setError("आपातकालीन 10-अंकीय मोबाइल नंबर दर्ज करना अनिवार्य है");
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
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← वापस (Back)</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-100 text-[#0D47A1] border border-blue-200 uppercase tracking-wider">
              राइडर पंजीकरण
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">चरण 2 / 6</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">
            मूल विवरण (Basic Profile)
          </h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            सत्यापन और फ्लीट रिकॉर्ड के लिए अपना नाम, निवास स्थान व आपातकालीन संपर्क दर्ज करें।
          </p>
        </div>

        {/* Verified Phone Badge */}
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <div>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                सत्यापित मोबाइल नंबर
              </span>
              <span className="text-xs font-mono font-bold text-slate-900">
                +91 {verifiedPhone || "Registered Mobile"}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
            ✓ सत्यापित
          </span>
        </div>

        {/* Input Form Card */}
        <form onSubmit={handleSubmit} className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              पूरा नाम (Full Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              placeholder="पूरा नाम दर्ज करें"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
              autoFocus
            />
          </div>

          {/* House No & Street */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              मकान संख्या एवं गली / मोहल्ला <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={houseAndStreet}
              onChange={(e) => {
                setHouseAndStreet(e.target.value);
                setError(null);
              }}
              placeholder="मकान नंबर व गली / मोहल्ला"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* Village & Post Office */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              गाँव / कस्बा एवं पोस्ट ऑफिस <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={villageAndPost}
              onChange={(e) => {
                setVillageAndPost(e.target.value);
                setError(null);
              }}
              placeholder="गाँव या कस्बा और पोस्ट ऑफिस"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* District & Pincode (Editable, not hardcoded to only Bahraich) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                जिला / शहर (District) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={districtAndCity}
                onChange={(e) => {
                  setDistrictAndCity(e.target.value);
                  setError(null);
                }}
                placeholder="बहराइच / श्रावस्ती"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
                पिन कोड (Pincode) <span className="text-rose-500">*</span>
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
              आपातकालीन संपर्क व्यक्ति का नाम (Emergency Contact Person) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={emergencyContactName}
              onChange={(e) => {
                setEmergencyContactName(e.target.value);
                setError(null);
              }}
              placeholder="पिता, भाई या मित्र का नाम"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* Emergency Contact Number (Mandatory) */}
          <div>
            <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider block mb-1">
              आपातकालीन मोबाइल नंबर (Emergency Mobile No.) <span className="text-rose-500">*</span>
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
                placeholder="10 अंकों का मोबाइल नंबर"
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
          <span>विवरण सहेजें और आगे बढ़ें (Save &amp; Continue)</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
