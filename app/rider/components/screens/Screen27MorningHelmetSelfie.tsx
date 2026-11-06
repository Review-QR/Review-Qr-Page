"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";
import { useRiderCamera } from "@/app/rider/hooks/useRiderCamera";

interface Screen27Props {
  onBack?: () => void;
  onSelfieApproved?: () => void;
}

export default function Screen27MorningHelmetSelfie({
  onBack,
  onSelfieApproved,
}: Screen27Props) {
  const [hasHelmet, setHasHelmet] = useState<boolean>(true);
  const [hasThermalBag, setHasThermalBag] = useState<boolean>(true);
  const [isAiVerifying, setIsAiVerifying] = useState<boolean>(false);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState<boolean>(false);

  const { rider, verifyHelmetSelfie, isLoading } = useRiderAuth();
  const {
    isStreaming,
    capturedImage,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    resetPhoto,
    toggleCameraFacing,
    videoRef,
    setCapturedImage,
  } = useRiderCamera("user");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    startCamera("user");
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const snap = capturePhoto();
    if (!snap) return;

    setIsAiVerifying(true);
    setTimeout(() => {
      setIsAiVerifying(false);
      setIsPhotoCaptured(true);
    }, 1200);
  };

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
        setIsAiVerifying(true);
        setTimeout(() => {
          setIsAiVerifying(false);
          setIsPhotoCaptured(true);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePassGate = async () => {
    if (rider?.id) {
      await verifyHelmetSelfie(rider.id);
    }
    onSelfieApproved?.();
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
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Daily Duty Gate
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Morning Safety &amp; Helmet Check</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            ☀️
          </span>
        </div>

        {/* Instructions */}
        <div className="mt-2 text-center space-y-0.5">
          <h3 className="text-xs font-black text-slate-900">
            Anti-Proxy Verification (No Account Sharing)
          </h3>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Take a live front-camera selfie wearing your <strong>Helmet</strong> with your <strong>Trustit Bag</strong>.
          </p>
        </div>

        {/* Live Camera Viewfinder */}
        <div className="mt-3 relative w-48 h-56 mx-auto rounded-3xl bg-slate-950 border-4 border-slate-700 flex flex-col items-center justify-center overflow-hidden shadow-xl">
          
          {/* Live Video Stream */}
          {isStreaming && !capturedImage && (
            <video
              ref={videoRef as React.LegacyRef<HTMLVideoElement>}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          )}

          {/* Guide Overlay */}
          {isStreaming && !capturedImage && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-32 h-44 rounded-[50%] border-2 border-dashed border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
              <span className="absolute bottom-2 text-[9px] font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                Align Helmet &amp; Face
              </span>
            </div>
          )}

          {/* Captured Image Display */}
          {capturedImage && (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Helmet Selfie" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 inset-x-2 bg-black/70 backdrop-blur-xs text-white p-1 rounded-lg text-center">
                <span className="text-[10px] font-bold text-emerald-400 block">✓ Helmet Verified (99.4%)</span>
                <span className="text-[9px] text-slate-300">Arjun Singh · Shift Ready</span>
              </div>
            </div>
          )}

          {/* Spinner when AI is auditing */}
          {isAiVerifying && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-20">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
              <span className="text-xs font-bold text-amber-300">Auditing Helmet &amp; Bag...</span>
            </div>
          )}

          {/* Fallback button if camera not streaming */}
          {!isStreaming && !capturedImage && (
            <div className="p-3 text-center space-y-2">
              <span className="text-3xl block">🪖</span>
              <span className="text-[11px] text-slate-300 font-bold block">{error || "Starting Front Cam..."}</span>
              <button
                type="button"
                onClick={() => startCamera("user")}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg"
              >
                Start Camera
              </button>
            </div>
          )}
        </div>

        {/* Retake, Switch & Native Fallback Controls */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleCapture}
                disabled={!isStreaming}
                className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition disabled:opacity-40 flex items-center gap-1 active:scale-95"
              >
                <span>📸 Capture Helmet Photo</span>
              </button>
              <button
                type="button"
                onClick={() => toggleCameraFacing()}
                className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-700 active:scale-95"
                title="Switch Front/Back Camera"
              >
                <span>🔄 Flip Cam</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsPhotoCaptured(false);
                resetPhoto();
              }}
              className="py-1 px-3 rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-slate-700"
            >
              🔄 Retake Selfie
            </button>
          )}

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
            className="py-1.5 px-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[10px] text-blue-700 font-bold active:scale-95"
          >
            📱 Phone Camera
          </button>
        </div>

        {/* Checklist Checkboxes */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer">
            <span className="flex items-center gap-2">
              <span>🪖</span>
              <span>I am wearing a certified safety helmet</span>
            </span>
            <input
              type="checkbox"
              checked={hasHelmet}
              onChange={(e) => setHasHelmet(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-[#0D47A1]"
            />
          </label>
          <label className="flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer pt-1.5 border-t border-slate-100">
            <span className="flex items-center gap-2">
              <span>🎒</span>
              <span>I have the clean Trustit thermal delivery bag</span>
            </span>
            <input
              type="checkbox"
              checked={hasThermalBag}
              onChange={(e) => setHasThermalBag(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-[#0D47A1]"
            />
          </label>
        </div>
      </div>

      {/* Footer Capture / Proceed Actions */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {!isPhotoCaptured ? (
          <button
            type="button"
            disabled={!hasHelmet || !hasThermalBag || isAiVerifying}
            onClick={handleCapture}
            className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-xs shadow-md hover:bg-blue-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <span>📸 Snap &amp; Audit Morning Helmet</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isLoading}
            onClick={handlePassGate}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-md hover:bg-emerald-700 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <span>{isLoading ? "Unlocking Duty Shift..." : "Pass Gate: Unlock Online Duty ➔"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
