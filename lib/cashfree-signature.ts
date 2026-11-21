import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cashfree's `x-webhook-timestamp` is a Unix timestamp. We auto-detect the unit
 * (10 digits => seconds, 13 digits => milliseconds) so the replay check is safe
 * whether the gateway sends seconds or millis. Anything that doesn't parse is
 * rejected (returns false).
 */
function parseTimestampMs(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  const digits = raw.length;
  // 10 digits => seconds (~10^9 magnitude today), 13 digits => milliseconds.
  if (digits <= 10) return value * 1000;
  if (digits >= 13) return value;
  // 11-12 digit edge case: treat as seconds (conservative, larger window).
  return value * 1000;
}

/**
 * Replay-window guard for Cashfree webhooks. Defense-in-depth on top of the
 * HMAC check: reject events whose timestamp is older than `maxAgeMs`, so a
 * captured valid webhook cannot be replayed indefinitely.
 *
 * Design notes (per approval):
 *  - Does NOT reject legitimate delayed/redelivered events: the default window
 *    (900s) comfortably exceeds Cashfree's retry jitter, and a small
 *    `clockSkewMs` buffer tolerates gateway/server clock drift in BOTH
 *    directions (a slightly-future timestamp is not a replay).
 *  - Configurable via `maxAgeMs`; pass 0 to disable the window (signature-only).
 *  - Pure + synchronous => trivially unit-testable without network/DB.
 */
export function verifyCashfreeWebhookReplayWindow(input: {
  timestamp: string | null;
  maxAgeMs?: number;
  clockSkewMs?: number;
  nowMs?: number;
}): boolean {
  if (input.maxAgeMs === 0) return true; // window disabled => signature-only
  if (!input.timestamp) return false;
  const tsMs = parseTimestampMs(input.timestamp);
  if (tsMs === null) return false;

  const maxAgeMs = input.maxAgeMs ?? 900_000; // default 15 minutes
  const clockSkewMs = input.clockSkewMs ?? 60_000; // 1 minute slack
  const nowMs = input.nowMs ?? Date.now();

  const drift = nowMs - tsMs;
  // Allow small negative drift (clock skew / near-future timestamp).
  if (drift < -clockSkewMs) return false;
  return drift <= maxAgeMs + clockSkewMs;
}

export function verifyCashfreeSignature(input: {
  secret: string;
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
}): boolean {
  if (!input.secret || !input.timestamp || !/^\d{10,16}$/.test(input.timestamp) ||
    !input.signature || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.signature)) return false;
  try {
    const expected = createHmac("sha256", input.secret).update(`${input.timestamp}${input.rawBody}`).digest();
    const supplied = Buffer.from(input.signature, "base64");
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  } catch {
    return false;
  }
}
