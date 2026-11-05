"use client";

import React, { useState, useRef } from "react";

interface Screen05Props {
  onBack?: () => void;
  onSave?: () => void;
  onSaveProfile?: (profile: { storeName: string; ownerName: string; businessType: string; logoUrl?: string }) => void;
  initialStoreName?: string;
  initialOwnerName?: string;
  initialBusinessType?: string;
  initialPhone?: string;
  initialLogoUrl?: string;
}

export default function Screen05StoreBrandProfile({
  onBack,
  onSave,
  onSaveProfile,
  initialStoreName = "Shri Balaji Daily Needs & General Store",
  initialOwnerName = "Aman Sharma",
  initialBusinessType = "Kirana & General Store",
  initialPhone = "+919118643415",
  initialLogoUrl,
}: Screen05Props) {
  const [storeName, setStoreName] = useState(initialStoreName);
  const [ownerName, setOwnerName] = useState(initialOwnerName);
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [phone] = useState(initialPhone);
  const [logoImage, setLogoImage] = useState<string | null>(initialLogoUrl || null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoImage(result);
        setUploadSuccess("✓ Logo photo attached & syncing to cloud database...");
        if (onSaveProfile) {
          onSaveProfile({ storeName, ownerName, businessType, logoUrl: result });
        }
        setTimeout(() => setUploadSuccess("✓ Logo successfully saved to Database!"), 1200);
        setTimeout(() => setUploadSuccess(null), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetLogo = (presetUrl: string, presetLabel: string) => {
    setLogoImage(presetUrl);
    setUploadSuccess(`✓ Selected ${presetLabel} & syncing to cloud database...`);
    if (onSaveProfile) {
      onSaveProfile({ storeName, ownerName, businessType, logoUrl: presetUrl });
    }
    setTimeout(() => setUploadSuccess("✓ Logo successfully saved to Database!"), 1200);
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  const handleSave = () => {
    setSaved(true);
    if (onSaveProfile) {
      onSaveProfile({ storeName, ownerName, businessType, logoUrl: logoImage || undefined });
    }
    setTimeout(() => {
      setSaved(false);
      onSave?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              MY BUSINESS • IDENTITY
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Store Branding &amp; Credentials
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

        {/* Hidden File Picker Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Logo Uploader & Emblem Preview */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex items-center gap-3.5">
          <div className="relative">
            {logoImage ? (
              <img
                src={logoImage}
                alt="Store Logo"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-950 border-2 border-amber-800 text-amber-300 flex items-center justify-center font-black text-2xl shadow-sm">
                🏬
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 text-[9px] shadow cursor-pointer hover:bg-blue-500"
              title="Change Logo"
            >
              ✏️
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-900">Official Store Logo</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Appears on consumer app, digital bills, KOT tickets, and WhatsApp greeting cards.
            </p>
            {uploadSuccess && (
              <span className="text-[10px] font-bold text-emerald-600 block mt-1 animate-pulse">
                {uploadSuccess}
              </span>
            )}
            <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 cursor-pointer active:scale-95 transition flex items-center gap-1 shadow-2xs"
              >
                <span>📁</span> Upload New Image
              </button>
              <button
                type="button"
                onClick={() => handleSelectPresetLogo("https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&auto=format&fit=crop&q=80", "Kirana Store Logo")}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-medium border border-slate-200 cursor-pointer transition"
              >
                🏬 Kirana
              </button>
              <button
                type="button"
                onClick={() => handleSelectPresetLogo("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80", "Restaurant Logo")}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-medium border border-slate-200 cursor-pointer transition"
              >
                🍱 Kitchen
              </button>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Store Name (As shown to customers)
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Business Category
            </label>
            <input
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Owner / Proprietor Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">
                Registered Contact Mobile
              </label>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ WhatsApp Verified
              </span>
            </div>
            <input
              type="text"
              value={phone}
              disabled
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-100 cursor-not-allowed font-mono"
            />
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3">
        {saved ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Store Profile Updated Successfully!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Save Profile Changes
          </button>
        )}
      </div>
    </div>
  );
}
