/**
 * Shared Hyperlocal Location & Landmark Service
 */

import { resolveBahraichArea } from "@/lib/hyperlocal/location-resolver";

export const locationService = {
  resolveAreaName: resolveBahraichArea,
};
