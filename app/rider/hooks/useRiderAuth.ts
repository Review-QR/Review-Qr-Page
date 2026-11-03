"use client";

import { useState, useEffect, useCallback } from "react";
import type { DeliveryRider } from "@/lib/hyperlocal/types";

export interface RiderAuthState {
  rider: DeliveryRider | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  previewOtp: string | null;
}

const RIDER_STORAGE_KEY = "trustit_rider_profile";
const RIDER_TOKEN_KEY = "trustit_rider_session_token";

export function useRiderAuth() {
  const [rider, setRider] = useState<DeliveryRider | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  // Load existing session from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(RIDER_TOKEN_KEY);
      const savedRider = localStorage.getItem(RIDER_STORAGE_KEY);
      if (savedToken) setToken(savedToken);
      if (savedRider) setRider(JSON.parse(savedRider));
    } catch {
      // Non-blocking browser storage access
    }
  }, []);

  const saveSession = useCallback((newRider: DeliveryRider, newToken?: string) => {
    setRider(newRider);
    try {
      localStorage.setItem(RIDER_STORAGE_KEY, JSON.stringify(newRider));
      if (newToken) {
        setToken(newToken);
        localStorage.setItem(RIDER_TOKEN_KEY, newToken);
      }
    } catch {}
  }, []);

  const clearSession = useCallback(() => {
    setRider(null);
    setToken(null);
    try {
      localStorage.removeItem(RIDER_STORAGE_KEY);
      localStorage.removeItem(RIDER_TOKEN_KEY);
    } catch {}
  }, []);

  /**
   * 1. Send OTP to mobile (SMS / WhatsApp)
   */
  const sendPhoneOtp = async (phone: string, channel: "sms" | "whatsapp" = "sms") => {
    setIsLoading(true);
    setError(null);
    setPreviewOtp(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone, channel }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to send OTP.");
      }

      if (data.previewOtp) {
        setPreviewOtp(data.previewOtp);
      }
      return { success: true, previewOtp: data.previewOtp };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error sending OTP";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. Verify 6-digit OTP
   */
  const verifyPhoneOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone, otp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Invalid OTP code.");
      }

      if (data.rider) {
        saveSession(data.rider, data.riderToken);
      }

      return {
        success: true,
        isNewRider: Boolean(data.isNewRider),
        rider: data.rider,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to verify OTP";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. Submit KYC & Registration
   */
  const registerKyc = async (formData: {
    fullName: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
    drivingLicenseNumber: string;
    upiId?: string;
    profileImageUrl?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_kyc",
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "KYC registration failed.");
      }

      saveSession(data.rider, data.riderToken);
      return { success: true, rider: data.rider };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error registering KYC";
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 4. Complete Training Academy
   */
  const completeAcademy = async (riderId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete_academy", riderId }),
      });
      const data = await res.json();
      if (rider) {
        saveSession({ ...rider, kyc_status: "approved", training_completed_at: new Date().toISOString() });
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 5. Verify Daily Helmet Selfie
   */
  const verifyHelmetSelfie = async (riderId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_helmet_selfie", riderId }),
      });
      const data = await res.json();
      if (rider) {
        saveSession({ ...rider, is_online: true, is_available: true, daily_helmet_verified_at: new Date().toISOString() });
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rider,
    token,
    isLoading,
    error,
    previewOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    registerKyc,
    completeAcademy,
    verifyHelmetSelfie,
    saveSession,
    clearSession,
  };
}
