import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory cache for reverse geocoding to prevent excessive external API calls
interface CachedLocation {
  name: string;
  timestamp: number;
}
const geocodeCache = new Map<string, CachedLocation>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache per micro-grid (~100m)

function getCacheKey(lat: number, lng: number): string {
  // Round to ~100m precision (3 decimal places)
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: "Latitude and longitude query parameters are required" },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "Invalid numeric coordinates provided" },
      { status: 400 }
    );
  }

  // Check in-memory cache first
  const cacheKey = getCacheKey(lat, lng);
  const cached = geocodeCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        locationName: cached.name,
        cached: true,
        lat,
        lng,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  }

  let resolvedName: string | null = null;
  let source: "google" | "mapbox" | "nominatim" | "raw" = "raw";

  // 1. Google Maps Geocoding API (If key configured)
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleApiKey) {
    try {
      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}&language=en`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (googleRes.ok) {
        const googleData = await googleRes.json();
        if (googleData.status === "OK" && Array.isArray(googleData.results) && googleData.results.length > 0) {
          const first = googleData.results[0];
          // Try to extract sublocality / locality / neighborhood
          let sublocality = "";
          let locality = "";
          let district = "";

          for (const comp of first.address_components || []) {
            if (comp.types.includes("sublocality") || comp.types.includes("sublocality_level_1")) {
              sublocality = comp.long_name;
            } else if (comp.types.includes("locality")) {
              locality = comp.long_name;
            } else if (comp.types.includes("administrative_area_level_2")) {
              district = comp.long_name;
            }
          }

          if (sublocality && locality && sublocality !== locality) {
            resolvedName = `${sublocality}, ${locality}`;
          } else if (locality && district && locality !== district) {
            resolvedName = `${locality}, ${district}`;
          } else if (locality) {
            resolvedName = `${locality}`;
          } else if (first.formatted_address) {
            // Pick first two parts of formatted address
            const parts = first.formatted_address.split(",").map((p: string) => p.trim());
            resolvedName = parts.slice(0, 2).join(", ");
          }

          if (resolvedName) source = "google";
        }
      }
    } catch (e) {
      console.warn("[ReverseGeocode] Google Maps Geocoding error:", e);
    }
  }

  // 2. Mapbox Geocoding API (Standard verified fallback)
  if (!resolvedName) {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (mapboxToken) {
      try {
        const mapboxRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=en`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (mapboxRes.ok) {
          const mapboxData = await mapboxRes.json();
          if (Array.isArray(mapboxData.features) && mapboxData.features.length > 0) {
            // Find the most descriptive feature (neighborhood, address, or locality)
            const features = mapboxData.features;
            const primary = features[0];
            const text = primary.text || "";
            const placeName = primary.place_name || "";

            // Find parent locality/district context
            let districtOrCity = "";
            if (Array.isArray(primary.context)) {
              for (const ctx of primary.context) {
                if (ctx.id?.startsWith("place.") || ctx.id?.startsWith("district.")) {
                  districtOrCity = ctx.text;
                  break;
                }
              }
            }

            if (text && districtOrCity && !text.toLowerCase().includes(districtOrCity.toLowerCase())) {
              resolvedName = `${text}, ${districtOrCity}`;
            } else if (placeName) {
              const parts = placeName.split(",").map((s: string) => s.trim());
              resolvedName = parts.slice(0, 2).join(", ");
            } else if (text) {
              resolvedName = text;
            }

            if (resolvedName) source = "mapbox";
          }
        }
      } catch (e) {
        console.warn("[ReverseGeocode] Mapbox Geocoding error:", e);
      }
    }
  }

  // 3. OpenStreetMap Nominatim (Public Global Fallback)
  if (!resolvedName) {
    try {
      const osmRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Trustit-Hyperlocal-Delivery/1.0 (contact@trustitreview.com)",
            "Accept-Language": "en",
          },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const addr = osmData.address || {};
        const local =
          addr.suburb ||
          addr.village ||
          addr.town ||
          addr.hamlet ||
          addr.neighbourhood ||
          addr.road;
        const district = addr.county || addr.state_district || addr.city || "Bahraich";

        if (local && district && !local.toLowerCase().includes(district.toLowerCase())) {
          resolvedName = `${local}, ${district}`;
        } else if (local) {
          resolvedName = `${local}`;
        } else if (osmData.display_name) {
          const parts = osmData.display_name.split(",").map((s: string) => s.trim());
          resolvedName = parts.slice(0, 2).join(", ");
        }

        if (resolvedName) source = "nominatim";
      }
    } catch (e) {
      console.warn("[ReverseGeocode] Nominatim Geocoding error:", e);
    }
  }

  // 4. Clean Raw GPS Fallback (No fake landmarks, completely transparent)
  if (!resolvedName) {
    resolvedName = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    source = "raw";
  }

  // Cache resolved address
  geocodeCache.set(cacheKey, { name: resolvedName, timestamp: now });

  return NextResponse.json(
    {
      locationName: resolvedName,
      source,
      lat,
      lng,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    }
  );
}
