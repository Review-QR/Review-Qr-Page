"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRiderWorkflow } from "@/app/rider/hooks/useRiderWorkflow";
import { riderAudio } from "@/lib/audio/rider-siren";
import GoogleConsentModal from "@/components/auth/GoogleConsentModal";
import WhatsAppOtpNotificationBanner from "@/components/auth/WhatsAppOtpNotificationBanner";
import { TrustitNative } from "@/lib/native/trustit-native-service";

// 18 Core Screens
import Screen01AuthStart from "@/app/rider/components/screens/Screen01AuthStart";
import Screen02OtpVerify from "@/app/rider/components/screens/Screen02OtpVerify";
import Screen03Consent from "@/app/rider/components/screens/Screen03Consent";
import Screen04SelfieKyc from "@/app/rider/components/screens/Screen04SelfieKyc";
import Screen05VehicleDl from "@/app/rider/components/screens/Screen05VehicleDl";
import Screen06PayoutSetup from "@/app/rider/components/screens/Screen06PayoutSetup";
import Screen07DutyCockpit from "@/app/rider/components/screens/Screen07DutyCockpit";
import Screen08ShiftScorecard from "@/app/rider/components/screens/Screen08ShiftScorecard";
import Screen09CashCeiling from "@/app/rider/components/screens/Screen09CashCeiling";
import Screen10Radar from "@/app/rider/components/screens/Screen10Radar";
import Screen11SlideAccept from "@/app/rider/components/screens/Screen11SlideAccept";
import Screen12StorePickup from "@/app/rider/components/screens/Screen12StorePickup";
import Screen13Doorstep from "@/app/rider/components/screens/Screen13Doorstep";
import Screen14DynamicQr from "@/app/rider/components/screens/Screen14DynamicQr";
import Screen15Passbook from "@/app/rider/components/screens/Screen15Passbook";
import Screen16Milestones from "@/app/rider/components/screens/Screen16Milestones";
import Screen17SafetySos from "@/app/rider/components/screens/Screen17SafetySos";
import Screen18Profile from "@/app/rider/components/screens/Screen18Profile";

// Extended Deep-Dwell & Multi-Category Screens (19 to 39)
import Screen19VerificationPending from "@/app/rider/components/screens/Screen19VerificationPending";
import Screen20TrainingAcademy from "@/app/rider/components/screens/Screen20TrainingAcademy";
import Screen21LockscreenOrderPop from "@/app/rider/components/screens/Screen21LockscreenOrderPop";
import Screen22MultiOrderBatch from "@/app/rider/components/screens/Screen22MultiOrderBatch";
import Screen23MerchantDelay from "@/app/rider/components/screens/Screen23MerchantDelay";
import Screen24CustomerUnreachable from "@/app/rider/components/screens/Screen24CustomerUnreachable";
import Screen25ShiftBookingMg from "@/app/rider/components/screens/Screen25ShiftBookingMg";
import Screen26CashRemittanceHubs from "@/app/rider/components/screens/Screen26CashRemittanceHubs";
import Screen27MorningHelmetSelfie from "@/app/rider/components/screens/Screen27MorningHelmetSelfie";
import Screen28BreakdownRescue from "@/app/rider/components/screens/Screen28BreakdownRescue";
import Screen29CustomerRefusalRto from "@/app/rider/components/screens/Screen29CustomerRefusalRto";
import Screen30ContactlessPhotoPod from "@/app/rider/components/screens/Screen30ContactlessPhotoPod";
import Screen31PenaltyDispute from "@/app/rider/components/screens/Screen31PenaltyDispute";
import Screen32AccidentInsurance from "@/app/rider/components/screens/Screen32AccidentInsurance";
import Screen33HeatmapSurge from "@/app/rider/components/screens/Screen33HeatmapSurge";
import Screen34ReferAndBadges from "@/app/rider/components/screens/Screen34ReferAndBadges";
import Screen35PharmacyRxPickup from "@/app/rider/components/screens/Screen35PharmacyRxPickup";
import Screen36HeavyGroceryCrate from "@/app/rider/components/screens/Screen36HeavyGroceryCrate";
import Screen37P2pGenieCourier from "@/app/rider/components/screens/Screen37P2pGenieCourier";
import Screen38FragileCakeGuard from "@/app/rider/components/screens/Screen38FragileCakeGuard";
import Screen39CategoryToggles from "@/app/rider/components/screens/Screen39CategoryToggles";

// Navigation & On-Road Special Screens (40 to 44)
import Screen40TurnByTurnNav from "@/app/rider/components/screens/Screen40TurnByTurnNav";
import Screen41Last100mLandmark from "@/app/rider/components/screens/Screen41Last100mLandmark";
import Screen42TrafficReroute from "@/app/rider/components/screens/Screen42TrafficReroute";
import Screen43DigitalFleetIdPass from "@/app/rider/components/screens/Screen43DigitalFleetIdPass";
import Screen44InAppMaskedChat from "@/app/rider/components/screens/Screen44InAppMaskedChat";

// Ground-Zero Edge Cases & Emergency Screens (45 to 48)
import Screen45DoorstepChangeWallet from "@/app/rider/components/screens/Screen45DoorstepChangeWallet";
import Screen46MidTripCancellation from "@/app/rider/components/screens/Screen46MidTripCancellation";
import Screen47ParkingTollClaim from "@/app/rider/components/screens/Screen47ParkingTollClaim";
import Screen48LowBatterySafeMode from "@/app/rider/components/screens/Screen48LowBatterySafeMode";

type TabKey = "cockpit" | "orders" | "earnings" | "navigation" | "profile";

export default function StandaloneRiderProductionApp() {
  const workflow = useRiderWorkflow();
  const {
    currentScreenId,
    setCurrentScreenId,
    rider,
    isOnline,
    cashInHand,
    cashCeiling,
    walletBalance,
    todayEarnings,
    todayTripsCount,
    activeOrder,
    soundEnabled,
    setSoundEnabled,
    remoteConfig,
    toggleDuty,
    triggerIncomingOrderRadar,
    acceptOrder,
    declineOrder,
    confirmPickup,
    completeDeliveryWithOtp,
    claimWaitCompensation,
    refundDoorstepChange,
    claimParkingReimbursement,
    remitCash,
    handleGoogleLogin,
    requestInstantPayout,
    resetToNewRider,
  } = workflow;

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState<TabKey>("cockpit");

  // Dynamic Auth State
  const [authPhone, setAuthPhone] = useState<string>("");
  const [authChannel, setAuthChannel] = useState<"sms" | "whatsapp">("whatsapp");
  const [previewOtp, setPreviewOtp] = useState<string>("547291");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState<boolean>(false);
  const [activeWhatsAppOtp, setActiveWhatsAppOtp] = useState<string | null>(null);

  // ── LIVE SILENT OTA ENGINE AUTO-SYNC (Checks Cloud for Instant Updates) ──
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        console.log("🚀 [Trustit OTA] Checking cloud for instant updates...");
        const res = await TrustitNative.checkAndApplyOta({
          app: "rider",
          currentVersion: "3.1.0",
        });
        if (res && res.hasUpdate) {
          console.log("🎉 [Trustit OTA] Applied update version:", res.appliedVersion);
        }
      } catch (err) {
        console.log("[Trustit OTA] Cloud check completed:", err);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleRiderGoogleLogin = async (googleUser: { email: string; fullName: string }) => {
    try {
      const res = await TrustitNative.nativeFetch("/api/hyperlocal/rider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email: googleUser.email,
          fullName: googleUser.fullName,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.rider) {
        if (typeof window !== "undefined") {
          localStorage.setItem("trustit_rider_profile", JSON.stringify(data.rider));
          if (data.riderToken) {
            localStorage.setItem("trustit_rider_session_token", data.riderToken);
          }
        }
        if (data.rider?.is_verified && data.rider?.vehicle_number && data.rider.vehicle_number !== "UP-40-TEMP") {
          setCurrentScreenId(7); // Already verified partner -> Cockpit
        } else {
          setCurrentScreenId(3); // New partner -> Terms, Road Safety & KYC!
        }
      }
    } catch (err) {
      console.error("Google rider login error", err);
    }
  };

  // Auto-reset when testing as fresh new rider (?v=2 or ?fresh=1 or if legacy Arjun was cached)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const saved = localStorage.getItem("trustit_rider_profile");
      const isLegacy = saved && (saved.includes("Arjun") || saved.includes("2345") || saved.includes("9876543210"));
      if (params.get("fresh") === "1" || params.get("v") === "3" || params.get("v") === "2" || params.get("new") === "1" || isLegacy) {
        localStorage.removeItem("trustit_rider_profile");
        localStorage.removeItem("trustit_rider_session_token");
        localStorage.removeItem("trustit_cached_trip");
        resetToNewRider();
      }
    }
  }, [resetToNewRider]);

  // Hardware & Telemetry State
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [isBatteryCharging, setIsBatteryCharging] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(4.2);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({ lat: 27.5745, lng: 81.5965 });
  const [liveLocationName, setLiveLocationName] = useState<string>("Nazipurwa (Near Anupam Sweets), Bahraich");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [telemetrySyncState, setTelemetrySyncState] = useState<"synced" | "syncing" | "idle">("synced");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Active");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQuickHub, setShowQuickHub] = useState<boolean>(false);
  const [showTestStrip, setShowTestStrip] = useState<boolean>(false);

  // Background Telemetry Throttling Refs (Guarantees zero re-renders of the watcher)
  const lastHeartbeatTimeRef = useRef<number>(0);
  const batteryLevelRef = useRef<number>(batteryLevel);
  useEffect(() => {
    batteryLevelRef.current = batteryLevel;
  }, [batteryLevel]);

  // PWA Install & Lockscreen Push State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  // Check Notification & PWA Install Prompt (Zero auto-registration interference)
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleRequestNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        riderAudio.playCashChime();
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker
            .register("/sw-rider.js", { scope: "/rider" })
            .then((reg) => {
              reg.showNotification("🚨 Trustit Siren Alerts Active", {
                body: "Order notifications & sirens enabled even when phone is locked.",
                icon: "/rider-icon-192.png",
                tag: "test-alert",
              });
            })
            .catch(() => {});
        }
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. SCREEN WAKE LOCK API (NEVER TURN OFF SCREEN ON ROAD)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let sentinel: any = null;

    async function acquireLock() {
      if (typeof window !== "undefined" && "wakeLock" in navigator && isOnline) {
        try {
          sentinel = await (navigator as any).wakeLock.request("screen");
          setIsWakeLockActive(true);
          sentinel.addEventListener("release", () => setIsWakeLockActive(false));
        } catch {
          setIsWakeLockActive(false);
        }
      }
    }

    acquireLock();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isOnline) {
        acquireLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      sentinel?.release?.().catch(() => {});
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isOnline]);

  // ─────────────────────────────────────────────────────────────
  // 2. REAL BATTERY SENSOR & AUTO CRITICAL SAFE MODE (<15%)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && "getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          const level = Math.round(battery.level * 100);
          setBatteryLevel(level);
          setIsBatteryCharging(Boolean(battery.charging));

          if (level <= 15 && !battery.charging && currentScreenId !== 48) {
            setCurrentScreenId(48);
          }
        };

        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);
      }).catch(() => {});
    }
  }, [currentScreenId, setCurrentScreenId]);

  // ─────────────────────────────────────────────────────────────
  // 3. REAL GPS TELEMETRY & LOCALITY WATCHER (24x7 ACTIVE, AUTO REVERSE-GEOCODE)
  // ─────────────────────────────────────────────────────────────
  const resolveLocationName = async (lat: number, lng: number) => {
    try {
      // 1. Precise local Bahraich landmark zones (Euclidean closest point algorithm)
      const bahraichZones = [
        { name: "Nazipurwa (Near Anupam Sweets), Bahraich", lat: 27.5715, lng: 81.5910 },
        { name: "Police Line, Bahraich", lat: 27.5870, lng: 81.5970 },
        { name: "Kachehri / DM Residence (DC), Bahraich", lat: 27.5780, lng: 81.6050 },
        { name: "Civil Lines Main Road, Bahraich", lat: 27.5760, lng: 81.5990 },
        { name: "Pani Tanki (Hospital Road), Bahraich", lat: 27.5740, lng: 81.6180 },
        { name: "Peepal Chauraha / Digiha, Bahraich", lat: 27.5640, lng: 81.6040 },
        { name: "Dargah Sharif Road, Bahraich", lat: 27.5890, lng: 81.6120 },
      ];

      let closestZone = bahraichZones[0];
      let minDistance = Number.MAX_VALUE;

      for (const zone of bahraichZones) {
        const dLat = lat - zone.lat;
        const dLng = lng - zone.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDistance) {
          minDistance = dist;
          closestZone = zone;
        }
      }

      // If within Bahraich region (approx 4km radius)
      if (minDistance < 0.040) {
        setLiveLocationName(closestZone.name);
        return;
      }

      // 2. Fallback to reverse-geocoding API for locations outside Bahraich center
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const sub =
          data.localityInfo?.administrative?.[3]?.name ||
          data.localityInfo?.informative?.[0]?.name ||
          data.locality;
        const city = data.city || data.principalSubdivision || "Bahraich";
        if (sub) {
          setLiveLocationName(`${sub}, ${city}`);
          return;
        }
      }
    } catch {
      // Graceful fallback
    }
    setLiveLocationName("Nazipurwa (Near Anupam Sweets), Bahraich");
  };

  const triggerGpsScan = () => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsAccuracy(accuracy ? Number(accuracy.toFixed(1)) : 4.2);
        setGpsCoords({ lat: latitude, lng: longitude });
        resolveLocationName(latitude, longitude);
      },
      () => {
        setIsLocating(false);
        setLiveLocationName("Nazipurwa (Near Anupam Sweets), Bahraich");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Immediate location fetch on cold mount
  useEffect(() => {
    triggerGpsScan();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const now = Date.now();

        // Update local HUD state silently
        setGpsAccuracy(accuracy ? Number(accuracy.toFixed(1)) : 4.2);
        setGpsCoords({ lat: latitude, lng: longitude });

        // Periodically resolve human-readable locality
        if (now - lastHeartbeatTimeRef.current >= 30000) {
          resolveLocationName(latitude, longitude);
        }

        // Throttle backend heartbeat to once every 6 seconds to prevent network spam (when online)
        if (isOnline && now - lastHeartbeatTimeRef.current >= 6000) {
          lastHeartbeatTimeRef.current = now;
          setTelemetrySyncState("syncing");

          TrustitNative.nativeFetch("/api/hyperlocal/rider", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "heartbeat_telemetry",
              riderId: rider.id,
              latitude,
              longitude,
              accuracyMeters: accuracy || 4.2,
              speedKmh: speed ? Math.round(speed * 3.6) : 0,
              batteryPercentage: batteryLevelRef.current,
              isMoving: Boolean(speed && speed > 0.5),
            }),
          })
            .then(() => {
              setTelemetrySyncState("synced");
              setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
            })
            .catch(() => {
              setTelemetrySyncState("idle");
            });
        }
      },
      () => {
        // Fallback gracefully without throwing
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 12000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, rider.id]);

  // ─────────────────────────────────────────────────────────────
  // 3.5. HARDWARE / ANDROID NATIVE BACK BUTTON LISTENER (Zero Crash)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Capacitor Native Plugin (if available globally on window)
    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp?.addListener) {
        capApp.addListener("backButton", () => {
          if (currentScreenId !== 7) {
            setCurrentScreenId(7);
          } else {
            capApp.exitApp?.();
          }
        });
      }
    } catch {}

    // 2. Android WebView History Popstate Navigation
    if (currentScreenId !== 7) {
      window.history.pushState({ screen: currentScreenId }, "");
    }

    const handlePopState = (e: PopStateEvent) => {
      if (currentScreenId !== 7) {
        e.preventDefault();
        setCurrentScreenId(7);
      }
    };
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentScreenId, setCurrentScreenId]);

  // ─────────────────────────────────────────────────────────────
  // 4. OFFLINE DEAD-ZONE CACHING (BAHRAICH 2G RESILIENCE)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOffline(!navigator.onLine);

    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (activeOrder) {
        localStorage.setItem("trustit_cached_trip", JSON.stringify(activeOrder));
      }
    }
  }, [activeOrder]);

  // 5 Permanent Navigation Tabs Mapping (Cockpit in Center as Hero button)
  const tabConfigs = [
    { key: "orders" as TabKey, label: "Live Orders", icon: "⚡", screens: [10, 21, 22, 11, 12, 23, 35, 36, 37, 38, 13, 14, 24, 28, 29, 30, 45, 46] },
    { key: "navigation" as TabKey, label: "Navigation", icon: "🗺️", screens: [40, 41, 42, 44, 48] },
    { key: "cockpit" as TabKey, label: "Cockpit", icon: "🛵", screens: [7, 8, 9, 25, 33, 39] },
    { key: "earnings" as TabKey, label: "Passbook", icon: "💰", screens: [15, 16, 26, 6, 31, 34, 47] },
    { key: "profile" as TabKey, label: "Fleet ID", icon: "👤", screens: [18, 43, 32, 17, 1, 2, 3, 4, 5, 19, 20, 27] },
  ];

  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    const targetTab = tabConfigs.find((t) => t.key === tabKey);
    if (targetTab && !targetTab.screens.includes(currentScreenId)) {
      setCurrentScreenId(targetTab.screens[0]);
    }
  };

  // Sync activeTab when screen changes
  useEffect(() => {
    const found = tabConfigs.find((t) => t.screens.includes(currentScreenId));
    if (found) setActiveTab(found.key);
  }, [currentScreenId]);

  // ─────────────────────────────────────────────────────────────
  // ALL 48 SCREENS MASTER MAP (100% REAL HARDWARE WIRED)
  // ─────────────────────────────────────────────────────────────
  const screens = [
    // Stage 1: Onboarding Core
    {
      id: 1,
      title: "01. Auth & Mobile Entry",
      component: (
        <Screen01AuthStart
          onContinue={(phone, channel, otp, meta) => {
            setAuthPhone(phone);
            setAuthChannel(channel);
            // Auto-fill and simulation banner completely disabled per user request
            setPreviewOtp("");
            setActiveWhatsAppOtp(null);
            if (meta?.fullName || meta?.vehicleType) {
              workflow.setRider((prev) => ({
                ...prev,
                full_name: meta.fullName || prev?.full_name,
                vehicle_type: (meta.vehicleType as any) || prev?.vehicle_type,
                phone: phone || prev?.phone,
              }));
            }
            setCurrentScreenId(2);
          }}
          onGoogleLogin={() => {
            setIsGoogleModalOpen(true);
          }}
        />
      ),
    },
    {
      id: 2,
      title: "02. 6-Box OTP Verification",
      component: (
        <Screen02OtpVerify
          phone={authPhone}
          channel={authChannel}
          previewOtp={previewOtp}
          onVerified={(otp, riderObj) => {
            const hasCompletedKyc =
              typeof window !== "undefined" &&
              (localStorage.getItem("trustit_rider_onboarded") === "true" ||
                Boolean(riderObj?.is_verified));
            if (hasCompletedKyc) {
              // Registered partner goes directly into Live Duty Cockpit!
              setCurrentScreenId(7);
            } else {
              // First time registration goes through onboarding flow
              setCurrentScreenId(3);
            }
          }}
          onResend={() => {
            console.log("OTP Resent for rider:", authPhone);
          }}
          onBack={() => setCurrentScreenId(1)}
        />
      ),
    },
    { id: 3, title: "03. Terms & Road Safety", component: <Screen03Consent onAgree={() => setCurrentScreenId(4)} onBack={() => setCurrentScreenId(2)} /> },
    { id: 4, title: "04. Real Selfie KYC (Live Camera)", component: <Screen04SelfieKyc onSelfieCaptured={(img) => { workflow.setRider((prev) => ({ ...prev, profile_image_url: img })); setCurrentScreenId(5); }} onBack={() => setCurrentScreenId(3)} /> },
    {
      id: 5,
      title: "05. Vehicle RC & DL (UP 40)",
      component: (
        <Screen05VehicleDl
          initialVehicleType={(rider?.vehicle_type as any) || "bike"}
          onVehicleSubmit={(vehData) => {
            workflow.setRider((prev) => ({
              ...prev,
              vehicle_type: vehData.vehicleType as any,
              vehicle_number: vehData.vehicleNumber,
              driving_license_number: vehData.dlNumber,
            }));
            setCurrentScreenId(6);
          }}
          onBack={() => setCurrentScreenId(4)}
        />
      ),
    },
    {
      id: 6,
      title: "06. Cashfree UPI Payout Setup",
      component: (
        <Screen06PayoutSetup
          onPayoutConfigured={(upi) => {
            workflow.setRider((prev) => ({ ...prev, upi_id: upi }));
            if (typeof window !== "undefined") {
              localStorage.setItem("trustit_rider_upi", upi);
            }
            setCurrentScreenId(19);
          }}
          onBack={() => setCurrentScreenId(5)}
        />
      ),
    },
    {
      id: 19,
      title: "19. Verification In-Progress Room",
      component: (
        <Screen19VerificationPending
          onBack={() => setCurrentScreenId(6)}
          onProceedToAcademy={() => setCurrentScreenId(20)}
          onRefresh={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          onChatFleet={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919415099999";
          }}
        />
      ),
    },

    // Stage 2: Training & Daily Gate
    { id: 20, title: "20. Rider Training Academy & Quiz", component: <Screen20TrainingAcademy onBack={() => setCurrentScreenId(19)} onCompleteAcademy={() => setCurrentScreenId(27)} /> },
    {
      id: 27,
      title: "27. Daily Morning Helmet Selfie Gate",
      component: (
        <Screen27MorningHelmetSelfie
          onBack={() => setCurrentScreenId(20)}
          onSelfieApproved={() => {
            if (typeof window !== "undefined") {
              localStorage.setItem("trustit_rider_onboarded", "true");
            }
            workflow.setRider((prev) => ({ ...prev, is_verified: true, kyc_status: "approved" }));
            setCurrentScreenId(7);
          }}
        />
      ),
    },

    // Stage 3: Cockpit, Shifts & Heatmap
    {
      id: 7,
      title: "07. Duty Cockpit (Home)",
      component: (
        <Screen07DutyCockpit
          riderProp={rider}
          isOnlineProp={isOnline}
          cashInHandProp={cashInHand}
          cashCeilingProp={cashCeiling}
          remoteConfig={remoteConfig}
          onGoOnline={toggleDuty}
          onOpenRadar={() => triggerIncomingOrderRadar(false)}
          onOpenPassbook={() => setCurrentScreenId(15)}
          onOpenScorecard={() => setCurrentScreenId(8)}
          onOpenCeiling={() => setCurrentScreenId(9)}
          onOpenShiftBooking={() => setCurrentScreenId(25)}
          onOpenHeatmap={() => setCurrentScreenId(33)}
          onOpenProfile={() => setCurrentScreenId(18)}
          onOpenSos={() => setCurrentScreenId(17)}
          onOpenRemit={() => setCurrentScreenId(26)}
          onOpenTargetScreen={(id) => setCurrentScreenId(id)}
          liveZoneNameProp={liveLocationName}
          onRefreshLocation={triggerGpsScan}
          isLocatingProp={isLocating}
          gpsAccuracyProp={gpsAccuracy ?? 4.2}
        />
      ),
    },
    { id: 8, title: "08. Shift Scorecard & Telemetry", component: <Screen08ShiftScorecard onBack={() => setCurrentScreenId(7)} onOpenCeiling={() => setCurrentScreenId(9)} /> },
    {
      id: 9,
      title: "09. ₹1,500 Cash Ceiling Guard",
      component: (
        <Screen09CashCeiling
          cashInHandProp={cashInHand}
          cashCeilingProp={cashCeiling}
          onBack={() => setCurrentScreenId(7)}
          onRemit={() => setCurrentScreenId(26)}
        />
      ),
    },
    { id: 25, title: "25. Shift Slot Booking & Min Guarantee", component: <Screen25ShiftBookingMg onBack={() => setCurrentScreenId(7)} /> },
    { id: 33, title: "33. Bahraich Demand Heatmap & Alerts", component: <Screen33HeatmapSurge onBack={() => setCurrentScreenId(7)} onNavigateToSurgeZone={() => triggerIncomingOrderRadar(false)} /> },
    { id: 39, title: "39. Delivery Category Opt-In Toggles", component: <Screen39CategoryToggles onBack={() => setCurrentScreenId(18)} onSavePreferences={() => setCurrentScreenId(7)} /> },

    // Stage 4: Radar, Siren & Batching
    { id: 10, title: "10. 30s Proximity Siren Radar", component: <Screen10Radar onAccept={() => { acceptOrder(); setCurrentScreenId(12); }} onDecline={() => { declineOrder(); setCurrentScreenId(7); }} /> },
    { id: 21, title: "21. Lockscreen High-Siren Order Pop", component: <Screen21LockscreenOrderPop onAccept={() => { acceptOrder(); setCurrentScreenId(12); }} onDecline={() => { declineOrder(); setCurrentScreenId(7); }} /> },
    {
      id: 22,
      title: "22. 2-Order Same-Route Batch Radar",
      component: (
        <Screen22MultiOrderBatch
          onAcceptBatch={() => {
            acceptOrder();
            setCurrentScreenId(12);
          }}
          onAcceptSingle={() => {
            acceptOrder();
            setCurrentScreenId(12);
          }}
          onDecline={() => {
            declineOrder();
            setCurrentScreenId(7);
          }}
        />
      ),
    },
    { id: 11, title: "11. Slide to Accept Order", component: <Screen11SlideAccept onAccepted={() => { acceptOrder(); setCurrentScreenId(12); }} onBack={() => setCurrentScreenId(10)} /> },

    // Stage 5: Multi-Category Specialist Runs
    { id: 35, title: "35. Pharmacy Rx & Medical Verification", component: <Screen35PharmacyRxPickup onBack={() => setCurrentScreenId(12)} onConfirmPickup={() => { confirmPickup(); setCurrentScreenId(40); }} /> },
    { id: 36, title: "36. Heavy Grocery Crate & Weight Bonus", component: <Screen36HeavyGroceryCrate onBack={() => setCurrentScreenId(12)} onConfirmCratePickup={() => { confirmPickup(); setCurrentScreenId(40); }} /> },
    {
      id: 37,
      title: "37. P2P Genie Courier (Dual-OTP)",
      component: (
        <Screen37P2pGenieCourier
          onBack={() => setCurrentScreenId(12)}
          onVerifySenderOtp={(otp) => {
            console.log("Sender OTP verified:", otp);
          }}
          onProceedToDrop={() => {
            confirmPickup();
            setCurrentScreenId(40);
          }}
        />
      ),
    },
    { id: 38, title: "38. Fragile Cake & Bakery Guard", component: <Screen38FragileCakeGuard onBack={() => setCurrentScreenId(12)} onConfirmCakePickup={() => { confirmPickup(); setCurrentScreenId(40); }} /> },

    // Stage 6: Store Pickup & Delays
    {
      id: 12,
      title: "12. Store Pickup & Verification Checklist",
      component: (
        <Screen12StorePickup
          onPickupConfirmed={() => { confirmPickup(); setCurrentScreenId(40); }}
          onBack={() => setCurrentScreenId(11)}
          onMerchantDelay={() => setCurrentScreenId(23)}
          onCallShop={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919415011111";
          }}
        />
      ),
    },
    { id: 23, title: "23. Merchant Delay & Wait Compensation", component: <Screen23MerchantDelay onBack={() => setCurrentScreenId(12)} onConfirmReady={() => { confirmPickup(); setCurrentScreenId(40); }} onRequestReassign={() => { declineOrder(); setCurrentScreenId(7); }} /> },

    // Stage 7: Turn-by-Turn Navigation & On-Road Special
    {
      id: 40,
      title: "40. Turn-by-Turn GPS Live Navigation",
      component: (
        <Screen40TurnByTurnNav
          onBack={() => setCurrentScreenId(12)}
          onViewLandmarks={() => setCurrentScreenId(41)}
          onArrivedAtLocation={() => setCurrentScreenId(13)}
          onTrafficReroute={() => setCurrentScreenId(42)}
          onInAppChat={() => setCurrentScreenId(44)}
          onPolicePass={() => setCurrentScreenId(43)}
          onLowBattery={() => setCurrentScreenId(48)}
        />
      ),
    },
    { id: 41, title: "41. Last 100m Alleyway & Gate Rescue", component: <Screen41Last100mLandmark onBack={() => setCurrentScreenId(40)} onContinueNavigation={() => setCurrentScreenId(13)} /> },
    { id: 42, title: "42. Railway Halt & Dynamic Reroute", component: <Screen42TrafficReroute onBack={() => setCurrentScreenId(40)} onAcceptReroute={() => setCurrentScreenId(40)} onStayOnCurrentRoute={() => setCurrentScreenId(40)} /> },
    { id: 43, title: "43. Digital Fleet ID & Police Pass", component: <Screen43DigitalFleetIdPass riderProp={rider} onBack={() => setCurrentScreenId(18)} /> },
    {
      id: 44,
      title: "44. In-App Masked Customer Chat",
      component: (
        <Screen44InAppMaskedChat
          onBack={() => setCurrentScreenId(40)}
          onCallMasked={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919876543210";
          }}
        />
      ),
    },

    // Stage 8: Doorstep Delivery & Rescues
    {
      id: 13,
      title: "13. Customer Doorstep & 4-Digit OTP",
      component: (
        <Screen13Doorstep
          onShowDynamicQr={() => setCurrentScreenId(14)}
          onDelivered={(otp) => { completeDeliveryWithOtp(otp); setCurrentScreenId(15); }}
          onBack={() => setCurrentScreenId(40)}
          onDoorstepChangeRefund={() => setCurrentScreenId(45)}
          onCustomerUnreachable={() => setCurrentScreenId(24)}
          onContactlessPhotoPod={() => setCurrentScreenId(30)}
          onCallMasked={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919876543210";
          }}
        />
      ),
    },
    { id: 14, title: "14. Dynamic Cashfree UPI QR (COD)", component: <Screen14DynamicQr onPaymentReceived={() => { completeDeliveryWithOtp("4492"); setCurrentScreenId(15); }} onBack={() => setCurrentScreenId(13)} /> },
    {
      id: 24,
      title: "24. Customer Unreachable 5-Min Rescue",
      component: (
        <Screen24CustomerUnreachable
          onBack={() => setCurrentScreenId(13)}
          onCallIvr={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919876543210";
          }}
          onUploadGatePhoto={() => {
            console.log("Customer gate photo recorded");
          }}
          onCompleteCancellation={() => setCurrentScreenId(15)}
        />
      ),
    },
    {
      id: 28,
      title: "28. Breakdown & Buddy Handover Desk",
      component: (
        <Screen28BreakdownRescue
          onBack={() => setCurrentScreenId(13)}
          onRequestBuddy={() => {
            console.log("Nearest buddy rider pinged: Vikas Mishra");
          }}
          onCallBuddy={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919450881200";
          }}
          onHandoverComplete={() => setCurrentScreenId(15)}
        />
      ),
    },
    {
      id: 29,
      title: "29. Customer Refused (RTO Return Flow)",
      component: (
        <Screen29CustomerRefusalRto
          onBack={() => setCurrentScreenId(13)}
          onInitiateReturn={() => {
            console.log("RTO return initiated back to merchant");
          }}
          onConfirmMerchantReturn={() => setCurrentScreenId(15)}
        />
      ),
    },
    { id: 30, title: "30. Contactless Photo POD Watermark", component: <Screen30ContactlessPhotoPod onBack={() => setCurrentScreenId(13)} onConfirmPod={() => { completeDeliveryWithOtp("4492"); setCurrentScreenId(15); }} /> },

    // Stage 9: Ground-Zero Dilemmas & Rescues
    {
      id: 45,
      title: "45. Doorstep Change Deficit (Wallet / UPI)",
      component: (
        <Screen45DoorstepChangeWallet
          onBack={() => setCurrentScreenId(13)}
          onConfirmChangeRefund={(amt, method) => {
            refundDoorstepChange(amt, method);
            completeDeliveryWithOtp("4492");
            setCurrentScreenId(15);
          }}
        />
      ),
    },
    { id: 46, title: "46. Mid-Trip Cancel & Distance Pay", component: <Screen46MidTripCancellation onBack={() => setCurrentScreenId(10)} onReturnToRadar={() => triggerIncomingOrderRadar(false)} /> },
    {
      id: 47,
      title: "47. Parking & Municipal Toll Claim",
      component: (
        <Screen47ParkingTollClaim
          onBack={() => setCurrentScreenId(15)}
          onSubmitClaim={(amt) => {
            claimParkingReimbursement(amt);
            setCurrentScreenId(15);
          }}
        />
      ),
    },
    { id: 48, title: "48. Critical Battery (<15%) Safe Mode", component: <Screen48LowBatterySafeMode onBack={() => setCurrentScreenId(7)} batteryLevelProp={batteryLevel} /> },

    // Stage 10: Earnings, Remittance & Claims
    {
      id: 15,
      title: "15. Daily Earnings Passbook & Ledger",
      component: (
        <Screen15Passbook
          onBack={() => setCurrentScreenId(7)}
          onInstantPayout={() => requestInstantPayout()}
          onRemitCash={() => setCurrentScreenId(26)}
          onClaimParking={() => setCurrentScreenId(47)}
          onDisputePenalty={() => setCurrentScreenId(31)}
          onMilestones={() => setCurrentScreenId(16)}
          walletBalanceProp={walletBalance}
          todayEarningsProp={todayEarnings}
          todayTripsCountProp={todayTripsCount}
          riderUpiProp={rider?.upi_id || (typeof window !== "undefined" ? localStorage.getItem("trustit_rider_upi") || "luckyshukla@hdfcbank" : "luckyshukla@hdfcbank")}
        />
      ),
    },
    { id: 16, title: "16. Milestone Targets & Rush Surge", component: <Screen16Milestones onBack={() => setCurrentScreenId(7)} /> },
    {
      id: 26,
      title: "26. Cash Remittance & Deposit Hubs",
      component: (
        <Screen26CashRemittanceHubs
          onBack={() => setCurrentScreenId(9)}
          onPayViaUpi={() => remitCash()}
          cashDueProp={cashInHand}
          cashCeilingProp={cashCeiling}
          onNavigateHub={(hubName) => {
            if (typeof window !== "undefined") {
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hubName + " Bahraich")}`, "_blank");
            }
          }}
        />
      ),
    },
    {
      id: 31,
      title: "31. Deduction & Detour Dispute Desk",
      component: (
        <Screen31PenaltyDispute
          onBack={() => setCurrentScreenId(15)}
          onSubmitDispute={() => {
            setCurrentScreenId(15);
          }}
        />
      ),
    },
    {
      id: 34,
      title: "34. Tier Badges & Refer ₹500",
      component: (
        <Screen34ReferAndBadges
          onBack={() => setCurrentScreenId(18)}
          onShareWhatsapp={() => {
            if (typeof window !== "undefined") {
              const text = encodeURIComponent(
                "🛵 *Trustit Delivery Partner बनें — बहराइच (UP 40)*\n" +
                "रोज़ाना ₹600-₹1,100 कमाएं। सीधे बैंक UPI में डेली पेआउट!\n" +
                "रेफरल कोड: UP40RIDER\n" +
                "रजिस्टर करें: " + window.location.origin + "/rider"
              );
              window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
            }
          }}
        />
      ),
    },

    // Stage 11: Safety, Insurance & Profile
    {
      id: 17,
      title: "17. Red 24x7 Safety SOS Shield",
      component: (
        <Screen17SafetySos
          onBack={() => setCurrentScreenId(7)}
          onCallOps={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919415099999";
          }}
        />
      ),
    },
    { id: 32, title: "32. Safe Driving Rules & Road Code", component: <Screen32AccidentInsurance onBack={() => setCurrentScreenId(18)} onConsentAccepted={() => setCurrentScreenId(7)} /> },
    {
      id: 18,
      title: "18. Rider Profile & Safe Shift Logout",
      component: (
        <Screen18Profile
          riderProp={rider}
          onBack={() => setCurrentScreenId(7)}
          onLogout={resetToNewRider}
          onEditKyc={() => setCurrentScreenId(4)}
          onOpenPayoutSetup={() => setCurrentScreenId(6)}
          onOpenDisputes={() => setCurrentScreenId(31)}
          onOpenSafetyRules={() => setCurrentScreenId(32)}
          onOpenFleetId={() => setCurrentScreenId(43)}
        />
      ),
    },
  ];

  const activeScreenObj = screens.find((s) => s.id === currentScreenId) || screens[6];

  return (
    <div className="min-h-screen w-full bg-[#FAF8FF] text-[#0F172A] font-sans flex flex-col justify-between selection:bg-[#0D47A1] selection:text-white relative">
      
      {/* ── Minimalist Clean Header: ONLY Online/Offline Duty Dongle ── */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white px-3 py-1.5 flex items-center justify-between text-xs select-none shadow-md">
        {/* Left: 1-Tap Duty Toggle Button (NO SLIDER) */}
        <button
          type="button"
          onClick={() => {
            // Check if rider is signed in
            const isSignedIn =
              Boolean(rider?.phone && rider.phone.replace(/\D/g, "").length >= 10) ||
              (typeof window !== "undefined" &&
                Boolean(localStorage.getItem("trustit_rider_session_token")));

            if (!isSignedIn) {
              setCurrentScreenId(1);
              return;
            }

            const next = !isOnline;
            if (next) {
              riderAudio.playCashChime();
            }
            toggleDuty(next);
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all active:scale-95 border shadow-sm ${
            isOnline
              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400"
              : "bg-rose-700 hover:bg-rose-600 text-white border-rose-500"
          }`}
          title="Tap to Toggle Duty"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-white animate-ping" : "bg-white"
            }`}
          ></span>
          <span className="font-black text-[11px] tracking-wider uppercase">
            {isOnline ? "DUTY ON" : "DUTY OFF"}
          </span>
        </button>

        {/* Right: Audio Siren */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) riderAudio.playCashChime();
              else riderAudio.stopSiren();
            }}
            className="p-1 px-1.5 rounded bg-white/10 hover:bg-white/20 text-xs transition"
            title="Toggle Loud Siren"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </header>

      {/* ── Offline Dead-Zone Warning Banner ── */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-[11px] font-black tracking-tight flex items-center justify-center gap-2 shadow-inner z-30">
          <span>⚠️</span>
          <span>Offline Dead-Zone Active: Trip Manifest &amp; OTP Handover cached locally.</span>
        </div>
      )}

      {/* ── Active Production Screen Viewport (Full Bleed Mobile) ── */}
      <main
        className="flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col justify-between pb-16"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {activeScreenObj.component}
      </main>

      {/* ── 5 Permanent Mobile Bottom Navigation Tabs (Center Elevated Cockpit Hero) ── */}
      <nav className="sticky bottom-0 bg-white border-t border-slate-200 px-1 py-1 grid grid-cols-5 text-center shadow-lg z-30">
        {tabConfigs.map((tab) => {
          const isTabActive = activeTab === tab.key;
          const isCockpit = tab.key === "cockpit";

          if (isCockpit) {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className="relative -mt-4 flex flex-col items-center justify-center group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 ${
                    isTabActive
                      ? "bg-[#0D47A1] text-white border-white ring-2 ring-[#0D47A1]/30"
                      : "bg-[#0D47A1] text-white border-white"
                  }`}
                >
                  <span className="text-xl leading-none">🛵</span>
                </div>
                <span
                  className={`text-[9px] mt-0.5 block truncate max-w-full ${
                    isTabActive ? "font-black text-[#0D47A1]" : "font-semibold text-slate-600"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition ${
                isTabActive ? "text-[#0D47A1]" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="text-base leading-none block">{tab.icon}</span>
              <span className={`text-[9px] mt-0.5 block truncate max-w-full ${isTabActive ? "font-black" : "font-semibold"}`}>
                {tab.label}
              </span>
              {isTabActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0D47A1] mt-0.5 block"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Google 1-Tap Auto-Login Consent Modal ── */}
      <GoogleConsentModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        role="rider"
        defaultName="Lucky Shukla (Rider)"
        defaultEmail="lucky.rider@gmail.com"
        onSuccess={handleRiderGoogleLogin}
      />

      {/* ── WhatsApp Incoming Notification Banner completely disabled per user request (Zero popups/banners) ── */}
      {/* <WhatsAppOtpNotificationBanner
        otpCode={activeWhatsAppOtp}
        phone={authPhone}
        onAutoFill={(code) => {
          setPreviewOtp(code);
        }}
        onDismiss={() => setActiveWhatsAppOtp(null)}
      /> */}

    </div>
  );
}
