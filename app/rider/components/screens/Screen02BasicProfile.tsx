"use client";

import React, { useState, useEffect } from "react";

interface Screen02BasicProfileProps {
  verifiedPhone: string;
  initialData?: {
    fullName?: string;
    residentialAddress?: string;
    emergencyPhone?: string;
  };
  onSaveProfile: (data: {
    fullName: string;
    address: string;
    emergencyPhone?: string;
  }) => void;
  onBack?: () => void;
}

export default function Screen02BasicProfile({
  verifiedPhone,
  initialData,
  onSaveProfile,
  onBack,
}: Screen02BasicProfileProps) {
  // Completely blank inputs by default (no fake prefilled names like Lucky Shukla)
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [houseAndStreet, setHouseAndStreet] = useState("");
  const [villageAndPost, setVillageAndPost] = useState("");
  const [district, setDistrict] = useState("बहराइच, उत्तर प्रदेश - 271801");
  const [emergencyPhone, setEmergencyPhone] = useState(initialData?.emergencyPhone || "");
  const [error, setError] = useState<string | null>(null);

  // Restore draft from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined" && !initialData?.fullName) {
      try {
        const draft = localStorage.getItem("trustit_rider_profile_draft");
        if (draft) {
          const parsed = JSON.parse(draft);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.houseAndStreet) setHouseAndStreet(parsed.houseAndStreet);
          if (parsed.villageAndPost) setVillageAndPost(parsed.villageAndPost);
          if (parsed.emergencyPhone) setEmergencyPhone(parsed.emergencyPhone);
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
          JSON.stringify({ fullName, houseAndStreet, villageAndPost, emergencyPhone })
        );
      } catch {}
    }
  }, [fullName, houseAndStreet, villageAndPost, emergencyPhone]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError("कृपया अपना वास्तविक पूरा नाम दर्ज करें (Enter your full name)");
      return;
    }
    if (!houseAndStreet.trim()) {
      setError("कृपया मकान नंबर और गली / मोहल्ला दर्ज करें (Enter House No. & Street/Mohalla)");
      return;
    }
    if (!villageAndPost.trim()) {
      setError("कृपया गाँव / कस्बा और पोस्ट ऑफिस दर्ज करें (Enter Village & Post Office)");
      return;
    }

    const fullAddress = `${houseAndStreet.trim()}, ${villageAndPost.trim()}, ${district.trim()}`;
    setError(null);

    onSaveProfile({
      fullName: fullName.trim(),
      address: fullAddress,
      emergencyPhone: emergencyPhone.trim() || undefined,
    });
  };

  const isFormValid =
    fullName.trim().length >= 3 &&
    houseAndStreet.trim().length >= 2 &&
    villageAndPost.trim().length >= 2;

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
            ऑर्डर डिलीवरी और फ्लीट रिकॉर्ड के लिए अपना वास्तविक नाम व बहराइच का पता दर्ज करें।
          </p>
        </div>

        {/* Verified Phone Badge */}
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <div>
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                सत्यापित मोबाइल नंबर (Verified Number)
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
        <form onSubmit={handleSubmit} className="mt-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-3">
          {/* Full Name */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              पूरा नाम (Full Name) *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError(null);
              }}
              placeholder="उदा. राहुल वर्मा (अपना नाम लिखें)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
              autoFocus
            />
          </div>

          {/* House No & Street */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              मकान संख्या एवं गली / मोहल्ला (House No., Street/Gali) *
            </label>
            <input
              type="text"
              value={houseAndStreet}
              onChange={(e) => {
                setHouseAndStreet(e.target.value);
                setError(null);
              }}
              placeholder="उदा. मकान नं. 15, नाज़िरपुरा / मोहल्ला छावनी"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* Village & Post Office */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              गाँव / कस्बा एवं पोस्ट ऑफिस (Village &amp; Post Office) *
            </label>
            <input
              type="text"
              value={villageAndPost}
              onChange={(e) => {
                setVillageAndPost(e.target.value);
                setError(null);
              }}
              placeholder="उदा. बहराइच हेड पोस्ट ऑफिस"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0D47A1] focus:outline-none"
            />
          </div>

          {/* District & Pincode (Read-only / Pre-set for Bahraich Fleet) */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              जिला एवं पिन कोड (District &amp; Pin Code)
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none"
            />
          </div>

          {/* Emergency / Alternate Phone */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              आपातकालीन संपर्क नंबर (Emergency Contact - Optional)
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 focus-within:border-[#0D47A1] focus-within:bg-white">
              <span className="text-xs font-bold text-slate-500 font-mono pr-2 border-r border-slate-300">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10 अंकों का नंबर"
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
