"use client";

import React, { useState, useEffect } from "react";
import { calculatePointsInrValue } from "@/lib/customer-points";
import { CustomerLanguage, t } from "./customer-types";

interface ProfileAndSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  lang: CustomerLanguage;
  onToggleLanguage: () => void;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  walletBalance: number;
  rewardPoints?: number;
  speedPassActive: boolean;
  onActivateSpeedPass: () => void;
  pushEnabled: boolean;
  onTogglePush: () => void;
  onUpdateCustomerName: (newName: string) => void;
  onOpenPastOrders: () => void;
  onOpenAddresses: () => void;
  onOpenStandeeQr: () => void;
  onOpenLogin: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onRegisterSubBack?: (handler: (() => boolean) | null) => void;
}

/**
 * N-31 & N-32:
 * - N-31: Profile Hub, Trustit Money Cashback Wallet & Trustit SpeedPass (No EU Gift Cards)
 * - N-32: Account Settings, Language EN/HI, Push Toggle, DPDP Delete Account & Log Out Safely
 */
export default function CustomerProfileAndSettings({
  isOpen,
  onClose,
  lang,
  onToggleLanguage,
  customerId,
  customerName,
  customerPhone,
  customerEmail,
  walletBalance,
  rewardPoints = 0,
  speedPassActive,
  onActivateSpeedPass,
  pushEnabled,
  onTogglePush,
  onUpdateCustomerName,
  onOpenPastOrders,
  onOpenAddresses,
  onOpenStandeeQr,
  onOpenLogin,
  onSignOut,
  onDeleteAccount,
  onRegisterSubBack,
}: ProfileAndSettingsProps) {
  const [view, setView] = useState<"hub" | "settings" | "payments">("hub"); // N-31 = hub, N-32 = settings
  const [editName, setEditName] = useState(customerName || "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!onRegisterSubBack) return;
    if (!isOpen) {
      onRegisterSubBack(null);
      return;
    }
    onRegisterSubBack(() => {
      if (confirmDelete) {
        setConfirmDelete(false);
        return true;
      }
      if (view !== "hub") {
        setView("hub");
        return true;
      }
      return false;
    });
    return () => onRegisterSubBack(null);
  }, [onRegisterSubBack, isOpen, view, confirmDelete]);

  if (!isOpen) return null;

  const isLoggedIn = Boolean(customerId || customerPhone || customerEmail);
  const pointsInrValue = calculatePointsInrValue(rewardPoints);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#faf8ff] h-full shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-[#003178] to-[#0d47a1] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {view !== "hub" && (
              <button
                type="button"
                onClick={() => setView("hub")}
                className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
              >
                ←
              </button>
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                {view === "settings"
                  ? "N-32 • Account Settings"
                  : view === "payments"
                    ? "Payment Rails"
                    : "N-31 • Profile, Wallet & SpeedPass"}
              </div>
              <h3 className="text-sm font-black">
                {view === "settings"
                  ? t(lang, "Account & DPDP Controls", "अकाउंट व प्राइवेसी सेटिंग्स")
                  : view === "payments"
                    ? "Cashfree UPI & COD Rails"
                    : customerName
                      ? `Hi ${customerName}!`
                      : "Trustit Account"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-white/15 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!isLoggedIn ? (
            <div className="rounded-3xl bg-white border border-[#c3c6d4] p-6 text-center space-y-3 shadow-xs">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-[#f2f3ff] text-2xl flex items-center justify-center">
                👤
              </div>
              <h4 className="text-base font-black text-[#131b2e]">
                {t(lang, "Sign in with +91 WhatsApp OTP", "🇮🇳 +91 WhatsApp OTP से लॉगिन करें")}
              </h4>
              <p className="text-xs text-[#434652]">
                Unlock Trustit Money cashback wallet, saved Bahraich addresses, 1-tap reorder, and IMPS refund tracking.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 text-xs font-black text-white shadow-md"
              >
                Sign In / Continue →
              </button>
            </div>
          ) : view === "hub" ? (
            <>
              {/* Profile Card */}
              <div className="rounded-3xl bg-white border border-[#eaedff] p-4 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-[#003178] text-white font-black text-lg flex items-center justify-center shrink-0">
                    {(customerName || "T").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-[#131b2e] truncate">
                      {customerName || "Trustit Customer"}
                    </div>
                    <div className="text-[11px] font-mono text-[#006875]">
                      {customerPhone ? `🇮🇳 +91 ${customerPhone}` : customerEmail}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(customerName);
                    setView("settings");
                  }}
                  className="rounded-xl bg-[#f2f3ff] px-3 py-1.5 text-[11px] font-black text-[#003178] shrink-0"
                >
                  Settings ›
                </button>
              </div>

              {/* Trustit Money & Reward Points Wallet */}
              <div className="rounded-3xl bg-gradient-to-br from-[#003178] to-[#006875] text-white p-4 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9cf0ff]">
                    💰 Trustit Money Balance
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenStandeeQr();
                    }}
                    className="shrink-0 whitespace-nowrap rounded-full bg-white/15 hover:bg-white/25 px-2.5 py-1 text-[10px] font-bold"
                  >
                    📷 Scan QR
                  </button>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-2xl font-black font-mono">₹{walletBalance.toFixed(2)}</div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-[#9cf0ff]">★ Reward Points</div>
                    <div className="text-xs font-black text-[#8df7c1]">
                      {rewardPoints.toLocaleString("en-IN")} pts (₹{Number.isInteger(pointsInrValue) ? pointsInrValue : pointsInrValue.toFixed(2)})
                    </div>
                  </div>
                </div>
                <p className="text-[10.5px] text-[#d9e2ff]">
                  350 pts = ₹100 • Instant IMPS refunds &amp; verified shop cashback.
                </p>
              </div>

              {/* Trustit SpeedPass Card */}
              <div className="rounded-3xl border border-[#003178]/25 bg-[#f2f3ff] p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-[#003178]">⚡ Trustit SpeedPass</div>
                  <div className="text-[11px] text-[#434652]">
                    {speedPassActive
                      ? "Active • Priority 20-min Bahraich dispatch enabled ✓"
                      : "Free trial • Priority dispatch & zero surge in Bahraich"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onActivateSpeedPass}
                  className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-black ${
                    speedPassActive
                      ? "bg-emerald-600 text-white"
                      : "bg-[#003178] text-white"
                  }`}
                >
                  {speedPassActive ? "Active ✓" : "Activate Free"}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPastOrders();
                  }}
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40"
                >
                  <div className="text-lg mb-1">📦</div>
                  <div className="font-extrabold text-[#131b2e]">My Orders &amp; Reorder</div>
                  <div className="text-[10px] text-[#737783]">GST Receipts &amp; Refunds</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddresses();
                  }}
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40"
                >
                  <div className="text-lg mb-1">📍</div>
                  <div className="font-extrabold text-[#131b2e]">Saved Addresses</div>
                  <div className="text-[10px] text-[#737783]">Adjust Gate Dropoff Pin</div>
                </button>
                <button
                  type="button"
                  onClick={() => setView("payments")}
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40"
                >
                  <div className="text-lg mb-1">⚡</div>
                  <div className="font-extrabold text-[#131b2e]">Payment Rails</div>
                  <div className="text-[10px] text-[#737783]">Cashfree UPI &amp; COD</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditName(customerName);
                    setView("settings");
                  }}
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40"
                >
                  <div className="text-lg mb-1">⚙️</div>
                  <div className="font-extrabold text-[#131b2e]">Account Settings</div>
                  <div className="text-[10px] text-[#737783]">Language, Push &amp; DPDP</div>
                </button>
              </div>
            </>
          ) : view === "payments" ? (
            <div className="space-y-2.5">
              {[
                { title: "Cashfree 1-Tap UPI", sub: "GPay, PhonePe, Paytm, BHIM • Zero Convenience Fee" },
                { title: "Cards & NetBanking", sub: "Visa, Mastercard, RuPay, SBI / HDFC / ICICI" },
                { title: "Cash on Delivery (COD)", sub: "Pay directly at your gate with 4-digit PIN" },
              ].map((rail) => (
                <div
                  key={rail.title}
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-0.5"
                >
                  <div className="font-black text-[#131b2e]">{rail.title}</div>
                  <div className="text-[11px] text-[#434652]">{rail.sub}</div>
                </div>
              ))}
            </div>
          ) : (
            /* N-32: Account Controls & DPDP Delete Account */
            <div className="space-y-3.5">
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3">
                <div className="font-extrabold text-[#131b2e]">Profile Identity</div>
                <div>
                  <label className="block text-[10.5px] font-bold text-[#737783] mb-1">
                    Display Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateCustomerName(editName)}
                      className="rounded-xl bg-[#003178] text-white px-3.5 py-2 text-xs font-black"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-[#434652]">Verified Mobile</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {customerPhone ? `🇮🇳 +91 ${customerPhone} ✓` : "Not linked"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-[#131b2e]">App Language</div>
                    <div className="text-[10.5px] text-[#737783]">Switch UI between English &amp; हिन्दी</div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleLanguage}
                    className="rounded-xl bg-[#f2f3ff] border border-[#003178]/30 px-3 py-1.5 text-xs font-black text-[#003178]"
                  >
                    {lang === "hi" ? "हिन्दी → EN" : "EN → हिन्दी"}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f2f3ff]">
                  <div>
                    <div className="font-extrabold text-[#131b2e]">Push Notifications</div>
                    <div className="text-[10.5px] text-[#737783]">Order status, Rider gate alert &amp; UTR</div>
                  </div>
                  <button
                    type="button"
                    onClick={onTogglePush}
                    className={`rounded-full px-3 py-1 text-[11px] font-black ${
                      pushEnabled
                        ? "bg-emerald-600 text-white"
                        : "bg-[#eaedff] text-[#434652]"
                    }`}
                  >
                    {pushEnabled ? "ON 🟢" : "OFF"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-rose-200 p-4 space-y-2.5">
                <div className="font-extrabold text-rose-900">Privacy &amp; DPDP Act 2023</div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full rounded-xl border border-rose-300 bg-rose-50 py-2 text-xs font-bold text-rose-800"
                  >
                    🗑️ Delete My Account &amp; Data
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-rose-800">
                      This clears your local session and initiates DPDP account deactivation. Continue?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="rounded-xl border border-[#c3c6d4] py-1.5 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={onDeleteAccount}
                        className="rounded-xl bg-rose-600 text-white py-1.5 font-black"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onSignOut}
                className="w-full rounded-2xl bg-[#131b2e] hover:bg-slate-800 py-3 text-xs font-black text-white"
              >
                🚪 Log Out Safely
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
