"use client";

import { useState, useRef, useEffect, useActionState, useTransition } from "react";
import Link from "next/link";
import { merchantSignOutAction } from "@/app/merchant/login/actions";
import { changeMerchantPasswordAction, type ChangePasswordResult } from "./profile/actions";

type MerchantProfileDropdownProps = {
  businessName: string;
  businessId: string;
  businessType?: string | null;
  logoUrl?: string | null;
  isPremium?: boolean;
  crown?: React.ReactNode;
  variant?: "sidebar" | "header" | "compact";
};

function getMerchantFallbackIcon(businessType?: string | null) {
  const value = String(businessType ?? "").toLowerCase();
  if (/(sweet|mithai|bakery|cake|dessert|food|restaurant|cafe)/.test(value)) return "✿";
  if (/(medical|clinic|doctor|health)/.test(value)) return "+";
  if (/(salon|beauty|spa|barber)/.test(value)) return "✦";
  if (/(hotel|stay|resort)/.test(value)) return "⌂";
  return "✦";
}

export default function MerchantProfileDropdown({
  businessName,
  businessId,
  businessType,
  logoUrl,
  isPremium,
  crown,
  variant = "sidebar",
}: MerchantProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        if (showPasswordModal) setShowPasswordModal(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPasswordModal]);

  return (
    <>
      <div className="relative" ref={menuRef}>
        {variant === "sidebar" && (
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="merchant-identity group cursor-pointer transition-all hover:border-slate-300 hover:shadow-xs relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsOpen(!isOpen);
              }
            }}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={`Merchant menu for ${businessName}`}
          >
            <div className="h-11 w-11 shrink-0 rounded-full border-2 border-[#b59363] ring-2 ring-amber-200/50 bg-[#1e140a] flex items-center justify-center overflow-hidden shadow-xs">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={businessName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-amber-300 font-bold text-lg">{getMerchantFallbackIcon(businessType)}</span>
              )}
            </div>

            <div className="merchant-identity__copy min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <strong className="truncate block font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 transition-colors">
                  {businessName}
                </strong>
                {crown ?? (isPremium && (
                  <span title="Trustit VIP Merchant" aria-label="VIP Merchant" className="inline-flex items-center text-amber-500 shrink-0">
                    👑
                  </span>
                ))}
              </span>
              <small className="font-mono text-[10px] text-slate-500 block truncate">{businessId}</small>
              <span className="merchant-active-pill">
                <i /> Active Merchant
              </span>
            </div>

            {/* 3-Dots Action Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs hover:border-blue-300 hover:bg-blue-50/70 hover:text-blue-700 transition"
              aria-label="Account Options (Profile, Change Password, Logout)"
              title="Account Options"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        )}

        {(variant === "header" || variant === "compact") && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800 transition"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label="Merchant account profile & options"
          >
            <div className="size-6 shrink-0 rounded-full border border-amber-300 bg-[#1e140a] flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-[10px] text-amber-300 font-bold">{getMerchantFallbackIcon(businessType)}</span>
              )}
            </div>
            <span className="max-w-[120px] sm:max-w-[160px] truncate">{businessName}</span>
            <svg
              className={`size-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}

        {/* ── Floating Pop-Up Menu (3 Options) ── */}
        {isOpen && (
          <div
            className={`absolute z-50 min-w-[260px] max-w-[320px] rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-slate-900/15 backdrop-blur-md transition-all animate-in fade-in-0 zoom-in-95 ${
              variant === "sidebar" ? "left-0 sm:left-auto right-0 top-full mt-2" : "right-0 top-full mt-2"
            }`}
            role="menu"
          >
            {/* Header info */}
            <div className="border-b border-slate-100 px-3 py-2.5 mb-1 bg-slate-50/70 rounded-xl">
              <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">Merchant Account</p>
              <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{businessName}</p>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">ID: {businessId}</p>
            </div>

            {/* Option 1: Merchant Profile */}
            <Link
              href="/merchant/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-blue-50/80 hover:text-blue-800 transition group"
              role="menuitem"
            >
              <span className="grid size-8 place-items-center rounded-xl bg-blue-100/80 text-blue-700 group-hover:scale-105 transition-transform">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <div>
                <span className="block text-slate-900 group-hover:text-blue-800 font-extrabold">Merchant Profile</span>
                <span className="block text-[11px] font-normal text-slate-500">Business details, location & bank</span>
              </div>
            </Link>

            {/* Option 2: Change Password */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowPasswordModal(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-amber-50/80 hover:text-amber-900 transition group"
              role="menuitem"
            >
              <span className="grid size-8 place-items-center rounded-xl bg-amber-100/80 text-amber-800 group-hover:scale-105 transition-transform">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7.5" cy="15.5" r="5.5" />
                  <path d="m21 2-9.6 9.6" />
                  <path d="m15.5 7.5 3 3L22 7l-3-3" />
                </svg>
              </span>
              <div>
                <span className="block text-slate-900 group-hover:text-amber-900 font-extrabold">Change Password</span>
                <span className="block text-[11px] font-normal text-slate-500">Update merchant portal login password</span>
              </div>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* Option 3: Logout */}
            <form action={merchantSignOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-700 hover:bg-rose-50 transition group"
                role="menuitem"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-rose-100/70 text-rose-700 group-hover:scale-105 transition-transform">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <div>
                  <span className="block text-rose-700 font-extrabold">Log Out</span>
                  <span className="block text-[11px] font-normal text-slate-500">End active merchant session</span>
                </div>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <ChangePasswordModal
          businessName={businessName}
          businessId={businessId}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
}

function ChangePasswordModal({
  businessName,
  businessId,
  onClose,
}: {
  businessName: string;
  businessId: string;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (prev: ChangePasswordResult | null, formData: FormData) => {
      const result = await changeMerchantPasswordAction(prev, formData);
      return result;
    },
    null
  );

  const hasLength = newPassword.length >= 8 && newPassword.length <= 64;
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Close change password modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="7.5" cy="15.5" r="5.5" />
              <path d="m21 2-9.6 9.6" />
              <path d="m15.5 7.5 3 3L22 7l-3-3" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500 font-medium">
              Update password for <span className="font-bold text-slate-700">{businessName}</span> ({businessId})
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {state?.success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-center">
            <span className="text-2xl">✅</span>
            <p className="mt-1 text-xs font-bold text-emerald-900">{state.message}</p>
            <p className="mt-0.5 text-[11px] text-emerald-700">Use this new password next time you sign in.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-block rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              Done & Close
            </button>
          </div>
        )}

        {/* Error Banner */}
        {state && !state.success && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <span>⚠️</span>
            <span>{state.message}</span>
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="space-y-4">
            {/* Current Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password <span className="text-[11px] text-slate-400 font-normal">(Optional if newly registered)</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  {showCurrent ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-xl bg-slate-50 p-3 text-[11px] space-y-1">
              <div className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                <span>{hasLength ? "✓" : "○"}</span>
                <span>8 to 64 characters long</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                <span>{hasLetter && hasNumber ? "✓" : "○"}</span>
                <span>Includes at least one letter and one number</span>
              </div>
              {newPassword.length > 0 && (
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-700 font-bold" : "text-rose-600 font-medium"}`}>
                  <span>{passwordsMatch ? "✓" : "○"}</span>
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !hasLength || !hasLetter || !hasNumber || !passwordsMatch}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 transition disabled:opacity-50 disabled:pointer-events-none"
              >
                {isPending ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
