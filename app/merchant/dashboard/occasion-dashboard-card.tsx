"use client";

import { useState } from "react";
import Link from "next/link";
import type { MerchantOccasionSummary, MerchantConnectWalletState } from "@/lib/customer-crm-service";

export default function OccasionDashboardCard({
  summary,
  wallet: initialWallet,
  businessName,
  logoUrl,
}: {
  summary: MerchantOccasionSummary;
  wallet: MerchantConnectWalletState;
  businessName: string;
  logoUrl: string | null;
}) {
  const [wallet, setWallet] = useState(initialWallet);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeError, setRechargeError] = useState<string | null>(null);

  const packs = [
    { inr: 200, credits: 200, bonus: 0, tag: "Starter", label: "₹200 = 200 Credits" },
    { inr: 500, credits: 550, bonus: 50, tag: "Popular", label: "₹500 = 550 Credits (+50 Free)" },
    { inr: 1000, credits: 1200, bonus: 200, tag: "Best Value", label: "₹1,000 = 1,200 Credits (+200 Free)" },
  ];

  const effectiveCredits =
    selectedPack > 0
      ? (packs.find((p) => p.inr === selectedPack)?.credits ?? selectedPack)
      : Number(customAmount) > 0
      ? Number(customAmount)
      : 0;

  async function handleProceedToCashfree() {
    const finalAmount = selectedPack > 0 ? selectedPack : Number(customAmount);
    if (!finalAmount || finalAmount < 50) {
      setRechargeError("Minimum recharge amount is ₹50.");
      return;
    }

    setRechargeError(null);
    setIsRecharging(true);

    try {
      const res = await fetch("/api/merchant/wallet/cashfree-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          credits: effectiveCredits,
          businessId: wallet.businessId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.paymentSessionId) {
        setRechargeError(data.message || "Unable to initiate payment session. Please try again.");
        return;
      }

      // Redirect or invoke Cashfree JS checkout
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch {
      setRechargeError("Network error. Please try again.");
    } finally {
      setIsRecharging(false);
    }
  }

  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white shadow-xl">
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Column: Occasion Intelligence */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                ✨ Automated Occasion CRM & AI Greetings
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                ● DPDP 2023 Masked
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Today&apos;s Occasions &amp; Customer Wishes
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Automated rich greeting cards &amp; coupons sent directly to your customers on WhatsApp at{" "}
                <span className="font-semibold text-amber-300">{wallet.dailyDispatchTime} AM</span> daily.
              </p>
            </div>

            {/* Quick Counters Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              {/* Today's Birthdays */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">🎂</span>
                  <span className="text-xs font-bold text-amber-300">Today</span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">{summary.todayBirthdaysCount}</div>
                <div className="text-xs text-slate-400">
                  {summary.birthdaysSentToday > 0 ? `✓ ${summary.birthdaysSentToday} Sent` : "Birthdays"}
                </div>
              </div>

              {/* Today's Anniversaries */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">💍</span>
                  <span className="text-xs font-bold text-rose-300">Today</span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">{summary.todayAnniversariesCount}</div>
                <div className="text-xs text-slate-400">
                  {summary.anniversariesSentToday > 0 ? `✓ ${summary.anniversariesSentToday} Sent` : "Anniversaries"}
                </div>
              </div>

              {/* Today's Special Offers */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">📢</span>
                  <span className="text-xs font-bold text-sky-300">Promos</span>
                </div>
                <div className="mt-2 text-2xl font-black text-white">{summary.offersSentToday}</div>
                <div className="text-xs text-slate-400">Offers Sent</div>
              </div>

              {/* Connect Credits Balance */}
              <div
                className={`rounded-2xl border p-3.5 backdrop-blur-xs transition ${
                  wallet.isZeroBalance
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-200"
                    : wallet.isLowBalance
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🪙</span>
                  {wallet.isLowBalance ? (
                    <span className="rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                      Low
                    </span>
                  ) : wallet.isZeroBalance ? (
                    <span className="rounded-full bg-rose-400/20 px-1.5 py-0.2 text-[10px] font-bold text-rose-300">
                      0 Credits
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-400/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-2 text-2xl font-black text-white">{wallet.creditsBalance}</div>
                <div className="text-xs text-slate-300">Connect Credits</div>
              </div>
            </div>

            {/* Today's Masked Customer List */}
            {summary.todayCustomers.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Customers Celebrating Today:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {summary.todayCustomers.slice(0, 6).map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-xs text-white"
                    >
                      <span>{c.occasionType === "birthday" ? "🎂" : "💍"}</span>
                      <strong className="font-semibold text-white">{c.customerName}</strong>
                      <span className="font-mono text-[11px] text-amber-200/90">({c.maskedPhone})</span>
                    </span>
                  ))}
                  {summary.todayCustomers.length > 6 && (
                    <span className="inline-flex items-center rounded-xl bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                      +{summary.todayCustomers.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Recharge */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:min-w-[280px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs text-slate-400">Available Balance</span>
                <div className="flex items-center gap-1.5 text-xl font-bold text-white">
                  <span>🪙</span>
                  <span>{wallet.creditsBalance} Connect Credits</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md hover:from-amber-400 hover:to-orange-400"
              >
                + Top-up
              </button>
            </div>

            {/* Low Balance Warning Alert */}
            {wallet.isLowBalance && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/20 p-2.5 text-xs text-amber-200">
                ⚠️ <strong>Low message balance!</strong> Recharge now so tomorrow morning&apos;s wishes aren&apos;t paused.
              </div>
            )}

            {wallet.isZeroBalance && (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/20 p-2.5 text-xs text-rose-200">
                🛑 <strong>Balance exhausted!</strong> Automatic birthday and anniversary greetings are currently paused.
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/merchant/dashboard/messages"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-slate-100"
              >
                <span>🎨 Greeting Card &amp; Draft Studio</span>
                <span>→</span>
              </Link>
              <Link
                href="/merchant/dashboard/business"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <span>🏢 Manage Logo &amp; Shop Details</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CASHFREE RECHARGE MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🪙</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Top-up Connect Credits</h3>
                  <p className="text-xs text-slate-500">Fast, automated WhatsApp &amp; SMS delivery</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Choose a Pack (with Bonus Credits):
              </p>

              <div className="space-y-2">
                {packs.map((p) => {
                  const isSelected = selectedPack === p.inr;
                  return (
                    <div
                      key={p.inr}
                      onClick={() => {
                        setSelectedPack(p.inr);
                        setCustomAmount("");
                      }}
                      className={`cursor-pointer flex items-center justify-between rounded-2xl border p-3.5 transition ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-200"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            ₹{p.inr}{" "}
                            <span className="font-semibold text-slate-600">➔ {p.credits} Connect Credits</span>
                          </div>
                          {p.bonus > 0 && (
                            <span className="text-[11px] font-bold text-emerald-600">
                              +{p.bonus} Free Bonus Credits Included!
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {p.tag}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Custom Amount Input */}
              <div className="pt-1">
                <label className="text-xs font-bold text-slate-700">Or Enter Custom Amount (₹):</label>
                <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                  <span className="font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="50"
                    placeholder="e.g. 750"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedPack(0);
                    }}
                    className="ml-2 w-full text-sm font-semibold text-slate-900 outline-none"
                  />
                  {Number(customAmount) > 0 && (
                    <span className="text-xs font-bold text-orange-600">
                      = {customAmount} Credits
                    </span>
                  )}
                </div>
              </div>

              {rechargeError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700">
                  {rechargeError}
                </div>
              )}

              {/* Checkout Action */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isRecharging || effectiveCredits <= 0}
                  onClick={handleProceedToCashfree}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-sm font-bold text-white shadow-lg hover:from-orange-700 hover:to-amber-700 disabled:opacity-50"
                >
                  {isRecharging ? (
                    "Connecting to Cashfree..."
                  ) : (
                    <>
                      <span>Pay ₹{selectedPack > 0 ? selectedPack : customAmount || 0} via Cashfree</span>
                      <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">
                        +{effectiveCredits} Credits
                      </span>
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Secured by Cashfree Payments • Instant Credit to Trustit Wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
