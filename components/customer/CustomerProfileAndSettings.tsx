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

type ProfileView = "hub" | "settings" | "payments" | "contact" | "terms" | "refund" | "privacy";

/**
 * N-31 & N-32:
 * - N-31: Profile Hub, Trustit Money Cashback Wallet & Trustit SpeedPass
 * - N-32: Account Settings, Language EN/HI, Push Toggle, Cashfree Legal Compliance Policies,
 *         DPDP Delete Account & Log Out Safely
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
  const [view, setView] = useState<ProfileView>("hub");
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
      if (view === "contact" || view === "terms" || view === "refund" || view === "privacy") {
        setView("settings");
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

  const renderHeaderTitle = () => {
    switch (view) {
      case "settings":
        return t(lang, "Account & DPDP Controls", "अकाउंट व प्राइवेसी सेटिंग्स");
      case "payments":
        return "Cashfree UPI & COD Rails";
      case "contact":
        return "Contact Us & Helpdesk";
      case "terms":
        return "Terms & Conditions";
      case "refund":
        return "Refunds & Cancellations";
      case "privacy":
        return "Privacy Policy (DPDP)";
      default:
        return customerName ? `Hi ${customerName}!` : "Trustit Account";
    }
  };

  const renderHeaderSubtitle = () => {
    switch (view) {
      case "settings":
        return "N-32 • Account Settings";
      case "payments":
        return "Payment Rails";
      case "contact":
        return "Support • 24/7 Helpdesk";
      case "terms":
        return "Legal • Terms of Service";
      case "refund":
        return "Legal • Refund & Cancellation";
      case "privacy":
        return "Legal • DPDP Act 2023";
      default:
        return "N-31 • Profile, Wallet & SpeedPass";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#faf8ff] h-full shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#003178] to-[#0d47a1] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {view !== "hub" && (
              <button
                type="button"
                onClick={() => {
                  if (view === "contact" || view === "terms" || view === "refund" || view === "privacy") {
                    setView("settings");
                  } else {
                    setView("hub");
                  }
                }}
                className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold flex items-center justify-center transition"
              >
                ←
              </button>
            )}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#9cf0ff]">
                {renderHeaderSubtitle()}
              </div>
              <h3 className="text-sm font-black truncate max-w-[240px]">
                {renderHeaderTitle()}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
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
                  className="rounded-xl bg-[#f2f3ff] hover:bg-[#e4e7ff] px-3 py-1.5 text-[11px] font-black text-[#003178] shrink-0 transition"
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
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40 transition shadow-2xs"
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
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40 transition shadow-2xs"
                >
                  <div className="text-lg mb-1">📍</div>
                  <div className="font-extrabold text-[#131b2e]">Saved Addresses</div>
                  <div className="text-[10px] text-[#737783]">Adjust Gate Dropoff Pin</div>
                </button>
                <button
                  type="button"
                  onClick={() => setView("payments")}
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40 transition shadow-2xs"
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
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 text-left hover:border-[#003178]/40 transition shadow-2xs"
                >
                  <div className="text-lg mb-1">⚙️</div>
                  <div className="font-extrabold text-[#131b2e]">Account &amp; Policies</div>
                  <div className="text-[10px] text-[#737783]">Legal, Support &amp; DPDP</div>
                </button>
              </div>
            </>
          ) : view === "payments" ? (
            <div className="space-y-2.5">
              {[
                { title: "Cashfree 1-Tap UPI", sub: "PhonePe, GPay, Paytm, BHIM • Direct Bank Intent" },
                { title: "Cards & NetBanking", sub: "Visa, Mastercard, RuPay, SBI / HDFC / ICICI" },
                { title: "Cash on Delivery (COD)", sub: "Pay directly at your gate with 4-digit PIN" },
              ].map((rail) => (
                <div
                  key={rail.title}
                  className="rounded-2xl bg-white border border-[#eaedff] p-3.5 space-y-0.5 shadow-2xs"
                >
                  <div className="font-black text-[#131b2e]">{rail.title}</div>
                  <div className="text-[11px] text-[#434652]">{rail.sub}</div>
                </div>
              ))}
            </div>
          ) : view === "contact" ? (
            /* Contact Us & 24/7 Helpdesk View */
            <div className="space-y-3.5">
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-[#131b2e] text-sm">Customer Support Helpdesk</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active 24x7
                  </span>
                </div>
                <p className="text-[11px] text-[#434652] leading-relaxed">
                  Have questions about your order, food delivery, payment or refund? Reach our Bahraich support team directly:
                </p>

                <div className="space-y-2 pt-1">
                  <a
                    href="tel:+919118643415"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f2f3ff] hover:bg-[#e4e7ff] border border-[#003178]/20 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">📞</span>
                      <div>
                        <div className="font-black text-[#003178] text-xs">Call Helpline</div>
                        <div className="text-[11px] font-mono font-bold text-[#131b2e]">+91 9118643415</div>
                      </div>
                    </div>
                    <span className="rounded-lg bg-[#003178] text-white px-2.5 py-1 text-[10px] font-bold">
                      Call Now
                    </span>
                  </a>

                  <a
                    href="https://wa.me/919118643415?text=Hi%20Trustit%20Support,%20I%20need%20help%20with%20my%20order"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">💬</span>
                      <div>
                        <div className="font-black text-emerald-800 text-xs">WhatsApp Helpdesk</div>
                        <div className="text-[11px] font-bold text-emerald-700">&lt; 3 mins average response</div>
                      </div>
                    </div>
                    <span className="rounded-lg bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-bold">
                      Chat Now
                    </span>
                  </a>

                  <a
                    href="mailto:support@trustitreview.com"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">✉️</span>
                      <div>
                        <div className="font-black text-slate-800 text-xs">Email Support</div>
                        <div className="text-[11px] font-mono text-slate-600">support@trustitreview.com</div>
                      </div>
                    </div>
                    <span className="rounded-lg bg-slate-700 text-white px-2.5 py-1 text-[10px] font-bold">
                      Email
                    </span>
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-2 text-[11px] text-[#434652] shadow-2xs">
                <div className="font-extrabold text-[#131b2e] text-xs">Registered Business Office</div>
                <p className="leading-relaxed">
                  <strong>Trustit Hyperlocal Delivery Services</strong><br />
                  Nazirpura, Lucknow Road, Bahraich,<br />
                  Uttar Pradesh, India – 271801
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                  <span>Operational Hours:</span>
                  <span className="font-bold text-[#131b2e]">08:00 AM – 11:00 PM (Daily)</span>
                </div>
              </div>
            </div>
          ) : view === "terms" ? (
            /* Terms & Conditions View */
            <div className="space-y-3.5">
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3 shadow-2xs">
                <div className="font-extrabold text-[#131b2e] text-sm">Terms &amp; Conditions</div>
                <p className="text-[10px] text-[#737783] uppercase tracking-wider font-semibold">
                  Last Updated: November 2026 • Cashfree &amp; RBI Compliant
                </p>

                <div className="space-y-2.5 text-[11px] text-[#434652] leading-relaxed">
                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">1. Platform Services</h5>
                    <p>
                      Trustit operates a hyperlocal on-demand marketplace connecting customers with verified local food, grocery, and retail merchants in Bahraich.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">2. Single-Store Order Rule</h5>
                    <p>
                      To ensure rapid 25-minute delivery and maintain food safety, orders are placed from a single verified store per checkout session.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">3. Pricing &amp; Currency (INR)</h5>
                    <p>
                      All prices, menu items, delivery charges, and platform fees are clearly listed in <strong>Indian Rupees (₹ / INR)</strong> inclusive of applicable taxes.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">4. Payment Processing</h5>
                    <p>
                      Online transactions are processed securely via RBI-licensed payment gateway Cashfree (UPI Intent, Credit/Debit Cards, NetBanking). Trustit never stores card numbers or UPI PINs.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">5. Delivery &amp; Gate PIN</h5>
                    <p>
                      Delivery is executed by background-verified riders. Customers verify delivery using a secure 4-digit Delivery PIN provided in the app.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : view === "refund" ? (
            /* Refund & Cancellation Policy View */
            <div className="space-y-3.5">
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3 shadow-2xs">
                <div className="font-extrabold text-[#131b2e] text-sm">Refunds &amp; Cancellations</div>
                <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200">
                  Instant IMPS &amp; 100% Buyer Protection
                </p>

                <div className="space-y-2.5 text-[11px] text-[#434652] leading-relaxed">
                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">1. Order Cancellation Policy</h5>
                    <p>
                      Orders may be cancelled free of charge before the merchant accepts and starts preparing your items. Once food preparation has begun, cancellation may not be possible.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">2. Automatic Full Refund (Merchant Closed / Out of Stock)</h5>
                    <p>
                      If a store is closed, rider is unavailable, or items are sold out, the order is cancelled automatically and <strong>100% refund is initiated immediately</strong>.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">3. IMPS Refund Timelines</h5>
                    <p>
                      For online payments via Cashfree UPI, approved refunds are transferred directly back to the original bank account / UPI ID via IMPS within <strong>2 to 24 hours</strong>.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">4. Wrong or Damaged Items</h5>
                    <p>
                      In the rare event of missing, damaged, or poor-quality items, report within 2 hours via Support Helpdesk with photos for instant replacement or refund.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : view === "privacy" ? (
            /* Privacy Policy & DPDP View */
            <div className="space-y-3.5">
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3 shadow-2xs">
                <div className="font-extrabold text-[#131b2e] text-sm">Privacy Policy &amp; DPDP 2023</div>
                <p className="text-[10px] text-[#737783] uppercase tracking-wider font-semibold">
                  Digital Personal Data Protection Act Compliant
                </p>

                <div className="space-y-2.5 text-[11px] text-[#434652] leading-relaxed">
                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">1. Data Collected</h5>
                    <p>
                      We collect customer name, verified mobile number, delivery address, and delivery GPS coordinates strictly to fulfill orders and navigate delivery riders.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">2. Payment Security</h5>
                    <p>
                      Payment credentials (bank details, UPI PIN, CVV) are never viewed, collected, or stored by Trustit. All payments are processed on RBI-regulated Cashfree rails.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-black text-[#131b2e] mb-0.5">3. Right to Erasure</h5>
                    <p>
                      Under DPDP Act 2023, you have the full right to delete your account and personal data anytime using the &quot;Delete My Account &amp; Data&quot; option below.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* N-32: Account Controls & DPDP Delete Account (Settings Screen) */
            <div className="space-y-3.5">
              {/* Profile Identity */}
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3 shadow-2xs">
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
                      className="rounded-xl bg-[#003178] hover:bg-[#0d47a1] text-white px-3.5 py-2 text-xs font-black transition"
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

              {/* App Language & Notifications */}
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-[#131b2e]">App Language</div>
                    <div className="text-[10.5px] text-[#737783]">Switch UI between English &amp; हिन्दी</div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleLanguage}
                    className="rounded-xl bg-[#f2f3ff] hover:bg-[#e4e7ff] border border-[#003178]/30 px-3 py-1.5 text-xs font-black text-[#003178] transition"
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
                    className={`rounded-full px-3 py-1 text-[11px] font-black transition ${
                      pushEnabled
                        ? "bg-emerald-600 text-white"
                        : "bg-[#eaedff] text-[#434652]"
                    }`}
                  >
                    {pushEnabled ? "ON 🟢" : "OFF"}
                  </button>
                </div>
              </div>

              {/* Cashfree & Legal Compliance Policies Card */}
              <div className="rounded-2xl bg-white border border-[#eaedff] p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-[#131b2e]">Policies &amp; Customer Support</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Compliant ✓
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setView("contact")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] hover:bg-[#f2f3ff] border border-[#eaedff] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">📞</span>
                      <div>
                        <div className="font-bold text-[#131b2e]">Contact Us &amp; 24/7 Helpdesk</div>
                        <div className="text-[10px] text-[#737783]">+91 9118643415 • support@trustitreview.com</div>
                      </div>
                    </div>
                    <span className="text-[#003178] font-black text-sm">›</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("terms")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] hover:bg-[#f2f3ff] border border-[#eaedff] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">📄</span>
                      <div>
                        <div className="font-bold text-[#131b2e]">Terms &amp; Conditions</div>
                        <div className="text-[10px] text-[#737783]">Orders, delivery rules &amp; INR pricing</div>
                      </div>
                    </div>
                    <span className="text-[#003178] font-black text-sm">›</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("refund")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] hover:bg-[#f2f3ff] border border-[#eaedff] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🔄</span>
                      <div>
                        <div className="font-bold text-[#131b2e]">Refunds &amp; Cancellations</div>
                        <div className="text-[10px] text-[#737783]">Instant IMPS refund &amp; cancellation rules</div>
                      </div>
                    </div>
                    <span className="text-[#003178] font-black text-sm">›</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("privacy")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#faf8ff] hover:bg-[#f2f3ff] border border-[#eaedff] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🛡️</span>
                      <div>
                        <div className="font-bold text-[#131b2e]">Privacy Policy</div>
                        <div className="text-[10px] text-[#737783]">DPDP Act 2023 compliant data protection</div>
                      </div>
                    </div>
                    <span className="text-[#003178] font-black text-sm">›</span>
                  </button>
                </div>
              </div>

              {/* Privacy & DPDP Act 2023 Delete Account */}
              <div className="rounded-2xl bg-white border border-rose-200 p-4 space-y-2.5 shadow-2xs">
                <div className="font-extrabold text-rose-900">Privacy &amp; DPDP Act 2023</div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 py-2 text-xs font-bold text-rose-800 transition"
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
                        className="rounded-xl border border-[#c3c6d4] py-1.5 font-bold hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={onDeleteAccount}
                        className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-1.5 font-black transition"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Log Out Safely */}
              <button
                type="button"
                onClick={onSignOut}
                className="w-full rounded-2xl bg-[#131b2e] hover:bg-slate-800 py-3 text-xs font-black text-white transition shadow-sm"
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
