"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRiderWorkflow, clearAllRiderStorage } from "@/app/rider/hooks/useRiderWorkflow";
import { riderAudio } from "@/lib/audio/rider-siren";
import WhatsAppOtpNotificationBanner from "@/components/auth/WhatsAppOtpNotificationBanner";
import { TrustitNative } from "@/lib/native/trustit-native-service";

// 18 Core Screens
import Screen01AuthStart from "@/app/rider/components/screens/Screen01AuthStart";
import Screen02OtpVerify from "@/app/rider/components/screens/Screen02OtpVerify";
import Screen02BasicProfile from "@/app/rider/components/screens/Screen02BasicProfile";
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
    requestOrderCancellation,
    claimWaitCompensation,
    refundDoorstepChange,
    claimParkingReimbursement,
    recentCancelledOrder,
    remitCash,
    handleGoogleLogin,
    requestInstantPayout,
    resetToNewRider,
    sessionNotice,
    setSessionNotice,
  } = workflow;

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState<TabKey>("cockpit");

  // Dynamic Auth State
  const [authPhone, setAuthPhone] = useState<string>("");
  const [authChannel, setAuthChannel] = useState<"sms" | "whatsapp">("whatsapp");
  const [previewOtp, setPreviewOtp] = useState<string>("");
  const [activeWhatsAppOtp, setActiveWhatsAppOtp] = useState<string | null>(null);

  // Auto-reset when testing as fresh new rider (?v=2 or ?fresh=1 or if legacy Arjun was cached)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const saved = localStorage.getItem("trustit_rider_profile");
      const isLegacy = saved && (saved.includes("Arjun") || saved.includes("2345") || saved.includes("9876543210"));
      if (params.get("fresh") === "1" || params.get("v") === "3" || params.get("v") === "2" || params.get("new") === "1" || isLegacy) {
        clearAllRiderStorage();
        resetToNewRider();
      }
    }
  }, [resetToNewRider]);

  // Hardware & Telemetry State
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [isBatteryCharging, setIsBatteryCharging] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [liveLocationName, setLiveLocationName] = useState<string>("Locating GPS...");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [telemetrySyncState, setTelemetrySyncState] = useState<"synced" | "syncing" | "idle">("synced");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Active");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showQuickHub, setShowQuickHub] = useState<boolean>(false);
  const [showTestStrip, setShowTestStrip] = useState<boolean>(false);

  // Background Telemetry Throttling Refs (Guarantees zero re-renders of the watcher)
  const lastHeartbeatTimeRef = useRef<number>(0);
  const lastGeocodeTimeRef = useRef<number>(0);
  const lastGeocodedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const batteryLevelRef = useRef<number>(batteryLevel);
  useEffect(() => {
    batteryLevelRef.current = batteryLevel;
  }, [batteryLevel]);

  const currentScreenIdRef = useRef<number>(currentScreenId);
  useEffect(() => {
    currentScreenIdRef.current = currentScreenId;
  }, [currentScreenId]);

  const activeOrderRef = useRef(activeOrder);
  useEffect(() => {
    activeOrderRef.current = activeOrder;
  }, [activeOrder]);

  const hasShownLowBatteryAlertRef = useRef<boolean>(false);

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
    if (typeof window === "undefined" || !("getBattery" in navigator)) return;

    let cancelled = false;
    let batteryObj: any = null;
    const updateBattery = () => {
      if (!batteryObj || cancelled) return;
      const level = Math.round(batteryObj.level * 100);
      const charging = Boolean(batteryObj.charging);
      setBatteryLevel(level);
      setIsBatteryCharging(charging);

      if (level <= 15 && !charging) {
        if (!hasShownLowBatteryAlertRef.current) {
          hasShownLowBatteryAlertRef.current = true;
          if (currentScreenIdRef.current !== 48) {
            setCurrentScreenId(48);
          }
        }
      } else {
        hasShownLowBatteryAlertRef.current = false;
      }
    };

    (navigator as any).getBattery().then((battery: any) => {
      if (cancelled) return;
      batteryObj = battery;
      updateBattery();
      battery.addEventListener("levelchange", updateBattery);
      battery.addEventListener("chargingchange", updateBattery);
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (batteryObj) {
        batteryObj.removeEventListener("levelchange", updateBattery);
        batteryObj.removeEventListener("chargingchange", updateBattery);
      }
    };
  }, [setCurrentScreenId]);

  // ─────────────────────────────────────────────────────────────
  // 3. REAL GPS TELEMETRY & LOCALITY WATCHER (24x7 ACTIVE, AUTO REVERSE-GEOCODE)
  // ─────────────────────────────────────────────────────────────
  const resolveLocationName = async (lat: number, lng: number) => {
    try {
      // 1. High-precision Reverse-Geocoding via server proxy (Mapbox / Google Maps / Nominatim)
      const res = await TrustitNative.nativeFetch(
        `/api/hyperlocal/reverse-geocode?lat=${lat}&lng=${lng}`,
        { method: "GET" }
      );
      if (res && res.status === 200) {
        const data = await res.json();
        if (data && data.locationName) {
          setLiveLocationName(data.locationName);
          lastGeocodedCoordsRef.current = { lat, lng };
          lastGeocodeTimeRef.current = Date.now();
          return;
        }
      }
    } catch {
      // Direct fetch fallback if nativeFetch is unavailable
      try {
        const res = await fetch(`/api/hyperlocal/reverse-geocode?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.locationName) {
            setLiveLocationName(data.locationName);
            lastGeocodedCoordsRef.current = { lat, lng };
            lastGeocodeTimeRef.current = Date.now();
            return;
          }
        }
      } catch {}
    }

    // Honest live coordinate fallback when offline or resolving fails (Zero fake landmarks)
    setLiveLocationName(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const processLocationUpdate = (latitude: number, longitude: number, accuracy?: number, speed?: number) => {
    const now = Date.now();
    if (accuracy) {
      const roundedAcc = Number(accuracy.toFixed(1));
      setGpsAccuracy((prev) => {
        if (prev === null || Math.abs(prev - roundedAcc) >= 0.5) {
          return roundedAcc;
        }
        return prev;
      });
    }
    setGpsCoords({ lat: latitude, lng: longitude });

    // Intelligent Address Resolution (Updates when moved > 100m or after 2 minutes)
    const lastCoords = lastGeocodedCoordsRef.current;
    let shouldGeocode = false;
    if (!lastCoords) {
      shouldGeocode = true;
    } else {
      const dLat = latitude - lastCoords.lat;
      const dLng = longitude - lastCoords.lng;
      const distDegrees = Math.sqrt(dLat * dLat + dLng * dLng);
      // ~0.001 degrees = ~110m
      if (distDegrees >= 0.001 || now - lastGeocodeTimeRef.current >= 120000) {
        shouldGeocode = true;
      }
    }

    if (shouldGeocode) {
      lastGeocodeTimeRef.current = now;
      resolveLocationName(latitude, longitude);
    }

    // Telemetry Heartbeat to Backend Dispatch Engine (Every 5s when online)
    if (isOnline && rider?.id && now - lastHeartbeatTimeRef.current >= 5000) {
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
  };

  const triggerGpsScan = async () => {
    setIsLocating(true);
    // 1. Direct Native Android Hardware GPS Bridge (Instant Satellites / Cell Towers)
    try {
      const nativeLoc = await TrustitNative.getPreciseLocation();
      if (nativeLoc && nativeLoc.latitude && nativeLoc.longitude) {
        setIsLocating(false);
        processLocationUpdate(nativeLoc.latitude, nativeLoc.longitude, nativeLoc.accuracy, nativeLoc.speed);
        return;
      }
    } catch (e) {
      console.warn("[GPS] Native scan fallback:", e);
    }

    // 2. Browser navigator.geolocation Fallback
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude, accuracy, speed } = pos.coords;
          processLocationUpdate(latitude, longitude, accuracy, speed || 0);
        },
        (err) => {
          setIsLocating(false);
          console.warn("[GPS] Current position error:", err);
          setLiveLocationName((prev) => {
            if (!prev || prev === "Locating GPS...") {
              return "GPS Signal Waiting (Enable Location)";
            }
            return prev;
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      setLiveLocationName("GPS Unavailable");
    }
  };

  // Immediate location fetch on cold mount
  useEffect(() => {
    triggerGpsScan();
  }, []);

  // 4. CONTINUOUS LIVE TELEMETRY LOOP (Every 3.5s hardware poll + webview watcher)
  useEffect(() => {
    let watchId: number | null = null;
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed } = pos.coords;
          processLocationUpdate(latitude, longitude, accuracy, speed || 0);
        },
        (err) => {
          console.warn("[GPS] Watch position warning:", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000,
        }
      );
    }

    // Continuous 3.5s hardware polling loop ensures updates even if WebView throttles
    const pollInterval = setInterval(async () => {
      try {
        const nativeLoc = await TrustitNative.getPreciseLocation();
        if (nativeLoc && nativeLoc.latitude && nativeLoc.longitude) {
          processLocationUpdate(nativeLoc.latitude, nativeLoc.longitude, nativeLoc.accuracy, nativeLoc.speed);
        }
      } catch {}
    }, 3500);

    return () => {
      if (watchId !== null && typeof window !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(pollInterval);
    };
  }, [isOnline, rider?.id]);

  // ─────────────────────────────────────────────────────────────
  // 3.5. HARDWARE / ANDROID NATIVE BACK BUTTON (SCREEN HISTORY STACK)
  // ─────────────────────────────────────────────────────────────
  const screenHistoryRef = useRef<number[]>([currentScreenId]);
  const lastBackPressTimeRef = useRef<number>(0);
  const [backToast, setBackToast] = useState<string | null>(null);

  // Synchronize internal history stack whenever currentScreenId advances
  useEffect(() => {
    const stack = screenHistoryRef.current;
    // When entering active pickup/delivery screens, strip transient radar/lockscreen overlays from history
    if (currentScreenId === 12 || currentScreenId === 40) {
      const cleaned = stack.filter((id) => id !== 10 && id !== 11 && id !== 21 && id !== 22);
      screenHistoryRef.current = cleaned.length > 0 ? cleaned : [7];
    }
    const activeStack = screenHistoryRef.current;
    if (activeStack[activeStack.length - 1] !== currentScreenId) {
      activeStack.push(currentScreenId);
    }
  }, [currentScreenId]);

  // Navigate to previous (last) screen, prevent unintentional exit
  const handleHardwareBack = useCallback((): boolean => {
    const stack = screenHistoryRef.current;
    const cur = currentScreenIdRef.current;
    const curOrder = activeOrderRef.current;
    const isRootScreen = cur === 1 || cur === 7 || cur === 19;

    // On Store Pickup (Screen 12) with an active order, return directly to Cockpit (7) instead of Screen 11 loop
    if (cur === 12 && curOrder) {
      screenHistoryRef.current = [7];
      setCurrentScreenId(7);
      return true;
    }

    if (!isRootScreen && stack.length > 1) {
      // Pop the active screen and skip stale transient alert/OTP screens
      stack.pop();
      while (stack.length > 1) {
        const candidate = stack[stack.length - 1];
        if (
          (candidate === 2 && cur !== 2) ||
          (curOrder && (candidate === 10 || candidate === 11 || candidate === 21 || candidate === 22))
        ) {
          stack.pop();
          continue;
        }
        break;
      }
      let previousScreen = stack[stack.length - 1] || (cur === 1 ? 1 : 7);
      if (previousScreen === 2 && cur !== 2) {
        previousScreen = 1;
      }
      setCurrentScreenId(previousScreen);
      return true;
    }

    // At root screen (Screen 01, Screen 07 Cockpit, or Screen 19 Pending)
    const now = Date.now();
    if (now - lastBackPressTimeRef.current < 2000) {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp?.exitApp) {
        capApp.exitApp();
        return true;
      }
      return false;
    }

    lastBackPressTimeRef.current = now;
    setBackToast("Press back again to exit");
    setTimeout(() => setBackToast(null), 2000);
    return true;
  }, [setCurrentScreenId]);

  const handleHardwareBackRef = useRef<() => boolean>(handleHardwareBack);
  useEffect(() => {
    handleHardwareBackRef.current = handleHardwareBack;
  }, [handleHardwareBack]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let listenerHandle: any = null;
    const invokeBack = () => handleHardwareBackRef.current();

    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp?.addListener) {
        capApp.addListener("backButton", invokeBack).then((h: any) => {
          if (cancelled) {
            h?.remove?.();
          } else {
            listenerHandle = h;
          }
        });
      }
    } catch {}

    // Maintain WebView history buffer once on mount so native Android back never kills the WebView
    window.history.pushState({ screen: currentScreenIdRef.current }, "", window.location.pathname);

    const onPop = () => {
      // Re-push state so WebView history stack never collapses to 0
      window.history.pushState({ screen: currentScreenIdRef.current }, "", window.location.pathname);
      invokeBack();
    };
    window.addEventListener("popstate", onPop);
    (window as any).__handleTrustitBack = invokeBack;

    return () => {
      cancelled = true;
      window.removeEventListener("popstate", onPop);
      listenerHandle?.remove?.();
      if ((window as any).__handleTrustitBack === invokeBack) {
        delete (window as any).__handleTrustitBack;
      }
    };
  }, []);

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
          noticeMessage={sessionNotice}
          onContinue={(phone, channel, otp, meta) => {
            setAuthPhone(phone);
            setAuthChannel(channel);
            setPreviewOtp("");
            setActiveWhatsAppOtp(null);
            setSessionNotice(null);
            setCurrentScreenId(2);
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
          onVerified={async (otp, riderObj) => {
            // 1. Check if rider is fully approved in Supabase
            const isApprovedInDb = Boolean(
              riderObj?.id &&
              riderObj?.kyc_status === "approved" &&
              riderObj?.is_verified
            );

            if (isApprovedInDb) {
              // Existing approved partner -> Direct to Cockpit
              setSessionNotice(null);
              if (riderObj) workflow.setRider(riderObj);
              setCurrentScreenId(7);
              return;
            }

            // 2. Check if rider has already registered / submitted details and is pending admin review
            const kycStatusStr = String(riderObj?.kyc_status || "");
            const isPendingOrSubmittedInDb = Boolean(
              riderObj?.id &&
              (kycStatusStr === "pending" ||
               kycStatusStr === "submitted" ||
               kycStatusStr === "under_review" ||
               Boolean(riderObj?.full_name?.trim()))
            );

            if (isPendingOrSubmittedInDb) {
              // Existing applicant awaiting admin approval -> Direct to Verification Pending Room!
              setSessionNotice(null);
              if (riderObj) workflow.setRider(riderObj);
              setCurrentScreenId(19);
              return;
            }

            // 3. Brand New Rider Registration Journey (or previously deleted rider starting fresh)
            clearAllRiderStorage();
            workflow.resetToNewRider();
            workflow.setRider((prev) => ({
              ...prev,
              phone: authPhone,
              full_name: "",
              vehicle_number: "",
              is_verified: false,
              kyc_status: "pending",
            }));
            setSessionNotice("Please complete your full profile setup to log in as a delivery partner.");
            // Advance to Step 1 of 6: Basic Profile
            setCurrentScreenId(48);
          }}
          onResend={() => {
            console.log("OTP Resent for rider:", authPhone);
          }}
          onBack={() => setCurrentScreenId(1)}
        />
      ),
    },
    {
      id: 48,
      title: "02.5. Basic Profile (Name & Address)",
      component: (
        <Screen02BasicProfile
          verifiedPhone={authPhone}
          noticeMessage={sessionNotice}
          initialData={{
            fullName: workflow.rider?.full_name || undefined,
            residentialAddress: workflow.rider?.residential_address || undefined,
          }}
          onSaveProfile={(data) => {
            setSessionNotice(null);
            workflow.setRider((prev) => ({
              ...prev,
              full_name: data.fullName,
              phone: authPhone,
              residential_address: data.address,
              emergency_contact_name: data.emergencyContactName,
              emergency_contact_phone: data.emergencyPhone,
            }));
            if (typeof window !== "undefined") {
              localStorage.setItem("trustit_rider_name", data.fullName);
              localStorage.setItem("trustit_rider_address", data.address);
              localStorage.setItem("trustit_rider_emergency_name", data.emergencyContactName);
              localStorage.setItem("trustit_rider_emergency", data.emergencyPhone);
            }
            setCurrentScreenId(3); // Advance to Terms & Road Safety!
          }}
          onBack={() => setCurrentScreenId(1)}
        />
      ),
    },
    { id: 3, title: "03. Terms & Road Safety", component: <Screen03Consent onAgree={() => setCurrentScreenId(4)} onBack={() => setCurrentScreenId(48)} /> },
    { id: 4, title: "04. Real Selfie KYC (Live Camera)", component: <Screen04SelfieKyc onSelfieCaptured={(img) => { workflow.setRider((prev) => ({ ...prev, profile_image_url: img })); setCurrentScreenId(5); }} onBack={() => setCurrentScreenId(3)} /> },
    {
      id: 5,
      title: "05. Vehicle RC & DL (UP 40)",
      component: (
        <Screen05VehicleDl
          initialData={{
            vehicleType: (rider?.vehicle_type as any) || "bike",
            vehicleNumber: rider?.vehicle_number || "",
            dlNumber: rider?.driving_license_number || "",
          }}
          onVehicleSubmit={(vehData) => {
            workflow.setRider((prev) => ({
              ...prev,
              vehicle_type: vehData.vehicleType as any,
              vehicle_number: vehData.vehicleNumber,
              driving_license_number: vehData.dlNumber,
            }));
            if (typeof window !== "undefined") {
              localStorage.setItem("trustit_rider_vehicle_type", vehData.vehicleType);
              localStorage.setItem("trustit_rider_vehicle_number", vehData.vehicleNumber);
              localStorage.setItem("trustit_rider_dl_number", vehData.dlNumber);
            }
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
          onPayoutConfigured={async (upi) => {
            const currentRider = workflow.rider;
            const savedName = typeof window !== "undefined" ? localStorage.getItem("trustit_rider_name") : null;
            const savedAddress = typeof window !== "undefined" ? localStorage.getItem("trustit_rider_address") : null;
            const savedEmergencyName = typeof window !== "undefined" ? localStorage.getItem("trustit_rider_emergency_name") : null;
            const savedEmergencyPhone = typeof window !== "undefined" ? localStorage.getItem("trustit_rider_emergency") : null;
            const savedVehicleType = typeof window !== "undefined" ? localStorage.getItem("trustit_rider_vehicle_type") : null;
            const savedVehicleNumber = typeof window !== "undefined" ? localStorage.getItem("trustit_rider_vehicle_number") : null;
            const savedDl = typeof window !== "undefined" ? localStorage.getItem("trustit_rider_dl_number") : null;

            workflow.setRider((prev) => ({ ...prev, upi_id: upi }));
            if (typeof window !== "undefined") {
              localStorage.setItem("trustit_rider_upi", upi);
            }

            // Real-time API Submission to Supabase delivery_riders
            try {
              const res = await fetch("/api/hyperlocal/rider", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "register_kyc",
                  phone: authPhone || currentRider?.phone,
                  fullName: currentRider?.full_name || savedName || "New Delivery Partner",
                  residentialAddress: currentRider?.residential_address || savedAddress || "",
                  emergencyContactName: currentRider?.emergency_contact_name || savedEmergencyName || "",
                  emergencyContactPhone: currentRider?.emergency_contact_phone || savedEmergencyPhone || "",
                  profileImageUrl: currentRider?.profile_image_url || null,
                  vehicleType: currentRider?.vehicle_type || savedVehicleType || "bike",
                  vehicleNumber: currentRider?.vehicle_number || savedVehicleNumber || "UP-40-TEMP",
                  drivingLicenseNumber: currentRider?.driving_license_number || savedDl || null,
                  upiId: upi,
                  city: "Bahraich",
                  pincode: "271801",
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.rider) {
                  workflow.setRider(data.rider);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("trustit_rider_profile", JSON.stringify(data.rider));
                  }
                }
              }
            } catch (err) {
              console.error("KYC registration submission error:", err);
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
          riderId={workflow.rider?.id}
          onBack={() => setCurrentScreenId(1)}
          onProceedToAcademy={() => setCurrentScreenId(20)}
          onEditProfile={() => setCurrentScreenId(48)}
          onEditVehicle={() => setCurrentScreenId(5)}
          onEditSelfie={() => setCurrentScreenId(4)}
          onCallFleetOps={() => {
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
          gpsAccuracyProp={gpsAccuracy}
        />
      ),
    },
    {
      id: 8,
      title: "08. Shift Scorecard & Telemetry",
      component: (
        <Screen08ShiftScorecard
          onBack={() => setCurrentScreenId(7)}
          onOpenCeiling={() => setCurrentScreenId(9)}
          data={{
            todayEarnings,
            todayTrips: todayTripsCount,
            monthEarnings: Number(rider?.total_earnings || 0),
            monthTrips: Number(rider?.total_deliveries_count || 0),
            cashInHand,
            cashCap: cashCeiling,
            rating: Number(rider?.rating || 5.0),
            tier: rider?.tier_status ? `${rider.tier_status.toUpperCase()} PARTNER` : "GOLD PARTNER",
          }}
        />
      ),
    },
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
    { id: 10, title: "10. 30s Proximity Siren Radar", component: <Screen10Radar order={activeOrder} onAccept={() => { acceptOrder(); setCurrentScreenId(12); }} onDecline={() => { declineOrder(); setCurrentScreenId(7); }} /> },
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
          activeOrder={activeOrder as any}
          onPickupConfirmed={() => { confirmPickup(); setCurrentScreenId(40); }}
          onBack={() => setCurrentScreenId(activeOrder ? 7 : 11)}
          onMerchantDelay={() => setCurrentScreenId(23)}
          onCallShop={() => {
            const rawBiz = (activeOrder as any)?.businesses ?? activeOrder?.business;
            const biz = Array.isArray(rawBiz) ? rawBiz[0] : rawBiz;
            const phone = biz?.phone;
            if (typeof window !== "undefined" && phone) window.location.href = `tel:${phone}`;
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
          destinationAddress={
            typeof activeOrder?.customer_address === "string"
              ? activeOrder.customer_address
              : (activeOrder?.customer_address as any)?.address_line || activeOrder?.customer_address?.street || "Bahraich City"
          }
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
          customerName={activeOrder?.customer_name || "Customer"}
          orderCode={activeOrder?.id ? activeOrder.id.slice(-6).toUpperCase() : "LIVE"}
          onBack={() => setCurrentScreenId(40)}
          onCallMasked={() => {
            const phone = activeOrder?.customer_phone;
            if (typeof window !== "undefined" && phone) window.location.href = `tel:${phone}`;
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
          activeOrder={activeOrder}
          onShowDynamicQr={() => setCurrentScreenId(14)}
          onDelivered={(otp) => { completeDeliveryWithOtp(otp); setCurrentScreenId(15); }}
          onBack={() => setCurrentScreenId(40)}
          onDoorstepChangeRefund={() => setCurrentScreenId(45)}
          onCustomerUnreachable={() => setCurrentScreenId(24)}
          onContactlessPhotoPod={() => setCurrentScreenId(30)}
          onCallMasked={() => {
            const phone = activeOrder?.customer_phone;
            if (typeof window !== "undefined" && phone) window.location.href = `tel:${phone}`;
          }}
        />
      ),
    },
    {
      id: 14,
      title: "14. Dynamic Cashfree UPI QR (COD)",
      component: (
        <Screen14DynamicQr
          orderId={activeOrder?.id}
          amount={Number(activeOrder?.total_amount || 0)}
          orderCode={activeOrder?.id ? activeOrder.id.slice(-6).toUpperCase() : "TR-LIVE"}
          onPaymentReceived={() => {
            if (activeOrder?.delivery_otp) {
              completeDeliveryWithOtp(activeOrder.delivery_otp, { paidViaCashfreeQr: true });
            } else {
              const otp = typeof window !== "undefined" ? window.prompt("Enter customer 4-digit delivery OTP:") : "";
              if (otp) {
                completeDeliveryWithOtp(otp, { paidViaCashfreeQr: true });
              } else {
                setCurrentScreenId(13);
              }
            }
          }}
          onBack={() => setCurrentScreenId(13)}
        />
      ),
    },
    {
      id: 24,
      title: "24. Customer Unreachable 5-Min Rescue",
      component: (
        <Screen24CustomerUnreachable
          onBack={() => setCurrentScreenId(13)}
          onCallIvr={() => {
            const phone = activeOrder?.customer_phone;
            if (typeof window !== "undefined" && phone) window.location.href = `tel:${phone}`;
          }}
          onUploadGatePhoto={() => {
            console.log("Customer gate photo recorded");
          }}
          onCompleteCancellation={async () => {
            const res = await requestOrderCancellation(
              "customer_unreachable",
              "Customer unreachable after doorstep calls & rescue timer",
            );
            if (!res.success && typeof window !== "undefined") {
              alert(res.error || "Failed to send cancellation request.");
              return;
            }
            if (typeof window !== "undefined") {
              alert(res.message || "Cancellation request sent to Admin Command Center.");
            }
            setCurrentScreenId(13);
          }}
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
            requestOrderCancellation("wrong_address", "Rider vehicle breakdown — buddy handover requested");
          }}
          onCallBuddy={() => {
            if (typeof window !== "undefined") window.location.href = "tel:+919450881200";
          }}
          onHandoverComplete={() => setCurrentScreenId(7)}
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
            requestOrderCancellation(
              "customer_refused",
              "Customer refused order at doorstep — RTO initiated",
            );
          }}
          onConfirmMerchantReturn={async () => {
            await requestOrderCancellation(
              "customer_refused",
              "RTO package returned to merchant counter — awaiting Admin approval",
            );
            setCurrentScreenId(7);
          }}
        />
      ),
    },
    {
      id: 30,
      title: "30. Contactless Photo POD Watermark",
      component: (
        <Screen30ContactlessPhotoPod
          onBack={() => setCurrentScreenId(13)}
          onConfirmPod={() => {
            const otp =
              activeOrder?.delivery_otp ||
              (typeof window !== "undefined" ? window.prompt("Enter customer 4-digit delivery OTP:") || "" : "");
            if (otp) completeDeliveryWithOtp(otp);
          }}
        />
      ),
    },

    // Stage 9: Ground-Zero Dilemmas & Rescues
    {
      id: 45,
      title: "45. Doorstep Change Deficit (Wallet / UPI)",
      component: (
        <Screen45DoorstepChangeWallet
          onBack={() => setCurrentScreenId(13)}
          onConfirmChangeRefund={(amt, method) => {
            refundDoorstepChange(amt, method);
            const otp =
              activeOrder?.delivery_otp ||
              (typeof window !== "undefined" ? window.prompt("Enter customer 4-digit delivery OTP:") || "" : "");
            if (otp) completeDeliveryWithOtp(otp);
          }}
        />
      ),
    },
    {
      id: 46,
      title: "46. Mid-Trip Cancel & Distance Pay",
      component: (
        <Screen46MidTripCancellation
          orderCode={
            recentCancelledOrder?.id
              ? recentCancelledOrder.id.slice(-6).toUpperCase()
              : activeOrder?.id
                ? activeOrder.id.slice(-6).toUpperCase()
                : "TR-LIVE"
          }
          reason={
            recentCancelledOrder?.cancellation_reason ||
            recentCancelledOrder?.admin_notes ||
            activeOrder?.cancellation_reason ||
            "Order cancelled by Admin / Customer"
          }
          onBack={() => setCurrentScreenId(7)}
          onReturnToRadar={() => {
            setCurrentScreenId(7);
            triggerIncomingOrderRadar(false);
          }}
        />
      ),
    },
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
    {
      id: 48,
      title: "48. Critical Battery (<15%) Safe Mode",
      component: (
        <Screen48LowBatterySafeMode
          activeOrder={activeOrder}
          onBack={() => setCurrentScreenId(7)}
          batteryLevelProp={batteryLevel}
        />
      ),
    },

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
          riderUpiProp={rider?.upi_id || (typeof window !== "undefined" ? localStorage.getItem("trustit_rider_upi") || "" : "")}
          riderId={rider?.id}
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
          referralCode={rider?.referral_code}
          tier={rider?.tier_status ? `${rider.tier_status.toUpperCase()} PARTNER` : "GOLD PARTNER"}
          acceptanceRate={Number(rider?.acceptance_rate || 100)}
          rating={Number(rider?.rating || 5.0)}
          onBack={() => setCurrentScreenId(18)}
          onShareWhatsapp={() => {
            if (typeof window !== "undefined") {
              const refCode = rider?.referral_code || "TRFLEET";
              const text = encodeURIComponent(
                "🛵 *Become a Trustit Delivery Partner — Bahraich (UP 40)*\n" +
                "Earn ₹600 - ₹1,100 daily. Direct daily bank UPI payouts!\n" +
                `Referral Code: ${refCode}\n` +
                "Register now: " + window.location.origin + "/rider"
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

  const ONBOARDING_SCREEN_IDS = new Set([1, 2, 48, 3, 4, 5, 6, 19, 20, 27]);
  const isOnboarding = ONBOARDING_SCREEN_IDS.has(currentScreenId);
  const shouldShowNavAndHeader = !isOnboarding && Boolean(rider?.id && rider.id !== "rider_new_partner");

  return (
    <div className="min-h-screen w-full bg-[#FAF8FF] text-[#0F172A] font-sans flex flex-col justify-between selection:bg-[#0D47A1] selection:text-white relative">
      
      {/* ── Minimalist Clean Header: ONLY Online/Offline Duty Dongle (Visible ONLY after login & onboarding) ── */}
      {shouldShowNavAndHeader && (
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
      )}

      {/* ── Offline Dead-Zone Warning Banner ── */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-[11px] font-black tracking-tight flex items-center justify-center gap-2 shadow-inner z-30">
          <span>⚠️</span>
          <span>Offline Dead-Zone Active: Trip Manifest &amp; OTP Handover cached locally.</span>
        </div>
      )}

      {/* ── Active Production Screen Viewport (Full Bleed Mobile) ── */}
      <main
        className={`flex-1 w-full max-w-md mx-auto overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col justify-between ${
          shouldShowNavAndHeader ? "pb-16" : "pb-2"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {activeScreenObj.component}
      </main>

      {/* ── 5 Mobile Bottom Navigation Tabs (VISIBLE ONLY AFTER VERIFIED LOGIN & ONBOARDING) ── */}
      {shouldShowNavAndHeader && (
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
      )}

      {/* ── Android Native Hardware Back Button Toast ── */}
      {backToast && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-900/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 border border-slate-700">
          {backToast}
        </div>
      )}
    </div>
  );
}
