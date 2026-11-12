import { NextResponse } from "next/server";
import { stripGooglePlusCode } from "@/lib/hyperlocal/address-format";

export const dynamic = "force-dynamic";

// In-memory cache for reverse geocoding to prevent excessive external API calls
interface CachedLocation {
  name: string;
  mohalla?: string;
  landmark?: string;
  city?: string;
  district?: string;
  pincode?: string;
  formattedAddress?: string;
  source: string;
  timestamp: number;
}
const geocodeCache = new Map<string, CachedLocation>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache per ~11m micro-grid

function normalizeDistrictName(raw: string): string {
  return raw
    .replace(/\s+District$/i, "")
    .replace(/\s+Mandal$/i, "")
    .replace(/\s+Division$/i, "")
    .trim();
}

function isDivisionName(raw: string): boolean {
  return /\b(division|mandal)\b/i.test(raw);
}

function getCacheKey(lat: number, lng: number): string {
  // Round to ~11m precision (4 decimal places) so adjacent mohallas don't collide
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
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
        locationName: stripGooglePlusCode(cached.name),
        mohalla: stripGooglePlusCode(cached.mohalla || cached.name),
        landmark: stripGooglePlusCode(cached.landmark || ""),
        city: cached.city || "Bahraich",
        district: cached.district || cached.city || "Bahraich",
        pincode: cached.pincode || "271801",
        formattedAddress: stripGooglePlusCode(cached.formattedAddress || cached.name),
        source: cached.source || "cache",
        cached: true,
        lat,
        lng,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  }

  let resolvedName: string | null = null;
  let resolvedMohalla: string = "";
  let resolvedLandmark: string = "";
  let resolvedCity: string = "Bahraich";
  let resolvedDistrict: string = "Bahraich";
  let resolvedPincode: string = "271801";
  let resolvedFormattedAddress: string = "";
  let source: "google" | "mapbox" | "nominatim" | "raw" = "raw";

  // 1. Google Maps Geocoding API (Primary - Active Billing Key)
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
          const resultsList = googleData.results as Array<{
            formatted_address?: string;
            types?: string[];
            address_components?: Array<{ long_name: string; types: string[] }>;
          }>;
          const nonPlusResult =
            resultsList.find((r) => !(r.types || []).includes("plus_code")) || resultsList[0];
          const first = resultsList[0];
          resolvedFormattedAddress = stripGooglePlusCode(
            nonPlusResult.formatted_address || first.formatted_address || "",
          );

          let sublocality2 = "";
          let sublocality1 = "";
          let neighborhood = "";
          let poi = "";
          let locality = "";
          let adminLevel3 = "";
          let adminLevel2 = "";
          let postalCode = "";
          let route = "";

          const allComponents = resultsList
            .slice(0, 4)
            .flatMap((r) => r.address_components || []);

          for (const comp of allComponents) {
            const name = stripGooglePlusCode(comp.long_name);
            if (!name) continue;
            if (comp.types.includes("plus_code")) continue;
            if (comp.types.includes("sublocality_level_2")) {
              if (!sublocality2) sublocality2 = name;
            } else if (comp.types.includes("sublocality_level_1") || comp.types.includes("sublocality")) {
              if (!sublocality1) sublocality1 = name;
            } else if (comp.types.includes("neighborhood")) {
              if (!neighborhood) neighborhood = name;
            } else if (comp.types.includes("point_of_interest") || comp.types.includes("establishment") || comp.types.includes("premise")) {
              if (!poi) poi = name;
            } else if (comp.types.includes("locality")) {
              if (!locality) locality = name;
            } else if (comp.types.includes("administrative_area_level_3")) {
              if (!adminLevel3) adminLevel3 = name;
            } else if (comp.types.includes("administrative_area_level_2")) {
              if (!adminLevel2) adminLevel2 = name;
            } else if (comp.types.includes("postal_code")) {
              if (!postalCode) postalCode = name;
            } else if (comp.types.includes("route")) {
              if (!route && !/^unnamed\s+road$/i.test(name)) route = name;
            }
          }

          const bestSublocality = neighborhood || sublocality2 || sublocality1 || route || "";
          resolvedMohalla =
            [route, bestSublocality].filter((v, idx, arr) => v && arr.indexOf(v) === idx).slice(0, 2).join(", ") ||
            locality ||
            "";
          resolvedLandmark = poi || (route && route !== bestSublocality ? route : "") || sublocality1 || "";
          const cleanLevel3 = adminLevel3 && !isDivisionName(adminLevel3) ? normalizeDistrictName(adminLevel3) : "";
          const cleanLevel2 = adminLevel2 && !isDivisionName(adminLevel2) ? normalizeDistrictName(adminLevel2) : "";
          const cleanLocality = locality ? normalizeDistrictName(locality) : "";
          // Prefer specific administrative district (level_3 in states with divisions like UP, level_2 elsewhere), then locality
          const resolvedDist = cleanLevel3 || cleanLevel2 || cleanLocality || normalizeDistrictName(adminLevel2) || "Bahraich";
          resolvedDistrict = resolvedDist;
          resolvedCity = resolvedDist;
          if (postalCode) resolvedPincode = postalCode;

          const headerArea = bestSublocality || route;
          if (headerArea && locality && headerArea.toLowerCase() !== locality.toLowerCase()) {
            resolvedName = `${headerArea}, ${locality}`;
          } else if (locality && resolvedDist && locality.toLowerCase() !== resolvedDist.toLowerCase()) {
            resolvedName = `${locality}, ${resolvedDist}`;
          } else if (locality) {
            resolvedName = `${locality}`;
          } else if (resolvedFormattedAddress) {
            const parts = resolvedFormattedAddress.split(",").map((p: string) => p.trim()).filter(Boolean);
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
            const features = mapboxData.features;
            const primary = features[0];
            const text = primary.text || "";
            const placeName = primary.place_name || "";
            resolvedFormattedAddress = placeName;

            let districtOrCity = "";
            let postCode = "";
            if (Array.isArray(primary.context)) {
              for (const ctx of primary.context) {
                if (ctx.id?.startsWith("place.") || ctx.id?.startsWith("district.")) {
                  districtOrCity = ctx.text;
                } else if (ctx.id?.startsWith("postcode.")) {
                  postCode = ctx.text;
                }
              }
            }

            resolvedMohalla = text || "";
            if (districtOrCity) {
              const cleanDc = normalizeDistrictName(districtOrCity);
              resolvedCity = cleanDc;
              resolvedDistrict = cleanDc;
            }
            if (postCode) resolvedPincode = postCode;

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
        resolvedFormattedAddress = osmData.display_name || "";

        const local =
          addr.suburb ||
          addr.subdistrict ||
          addr.neighbourhood ||
          addr.road;
        const district = addr.county || addr.state_district || addr.city || "Bahraich";

        resolvedMohalla = local || "";
        resolvedCity = normalizeDistrictName(district);
        resolvedDistrict = resolvedCity;
        if (addr.postcode) resolvedPincode = addr.postcode;

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

  // 4. Clean Raw GPS Fallback
  if (!resolvedName) {
    resolvedName = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    resolvedMohalla = "Live GPS";
    source = "raw";
  }

  const cleanLocationName = stripGooglePlusCode(resolvedName) || `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  const cleanMohalla = stripGooglePlusCode(resolvedMohalla) || cleanLocationName;
  const cleanLandmark = stripGooglePlusCode(resolvedLandmark);
  const cleanFormatted = stripGooglePlusCode(resolvedFormattedAddress) || cleanLocationName;

  // Cache resolved address
  geocodeCache.set(cacheKey, {
    name: cleanLocationName,
    mohalla: cleanMohalla,
    landmark: cleanLandmark,
    city: resolvedCity,
    district: resolvedDistrict || resolvedCity,
    pincode: resolvedPincode,
    formattedAddress: cleanFormatted,
    source,
    timestamp: now,
  });

  return NextResponse.json(
    {
      locationName: cleanLocationName,
      mohalla: cleanMohalla,
      landmark: cleanLandmark,
      city: resolvedCity || "Bahraich",
      district: resolvedDistrict || resolvedCity || "Bahraich",
      pincode: resolvedPincode || "271801",
      formattedAddress: cleanFormatted,
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
