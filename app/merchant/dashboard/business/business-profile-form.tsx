"use client";

import { useActionState, useState, useRef } from "react";
import LocationCapture from "../profile/location-capture";
import { saveMerchantDiscoveryLocationAction } from "./location-actions";
import {
  saveBusinessProfileAction,
  requestMerchantMobileChangeOtpAction,
  verifyAndApplyMobileChangeAction,
  requestMerchantEmailChangeOtpAction,
  verifyAndApplyEmailChangeAction,
  requestMerchantProfileEditOtpAction,
  verifyMerchantProfileEditOtpAction,
  uploadBusinessLogoAction,
  removeBusinessLogoAction,
  type BusinessProfileActionState,
} from "./actions";

const initialState: BusinessProfileActionState = { ok: false, message: "" };
const inputClass =
  "mt-1 min-h-[38px] w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200 disabled:bg-slate-50 disabled:text-slate-500";

export default function BusinessProfileForm({
  name,
  type,
  owner,
  address,
  phone,
  email: initialEmail,
  isMobileVerified: initialIsMobileVerified,
  isEmailVerified: initialIsEmailVerified,
  logoUrl: initialLogoUrl,
  reviewLink: initialReviewLink,
  locality: initialLocality,
  city: initialCity,
  district: initialDistrict,
  state: initialRegionalState,
  pincode: initialPincode,
  latitude: initialLatitude,
  longitude: initialLongitude,
  capturedAt: initialCapturedAt,
}: {
  name: string;
  type: string | null;
  owner: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isMobileVerified: boolean;
  isEmailVerified: boolean;
  logoUrl?: string | null;
  reviewLink?: string | null;
  locality?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  capturedAt?: string | null;
}) {
  const [state, action, pending] = useActionState(saveBusinessProfileAction, initialState);

  // Edit Mode state (Protected by WhatsApp/SMS OTP)
  const [isEditUnlocked, setIsEditUnlocked] = useState(false);
  const [showEditAuthModal, setShowEditAuthModal] = useState(false);
  const [editAuthOtp, setEditAuthOtp] = useState("");
  const [editAuthSent, setEditAuthSent] = useState(false);
  const [editAuthCooldown, setEditAuthCooldown] = useState(0);
  const [editAuthBusy, setEditAuthBusy] = useState(false);
  const [editAuthMsg, setEditAuthMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [editAuthMaskedPhone, setEditAuthMaskedPhone] = useState<string>("");
  const [editAuthPreviewOtp, setEditAuthPreviewOtp] = useState<string | null>(null);

  // Locality Modal and state
  const [showLocalityModal, setShowLocalityModal] = useState(false);
  const [localityVal, setLocalityVal] = useState(initialLocality ?? "");
  const [cityVal, setCityVal] = useState(initialCity ?? "");
  const [districtVal, setDistrictVal] = useState(initialDistrict ?? "");
  const [stateVal, setStateVal] = useState(initialRegionalState ?? "");
  const [pincodeVal, setPincodeVal] = useState(initialPincode ?? "");
  const [currentLat, setCurrentLat] = useState<number | null>(initialLatitude ?? null);
  const [currentLon, setCurrentLon] = useState<number | null>(initialLongitude ?? null);
  const [currentCapturedAt, setCurrentCapturedAt] = useState<string | null>(initialCapturedAt ?? null);

  // Logo upload state
  const [currentLogoUrl, setCurrentLogoUrl] = useState(initialLogoUrl ?? null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMsg, setLogoMsg] = useState<{ text: string; error: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live state for mobile, email, and Google review link
  const [currentPhone, setCurrentPhone] = useState(phone ?? "");
  const [isMobileVerified, setIsMobileVerified] = useState(initialIsMobileVerified);
  const [currentEmail, setCurrentEmail] = useState(initialEmail ?? "");
  const [isEmailVerified, setIsEmailVerified] = useState(initialIsEmailVerified);
  const [currentReviewLink, setCurrentReviewLink] = useState(initialReviewLink ?? "");

  // Modal state for Change Mobile
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [newMobile, setNewMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileCooldown, setMobileCooldown] = useState(0);
  const [mobileBusy, setMobileBusy] = useState(false);
  const [mobileModalMsg, setMobileModalMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Modal state for Verify/Change Email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState(initialEmail ?? "");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailModalMsg, setEmailModalMsg] = useState<{ text: string; error: boolean } | null>(null);

  // 1. Send OTP for Unlocking Profile Edit
  async function handleSendEditOtp() {
    setEditAuthMsg(null);
    setEditAuthBusy(true);
    try {
      const res = await requestMerchantProfileEditOtpAction();
      if (!res.success) {
        setEditAuthMsg({ text: res.message, error: true });
        return;
      }
      setEditAuthSent(true);
      if (res.maskedPhone) setEditAuthMaskedPhone(res.maskedPhone);
      if (res.previewOtp) setEditAuthPreviewOtp(res.previewOtp);
      setEditAuthMsg({ text: "Verification code sent to your registered WhatsApp / SMS.", error: false });
      setEditAuthCooldown(30);
      const timer = setInterval(() => {
        setEditAuthCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setEditAuthMsg({ text: "Failed to send verification OTP. Please try again.", error: true });
    } finally {
      setEditAuthBusy(false);
    }
  }

  // 2. Verify OTP for Unlocking Profile Edit
  async function handleVerifyEditOtp() {
    setEditAuthMsg(null);
    if (!editAuthOtp || editAuthOtp.trim().length !== 6) {
      setEditAuthMsg({ text: "Please enter the 6-digit OTP code.", error: true });
      return;
    }

    setEditAuthBusy(true);
    try {
      const res = await verifyMerchantProfileEditOtpAction(editAuthOtp.trim());
      if (!res.success) {
        setEditAuthMsg({ text: res.message, error: true });
        return;
      }
      setIsEditUnlocked(true);
      setShowEditAuthModal(false);
      setEditAuthOtp("");
      setEditAuthSent(false);
      setEditAuthPreviewOtp(null);
    } catch {
      setEditAuthMsg({ text: "Verification failed. Please check the code and try again.", error: true });
    } finally {
      setEditAuthBusy(false);
    }
  }

  // 3. Send OTP for Mobile Change
  async function handleSendMobileOtp() {
    setMobileModalMsg(null);
    const clean = newMobile.replace(/\D/g, "");
    if (clean.length !== 10) {
      setMobileModalMsg({ text: "Please enter a valid 10-digit mobile number.", error: true });
      return;
    }

    setMobileBusy(true);
    try {
      const res = await requestMerchantMobileChangeOtpAction(clean);
      if (!res.success) {
        setMobileModalMsg({ text: res.message, error: true });
        return;
      }
      setMobileOtpSent(true);
      setMobileModalMsg({ text: "Verification code sent to your new mobile via SMS.", error: false });
      setMobileCooldown(30);
      const timer = setInterval(() => {
        setMobileCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setMobileModalMsg({ text: "Failed to send verification SMS. Please try again.", error: true });
    } finally {
      setMobileBusy(false);
    }
  }

  // 4. Verify & Apply Mobile Change
  async function handleVerifyMobileChange() {
    setMobileModalMsg(null);
    const clean = newMobile.replace(/\D/g, "");
    if (clean.length !== 10) {
      setMobileModalMsg({ text: "Please enter a valid 10-digit mobile number.", error: true });
      return;
    }
    if (mobileOtp.trim().length !== 6) {
      setMobileModalMsg({ text: "Please enter the 6-digit OTP code.", error: true });
      return;
    }

    setMobileBusy(true);
    try {
      const res = await verifyAndApplyMobileChangeAction(clean, mobileOtp.trim());
      if (!res.success) {
        setMobileModalMsg({ text: res.message, error: true });
        return;
      }
      setCurrentPhone(clean);
      setIsMobileVerified(true);
      setShowMobileModal(false);
      setMobileOtp("");
      setMobileOtpSent(false);
      setNewMobile("");
    } catch {
      setMobileModalMsg({ text: "Verification failed. Please check the code and try again.", error: true });
    } finally {
      setMobileBusy(false);
    }
  }

  // 5. Send OTP for Email Change/Verification
  async function handleSendEmailOtp() {
    setEmailModalMsg(null);
    const clean = newEmail.trim().toLowerCase();
    if (!clean.includes("@") || !clean.includes(".")) {
      setEmailModalMsg({ text: "Please enter a valid email address.", error: true });
      return;
    }

    setEmailBusy(true);
    try {
      const res = await requestMerchantEmailChangeOtpAction(clean);
      if (!res.success) {
        setEmailModalMsg({ text: res.message, error: true });
        return;
      }
      setEmailOtpSent(true);
      setEmailModalMsg({ text: "Verification code sent to your email inbox.", error: false });
      setEmailCooldown(30);
      const timer = setInterval(() => {
        setEmailCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setEmailModalMsg({ text: "Failed to send verification email. Please try again.", error: true });
    } finally {
      setEmailBusy(false);
    }
  }

  // 6. Verify & Apply Email Change
  async function handleVerifyEmailChange() {
    setEmailModalMsg(null);
    const clean = newEmail.trim().toLowerCase();
    if (!clean.includes("@") || !clean.includes(".")) {
      setEmailModalMsg({ text: "Please enter a valid email address.", error: true });
      return;
    }
    if (emailOtp.trim().length !== 6) {
      setEmailModalMsg({ text: "Please enter the 6-digit OTP code.", error: true });
      return;
    }

    setEmailBusy(true);
    try {
      const res = await verifyAndApplyEmailChangeAction(clean, emailOtp.trim());
      if (!res.success) {
        setEmailModalMsg({ text: res.message, error: true });
        return;
      }
      setCurrentEmail(clean);
      setIsEmailVerified(true);
      setShowEmailModal(false);
      setEmailOtp("");
      setEmailOtpSent(false);
      setNewEmail("");
    } catch {
      setEmailModalMsg({ text: "Verification failed. Please check the code and try again.", error: true });
    } finally {
      setEmailBusy(false);
    }
  }

  // 7. Handle Logo Upload
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoMsg(null);
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await uploadBusinessLogoAction(fd);
      if (res.success && res.logoUrl) {
        setCurrentLogoUrl(res.logoUrl);
        setLogoMsg({ text: res.message, error: false });
      } else {
        setLogoMsg({ text: res.message || "Upload failed.", error: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload logo. Please try again.";
      setLogoMsg({ text: msg, error: true });
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // 8. Handle Logo Remove
  async function handleLogoRemove() {
    if (!confirm("Are you sure you want to remove your business logo?")) return;
    setLogoMsg(null);
    setLogoUploading(true);
    try {
      const res = await removeBusinessLogoAction();
      if (res.success) {
        setCurrentLogoUrl(null);
        setLogoMsg({ text: "Logo removed successfully.", error: false });
      } else {
        setLogoMsg({ text: res.message, error: true });
      }
    } catch {
      setLogoMsg({ text: "Failed to remove logo.", error: true });
    } finally {
      setLogoUploading(false);
    }
  }

  // 9. Handle Full Profile & Locality Save
  async function handleProfileSubmit(formData: FormData) {
    const city = String(formData.get("store_city") ?? "").trim();
    const regionalState = String(formData.get("store_state") ?? "").trim();
    if (city && regionalState) {
      const locData = new FormData();
      locData.set("locality", String(formData.get("store_locality") ?? ""));
      locData.set("city", city);
      locData.set("district", String(formData.get("store_district") ?? ""));
      locData.set("state", regionalState);
      locData.set("pincode", String(formData.get("store_pincode") ?? ""));
      await saveMerchantDiscoveryLocationAction({ ok: false, message: "" }, locData);
    }
    action(formData);
  }

  return (
    <div className="relative">
      {/* CARD HEADER: Title on Left, Edit Button on Right */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">Business Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Aapke store ki verified profile details aur branding.</p>
        </div>

        {!isEditUnlocked ? (
          <button
            type="button"
            onClick={() => {
              setShowEditAuthModal(true);
              setEditAuthOtp("");
              setEditAuthSent(false);
              setEditAuthMsg(null);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-2xs transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-600">edit</span>
            <span>Edit Details</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Edit Mode Active
            </span>
            <button
              type="button"
              onClick={() => setIsEditUnlocked(false)}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* BUSINESS BRANDING & LOGO UPLOAD */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-orange-50/50 via-white to-slate-50 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Luxury Brand Medallion */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#b59363] ring-4 ring-amber-200/50 bg-[#1e140a] shadow-md">
              {currentLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentLogoUrl} alt="Business Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-amber-200/80">
                  <span className="text-2xl">🏪</span>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">No Logo</span>
                </div>
              )}
              {logoUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Business Logo &amp; Branding
                {currentLogoUrl && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Active
                  </span>
                )}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
                  <span>📐</span> <strong>500 × 500 px</strong> (Square 1:1)
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
                  <span>📁</span> <strong>PNG (Transparent) / JPG</strong>
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
                  <span>⚖️</span> <strong>Max 2 MB</strong>
                </span>
              </div>

              <p className="mt-1.5 text-[11px] text-slate-500">
                Yeh standard size aapke <strong>Merchant Profile Icon</strong> aur sabhi <strong>WhatsApp Greeting Cards / Posters</strong> par bina kate ekdum sharp aur perfect fit hoga.
              </p>

              {logoMsg && (
                <p className={`mt-1.5 text-xs font-semibold ${logoMsg.error ? "text-rose-600" : "text-emerald-700"}`}>
                  {logoMsg.text}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={logoUploading}
              onClick={() => {
                if (!isEditUnlocked) {
                  setShowEditAuthModal(true);
                  setEditAuthSent(false);
                  setEditAuthOtp("");
                  setEditAuthMsg({ text: "Logo update karne ke liye pehle OTP verification karke edit unlock kijiye.", error: false });
                  return;
                }
                fileInputRef.current?.click();
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 cursor-pointer"
            >
              {logoUploading ? "Uploading..." : currentLogoUrl ? "Change Logo" : "Upload Logo (PNG/JPG)"}
            </button>
            {currentLogoUrl && (
              <button
                type="button"
                disabled={logoUploading}
                onClick={() => {
                  if (!isEditUnlocked) {
                    setShowEditAuthModal(true);
                    setEditAuthSent(false);
                    setEditAuthOtp("");
                    setEditAuthMsg({ text: "Logo remove karne ke liye pehle OTP verification karke edit unlock kijiye.", error: false });
                    return;
                  }
                  handleLogoRemove();
                }}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: READ-ONLY DISPLAY BY DEFAULT */}
      {!isEditUnlocked ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Business Name */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Business Name
              </span>
              <p className="mt-1.5 text-sm font-bold text-slate-900">{name || "—"}</p>
            </div>

            {/* Business Type */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Business Type
              </span>
              <p className="mt-1.5 text-sm font-bold text-slate-900">{type || "—"}</p>
            </div>

            {/* Owner / Merchant Name */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                Owner / Merchant Name
              </span>
              <p className="mt-1.5 text-sm font-bold text-slate-900">{owner || "—"}</p>
            </div>

            {/* Registered Mobile */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Registered Mobile
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditUnlocked) {
                      setShowEditAuthModal(true);
                      setEditAuthSent(false);
                      setEditAuthOtp("");
                      setEditAuthMsg({ text: "Mobile change karne ke liye pehle OTP verification karke edit unlock kijiye.", error: false });
                      return;
                    }
                    setShowMobileModal(true);
                    setNewMobile("");
                    setMobileOtp("");
                    setMobileOtpSent(false);
                    setMobileModalMsg(null);
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  Change Mobile →
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900 font-mono">
                  +91 {currentPhone ? currentPhone.replace(/\D/g, "").slice(-10) : "—"}
                </p>
                {isMobileVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="font-black">✓</span> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Email ID */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Email ID
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditUnlocked) {
                      setShowEditAuthModal(true);
                      setEditAuthSent(false);
                      setEditAuthOtp("");
                      setEditAuthMsg({ text: "Email change karne ke liye pehle OTP verification karke edit unlock kijiye.", error: false });
                      return;
                    }
                    setShowEmailModal(true);
                    setNewEmail(currentEmail || "");
                    setEmailOtp("");
                    setEmailOtpSent(false);
                    setEmailModalMsg(null);
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  {currentEmail ? (isEmailVerified ? "Change Email →" : "Verify Email →") : "Add Email →"}
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {currentEmail || "Not provided"}
                </p>
                {currentEmail && isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="font-black">✓</span> Verified
                  </span>
                ) : currentEmail ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    Unverified
                  </span>
                ) : null}
              </div>
            </div>

            {/* Locality & Store Address (View Details opens popup) */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Locality &amp; Store Address
                </span>
                <button
                  type="button"
                  onClick={() => setShowLocalityModal(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                >
                  <span>View Details</span>
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {[localityVal, cityVal, stateVal].filter(Boolean).join(", ") || "Address not confirmed"}
                </p>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                {pincodeVal ? `PIN: ${pincodeVal}` : "Tap View Details to see full address breakdown"}
              </p>
            </div>

            {/* Google Review Link (Integrated into Business Profile card) */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Google Review Link
                </span>
                {currentReviewLink ? (
                  <a
                    href={currentReviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                  >
                    <span>Test Google Link</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </a>
                ) : null}
              </div>
              <p className="mt-1.5 text-xs font-mono font-medium text-slate-800 truncate">
                {currentReviewLink || "No Google Review link configured yet."}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-2">
            <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
            <span>Security notice: Details edit karne ke liye upar <strong>Edit Details</strong> button par click karke WhatsApp / SMS OTP verify kijiye.</span>
          </p>
        </div>
      ) : (
        /* VIEW 2: UNLOCKED EDITABLE FORM */
        <form action={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2 pt-2 animate-in fade-in duration-200">
          <label className="text-sm font-semibold text-slate-800">
            Business Name
            <input className={inputClass} name="name" defaultValue={name} maxLength={200} required autoComplete="organization" />
          </label>

          <label className="text-sm font-semibold text-slate-800">
            Business Type
            <input className={inputClass} name="type" defaultValue={type ?? ""} maxLength={120} required />
          </label>

          <label className="text-sm font-semibold text-slate-800">
            Owner / Merchant Name
            <input className={inputClass} name="owner" defaultValue={owner ?? ""} maxLength={200} required autoComplete="name" />
          </label>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800 block">
                Registered Mobile
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowMobileModal(true);
                  setNewMobile("");
                  setMobileOtp("");
                  setMobileOtpSent(false);
                  setMobileModalMsg(null);
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
              >
                Change Mobile →
              </button>
            </div>
            <input
              className={`${inputClass} bg-slate-50 text-slate-600 cursor-not-allowed`}
              value={currentPhone ? `+91 ${currentPhone.replace(/\D/g, "").slice(-10)} (Protected)` : "—"}
              readOnly
            />
            <span className="mt-1 block text-[11px] text-slate-500">
              Mobile number badalne ke liye &apos;Change Mobile&apos; option use kijiye.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800 block">
                Email ID (Optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(true);
                  setNewEmail(currentEmail || "");
                  setEmailOtp("");
                  setEmailOtpSent(false);
                  setEmailModalMsg(null);
                }}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
              >
                {currentEmail ? "Verify / Change Email →" : "Add Email →"}
              </button>
            </div>
            <input
              className={inputClass}
              name="email"
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              placeholder="e.g. contact@business.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-800 block">
              Google Review Link
            </label>
            <input
              className={inputClass}
              name="googleReviewLink"
              type="url"
              value={currentReviewLink}
              onChange={(e) => setCurrentReviewLink(e.target.value)}
              placeholder="https://maps.app.goo.gl/... or https://search.google.com/local/writereview?placeid=..."
            />
          </div>

          {/* STORE LOCALITY & DISCOVERY ADDRESS */}
          <div className="sm:col-span-2 pt-2 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-600 text-lg">distance</span>
              <span>Locality &amp; Store Discovery Address</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trustit search aur customer directions ke liye address update kijiye.
            </p>
          </div>

          <label className="text-xs font-semibold text-slate-800">
            Locality <span className="font-normal text-slate-500">(Optional)</span>
            <input
              className={inputClass}
              name="store_locality"
              value={localityVal}
              onChange={(e) => setLocalityVal(e.target.value)}
              maxLength={160}
              placeholder="e.g. Kdc road, Civil Lines"
              autoComplete="address-level3"
            />
          </label>

          <label className="text-xs font-semibold text-slate-800">
            City <span className="text-rose-700">*</span>
            <input
              className={inputClass}
              name="store_city"
              value={cityVal}
              onChange={(e) => setCityVal(e.target.value)}
              maxLength={160}
              required
              placeholder="e.g. Bahraich"
              autoComplete="address-level2"
            />
          </label>

          <label className="text-xs font-semibold text-slate-800">
            District <span className="font-normal text-slate-500">(Optional)</span>
            <input
              className={inputClass}
              name="store_district"
              value={districtVal}
              onChange={(e) => setDistrictVal(e.target.value)}
              maxLength={160}
              placeholder="e.g. Bahraich"
            />
          </label>

          <label className="text-xs font-semibold text-slate-800">
            State <span className="text-rose-700">*</span>
            <input
              className={inputClass}
              name="store_state"
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
              maxLength={100}
              required
              placeholder="e.g. Uttar Pradesh"
              autoComplete="address-level1"
            />
          </label>

          <label className="text-xs font-semibold text-slate-800">
            Pincode <span className="font-normal text-slate-500">(Optional while completing)</span>
            <input
              className={inputClass}
              name="store_pincode"
              value={pincodeVal}
              onChange={(e) => setPincodeVal(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="e.g. 271801"
              autoComplete="postal-code"
            />
          </label>

          {/* UPDATE CURRENT LOCATION (GPS Capture) */}
          <div className="sm:col-span-2 pt-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
              <LocationCapture
                latitude={currentLat}
                longitude={currentLon}
                capturedAt={currentCapturedAt}
                onLocationResolved={(loc) => {
                  if (loc.locality && !localityVal) setLocalityVal(loc.locality);
                  if (loc.city && (!cityVal || cityVal === "Not set")) setCityVal(loc.city);
                  if (loc.district && !districtVal) setDistrictVal(loc.district);
                  if (loc.state && !stateVal) setStateVal(loc.state);
                  if (loc.pincode && !pincodeVal) setPincodeVal(loc.pincode);
                }}
              />
            </div>
          </div>

          <input type="hidden" name="address" value={address ?? ""} />

          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Saving…" : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditUnlocked(false)}
              className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <p role={state.message ? "status" : undefined} aria-live="polite" className={`text-xs ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>
              {state.message}
            </p>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 0. LOCALITY & STORE ADDRESS MODAL (Read-Only Popup)       */}
      {/* ======================================================== */}
      {showLocalityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Locality &amp; Store Address</h3>
                  <p className="text-xs text-slate-500">Public discovery address details (View Mode)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocalityModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Locality</span>
                <p className="mt-1 text-xs font-bold text-slate-900">{localityVal?.trim() || "Not provided"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">City</span>
                <p className="mt-1 text-xs font-bold text-slate-900">{cityVal?.trim() || "Not provided"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">District</span>
                <p className="mt-1 text-xs font-bold text-slate-900">{districtVal?.trim() || "Not provided"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">State</span>
                <p className="mt-1 text-xs font-bold text-slate-900">{stateVal?.trim() || "Not provided"}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Pincode</span>
                <p className="mt-1 text-xs font-mono font-bold text-slate-900">{pincodeVal?.trim() || "Not provided"}</p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Live GPS Location</span>
                  {currentLat !== null && currentLon !== null && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                      ✓ Active GPS
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-mono font-bold text-slate-900">
                  {currentLat !== null && currentLon !== null ? `${currentLat}, ${currentLon}` : "GPS coordinates not captured yet"}
                </p>
                {currentCapturedAt && (
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Captured: {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(currentCapturedAt))}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-base shrink-0">lock</span>
              <span>Yeh popup sirf dekhne ke liye hai. Locality ya GPS change karne ke liye pehle <strong>Edit Details</strong> se OTP verify karke unlock kijiye.</span>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowLocalityModal(false);
                  setShowEditAuthModal(true);
                  setEditAuthSent(false);
                  setEditAuthOtp("");
                  setEditAuthMsg({ text: "Locality address edit karne ke liye OTP verify kijiye.", error: false });
                }}
                className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 cursor-pointer"
              >
                Edit Locality Details →
              </button>
              <button
                type="button"
                onClick={() => setShowLocalityModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. EDIT AUTH MODAL (WhatsApp / SMS OTP Verification)     */}
      {/* ======================================================== */}
      {showEditAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-2xl">verified_user</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Security Verification</h3>
                  <p className="text-xs text-slate-500">Verify identity to edit business profile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditAuthModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Aapki store details ko unauthorized changes se surakshit rakhne ke liye, aapke verified registered mobile number par WhatsApp / SMS verification code bheja jayega:
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Registered Mobile:</span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {editAuthMaskedPhone || `+91 ******${(currentPhone || "").replace(/\D/g, "").slice(-4)}`}
                </span>
              </div>

              {!editAuthSent ? (
                <button
                  type="button"
                  disabled={editAuthBusy}
                  onClick={handleSendEditOtp}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[17px]">send</span>
                  <span>{editAuthBusy ? "Sending Code..." : "Send Verification OTP (WhatsApp / SMS)"}</span>
                </button>
              ) : (
                <div className="space-y-3">
                  {editAuthPreviewOtp && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                      <span>Dev Preview Code: </span>
                      <strong className="font-mono text-sm tracking-widest">{editAuthPreviewOtp}</strong>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editAuthOtp}
                      onChange={(e) => setEditAuthOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-lg font-mono font-bold tracking-widest py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>

                  <button
                    type="button"
                    disabled={editAuthBusy || editAuthOtp.trim().length !== 6}
                    onClick={handleVerifyEditOtp}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[17px]">lock_open</span>
                    <span>{editAuthBusy ? "Verifying..." : "Verify & Unlock Edit Form"}</span>
                  </button>

                  <div className="text-center pt-1">
                    {editAuthCooldown > 0 ? (
                      <span className="text-[11px] text-slate-400">Resend OTP in {editAuthCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendEditOtp}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              )}

              {editAuthMsg && (
                <p className={`text-xs text-center font-semibold ${editAuthMsg.error ? "text-rose-600" : "text-emerald-700"}`}>
                  {editAuthMsg.text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CHANGE MOBILE MODAL (Requires OTP Verification)       */}
      {/* ======================================================== */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Registered Mobile</h3>
                <p className="text-xs text-slate-500">A verification code will be sent to confirm your new number.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">New Mobile Number</label>
                <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                  <span className="px-3 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 py-2.5 select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit number"
                    className="w-full px-3 py-2 text-sm text-slate-900 outline-none"
                    disabled={mobileOtpSent}
                  />
                </div>
              </div>

              {!mobileOtpSent ? (
                <button
                  type="button"
                  disabled={mobileBusy || newMobile.length !== 10}
                  onClick={handleSendMobileOtp}
                  className="w-full rounded-xl bg-[#a64c05] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#873d03] disabled:opacity-50 transition"
                >
                  {mobileBusy ? "Sending Code..." : "Send Verification Code via SMS"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="mt-1 w-full text-center text-lg font-mono font-bold tracking-widest py-2 rounded-xl border border-slate-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={mobileBusy || mobileOtp.length !== 6}
                      onClick={handleVerifyMobileChange}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                      {mobileBusy ? "Verifying..." : "Verify & Save Mobile"}
                    </button>
                    <button
                      type="button"
                      disabled={mobileCooldown > 0 || mobileBusy}
                      onClick={handleSendMobileOtp}
                      className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {mobileCooldown > 0 ? `${mobileCooldown}s` : "Resend"}
                    </button>
                  </div>
                </div>
              )}

              {mobileModalMsg && (
                <p className={`text-xs ${mobileModalMsg.error ? "text-rose-600" : "text-emerald-700"} font-medium`}>
                  {mobileModalMsg.text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VERIFY / CHANGE EMAIL MODAL (Email OTP Verification)  */}
      {/* ======================================================== */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verify Email Address</h3>
                <p className="text-xs text-slate-500">A verification code will be sent to your inbox.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contact@business.com"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  disabled={emailOtpSent}
                />
              </div>

              {!emailOtpSent ? (
                <button
                  type="button"
                  disabled={emailBusy || !newEmail.includes("@")}
                  onClick={handleSendEmailOtp}
                  className="w-full rounded-xl bg-[#a64c05] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#873d03] disabled:opacity-50 transition"
                >
                  {emailBusy ? "Sending Code..." : "Send Verification Code"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Enter 6-Digit Email Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="mt-1 w-full text-center text-lg font-mono font-bold tracking-widest py-2 rounded-xl border border-slate-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={emailBusy || emailOtp.length !== 6}
                      onClick={handleVerifyEmailChange}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
                    >
                      {emailBusy ? "Verifying..." : "Verify & Save Email"}
                    </button>
                    <button
                      type="button"
                      disabled={emailCooldown > 0 || emailBusy}
                      onClick={handleSendEmailOtp}
                      className="rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {emailCooldown > 0 ? `${emailCooldown}s` : "Resend"}
                    </button>
                  </div>
                </div>
              )}

              {emailModalMsg && (
                <p className={`text-xs ${emailModalMsg.error ? "text-rose-600" : "text-emerald-700"} font-medium`}>
                  {emailModalMsg.text}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
