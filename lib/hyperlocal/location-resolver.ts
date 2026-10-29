/**
 * Location Resolver for Trustit Hyperlocal Super-App
 * Transforms GPS coordinates into recognized human landmarks in Bahraich city
 * without ever exposing raw numeric coordinates (latitude/longitude) in the UI.
 */

interface BahraichLandmarkZone {
  name: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

const BAHRAICH_LANDMARKS: BahraichLandmarkZone[] = [
  {
    name: "Lucknow Road / Banjari Road",
    minLat: 27.550,
    maxLat: 27.571,
    minLon: 81.565,
    maxLon: 81.595,
  },
  {
    name: "Civil Lines / Hospital Road",
    minLat: 27.575,
    maxLat: 27.590,
    minLon: 81.592,
    maxLon: 81.615,
  },
  {
    name: "Dargah Sharif / Galla Mandi",
    minLat: 27.570,
    maxLat: 27.585,
    minLon: 81.580,
    maxLon: 81.605,
  },
  {
    name: "Chowk Bazaar / Peeparpur",
    minLat: 27.565,
    maxLat: 27.578,
    minLon: 81.595,
    maxLon: 81.612,
  },
  {
    name: "Nanpara Highway / KDC Area",
    minLat: 27.585,
    maxLat: 27.610,
    minLon: 81.580,
    maxLon: 81.610,
  },
  {
    name: "Gonda Road / Police Lines",
    minLat: 27.560,
    maxLat: 27.580,
    minLon: 81.610,
    maxLon: 81.635,
  },
];

/**
 * Resolves coordinates to a clean, familiar local locality in Bahraich.
 * Never returns raw decimal numbers.
 */
export function resolveBahraichArea(lat?: number | null, lon?: number | null): string {
  if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return "Bahraich City Center";
  }

  for (const zone of BAHRAICH_LANDMARKS) {
    if (lat >= zone.minLat && lat <= zone.maxLat && lon >= zone.minLon && lon <= zone.maxLon) {
      return `${zone.name}, Bahraich`;
    }
  }

  // Fallback within general Bahraich area
  if (lat >= 27.50 && lat <= 27.65 && lon >= 81.50 && lon <= 81.70) {
    return "Bahraich Central Zone";
  }

  return "Bahraich Delivery Zone";
}
