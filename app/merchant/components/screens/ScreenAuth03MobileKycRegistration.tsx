"use client";

import React, { useState } from "react";

interface ScreenAuth03Props {
  category?: string;
  onBack?: () => void;
  onRegisterComplete?: () => void;
}

export default function ScreenAuth03MobileKycRegistration({
  category = "kirana",
  onBack,
  onRegisterComplete,
}: ScreenAuth03Props) {
  const [storeName, setStoreName] = useState(
    category === "kirana"
      ? "Shri Ram Kirana & Supermarket"
      : category === "chemist"
      ? "Sanjivani Medicos & Pharmacy"
      : category === "salon"
      ? "Looks Unisex Salon & Spa"
      : category === "carwash"
      ? "SpeedX Auto Foam Detailing"
      : "Golden Blossom Cafe"
  );
  const [ownerName, setOwnerName] = useState("Rajesh Kumar Gupta");
  const [phone, setPhone] = useState("9876543210");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["4", "8", "1", "9", "2", "0"]);

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              REGISTRATION • STEP 2 OF 3
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Store KYC &amp; OTP Verification
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Selected Category Pill */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Selected Vertical:</span>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
            {category} Mart
          </span>
        </div>

        {/* Registration Form */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Official Store / Shop Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Proprietor / Owner Full Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Mobile Number (WhatsApp OTP)
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5">
              <span className="text-xs font-bold text-slate-600 mr-2 border-r border-slate-300 pr-2">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          {/* GPS Auto-Detect */}
          <div className="pt-1">
            <button
              type="button"
              className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300 flex items-center justify-center gap-1.5"
            >
              <span>📍 Detect Current GPS Coordinates (Bahraich Central)</span>
            </button>
          </div>
        </div>

        {/* 6-Digit OTP Box */}
        <div className="mt-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3 text-center space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-blue-900 tracking-wider">
              6-Box WhatsApp / SMS OTP
            </span>
            <span className="text-[9px] font-mono text-blue-700 font-bold">Auto-Detected</span>
          </div>

          <div className="flex justify-center gap-1.5 pt-1">
            {otp.map((digit, i) => (
              <span
                key={i}
                className="w-8 h-9 rounded-lg bg-white border border-blue-300 flex items-center justify-center font-mono font-black text-sm text-slate-950 shadow-2xs"
              >
                {digit}
              </span>
            ))}
          </div>
          <span className="text-[9px] text-slate-500 block">Sent to +91 {phone}</span>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onRegisterComplete}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>✓ VERIFY &amp; OPEN {category.toUpperCase()} CONSOLE</span>
        </button>
      </div>
    </div>
  );
}
