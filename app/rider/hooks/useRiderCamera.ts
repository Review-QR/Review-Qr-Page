"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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
}

export function useRiderCamera(initialFacingMode: "user" | "environment" = "user") {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialFacingMode);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(
    async (mode?: "user" | "environment"): Promise<boolean> => {
      stopCamera();
      const targetMode = mode || facingMode;
      setFacingMode(targetMode);
      setError(null);

      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError("Camera not supported on this device/browser.");
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
          videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
          await videoRef.current.play();
        }
        setIsStreaming(true);
        return true;
      } catch (err: any) {
        setError(err.name === "NotAllowedError" ? "Camera permission denied." : "Unable to access camera.");
        setIsStreaming(false);
        return false;
      }
    },
    [facingMode, stopCamera]
  );

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Draw mirrored if front camera
      if (facingMode === "user") {
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
  }, [facingMode, stopCamera]);

  const resetPhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera(facingMode);
  }, [facingMode, startCamera]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isStreaming,
    capturedImage,
    error,
    facingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    resetPhoto,
    videoRef,
    setCapturedImage,
  };
}
