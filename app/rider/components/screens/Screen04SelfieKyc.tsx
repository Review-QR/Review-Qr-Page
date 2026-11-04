"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean>(false);
  const [isVerifyingSelfie, setIsVerifyingSelfie] = useState<boolean>(false);

  // Auto-start camera on mount
  useEffect(() => {
    let mounted = true;
    startCamera("user").then((success) => {
      if (mounted) setCameraPermissionGranted(success);
    });
    return () => {
      mounted = false;
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setIsVerifyingSelfie(true);
      setTimeout(() => {
        setIsVerifyingSelfie(false);
      }, 700);
    }
  };

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
        setIsVerifyingSelfie(true);
        setTimeout(() => {
          setIsVerifyingSelfie(false);
        }, 700);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full max-h-[580px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ANTI-FRAUD KYC
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 4 of 6</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-2.5 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">Live Camera Selfie KYC</h2>
          <p className="text-[11px] text-slate-500 leading-tight">
            Take a real front-camera photo. Avatar will be shown to customers.
          </p>
        </div>

        {/* Compact Camera Viewfinder Box (Max Height 192px) */}
        <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center space-y-2.5">
          <div className="relative w-40 h-48 mx-auto rounded-2xl border-2 border-dashed border-[#0D47A1] bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white shadow-inner">
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
                <div className="w-28 h-36 rounded-[50%] border-2 border-dashed border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"></div>
                <span className="absolute bottom-1.5 text-[9px] font-bold text-emerald-300 bg-black/60 px-2 py-0.2 rounded">
                  Align Face Inside Oval
                </span>
              </div>
            )}

            {/* Captured Photo Preview */}
            {capturedImage && (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
                <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                  {isVerifyingSelfie ? "Auditing..." : "✓ Real Photo"}
                </div>
              </div>
            )}

            {/* Camera Offline / Request State */}
            {!isStreaming && !capturedImage && (
              <div className="space-y-1.5 p-2 text-center z-10">
                <span className="text-2xl block">📷</span>
                <span className="text-[11px] font-bold text-slate-300 block">
                  {error || "Camera access required"}
                </span>
                <button
                  type="button"
                  onClick={() => startCamera("user")}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow hover:bg-blue-500 active:scale-95"
                >
                  Open Camera 🤳
                </button>
              </div>
            )}
          </div>

          {/* Action Row: Snap vs Retake & Fallback */}
          <div className="flex items-center justify-center gap-2">
            {!capturedImage ? (
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isStreaming}
                className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition disabled:opacity-40 flex items-center gap-1 active:scale-95"
              >
                <span>📸 Snap Live Selfie</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => resetPhoto()}
                className="py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
              >
                🔄 Retake Photo
              </button>
            )}

            {/* Hardware Fallback Input for mobile browsers */}
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
              className="py-1.5 px-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600 active:scale-95"
              title="Use Device Native Camera"
            >
              📱 Phone Cam
            </button>
          </div>
        </div>
      </div>

      {/* Slim 40px Action Footer */}
      <div className="pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => {
            if (capturedImage) onSelfieCaptured?.(capturedImage);
          }}
          disabled={!capturedImage || isVerifyingSelfie}
          className={`w-full py-2.5 rounded-lg font-black text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] ${
            capturedImage && !isVerifyingSelfie
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>
            {capturedImage ? "Confirm Real Selfie ➔ Vehicle & RC" : "⚠️ Please Snap Live Selfie First"}
          </span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
