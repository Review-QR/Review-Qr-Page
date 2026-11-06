"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRiderCamera } from "@/app/rider/hooks/useRiderCamera";

interface Screen30Props {
  onBack?: () => void;
  onConfirmPod?: () => void;
}

export default function Screen30ContactlessPhotoPod({
  onBack,
  onConfirmPod,
}: Screen30Props) {
  const [podNote, setPodNote] = useState<string>("Placed safely on doorstep shoe rack");
  const [timestamp, setTimestamp] = useState<string>("");

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
    const now = new Date();
    setTimestamp(now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));
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
              No-Contact Handover
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Proof of Delivery (Photo POD)</h2>
          </div>
          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
            📸
          </span>
        </div>

        {/* Instructions */}
        <div className="mt-2 text-center space-y-0.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            Customer Request: Leave at Door
          </span>
          <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
            Take a clear photo of the package placed at customer&apos;s door or security gate.
          </p>
        </div>

        {/* Viewfinder with Live Watermark Overlay */}
        <div className="mt-3 relative w-full h-64 rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden shadow-lg flex flex-col justify-between p-3">
          
          {/* Live Rear Camera Video Stream */}
          {isStreaming && !capturedImage && (
            <video
              ref={videoRef as React.LegacyRef<HTMLVideoElement>}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Captured Photo */}
          {capturedImage && (
            <div className="absolute inset-0 w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedImage} alt="Watermarked POD" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Top Dynamic Watermark */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold text-white/95 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
            <span>📍 27.5745° N, 81.5965° E (±3.8m)</span>
            <span>{timestamp || "Bahraich, UP"}</span>
          </div>

          {/* Center Target Box */}
          {!capturedImage && isStreaming && (
            <div className="relative z-10 border-2 border-dashed border-amber-400/90 rounded-xl w-44 h-32 mx-auto flex flex-col items-center justify-center text-amber-300 bg-black/20 backdrop-blur-2xs">
              <span className="text-3xl">📦</span>
              <span className="text-[10px] font-bold mt-1">Frame Parcel Here</span>
            </div>
          )}

          {!isStreaming && !capturedImage && (
            <div className="relative z-10 my-auto text-center p-3 text-white space-y-2">
              <span className="text-3xl block">📷</span>
              <span className="text-xs font-bold block">{error || "Starting Rear Camera..."}</span>
              <button
                type="button"
                onClick={() => startCamera("environment")}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow"
              >
                Start Camera
              </button>
            </div>
          )}

          {/* Bottom Tamper-Proof Watermark */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-white/95 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs border border-white/10">
            <span>Order #TR-4492</span>
            <span>Rider: Verified Partner · UP 40</span>
          </div>
        </div>

        {/* Fallback to Native Camera & Retake */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {capturedImage && (
            <button
              type="button"
              onClick={() => {
                resetPhoto();
              }}
              className="py-1 px-3 rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-slate-700"
            >
              🔄 Retake POD Photo
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
            className="text-[10px] text-blue-700 hover:underline font-bold"
          >
            Native Phone Cam 📱
          </button>
        </div>

        {/* Quick Location Note */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
            Handover Placement Note:
          </label>
          <input
            type="text"
            value={podNote}
            onChange={(e) => setPodNote(e.target.value)}
            className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Footer CTAs */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        {!capturedImage ? (
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isStreaming}
            className="w-full py-3.5 rounded-xl bg-[#0D47A1] text-white font-black text-sm shadow-md hover:bg-blue-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            <span>📸 Snap Watermarked Photo POD</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onConfirmPod}
            className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-sm shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <span>Complete Contactless Delivery (Claim ₹45)</span>
            <span>✓</span>
          </button>
        )}
      </div>
    </div>
  );
}
