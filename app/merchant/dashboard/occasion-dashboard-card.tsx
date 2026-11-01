"use client";

import { useState } from "react";
import Link from "next/link";
import type { MerchantOccasionSummary, MerchantConnectWalletState } from "@/lib/customer-crm-service";

let cashfreeSdkPromise: Promise<void> | null = null;
function loadCashfreeSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as unknown as { Cashfree?: unknown }).Cashfree) return Promise.resolve();
  if (cashfreeSdkPromise) return cashfreeSdkPromise;

  cashfreeSdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if ((window as unknown as { Cashfree?: unknown }).Cashfree) resolve();
      else reject(new Error("Cashfree checkout could not be loaded."));
    };
    script.onerror = () => reject(new Error("Cashfree checkout could not be loaded."));
    document.head.appendChild(script);
  });
  return cashfreeSdkPromise;
}

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

      // Load official Cashfree JS SDK & launch modal checkout
      await loadCashfreeSdk();

      const cfWindow = window as unknown as {
        Cashfree?: (opts: { mode: string }) => {
          checkout: (opts: { paymentSessionId: string; redirectTarget: string }) => Promise<unknown>;
        };
      };

      if (cfWindow.Cashfree) {
        const cashfree = cfWindow.Cashfree({ mode: data.checkoutMode || "production" });
        await cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_modal",
        });

        // Verify payment and update wallet state immediately
        const resVerify = await fetch("/api/merchant/wallet/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.orderId,
            credits: effectiveCredits,
          }),
        });

        const verifyData = await resVerify.json();
        if (verifyData.success && verifyData.wallet) {
          setWallet(verifyData.wallet);
          setShowRechargeModal(false);
          alert(`🎉 Payment Successful! ${effectiveCredits} Connect Credits added to your wallet.`);
        }
      }
    } catch {
      setRechargeError("Network error. Please try again.");
    } finally {
      setIsRecharging(false);
    }
  }

  return (
    <>
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-b from-[#FFFDF9] to-[#FFF9F0] p-6 text-slate-800 shadow-sm">
        {/* Soft Background Accents */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-200/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-100/35 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Column: Occasion Intelligence */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 border border-amber-300/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 shadow-2xs">
                ✨ Automated Occasion CRM &amp; AI Greetings
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-300/70 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                DPDP 2023 Masked
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Today&apos;s Occasions &amp; Customer Wishes
              </h2>
              <p className="mt-1 text-sm text-slate-600 font-medium">
                Automated rich greeting cards &amp; coupons sent directly to your customers on WhatsApp at{" "}
                <span className="font-bold text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded-md">{wallet.dailyDispatchTime} AM</span> daily.
              </p>
            </div>

            {/* Quick Counters Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              {/* Today's Birthdays */}
              <div className="rounded-2xl border border-orange-200/70 bg-orange-50/60 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">🎂</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">Today</span>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{summary.todayBirthdaysCount}</div>
                <div className="text-xs font-semibold text-orange-800">
                  {summary.birthdaysSentToday > 0 ? `✓ ${summary.birthdaysSentToday} Sent` : "Birthdays"}
                </div>
              </div>

              {/* Today's Anniversaries */}
              <div className="rounded-2xl border border-rose-200/70 bg-rose-50/60 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">💍</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">Today</span>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{summary.todayAnniversariesCount}</div>
                <div className="text-xs font-semibold text-rose-800">
                  {summary.anniversariesSentToday > 0 ? `✓ ${summary.anniversariesSentToday} Sent` : "Anniversaries"}
                </div>
              </div>

              {/* Today's Special Offers */}
              <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/60 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">📢</span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">Promos</span>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{summary.offersSentToday}</div>
                <div className="text-xs font-semibold text-indigo-800">Offers Sent</div>
              </div>

              {/* Connect Credits Balance */}
              <div
                className={`rounded-2xl border p-3.5 shadow-2xs transition ${
                  wallet.isZeroBalance
                    ? "border-rose-300 bg-rose-50/80 text-rose-900"
                    : wallet.isLowBalance
                    ? "border-amber-300 bg-amber-50/80 text-amber-900"
                    : "border-emerald-200/80 bg-emerald-50/70 text-emerald-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">🪙</span>
                  {wallet.isLowBalance ? (
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      Low
                    </span>
                  ) : wallet.isZeroBalance ? (
                    <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                      0 Credits
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{wallet.creditsBalance}</div>
                <div className="text-xs font-semibold text-emerald-800">Connect Credits</div>
              </div>
            </div>

            {/* Today's Masked Customer List */}
            {summary.todayCustomers.length > 0 && (
              <div className="rounded-2xl border border-amber-200/70 bg-white/70 p-3.5 shadow-2xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Customers Celebrating Today:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {summary.todayCustomers.slice(0, 6).map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs text-slate-800"
                    >
                      <span>{c.occasionType === "birthday" ? "🎂" : "💍"}</span>
                      <strong className="font-bold text-slate-900">{c.customerName}</strong>
                      <span className="font-mono text-[11px] text-amber-900">({c.maskedPhone})</span>
                    </span>
                  ))}
                  {summary.todayCustomers.length > 6 && (
                    <span className="inline-flex items-center rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      +{summary.todayCustomers.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Recharge (Warm Luxury Gold Card) */}
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/70 bg-gradient-to-b from-amber-50/90 to-amber-100/60 p-4.5 sm:min-w-[280px] shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Available Balance</span>
                <div className="flex items-center gap-2 text-xl font-black text-slate-900 mt-0.5">
                  <span className="text-xl">🪙</span>
                  <span>{wallet.creditsBalance} Credits</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRechargeModal(true)}
                className="rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 px-4 py-2 text-xs font-black text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition"
              >
                + Top-up
              </button>
            </div>

            {/* Low Balance Warning Alert */}
            {wallet.isLowBalance && (
              <div className="rounded-xl border border-amber-300 bg-amber-100/90 p-2.5 text-xs text-amber-950 font-medium">
                ⚠️ <strong>Low message balance!</strong> Recharge now so tomorrow morning&apos;s wishes aren&apos;t paused.
              </div>
            )}

            {wallet.isZeroBalance && (
              <div className="rounded-xl border border-rose-300 bg-rose-100/90 p-2.5 text-xs text-rose-950 font-medium">
                🛑 <strong>Balance exhausted!</strong> Automatic greetings are currently paused.
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/merchant/dashboard/messages"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span>🎨 Greeting Card &amp; Draft Studio</span>
                <span>→</span>
              </Link>
              <Link
                href="/merchant/dashboard/business"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-white/90 px-4 py-2 text-xs font-bold text-amber-950 hover:bg-white shadow-2xs transition"
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
