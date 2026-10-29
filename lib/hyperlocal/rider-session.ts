import { createHmac, timingSafeEqual } from "node:crypto";

const RIDER_SESSION_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.APP_SECRET || "trustit_rider_hmac_secret_2026";

/**
 * Creates a cryptographically signed session token for a verified delivery rider.
 * Format: `<rider_uuid>.<hex_hmac_sha256>`
 */
export function signRiderSessionToken(riderId: string): string {
  const hmac = createHmac("sha256", RIDER_SESSION_SECRET);
  hmac.update(`trustit_rider:${riderId}`);
  const signature = hmac.digest("hex");
  return `${riderId}.${signature}`;
}

/**
 * Verifies a rider session token and returns the authenticated riderId, or null if forged/invalid.
 */
export function verifyRiderSessionToken(token: string | null | undefined): string | null {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [riderId, sig] = parts;

  if (!riderId || !sig || sig.length !== 64) return null;

  try {
    const hmac = createHmac("sha256", RIDER_SESSION_SECRET);
    hmac.update(`trustit_rider:${riderId}`);
    const expectedSig = hmac.digest("hex");

    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expectedSig, "hex");

    if (a.length === b.length && timingSafeEqual(a, b)) {
      return riderId;
    }
    return null;
  } catch {
    return null;
  }
}
