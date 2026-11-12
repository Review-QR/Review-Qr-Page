"use client";

import React, { useState } from "react";

interface CashfreeRechargeResponse {
  success?: boolean;
  message?: string;
  orderId?: string;
  paymentSessionId?: string;
  qrCodeImage?: string | null;
  qrCodeUrl?: string | null;
  paymentUrl?: string | null;
}

interface Screen28Props {
  onBack?: () => void;
  onRechargeSuccess?: () => void;
  onInitiateCashfree?: (amount: number, credits: number) => Promise<CashfreeRechargeResponse | void>;
}

export default function Screen28ConnectWalletRecharge({
  onBack,
  onRechargeSuccess,
  onInitiateCashfree,
}: Screen28Props) {
  const [selectedPack, setSelectedPack] = useState<number>(199);
  const [recharging, setRecharging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const packs = [
    { price: 99, credits: 110, rate: "₹0.90 / msg", popular: false },
    { price: 199, credits: 250, rate: "₹0.79 / msg", popular: true },
    { price: 499, credits: 700, rate: "₹0.71 / msg", popular: false },
  ];

  const handleRecharge = async () => {
    setRecharging(true);
    setQrCodeImage(null);
    setQrCodeUrl(null);
    setStatusMessage("Creating Cashfree UPI / QR session...");
    const pack = packs.find((p) => p.price === selectedPack) || packs[1];

    try {
      let data: CashfreeRechargeResponse | null = null;
      if (onInitiateCashfree) {
        const res = await onInitiateCashfree(pack.price, pack.credits);
        if (res) data = res;
      } else {
        const res = await fetch("/api/merchant/app-operations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "recharge_wallet",
            data: { amount: pack.price, credits: pack.credits, includeQr: true },
          }),
        });
        data = await res.json();
      }

      if (!data?.success) {
        setStatusMessage(data?.message || "Failed to initialize Cashfree payment session.");
        return;
      }

      if (data.qrCodeImage) setQrCodeImage(data.qrCodeImage);
      if (data.qrCodeUrl) setQrCodeUrl(data.qrCodeUrl);

      if (data.paymentUrl && typeof window !== "undefined") {
        window.location.href = data.paymentUrl;
        return;
      }
      setStatusMessage(
        data.qrCodeImage
          ? `Cashfree UPI QR ready for Order ${data.orderId?.slice(-8) || ""}. Scan below or complete checkout.`
          : `Cashfree Session ${data.orderId?.slice(-8) || ""} ready!`,
      );
      if (data.orderId && !data.qrCodeImage) onRechargeSuccess?.();
    } catch {
      setStatusMessage("Network error creating Cashfree recharge session.");
    } finally {
      setRecharging(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#FAF5FF] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-purple-200">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
              WHATSAPP &amp; SMS WALLET
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Connect Credits Wallet &amp; Top-Up
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

        {/* Current Balance Card */}
        <div className="mt-2.5 bg-white border border-amber-300 rounded-2xl p-3 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shadow-2xs">
              🪙
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500">Available Credits</span>
              <p className="text-base font-black text-slate-900 leading-tight">250 Connect Credits</p>
              <span className="text-[9px] text-emerald-700 font-semibold">Active &amp; Ready for WhatsApp Marketing</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
            Never Expires
          </span>
        </div>

        {/* Recharge Packs Selector */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Choose Recharge Package:
          </span>

          {packs.map((p) => (
            <div
              key={p.price}
              onClick={() => setSelectedPack(p.price)}
              className={`p-3 rounded-2xl border-2 transition cursor-pointer shadow-2xs flex items-center justify-between ${
                selectedPack === p.price
                  ? "bg-white border-purple-600 ring-2 ring-purple-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedPack === p.price ? "border-purple-600 bg-purple-600" : "border-slate-300"
                  }`}
                >
                  {selectedPack === p.price && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-slate-900">₹{p.price}</span>
                    <span className="text-xs font-black text-purple-700">({p.credits} Credits)</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{p.rate}</span>
                </div>
              </div>

              {p.popular && (
                <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}
            </div>
          ))}
        </div>

        {statusMessage && (
          <div className="mt-2.5 p-2 rounded-xl bg-purple-100 border border-purple-300 text-center text-xs font-bold text-purple-900">
            {statusMessage}
          </div>
        )}

        {qrCodeImage && (
          <div className="mt-2.5 bg-white border border-purple-200 rounded-2xl p-3 text-center space-y-2 shadow-2xs">
            <img src={qrCodeImage} alt="Cashfree UPI QR" className="w-40 h-40 mx-auto rounded-lg" />
            {qrCodeUrl && (
              <a
                href={qrCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] font-bold text-purple-700 underline"
              >
                Open Cashfree UPI Link →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer Payment */}
      <div className="pt-2">
        {recharging ? (
          <div className="w-full py-2.5 rounded-xl bg-purple-700 text-white font-bold text-xs text-center shadow-xs animate-pulse">
            Connecting Cashfree UPI...
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRecharge}
            className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>💳 TOP-UP ₹{selectedPack} VIA CASHFREE UPI</span>
          </button>
        )}
      </div>
    </div>
  );
}
