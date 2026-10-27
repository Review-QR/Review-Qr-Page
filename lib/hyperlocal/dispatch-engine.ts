import type { DeliveryRider } from "./types.ts";

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates straight-line spherical distance between two GPS coordinates using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Estimates transit time in minutes assuming realistic Tier-2 city city speed (~25 km/h) plus traffic buffer.
 */
export function estimateTransitTimeMinutes(distanceKm: number, averageSpeedKmH = 25): number {
  if (distanceKm <= 0) return 3;
  const transitMinutes = (distanceKm / averageSpeedKmH) * 60;
  return Math.ceil(transitMinutes + 3); // 3 min pickup buffer
}

/**
 * Sorts and filters available online riders by proximity to the merchant's shop.
 */
export function findNearestAvailableRiders(
  riders: DeliveryRider[],
  merchantLat: number,
  merchantLon: number,
  maxRadiusKm = 4.0,
): DeliveryRider[] {
  if (!Array.isArray(riders)) return [];

  const candidates: DeliveryRider[] = [];

  for (const rider of riders) {
    if (!rider.is_online || !rider.is_available) continue;
    if (
      typeof rider.current_latitude !== "number" ||
      typeof rider.current_longitude !== "number"
    ) {
      continue;
    }

    const distance = calculateHaversineDistanceKm(
      merchantLat,
      merchantLon,
      rider.current_latitude,
      rider.current_longitude,
    );

    if (distance <= maxRadiusKm) {
      candidates.push({
        ...rider,
        distanceKm: distance,
      });
    }
  }

  // Sort ascending by distance (nearest first)
  return candidates.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
}
