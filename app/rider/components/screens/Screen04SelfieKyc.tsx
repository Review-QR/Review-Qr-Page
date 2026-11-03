"use client";

import React, { useEffect, useRef } from "react";
import { useRiderCamera } from "@/app/rider/hooks/useRiderCamera";

interface Screen04Props {
  onSelfieCaptured?: (selfieUrl: string) => void;
  onBack?: () => void;
}

export default function Screen04SelfieKyc({ onSelfieCaptured, onBack }: Screen04Props) {
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
  } = useRiderCamera("user");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera("user");
    return () => stopCamera();
  }, [startCamera, stopCamera]);

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

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ANTI-FRAUD
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 4 of 6</span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <h2 className="text-base font-black text-slate-900 leading-tight">Live Camera Selfie KYC</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Take a real front-camera photo. <strong className="text-red-600">Cartoon avatars and gallery uploads are strictly prohibited.</strong>
          </p>
        </div>

        {/* Camera Viewfinder Box */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-center space-y-3">
          <div className="relative w-52 h-64 mx-auto rounded-3xl border-2 border-dashed border-[#0D47A1] bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white shadow-inner">
            
            {/* Live Video Element */}
            {isStreaming && !capturedImage && (
              <video
                ref={videoRef as React.LegacyRef<HTMLVideoElement>}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            )}

            {/* Oval Face Guide Overlay */}
            {isStreaming && !capturedImage && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-36 h-48 rounded-[50%] border-2 border-dashed border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"></div>
                <span className="absolute bottom-2 text-[10px] font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                  Align Face Inside Oval
                </span>
              </div>
            )}

            {/* Captured Photo Preview */}
            {capturedImage && (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  ✓ Verified
                </div>
              </div>
            )}

            {/* Error or Loading State */}
            {!isStreaming && !capturedImage && (
              <div className="space-y-2 p-3 text-center">
                <span className="text-3xl block">📷</span>
                <span className="text-xs font-bold text-slate-300 block">
                  {error || "Starting Front Camera..."}
                </span>
                <button
                  type="button"
                  onClick={() => startCamera("user")}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-500"
                >
                  Enable Camera
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Snap Photo vs Retake */}
          <div className="flex items-center justify-center gap-2">
            {!capturedImage ? (
              <button
                type="button"
                onClick={() => capturePhoto()}
                disabled={!isStreaming}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>📸 Snap Live Selfie</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => resetPhoto()}
                className="py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                🔄 Retake Photo
              </button>
            )}

            {/* Hardware Fallback Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileFallback}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600"
              title="Use Device Native Camera"
            >
              Native Cam 📱
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[10px] text-blue-900 leading-tight">
            🛡️ This official photo will be shown to customers and restaurant merchants during delivery handovers.
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onSelfieCaptured?.(capturedImage || "/mock-rider-selfie.jpg")}
          className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-[#0D47A1] hover:bg-[#082b66] text-white shadow-sm active:scale-[0.98] transition"
        >
          <span>Confirm Real Selfie ➔ Vehicle &amp; RC</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
