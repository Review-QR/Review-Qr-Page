"use client";

import React, { useState } from "react";
import Link from "next/link";
import ScreenAuth01LandingBecomePartner from "@/app/merchant/components/screens/ScreenAuth01LandingBecomePartner";
import ScreenAuth02BusinessCategoryWizard from "@/app/merchant/components/screens/ScreenAuth02BusinessCategoryWizard";
import ScreenAuth03MobileKycRegistration from "@/app/merchant/components/screens/ScreenAuth03MobileKycRegistration";
import ScreenAuth04PartnerLogin from "@/app/merchant/components/screens/ScreenAuth04PartnerLogin";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

export default function PublicPartnerRegistrationPage() {
  const [step, setStep] = useState<"pitch" | "category" | "kyc_otp" | "success" | "login">("pitch");
  const [selectedCategory, setSelectedCategory] = useState<string>("kirana");
  const [registeredShopName, setRegisteredShopName] = useState<string>("Gupta Kirana & General Store");
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/trustit" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
              T
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">
                TRUSTIT
              </span>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Merchant Partner Network
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              0% Commission · Free QR Standee
            </span>

            {step === "login" ? (
              <button
                type="button"
                onClick={() => setStep("pitch")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
              >
                + Register New Shop
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep("login")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition border border-slate-300 flex items-center gap-1"
              >
                <span>Already Registered?</span>
                <span className="text-blue-700 font-black">Login →</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Multi-Step Funnel Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 py-8 flex flex-col justify-center">
        {/* Step Indicator (Only visible during onboarding flow) */}
        {step !== "login" && step !== "success" && (
          <div className="mb-6 max-w-md mx-auto w-full">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-400 mb-2">
              <span className={step === "pitch" ? "text-blue-700 font-bold" : "text-emerald-600"}>
                1. Overview
              </span>
              <span className={step === "category" ? "text-blue-700 font-bold" : ""}>
                2. Business Type
              </span>
              <span className={step === "kyc_otp" ? "text-blue-700 font-bold" : ""}>
                3. Shop KYC &amp; OTP
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width:
                    step === "pitch"
                      ? "33%"
                      : step === "category"
                      ? "66%"
                      : "100%",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* STEP 1: PITCH & BENEFITS */}
        {step === "pitch" && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-md mx-auto w-full">
            <ScreenAuth01LandingBecomePartner
              onStartRegistration={() => setStep("category")}
              onGoToLogin={() => setStep("login")}
            />
          </div>
        )}

        {/* STEP 2: BUSINESS CATEGORY WIZARD */}
        {step === "category" && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-md mx-auto w-full">
            <ScreenAuth02BusinessCategoryWizard
              onBack={() => setStep("pitch")}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setStep("kyc_otp");
              }}
            />
          </div>
        )}

        {/* STEP 3: SHOP KYC & WHATSAPP OTP */}
        {step === "kyc_otp" && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-md mx-auto w-full">
            <ScreenAuth03MobileKycRegistration
              category={selectedCategory}
              onBack={() => setStep("category")}
              onRegisterComplete={() => {
                setRegisteredShopName(
                  selectedCategory === "kirana"
                    ? "Gupta Kirana & General Store"
                    : selectedCategory === "chemist"
                    ? "Arogya Medical & Wellness Store"
                    : selectedCategory === "salon"
                    ? "Royal Look Salon & Spa"
                    : selectedCategory === "carwash"
                    ? "SpeedShine Car Detailing"
                    : "The Golden Leaf Cafe"
                );
                setStep("success");
              }}
            />
          </div>
        )}

        {/* STEP 4: REGISTRATION SUCCESS & FREE QR REWARD */}
        {step === "success" && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-xl mx-auto w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto ring-8 ring-emerald-50">
              🎉
            </div>

            <div>
              <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Shop Registration Complete!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Badhaai Ho, {registeredShopName}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Aapka official Trustit Partner ID ban chuka hai aur aapka Digital Review QR standee generate ho gaya hai.
              </p>
            </div>

            {/* Instant Free Review Standee Mockup */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-5 rounded-3xl text-white shadow-xl max-w-xs mx-auto border-4 border-slate-800">
              <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-md">
                <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                  Official Google Review QR
                </span>
                <p className="font-extrabold text-xs text-slate-900 mt-0.5 line-clamp-1">
                  {registeredShopName}
                </p>

                {/* Simulated High-Res QR Code */}
                <div className="w-36 h-36 mx-auto my-3 bg-white p-2 border-2 border-slate-900 rounded-xl flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-slate-950 rounded-lg p-1.5 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-7 h-7 bg-white rounded-sm p-1">
                        <div className="w-full h-full bg-slate-950"></div>
                      </div>
                      <div className="w-7 h-7 bg-white rounded-sm p-1">
                        <div className="w-full h-full bg-slate-950"></div>
                      </div>
                    </div>
                    <div className="text-center text-[8px] font-black text-white uppercase tracking-widest">
                      TRUSTIT REVIEW
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="w-7 h-7 bg-white rounded-sm p-1">
                        <div className="w-full h-full bg-slate-950"></div>
                      </div>
                      <div className="text-[10px]">⭐ 5.0</div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] font-bold text-slate-700">
                  Scan to Rate on Google &amp; Pay via UPI
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>Free Standee Guarantee</span>
                <span className="text-emerald-400">Lifetime Active</span>
              </div>
            </div>

            {/* Teaser Benefit Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <span>🎁 Aapko Mila Hai Free Forever Access:</span>
              </div>
              <p className="text-amber-800">
                • <strong>Google Review QR Code:</strong> Counter par print karke lagayein, hamesha free rahega.
              </p>
              <p className="text-amber-800">
                • <strong>Customer Feedback:</strong> Pehla review bina kisi shart ke free padhein.
              </p>
              <p className="text-amber-800">
                • <strong>Unlimited Reviews &amp; WhatsApp Wishes:</strong> Aage chalkar sirf ₹29 ya ₹49 me unlock karein!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/merchant/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <span>Dukaan Dashboard Kholein</span>
                <span>→</span>
              </Link>

              <Link
                href="/merchant-preview"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <span>📱 68-Screen Gallery Preview</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <span>⭐ View Plans &amp; Benefits (₹29 / ₹49)</span>
              </button>
            </div>
          </div>
        )}

        {/* ALREADY REGISTERED PARTNER LOGIN */}
        {step === "login" && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden max-w-md mx-auto w-full">
            <ScreenAuth04PartnerLogin
              onLoginSuccess={() => {
                window.location.href = "/merchant/dashboard";
              }}
              onGoToRegister={() => setStep("pitch")}
            />
          </div>
        )}
      </main>

      {/* Reusable Universal Upgrade Modal */}
      <UniversalUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        reason="general"
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Trustit Technologies India · Hyperlocal Merchant Operating System · Bahraich &amp; Uttar Pradesh
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          100% Data Privacy &amp; DPDPA 2023 Compliant · 24x7 Merchant Helpline: +91 98765 43210
        </p>
      </footer>
    </div>
  );
}
