"use client";

import React, { useState } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";

export interface OnContinueParams {
  phone: string;
  channel: "sms" | "whatsapp";
  previewOtp?: string;
  fullName?: string;
  vehicleType?: "scooter";
  isNewRegistration?: boolean;
}

interface Screen01Props {
  onContinue?: (
    phone: string,
    channel: "sms" | "whatsapp",
    previewOtp?: string,
    meta?: { fullName?: string; vehicleType?: "scooter"; isNewRegistration?: boolean }
  ) => void;
  onGoogleLogin?: () => void;
}

export default function Screen01AuthStart({ onContinue, onGoogleLogin }: Screen01Props) {
  const [phone, setPhone] = useState("9415011111");
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { sendPhoneOtp, isLoading, error } = useRiderAuth();

  const handleSmsClick = () => {
    // SMS button is disabled as instructed: "SMS पे टिक करने पे tick na हो"
    setLocalError("SMS OTP सेवा अस्थायी रूप से अक्षम है। कृपया WhatsApp OTP का उपयोग करें।");
  };

  const handleWhatsAppClick = () => {
    setSelectedChannel("whatsapp");
    setLocalError(null);
  };

  const handleSubmit = async () => {
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setLocalError("कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile number).");
      return;
    }
    setLocalError(null);

    const res = await sendPhoneOtp(cleanPhone, "whatsapp");
    if (res.success) {
      onContinue?.(cleanPhone, "whatsapp", res.previewOtp, {
        fullName: "Delivery Partner",
        vehicleType: "scooter",
        isNewRegistration: true,
      });
    } else {
      setLocalError(res.error || "WhatsApp OTP भेजने में विफल। कृपया पुनः प्रयास करें।");
    }
  };

  return (
    <div className="w-full h-full max-h-[600px] bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none overflow-hidden relative">
      <div>
        {/* Top Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center text-sm shadow-sm">
              🛵
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-[#0D47A1] tracking-wider block leading-none">
                TRUSTIT FLEET
              </span>
              <h2 className="text-xs font-black text-slate-900 leading-tight">Delivery Partner App</h2>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-[#0D47A1] border border-blue-200">
            Bahraich UP 40
          </span>
        </div>

        {/* Title */}
        <div className="mt-3 space-y-0.5">
          <h1 className="text-sm font-black text-slate-900 leading-tight">Enter Your Mobile Number</h1>
          <p className="text-[11px] text-slate-500 leading-tight">
            We will send an instant 6-digit verification code.
          </p>
        </div>

        {/* Phone Entry Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-3">
          {/* Mobile Input */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Registered Mobile Number
            </label>
            <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 focus-within:border-[#0D47A1] focus-within:bg-white transition">
              <span className="text-xs font-bold text-slate-700 font-mono pr-2 border-r border-slate-300">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setLocalError(null);
                }}
                placeholder="Enter 10-digit number"
                className="w-full pl-2 text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none tracking-wider"
              />
            </div>
          </div>

          {/* TWO BUTTONS: OTP on WhatsApp & OTP on SMS (As strictly requested by user) */}
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select OTP Channel
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Button 1: OTP on WhatsApp (Selected by default) */}
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className={`py-2 px-2.5 rounded-lg border font-black text-[11px] flex items-center justify-center gap-1.5 transition shadow-2xs ${
                  selectedChannel === "whatsapp"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>💬</span>
                <span>OTP on WhatsApp</span>
                <span className="text-[10px] text-emerald-600 font-bold">✓</span>
              </button>

              {/* Button 2: OTP on SMS (Disabled, clicking does not select) */}
              <button
                type="button"
                onClick={handleSmsClick}
                className="py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-100/90 text-slate-400 font-bold text-[11px] flex items-center justify-center gap-1 cursor-not-allowed opacity-75"
                title="SMS Gateway Temporarily Disabled"
              >
                <span>📱</span>
                <span>OTP on SMS</span>
                <span className="text-[8px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-mono">Soon</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-semibold leading-tight">
              ⚠️ {localError || error}
            </div>
          )}

          {/* Exact Undertaking Sentence with PDF Link as Requested:
              "By tapping Continue, you agree to our (Terms & Road Safety Policy)" */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 leading-snug">
            <span>By tapping Continue, you agree to our </span>
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="text-[#0D47A1] font-bold underline hover:text-blue-800 transition cursor-pointer"
            >
              (Terms &amp; Road Safety Policy)
            </button>
            <span> and ₹1,500 cash ceiling undertaking.</span>
          </div>

          {/* Slim 40px Primary Action Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={phone.length < 10 || isLoading}
            className={`w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-2 shadow-2xs transition active:scale-[0.99] ${
              phone.length === 10 && !isLoading
                ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span>Sending WhatsApp OTP...</span>
            ) : (
              <>
                <span>Continue with WhatsApp OTP</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Google Sign-In */}
        <div className="mt-2.5 text-center">
          <button
            type="button"
            onClick={onGoogleLogin}
            className="w-full py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 shadow-2xs active:scale-[0.99] transition"
          >
            <span>🌐</span>
            <span>Continue with Google Account</span>
          </button>
        </div>
      </div>

      {/* Security Footer */}
      <div className="pt-2 border-t border-slate-200 text-center">
        <p className="text-[9px] text-slate-400 font-mono">
          Fast2SMS Direct WhatsApp Gateway · 256-Bit SSL Encrypted
        </p>
      </div>

      {/* Automatic Terms & Road Safety Policy PDF Modal (Opens on clicking link) */}
      {showPdfModal && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-xs z-50 p-3.5 flex flex-col justify-end">
          <div className="bg-white rounded-2xl p-4 shadow-2xl max-h-[88%] flex flex-col justify-between text-[#0F172A] border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="text-base">📄</span>
                <div>
                  <strong className="text-xs font-black block leading-none">Terms &amp; Road Safety Policy</strong>
                  <span className="text-[9px] text-slate-400 font-mono">Trustit Bahraich Partner Code (PDF Document)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Document Body */}
            <div className="py-2.5 space-y-2 text-[10px] text-slate-600 overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5">
                <strong className="text-amber-950 font-bold block text-[11px]">
                  1. ₹1,500 Cash-in-Hand Safety Ceiling:
                </strong>
                <p className="text-amber-900 leading-tight">
                  जब भी राइडर का COD कैश संग्रह ₹1,500 तक पहुंचेगा, वह Trustit UPI रीमिटेंस के जरिए कैश जमा करेगा। इसके बाद ही अगले ऑर्डर उपलब्ध होंगे।
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 space-y-0.5">
                <strong className="text-blue-950 font-bold block text-[11px]">
                  2. Mandatory Helmet &amp; UP 40 Traffic Safety:
                </strong>
                <p className="text-blue-900 leading-tight">
                  राइडर हमेशा हेलमेट पहनेगा तथा वैध UP 40 RC व ड्राइविंग लाइसेंस साथ रखेगा। बहराइच ट्रैफिक नियमों का कड़ाई से पालन अनिवार्य है।
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 space-y-0.5">
                <strong className="text-purple-950 font-bold block text-[11px]">
                  3. Trustit Dynamic QR Code Only:
                </strong>
                <p className="text-purple-900 leading-tight">
                  ग्राहक से भुगतान के लिए केवल आधिकारिक Trustit Cashfree QR कोड ही दिखाएं। अपना व्यक्तिगत QR कोड दिखाना सख्त प्रतिबंधित है।
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                <strong className="text-emerald-950 font-bold block text-[11px]">
                  4. Honest GPS Telemetry:
                </strong>
                <p className="text-emerald-900 leading-tight">
                  सटीक लाइव जीपीएस लोकेशन शेयर करना आवश्यक है। किसी भी मॉक या फेक जीपीएस टूल के प्रयोग पर आईडी तुरंत ब्लॉक की जाएगी।
                </p>
              </div>
            </div>

            {/* Modal Accept Action */}
            <button
              type="button"
              onClick={() => setShowPdfModal(false)}
              className="w-full py-2 bg-[#0D47A1] hover:bg-[#082b66] text-white rounded-lg text-xs font-black shadow-xs transition"
            >
              ✓ I Agree to Terms &amp; Conditions (स्वीकार है)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
