"use client";

import { useEffect, useState } from "react";

export function OtaUpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      })
      .catch(() => {
        // Optional in development
      });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  if (!updateAvailable) return null;

  return (
    <aside
      aria-label="OTA update notification"
      className="fixed top-4 inset-x-4 z-50 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-3 text-white shadow-xl shadow-blue-500/25 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">🚀</span>
        <div>
          <strong className="block font-bold">Naya Update Uplabdh Hai!</strong>
          <span className="text-[11px] text-blue-100">Bina APK download kiye turant update karein.</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="shrink-0 rounded-xl bg-white px-3 py-1.5 font-black text-blue-700 shadow-xs hover:bg-blue-50 active:scale-95 transition"
      >
        Refresh 🔄
      </button>
    </aside>
  );
}
