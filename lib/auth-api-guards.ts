import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { getActiveAdminContext } from "@/lib/supabase-server";
import { checkRateLimit } from "@/lib/rate-limiter";
import { getClientIp } from "@/lib/auth-cors";

export type ActiveMerchant = NonNullable<Awaited<ReturnType<typeof getActiveMerchant>>>;
export type AdminContext = NonNullable<Awaited<ReturnType<typeof getActiveAdminContext>>>;

export const CUSTOMER_SESSION_COOKIE = "trustit_customer_session";

function getCustomerSessionSecret(): string {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "trustit_customer_hmac_dev_secret"
  );
}

export function createCustomerSessionToken(payload: {
  customerId?: string;
  phone?: string | null;
  email?: string | null;
}): string {
  const data = Buffer.from(
    JSON.stringify({
      cid: payload.customerId || "",
      ph: normalizePhone10(payload.phone || ""),
      em: (payload.email || "").trim().toLowerCase(),
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    })
  ).toString("base64url");
  const sig = createHmac("sha256", getCustomerSessionSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyCustomerSessionToken(
  token: string | undefined | null
): { customerId: string; phone: string; email: string } | null {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = createHmac("sha256", getCustomerSessionSecret())
    .update(data)
    .digest("base64url");
  if (!constantTimeEqual(sig, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as {
      cid?: string;
      ph?: string;
      em?: string;
      exp?: number;
    };
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return {
      customerId: parsed.cid || "",
      phone: parsed.ph || "",
      email: parsed.em || "",
    };
  } catch {
    return null;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value.trim());
}

export function normalizePhone10(value: unknown): string {
  if (typeof value !== "string") return "";
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i += 1) {
    const byteA = i < aBytes.length ? aBytes[i] : 0;
    const byteB = i < bBytes.length ? bBytes[i] : 0;
    diff |= byteA ^ byteB;
  }
  return diff === 0;
}

export async function requireAdminApi(): Promise<
  | { ok: true; admin: AdminContext }
  | { ok: false; response: NextResponse }
> {
  try {
    const admin = await getActiveAdminContext();
    if (!admin) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized: admin session required." },
          { status: 401 }
        ),
      };
    }
    return { ok: true, admin };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: invalid admin session." },
        { status: 401 }
      ),
    };
  }
}

export async function requireMerchantApi(): Promise<
  | { ok: true; merchant: ActiveMerchant }
  | { ok: false; response: NextResponse }
> {
  try {
    const merchant = await getActiveMerchant();
    if (!merchant) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized: active merchant session required." },
          { status: 401 }
        ),
      };
    }
    return { ok: true, merchant };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: invalid merchant session." },
        { status: 401 }
      ),
    };
  }
}

export function enforceRateLimit(
  request: Request,
  bucket: string,
  maxRequests: number,
  windowMs: number,
  extraKey?: string
): NextResponse | null {
  const ip = getClientIp(request);
  const cleanExtra = extraKey ? `:${extraKey.trim().toLowerCase()}` : "";
  const key = `${bucket}:${ip}${cleanExtra}`;
  const result = checkRateLimit(key, { maxRequests, windowMs });
  if (result.success) return null;

  const retryAfterSec = Math.max(1, Math.ceil(result.resetMs / 1000));
  return NextResponse.json(
    {
      success: false,
      error: `Too many requests. Please try again in ${retryAfterSec} seconds.`,
      retryAfterSeconds: retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
      },
    }
  );
}

/**
 * Verifies a Google OAuth2 ID token against Google's tokeninfo endpoint when supplied.
 * Returns null if invalid or email is unverified.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  expectedEmail?: string
): Promise<{ email: string; name?: string } | null> {
  try {
    const trimmed = idToken.trim();
    if (!trimmed) return null;
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(trimmed)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const payload = (await res.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
    };
    const isVerified =
      payload.email_verified === true || payload.email_verified === "true";
    if (!isVerified || !payload.email) return null;

    const configuredClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (configuredClientId && payload.aud && payload.aud !== configuredClientId) {
      return null;
    }

    const tokenEmail = payload.email.trim().toLowerCase();
    if (expectedEmail && tokenEmail !== expectedEmail.trim().toLowerCase()) {
      return null;
    }

    return {
      email: tokenEmail,
      name: payload.name,
    };
  } catch {
    return null;
  }
}
