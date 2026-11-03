"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRiderCamera } from "@/app/rider/hooks/useRiderCamera";

interface Screen47Props {
  onBack?: () => void;
  onSubmitClaim?: (amount: number) => void;
}

export default function Screen47ParkingTollClaim({
  onBack,
  onSubmitClaim,
}: Screen47Props) {
  const [amount, setAmount] = useState<number>(10);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  const {
    isStreaming,
    capturedImage,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    resetPhoto,
    videoRef,
    setCapturedImage,
  } = useRiderCamera("environment");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    startCamera("environment");
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    capturePhoto();
  };

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClaim = () => {
    setIsApproved(true);
    onSubmitClaim?.(amount);
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Rider Reimbursements
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Parking &amp; Toll Quick Claim</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-amber-700 bg-amber-50 rounded-full py-0.5 border border-amber-200">
            ₹{amount}
          </span>
        </div>

        {/* Claim Amount Selector */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-900">Select Paid Amount:</h4>
              <p className="text-[10px] text-slate-500">Commercial parking or municipal chungi fee</p>
            </div>
            <span className="text-base font-black font-mono text-[#0D47A1]">₹{amount}.00</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`py-2 rounded-xl text-xs font-black border transition ${
                  amount === amt
                    ? "bg-[#0D47A1] text-white border-[#0D47A1] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Live Camera Receipt Viewfinder */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Parking Receipt Photo:
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {capturedImage ? "✓ Receipt Attached" : "Live Camera"}
            </span>
          </div>

          <div className="relative w-full h-44 rounded-xl bg-slate-950 border border-slate-700 flex flex-col items-center justify-center text-white overflow-hidden shadow-inner">
            {isStreaming && !capturedImage && (
              <video
                ref={videoRef as React.LegacyRef<HTMLVideoElement>}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {capturedImage && (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage} alt="Parking Slip" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  ✓ Attached
                </div>
              </div>
            )}

            {!isStreaming && !capturedImage && (
              <div className="p-3 text-center space-y-1">
                <span className="text-2xl block">🎫</span>
                <span className="text-xs font-bold block">{error || "Starting Camera..."}</span>
                <button
                  type="button"
                  onClick={() => startCamera("environment")}
                  className="px-2.5 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-lg"
                >
                  Start Cam
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            {!capturedImage ? (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isStreaming}
                className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40"
              >
                📸 Snap Receipt Photo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => resetPhoto()}
                className="py-1.5 px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                🔄 Retake Photo
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileFallback}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] text-blue-700 font-bold hover:underline"
            >
              Native Cam 📱
            </button>
          </div>
        </div>

        {/* Approved Success Banner */}
        {isApproved && (
          <div className="mt-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center space-y-0.5">
            <span className="text-base">🎉</span>
            <p className="text-xs font-black text-emerald-900">₹{amount}.00 Reimbursement Approved!</p>
            <p className="text-[10px] text-emerald-700">Added to today&apos;s trip ledger with zero deduction.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          disabled={isApproved}
          onClick={handleClaim}
          className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
        >
          <span>{isApproved ? "Reimbursement Credited ✓" : `Claim ₹${amount}.00 Reimbursement Now`}</span>
          <span>⚡</span>
        </button>
      </div>
    </div>
  );
}
