"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { saveMerchantLocationAction } from "./actions";

type SavedLocation = { latitude: number; longitude: number; capturedAt: string } | null;

export type ResolvedGeocodeLocation = {
  formatted: string;
  mohalla?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
};

function deviceLocationError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "Location permission was denied. Allow location access in your browser settings, then retry.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Your device could not determine a location. Check its location settings and retry.";
  if (error.code === error.TIMEOUT) return "Location lookup took too long. Move to an area with better signal and retry.";
  return "We could not read your location. Check browser permissions and retry.";
}

async function fetchReverseGeocode(lat: number, lon: number): Promise<ResolvedGeocodeLocation | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: { "Accept-Language": "en", "User-Agent": "TrustitReviewApp/1.0" },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const mohalla =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.subdistrict ||
      addr.quarter ||
      addr.village ||
      "";
    const city = addr.city || addr.town || addr.municipality || addr.village || "";
    const district = addr.state_district || addr.county || addr.district || "";
    const state = addr.state || "";
    const pincode = addr.postcode || "";

    const parts = [mohalla, city, district, state].filter(Boolean);
    const formatted =
      parts.length > 0
        ? pincode
          ? `${parts.join(", ")} - ${pincode}`
          : parts.join(", ")
        : data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

    return {
      formatted,
      mohalla,
      locality: mohalla,
      city,
      district,
      state,
      pincode,
    };
  } catch {
    return null;
  }
}

export default function LocationCapture({
  latitude,
  longitude,
  capturedAt,
  onLocationResolved,
}: {
  latitude: number | null;
  longitude: number | null;
  capturedAt: string | null;
  onLocationResolved?: (loc: ResolvedGeocodeLocation) => void;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedLocation>(
    latitude !== null && longitude !== null && capturedAt ? { latitude, longitude, capturedAt } : null,
  );
  const [resolved, setResolved] = useState<ResolvedGeocodeLocation | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!saved?.latitude || !saved?.longitude) return;
    let active = true;
    fetchReverseGeocode(saved.latitude, saved.longitude).then((info) => {
      if (active && info) {
        setResolved(info);
        onLocationResolved?.(info);
      }
    });
    return () => {
      active = false;
    };
  }, [saved?.latitude, saved?.longitude]);

  function capture() {
    setMessage("");
    setFailed(false);
    if (!navigator.geolocation) {
      setFailed(true);
      setMessage("This browser does not support device location. Try a modern browser with location permission enabled.");
      return;
    }
    setBusy(true);
    const savePosition = async (position: GeolocationPosition) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const result = await saveMerchantLocationAction(lat, lon);
        if (!result.ok) {
          setFailed(true);
          setMessage(result.message);
          return;
        }
        setSaved({ latitude: lat, longitude: lon, capturedAt: result.capturedAt });
        setMessage(result.message);

        // Fetch reverse geocode immediately
        const info = await fetchReverseGeocode(lat, lon);
        if (info) {
          setResolved(info);
          onLocationResolved?.(info);
        }

        router.refresh();
      } catch {
        setFailed(true);
        setMessage("We could not save the location. Please retry.");
      } finally {
        setBusy(false);
      }
    };
    const handleError = (error: GeolocationPositionError) => {
      setBusy(false);
      setFailed(true);
      setMessage(deviceLocationError(error));
    };

    navigator.geolocation.getCurrentPosition(savePosition, (error) => {
      if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
        // Some desktops and tablets cannot produce a high-accuracy fix promptly.
        // Retry through the browser's approximate provider without accepting cached coordinates.
        navigator.geolocation.getCurrentPosition(savePosition, handleError, {
          enableHighAccuracy: false,
          timeout: 60_000,
          maximumAge: 0,
        });
        return;
      }
      handleError(error);
    }, { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 });
  }

  const mapsUrl = saved ? `https://maps.google.com/?q=${saved.latitude},${saved.longitude}` : null;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Live Location</p>
          {saved ? (
            <>
              {/* Human-Readable Verified Address Card */}
              <div className="mt-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl leading-none">📍</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        Verified Business Location (Sahi Pata)
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        ✓ Active GPS
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-slate-900 leading-snug break-words">
                      {resolved?.formatted || "Fetching verified address…"}
                    </p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        🗺️ View on Google Maps ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 font-mono">
                GPS: {saved.latitude.toFixed(6)}, {saved.longitude.toFixed(6)} · Captured {new Date(saved.capturedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                This is the GPS location reported by your device. Your typed business address stays separate. No reverse-geocoding service is configured, so coordinates are shown as-is.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-base font-bold text-slate-800">Not captured</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Capture the device location at your business. Your browser will ask before sharing it.</p>
            </>
          )}
        </div>
        {saved && mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Open Map ↗
          </a>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={capture}
          disabled={busy}
          className="min-h-11 rounded-xl bg-[#a64c05] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#873d03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? "Getting device location…" : saved ? "Update Current Location" : "Capture Current Location"}
        </button>
        {message ? (
          <p role={failed ? "alert" : "status"} aria-live="polite" className={`max-w-xl text-sm ${failed ? "text-rose-700" : "text-emerald-700"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
