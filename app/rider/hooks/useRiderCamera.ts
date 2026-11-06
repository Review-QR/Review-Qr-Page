"use client";

import { useState, useRef, useCallback } from "react";

export interface RiderCameraState {
  isStreaming: boolean;
  capturedImage: string | null;
  error: string | null;
  facingMode: "user" | "environment";
  startCamera: (mode?: "user" | "environment") => Promise<boolean>;
  stopCamera: () => void;
  capturePhoto: () => string | null;
  resetPhoto: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useRiderCamera(initialFacingMode: "user" | "environment" = "user") {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialFacingMode);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<"user" | "environment">(initialFacingMode);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {}
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(
    async (mode?: "user" | "environment"): Promise<boolean> => {
      // 1. Cleanly stop any existing stream
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((t) => t.stop());
        } catch {}
        streamRef.current = null;
      }

      const targetMode = mode || facingModeRef.current || "user";
      facingModeRef.current = targetMode;
      setFacingMode(targetMode);
      setError(null);

      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        setError("Camera is not supported on this device or insecure context.");
        setIsStreaming(false);
        return false;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetMode },
            width: { ideal: 720 },
            height: { ideal: 960 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          try {
            await videoRef.current.play();
          } catch {
            // Autoplay might need user interaction; stream is still active
          }
        }
        setIsStreaming(true);
        return true;
      } catch (err: any) {
        const isDenied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
        setError(isDenied ? "Camera permission denied. Please allow camera in Chrome settings." : "Unable to open camera hardware.");
        setIsStreaming(false);
        return false;
      }
    },
    [] // Stable reference - NEVER re-creates!
  );

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const width = video.videoWidth > 0 ? video.videoWidth : (video.clientWidth || 640);
      const height = video.videoHeight > 0 ? video.videoHeight : (video.clientHeight || 480);
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Draw mirrored if front camera
      if (facingModeRef.current === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      setCapturedImage(dataUrl);
      stopCamera();
      return dataUrl;
    } catch {
      return null;
    }
  }, [stopCamera]);

  const resetPhoto = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    startCamera(facingModeRef.current);
  }, [startCamera]);

  const toggleCameraFacing = useCallback(async () => {
    const nextMode = facingModeRef.current === "user" ? "environment" : "user";
    return await startCamera(nextMode);
  }, [startCamera]);

  return {
    isStreaming,
    capturedImage,
    error,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    resetPhoto,
    toggleCameraFacing,
    videoRef,
    setCapturedImage,
  };
}
