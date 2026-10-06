"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveMerchantLocationAction } from "./actions";

type SavedLocation = { latitude: number; longitude: number; capturedAt: string } | null;

function deviceLocationError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "Location permission was denied. Allow location access in your browser settings, then retry.";
  if (error.code === error.POSITION_UNAVAILABLE) return "Your device could not determine a location. Check its location settings and retry.";
  if (error.code === error.TIMEOUT) return "Location lookup took too long. Move to an area with better signal and retry.";
  return "We could not read your location. Check browser permissions and retry.";
}

export default function LocationCapture({
  latitude,
  longitude,
  capturedAt,
}: {
  latitude: number | null;
  longitude: number | null;
  capturedAt: string | null;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedLocation>(
    latitude !== null && longitude !== null && capturedAt ? { latitude, longitude, capturedAt } : null,
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  function capture() {
    setMessage("");
    setFailed(false);
    if (!navigator.geolocation) {
      setFailed(true);
      setMessage("This browser does not support device location. Try a modern browser with location permission enabled.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const result = await saveMerchantLocationAction(position.coords.latitude, position.coords.longitude);
        if (!result.ok) {
          setFailed(true);
          setMessage(result.message);
          return;
        }
        setSaved({ latitude: position.coords.latitude, longitude: position.coords.longitude, capturedAt: result.capturedAt });
        setMessage(result.message);
        router.refresh();
      } catch {
        setFailed(true);
        setMessage("We could not save the location. Please retry.");
      } finally {
        setBusy(false);
      }
    }, (error) => {
      setBusy(false);
      setFailed(true);
      setMessage(deviceLocationError(error));
    }, { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 });
  }

  const mapsUrl = saved ? `https://maps.google.com/?q=${saved.latitude},${saved.longitude}` : null;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Live Location</p>
          {saved ? (
            <>
              <p className="mt-2 text-base font-bold text-emerald-800">✓ Captured</p>
              <p className="mt-1 break-words font-mono text-sm text-slate-700">{saved.latitude.toFixed(6)}, {saved.longitude.toFixed(6)}</p>
              <p className="mt-1 text-xs text-slate-500">Captured {new Date(saved.capturedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">This is the GPS location reported by your device. Your typed business address stays separate. No reverse-geocoding service is configured, so coordinates are shown as-is.</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-base font-bold text-slate-800">Not captured</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Capture the device location at your business. Your browser will ask before sharing it.</p>
            </>
          )}
        </div>
        {saved && mapsUrl ? <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">Open Map ↗</a> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={capture} disabled={busy} className="min-h-11 rounded-xl bg-[#a64c05] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#873d03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
          {busy ? "Getting device location…" : saved ? "Update Current Location" : "Capture Current Location"}
        </button>
        {message ? <p role={failed ? "alert" : "status"} aria-live="polite" className={`max-w-xl text-sm ${failed ? "text-rose-700" : "text-emerald-700"}`}>{message}</p> : null}
      </div>
    </div>
  );
}
