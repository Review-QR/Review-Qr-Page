import type { DeliveryRider, HyperlocalOrder } from "./types.ts";
import { isValidHyperlocalOrderId } from "./order-id.ts";

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

export const CASCADING_RADII_METERS = [1000, 1100, 1300, 1500, 2000, 3000];

/**
 * Executes proximity waterfall dispatch:
 * Starts at 1000m. If rider ignores/declines within 30s, automatically escalates to 1100m, etc. up to 3000m.
 */
export async function dispatchCascadingRadar(orderId: string) {
  if (!isValidHyperlocalOrderId(orderId)) {
    throw new Error("Invalid order reference for dispatch.");
  }

  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const admin = createSupabaseAdminClient();

  // 1. Fetch order and merchant coordinates
  const { data: order, error: orderErr } = await admin
    .from("hyperlocal_orders")
    .select(`
      id, status, rider_id, dispatch_target_rider_id, dispatch_expires_at,
      dispatch_current_radius_meters, dispatch_declined_rider_ids,
      businesses (location_latitude, location_longitude, name)
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    throw new Error("Order not found for dispatch.");
  }

  // If rider is already assigned or order delivered/cancelled, stop dispatch
  if (order.rider_id || ["delivered", "completed", "cancelled", "rejected"].includes(order.status)) {
    return { success: true, alreadyAssigned: true, riderId: order.rider_id };
  }

  // Check if current dispatch slot is still actively ticking within 30 seconds
  if (
    order.dispatch_target_rider_id &&
    order.dispatch_expires_at &&
    new Date(order.dispatch_expires_at).getTime() > Date.now()
  ) {
    const secondsRemaining = Math.max(
      1,
      Math.round((new Date(order.dispatch_expires_at).getTime() - Date.now()) / 1000),
    );
    return {
      success: true,
      activeSlot: true,
      targetRiderId: order.dispatch_target_rider_id,
      secondsRemaining,
      radiusMeters: order.dispatch_current_radius_meters || 1000,
    };
  }

  const biz = (Array.isArray(order.businesses) ? order.businesses[0] : order.businesses) as { location_latitude?: number; location_longitude?: number; name?: string } | undefined;
  const merchantLat = biz?.location_latitude || 27.5742;
  const merchantLon = biz?.location_longitude || 81.5961;
  const declinedIds: string[] = order.dispatch_declined_rider_ids || [];

  // If previous slot expired, add previous target to declined list
  if (order.dispatch_target_rider_id && !declinedIds.includes(order.dispatch_target_rider_id)) {
    declinedIds.push(order.dispatch_target_rider_id);
  }

  // 2. Fetch all online, available delivery partners
  const { data: allRiders } = await admin
    .from("delivery_riders")
    .select("id, full_name, phone, vehicle_type, vehicle_number, rating, current_latitude, current_longitude, is_online, is_available")
    .eq("is_online", true)
    .eq("is_available", true);

  if (!allRiders || allRiders.length === 0) {
    return { success: false, reason: "No delivery partners are currently online in your city." };
  }

  // Filter out riders who already declined or timed out
  const availableRiders = (allRiders as unknown as DeliveryRider[]).filter(
    (r) => !declinedIds.includes(r.id),
  );

  if (availableRiders.length === 0) {
    return { success: false, reason: "All nearby delivery partners have declined or timed out." };
  }

  // Calculate distance for each available candidate
  const candidateList = availableRiders
    .map((r) => {
      const lat = r.current_latitude || 27.5742;
      const lon = r.current_longitude || 81.5961;
      const distKm = calculateHaversineDistanceKm(merchantLat, merchantLon, lat, lon);
      const distMeters = Math.round(distKm * 1000);
      return { ...r, distanceKm: distKm, distanceMeters: distMeters };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  // 3. Cascading Radius Search (1000m -> 1100m -> 1300m -> 1500m -> 2000m -> 3000m)
  const currentRadius = order.dispatch_current_radius_meters || 1000;
  let targetRadius = currentRadius;
  let matchedCandidate = candidateList.find((c) => c.distanceMeters <= targetRadius);

  // If no candidate in current radius, expand to next ring that contains at least one rider
  if (!matchedCandidate) {
    for (const radiusStep of CASCADING_RADII_METERS) {
      if (radiusStep > currentRadius) {
        matchedCandidate = candidateList.find((c) => c.distanceMeters <= radiusStep);
        if (matchedCandidate) {
          targetRadius = radiusStep;
          break;
        }
      }
    }
  }

  // If still no candidate within 3000m, pick closest within max 5km fallback
  if (!matchedCandidate && candidateList[0] && candidateList[0].distanceMeters <= 5000) {
    matchedCandidate = candidateList[0];
    targetRadius = Math.max(3000, matchedCandidate.distanceMeters);
  }

  if (!matchedCandidate) {
    await admin
      .from("hyperlocal_orders")
      .update({
        dispatch_declined_rider_ids: declinedIds,
        dispatch_current_radius_meters: 3000,
        dispatch_target_rider_id: null,
        dispatch_expires_at: null,
      })
      .eq("id", orderId);

    return { success: false, reason: "No available delivery partner within 3km radius." };
  }

  // 4. Assign 30-Second Countdown Window to matched rider
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30_000).toISOString();

  await admin
    .from("hyperlocal_orders")
    .update({
      dispatch_target_rider_id: matchedCandidate.id,
      dispatch_expires_at: expiresAt,
      dispatch_current_radius_meters: targetRadius,
      dispatch_declined_rider_ids: declinedIds,
      updated_at: now.toISOString(),
    })
    .eq("id", orderId);

  return {
    success: true,
    matchedRider: {
      id: matchedCandidate.id,
      name: matchedCandidate.full_name,
      distanceMeters: matchedCandidate.distanceMeters,
    },
    radiusMeters: targetRadius,
    expiresAt,
    secondsRemaining: 30,
  };
}

/**
 * Handles rider decline or 30-second timeout:
 * Immediately skips this rider, expands radius, and waterfalls to the next nearest rider.
 */
export async function handleRiderTimeoutOrDecline(orderId: string, riderId: string) {
  if (!isValidHyperlocalOrderId(orderId)) {
    throw new Error("Invalid order ID.");
  }

  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("hyperlocal_orders")
    .select("dispatch_declined_rider_ids, dispatch_current_radius_meters")
    .eq("id", orderId)
    .maybeSingle();

  const declined: string[] = order?.dispatch_declined_rider_ids || [];
  if (!declined.includes(riderId)) {
    declined.push(riderId);
  }

  const currentRadius = order?.dispatch_current_radius_meters || 1000;
  const nextRadius = Math.min(3000, currentRadius + 100);

  await admin
    .from("hyperlocal_orders")
    .update({
      dispatch_target_rider_id: null,
      dispatch_expires_at: null,
      dispatch_current_radius_meters: nextRadius,
      dispatch_declined_rider_ids: declined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  // Immediately waterfall to next candidate
  return dispatchCascadingRadar(orderId);
}
