import { createHmac, timingSafeEqual } from "node:crypto";

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
