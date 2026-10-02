import "server-only";

import { createHash, randomBytes } from "node:crypto";

export function createMerchantInviteToken() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    tokenHash: createHash("sha256").update(token).digest("hex"),
  };
}

export function hashMerchantInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidMerchantInviteToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}

export function merchantRegistrationUrl(token: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  const origin = configured || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return `${origin}/merchant/register/${token}`;
}
