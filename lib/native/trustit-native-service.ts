"use client";

import { registerPlugin } from "@capacitor/core";
import { merchantAudio } from "@/lib/audio/merchant-siren";

interface TrustitNativeBridgePlugin {
  playEmergencySiren(): Promise<{ success: boolean; channel?: string; message?: string }>;
  stopEmergencySiren(): Promise<{ success: boolean }>;
  setKeepScreenOn(options: { enabled: boolean }): Promise<{ success: boolean; isScreenOn: boolean }>;
  getPairedPrinters(): Promise<{ success: boolean; printers: Array<{ name: string; address: string }> }>;
  printThermalReceipt(options: { address?: string; text: string }): Promise<{ success: boolean; printerName?: string; message?: string }>;
  nativeFetch(options: { url: string; method?: string; body?: string }): Promise<{ status: number; data: string }>;
  getPreciseLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    bearing?: number;
    altitude?: number;
    provider?: string;
    timestamp?: number;
    address?: string;
    mohalla?: string;
    city?: string;
    pincode?: string;
  }>;
  playHapticFeedback(options?: { type?: string }): Promise<{ success: boolean; type?: string }>;
  nativeCheckoutHandoff(options?: { upiUri?: string }): Promise<{ success: boolean; dispatched?: boolean; installedCount?: number }>;
  openInAppCheckout(options: { url: string }): Promise<{ opened: boolean; mode: string }>;
  checkAndApplyOta(options?: { manifestUrl?: string; currentVersion?: string }): Promise<{ hasUpdate: boolean; appliedVersion?: string; message?: string }>;
}

let nativePlugin: TrustitNativeBridgePlugin | null = null;

function getNativePlugin(): TrustitNativeBridgePlugin | null {
  if (typeof window === "undefined") return null;
  const directBridge = (window as any).Capacitor?.Plugins?.TrustitNativeBridge;
  if (directBridge) return directBridge;
  if (!nativePlugin) {
    try {
      nativePlugin = registerPlugin<TrustitNativeBridgePlugin>("TrustitNativeBridge");
    } catch {
      nativePlugin = null;
    }
  }
  return nativePlugin || directBridge || null;
}

export const TrustitNative = {
  /**
   * Sound loud emergency order siren.
   * On Android: uses hardware STREAM_ALARM (bypasses silent switch) + vibration + wake screen.
   * On Web: uses WebAudio 880Hz/1320Hz alternating oscillator.
   */
  async playOrderSiren(): Promise<void> {
    const plugin = getNativePlugin();
    if (plugin) {
      try {
        await plugin.playEmergencySiren();
        return;
      } catch (err) {
        console.warn("Native siren fallback to WebAudio:", err);
      }
    }
    merchantAudio.playIncomingOrderSiren(8);
  },

  /**
   * Stop order siren & vibration.
   */
  async stopOrderSiren(): Promise<void> {
    merchantAudio.stopIncomingOrderSiren();
    const plugin = getNativePlugin();
    if (plugin) {
      try {
        await plugin.stopEmergencySiren();
      } catch {}
    }
  },

  /**
   * Keep tablet/phone display turned on (Kitchen Mode).
   */
  async setKeepScreenOn(enabled: boolean): Promise<void> {
    const plugin = getNativePlugin();
    if (plugin) {
      try {
        await plugin.setKeepScreenOn({ enabled });
      } catch {}
    }
  },

  /**
   * Get paired Bluetooth thermal printers.
   */
  async getPairedPrinters(): Promise<Array<{ name: string; address: string }>> {
    const plugin = getNativePlugin();
    if (plugin) {
      try {
        const res = await plugin.getPairedPrinters();
        return res.printers || [];
      } catch {
        return [];
      }
    }
    return [];
  },

  /**
   * Print raw receipt to thermal printer over Bluetooth RFCOMM socket.
   */
  async printThermalReceipt(text: string, address?: string): Promise<{ success: boolean; message: string }> {
    const plugin = getNativePlugin();
    if (plugin) {
      try {
        const res = await plugin.printThermalReceipt({ text, address });
        return { success: true, message: res.message || "Printed via native Bluetooth socket" };
      } catch (err: any) {
        return { success: false, message: err?.message || "Thermal printer connection failed" };
      }
    }
    return { success: false, message: "Bluetooth native printing is only available on Android native app" };
  },

  /**
   * High-accuracy hardware GPS coordinates & reverse geocoded address via Android Fused/LocationManager.
   */
  async getPreciseLocation(options?: { forceFresh?: boolean }): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    bearing?: number;
    altitude?: number;
    provider?: string;
    timestamp?: number;
    address?: string;
    mohalla?: string;
    city?: string;
    pincode?: string;
  }> {
    const forceFresh = Boolean(options?.forceFresh);
    const maxAgeAllowed = forceFresh ? 15_000 : 35_000;
    let nativeFallback: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      speed?: number;
      bearing?: number;
      altitude?: number;
      provider?: string;
      timestamp?: number;
      address?: string;
      mohalla?: string;
      city?: string;
      pincode?: string;
    } | null = null;

    const plugin = getNativePlugin();
    if (plugin && typeof plugin.getPreciseLocation === "function") {
      try {
        const res = await plugin.getPreciseLocation();
        const fixAgeMs = res?.timestamp ? Math.abs(Date.now() - res.timestamp) : 0;
        const isAccurateEnough =
          !forceFresh || ((res?.accuracy ?? 999) <= 45 && res?.provider !== "network");
        if (res && res.latitude && res.longitude) {
          if (fixAgeMs < maxAgeAllowed && isAccurateEnough) {
            return res;
          }
          nativeFallback = res;
          console.warn(
            `[TrustitNative] Native fix (${res.provider || "?"}, acc=${res.accuracy ?? "?"}m, age=${Math.round(fixAgeMs / 1000)}s) needs fresher high-accuracy check.`,
          );
        }
      } catch (err) {
        console.warn("Native location fallback to web navigator:", err);
      }
    }

    if (typeof window !== "undefined" && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const webLoc = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              speed: pos.coords.speed || 0,
              bearing: pos.coords.heading || 0,
              altitude: pos.coords.altitude || 0,
              provider: "browser",
              timestamp: pos.timestamp,
              address: `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
              mohalla: "Live Telemetry",
              city: "UP",
              pincode: "",
            };
            if (
              nativeFallback &&
              (nativeFallback.accuracy ?? 999) < pos.coords.accuracy &&
              (!forceFresh || Math.abs(Date.now() - (nativeFallback.timestamp || 0)) < 25_000)
            ) {
              resolve(nativeFallback);
              return;
            }
            resolve(webLoc);
          },
          () => {
            if (nativeFallback) {
              resolve(nativeFallback);
              return;
            }
            // Second attempt with network/Wi-Fi accuracy for indoor reliability
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                speed: pos.coords.speed || 0,
                bearing: pos.coords.heading || 0,
                altitude: pos.coords.altitude || 0,
                provider: "browser-network",
                timestamp: pos.timestamp,
                address: `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
                mohalla: "Live Telemetry",
                city: "UP",
                pincode: "",
              }),
              () => resolve({
                latitude: 0,
                longitude: 0,
                accuracy: 999,
                address: "Location Permission Required",
                mohalla: "",
                city: "",
                pincode: "",
              }),
              { enableHighAccuracy: false, maximumAge: 15000, timeout: 8000 }
            );
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
        );
      });
    }

    if (nativeFallback) return nativeFallback;

    return {
      latitude: 0,
      longitude: 0,
      accuracy: 999,
      address: "GPS Unavailable",
      mohalla: "",
      city: "",
      pincode: "",
    };
  },

  /**
   * Native Android tactile haptic vibration (Swiggy / Zomato click feel).
   */
  async playHapticFeedback(type: "click" | "heavy" | "success" = "click"): Promise<void> {
    const plugin = getNativePlugin();
    if (plugin && typeof plugin.playHapticFeedback === "function") {
      try {
        await plugin.playHapticFeedback({ type });
        return;
      } catch {}
    }

    if (typeof window !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(type === "heavy" ? [40, 20, 40] : 25);
      } catch {}
    }
  },

  /**
   * Native UPI Intent & Cashfree Handoff (GPay, PhonePe, Paytm, BHIM).
   */
  async nativeCheckoutHandoff(options: { upiUri?: string }): Promise<{ success: boolean; dispatched?: boolean }> {
    const plugin = getNativePlugin();
    if (plugin && typeof plugin.nativeCheckoutHandoff === "function") {
      try {
        const res = await plugin.nativeCheckoutHandoff(options);
        return res;
      } catch (err: any) {
        console.warn("Native checkout handoff error:", err);
      }
    }

    if (options.upiUri && typeof window !== "undefined") {
      try {
        window.location.href = options.upiUri;
        return { success: true, dispatched: true };
      } catch {}
    }

    return { success: false, dispatched: false };
  },

  /**
   * Opens an HTTPS checkout page inside an Android Chrome Custom Tab on native,
   * falling back to window.open in web browsers.
   */
  async openInAppCheckout(url: string): Promise<{ opened: boolean; mode: string }> {
    const plugin = getNativePlugin();
    if (plugin && typeof plugin.openInAppCheckout === "function") {
      try {
        return await plugin.openInAppCheckout({ url });
      } catch (err: any) {
        console.warn("[TrustitNative] openInAppCheckout error:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        const openedWindow = window.open(url, "_blank", "noopener,noreferrer");
        return { opened: Boolean(openedWindow), mode: "web_window" };
      } catch {}
    }

    return { opened: false, mode: "unavailable" };
  },

  /**
   * Legacy High-accuracy hardware GPS coordinates.
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    const loc = await this.getPreciseLocation();
    return { latitude: loc.latitude, longitude: loc.longitude };
  },

  /**
   * Universal Native Cloud Fetch Bridge:
   * Uses Android's native HttpURLConnection (via TrustitNativeBridge) to completely
   * bypass browser CORS restrictions and offline port issues.
   */
  async nativeFetch(url: string, init?: RequestInit): Promise<Response> {
    const isRelative = url.startsWith("/");
    const resolvedUrl = isRelative ? `https://trustitreview.com${url}` : url;
    const plugin = getNativePlugin();

    if (plugin && typeof plugin.nativeFetch === "function") {
      try {
        const method = init?.method || "GET";
        const body = typeof init?.body === "string" ? init.body : (init?.body ? JSON.stringify(init.body) : "");
        const res = await plugin.nativeFetch({
          url: resolvedUrl,
          method,
          body,
        });

        return new Response(res.data, {
          status: res.status || 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        });
      } catch (nativeErr) {
        console.warn("[TrustitNative] Native bridge fetch threw, falling back to network fetch:", nativeErr);
      }
    }

    return fetch(resolvedUrl, init);
  },

  /**
   * Live Over-The-Air (OTA) Dynamic Bundle Auto-Updater.
   * Downloads and applies latest UI bundle without APK reinstall.
   */
  async checkAndApplyOta(options?: {
    app?: string;
    currentVersion?: string;
    manifestUrl?: string;
  }): Promise<{ hasUpdate: boolean; appliedVersion?: string; message?: string }> {
    const plugin = getNativePlugin();
    if (plugin && typeof plugin.checkAndApplyOta === "function") {
      try {
        const app = options?.app || "partner";
        const currentVersion = options?.currentVersion || "2.2.0";
        let manifestUrl = options?.manifestUrl;

        if (!manifestUrl) {
          try {
            // Fast 600ms LAN probe: If user is on local WiFi, sync directly from dev server
            const probe = await fetch("http://192.168.1.5:3000/api/hyperlocal/ota?probe=1", {
              signal: AbortSignal.timeout(600),
            });
            if (probe.ok) {
              manifestUrl = `http://192.168.1.5:3000/api/hyperlocal/ota?app=${app}`;
            }
          } catch {}

          if (!manifestUrl) {
            manifestUrl = `https://trustitreview.com/api/hyperlocal/ota?app=${app}`;
          }
        }

        const res = await plugin.checkAndApplyOta({
          manifestUrl,
          currentVersion,
        });
        return res;
      } catch (err: any) {
        console.warn("[TrustitNative] OTA check error:", err);
      }
    }
    return { hasUpdate: false };
  },
};

// Global automatic fetch hook for Android embedded environment
if (typeof window !== "undefined" && !(window as any).__trustit_native_fetch_hooked) {
  (window as any).__trustit_native_fetch_hooked = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const rawUrl = typeof input === "string" ? input : (input instanceof Request ? input.url : input.toString());
    const isApiCall = rawUrl.includes("/api/") || rawUrl.startsWith("/api/");

    if (isApiCall) {
      let fullUrl = rawUrl;
      const isNative = typeof window !== "undefined" && (
        Boolean((window as any).Capacitor?.isNativePlatform?.()) ||
        window.location.protocol === "capacitor:" ||
        window.location.hostname === "localhost" && (!window.location.port || window.location.port === "80")
      );

      if (rawUrl.startsWith("/")) {
        fullUrl = `https://trustitreview.com${rawUrl}`;
      } else if ((rawUrl.includes("localhost") || rawUrl.includes("127.0.0.1")) && isNative) {
        fullUrl = rawUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, "https://trustitreview.com");
      }

      const plugin = getNativePlugin();
      if (plugin && typeof plugin.nativeFetch === "function") {
        try {
          const method = (init && init.method) || (input instanceof Request ? input.method : "GET");
          let bodyStr = "";
          if (init && init.body) {
            bodyStr = typeof init.body === "string" ? init.body : JSON.stringify(init.body);
          } else if (input instanceof Request && method !== "GET" && method !== "HEAD") {
            try { bodyStr = await input.clone().text(); } catch {}
          }

          const res = await plugin.nativeFetch({
            url: fullUrl,
            method,
            body: bodyStr,
          });

          return new Response(res.data, {
            status: res.status || 200,
            statusText: "OK",
            headers: { "Content-Type": "application/json" },
          });
        } catch (bridgeErr) {
          console.warn("[TrustitNative] Native bridge fetch fallback to network:", bridgeErr);
        }
      }

      // If native bridge not ready or threw, fetch directly from cloud endpoint
      try {
        return await originalFetch(fullUrl, init);
      } catch (cloudErr) {
        console.error("[TrustitNative] Cloud fetch failed:", fullUrl, cloudErr);
      }
    }

    return originalFetch(input, init);
  };
}
