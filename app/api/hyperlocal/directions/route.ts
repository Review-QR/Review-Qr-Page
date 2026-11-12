import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

type LatLng = { lat: number; lng: number };

const BAHRAICH_LANDMARKS: Array<{ name: string; area: string; lat: number; lng: number; pincode: string }> = [
  { name: "Civil Lines, Near District Hospital", area: "Civil Lines", lat: 27.5744, lng: 81.5977, pincode: "271801" },
  { name: "Ghantaghar Chowk Main Market", area: "Ghantaghar", lat: 27.5765, lng: 81.6012, pincode: "271801" },
  { name: "Station Road, Near Railway Junction", area: "Station Road", lat: 27.5718, lng: 81.6033, pincode: "271801" },
  { name: "Medical College Road", area: "Medical College", lat: 27.5755, lng: 81.5988, pincode: "271801" },
  { name: "Hospital Chauraha, KDC Road", area: "Hospital Chauraha", lat: 27.5732, lng: 81.5955, pincode: "271801" },
  { name: "Salarganj Dargah Sharif Road", area: "Salarganj", lat: 27.5831, lng: 81.6075, pincode: "271801" },
  { name: "Lucknow Road Bypass, KDC", area: "Lucknow Road", lat: 27.5689, lng: 81.6055, pincode: "271801" },
  { name: "Brahmanipura & Chhavni Bazar", area: "Brahmanipura", lat: 27.5782, lng: 81.5944, pincode: "271801" },
];

/**
 * Decodes Google Maps encoded polyline string into latitude/longitude pairs.
 */
function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < encoded.length);
    const dLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < encoded.length);
    const dLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export async function GET(request: Request) {
  const rateLimited = enforceRateLimit(request, "hyperlocal_directions", 60, 60_000);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  // Mode 1: Bahraich Mohalla / Address Search
  if (query !== undefined) {
    const q = query.toLowerCase();
    const curatedMatches = BAHRAICH_LANDMARKS.filter(
      (l) => !q || l.name.toLowerCase().includes(q) || l.area.toLowerCase().includes(q),
    );

    const googleKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleKey && query.length >= 3) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            `${query}, Bahraich, Uttar Pradesh, India`,
          )}&key=${googleKey}`,
          { signal: AbortSignal.timeout(4000) },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "OK" && Array.isArray(data.results)) {
            const googleResults = data.results.slice(0, 4).map((r: any) => ({
              name: r.formatted_address,
              area: r.address_components?.[0]?.long_name || query,
              lat: r.geometry?.location?.lat ?? 27.5744,
              lng: r.geometry?.location?.lng ?? 81.5977,
              pincode:
                r.address_components?.find((c: any) => c.types?.includes("postal_code"))?.long_name ||
                "271801",
            }));
            return NextResponse.json({
              success: true,
              source: "google",
              suggestions: [...googleResults, ...curatedMatches].slice(0, 6),
            });
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      source: "bahraich_curated",
      suggestions: curatedMatches.slice(0, 6),
    });
  }

  // Mode 2: Store -> Customer Route Polyline & ETA
  const originLat = parseFloat(searchParams.get("originLat") || "");
  const originLng = parseFloat(searchParams.get("originLng") || "");
  const destLat = parseFloat(searchParams.get("destLat") || "");
  const destLng = parseFloat(searchParams.get("destLng") || "");

  if (
    !Number.isFinite(originLat) ||
    !Number.isFinite(originLng) ||
    !Number.isFinite(destLat) ||
    !Number.isFinite(destLng)
  ) {
    return NextResponse.json(
      { success: false, error: "originLat, originLng, destLat, destLng are required" },
      { status: 400 },
    );
  }

  const origin: LatLng = { lat: originLat, lng: originLng };
  const dest: LatLng = { lat: destLat, lng: destLng };
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;

  if (googleKey) {
    try {
      const dirRes = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=driving&key=${googleKey}`,
        { signal: AbortSignal.timeout(5000) },
      );
      if (dirRes.ok) {
        const dirData = await dirRes.json();
        const route = dirData.routes?.[0];
        const leg = route?.legs?.[0];
        const encoded = route?.overview_polyline?.points;
        if (encoded) {
          return NextResponse.json({
            success: true,
            source: "google_directions",
            distanceText: leg?.distance?.text || "1.4 km",
            durationText: leg?.duration?.text || "12 mins",
            points: decodePolyline(encoded),
          });
        }
      }
    } catch {}
  }

  // Clean fallback road curve between store and customer pin
  const km = Math.max(0.4, haversineKm(origin, dest));
  const mid1: LatLng = {
    lat: origin.lat + (dest.lat - origin.lat) * 0.35 + 0.0012,
    lng: origin.lng + (dest.lng - origin.lng) * 0.35 - 0.0008,
  };
  const mid2: LatLng = {
    lat: origin.lat + (dest.lat - origin.lat) * 0.72 - 0.0006,
    lng: origin.lng + (dest.lng - origin.lng) * 0.72 + 0.001,
  };

  return NextResponse.json({
    success: true,
    source: "haversine_fallback",
    distanceText: `${km.toFixed(1)} km`,
    durationText: `${Math.max(8, Math.round(km * 5 + 6))} mins`,
    points: [origin, mid1, mid2, dest],
  });
}
