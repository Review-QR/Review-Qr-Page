import { NextResponse } from "next/server";

export const PRODUCTION_ALLOWED_ORIGINS = new Set<string>([
  "https://trustitreview.com",
  "https://www.trustitreview.com",
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
]);

function getConfiguredExtraOrigins(): Set<string> {
  const raw = process.env.ALLOWED_CORS_ORIGINS || "";
  const extra = new Set<string>();
  for (const item of raw.split(",")) {
    const trimmed = item.trim();
    if (trimmed) {
      extra.add(trimmed);
    }
  }
  return extra;
}

/**
 * Validates a browser `Origin` header against the strict TrustIt allowlist.
 * Never returns `*`. Development localhost/tunnel ports are allowed only outside production.
 */
export function resolveAllowedOrigin(origin: string | null | undefined): string | null {
  if (!origin) return null;
  const trimmed = origin.trim();
  if (!trimmed || trimmed === "null") return null;

  if (PRODUCTION_ALLOWED_ORIGINS.has(trimmed)) {
    return trimmed;
  }

  if (getConfiguredExtraOrigins().has(trimmed)) {
    return trimmed;
  }

  if (process.env.NODE_ENV !== "production") {
    try {
      const parsed = new URL(trimmed);
      const isHttpOrHttps = parsed.protocol === "http:" || parsed.protocol === "https:";
      const isLocalHost = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
      const isTryCloudflare =
        parsed.protocol === "https:" &&
        parsed.hostname.endsWith(".trycloudflare.com") &&
        parsed.hostname.length > ".trycloudflare.com".length;

      if ((isHttpOrHttps && isLocalHost) || isTryCloudflare) {
        return trimmed;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function buildCorsHeaders(
  origin: string | null | undefined,
  allowedMethods = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
): Record<string, string> {
  const allowedOrigin = resolveAllowedOrigin(origin);
  const headers: Record<string, string> = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": allowedMethods,
    "Access-Control-Allow-Headers":
      "X-Requested-With, Content-Type, Authorization, Accept, Origin",
    "Access-Control-Max-Age": "86400",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function handleCorsPreflight(
  request: Request,
  allowedMethods = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
): NextResponse {
  const origin = request.headers.get("origin");
  if (origin && !resolveAllowedOrigin(origin)) {
    return NextResponse.json(
      { success: false, error: "Origin not allowed by CORS policy." },
      { status: 403, headers: { Vary: "Origin" } }
    );
  }

  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(origin, allowedMethods),
  });
}

export function applyCorsHeaders(
  response: NextResponse,
  origin: string | null | undefined,
  allowedMethods?: string
): NextResponse {
  const cors = buildCorsHeaders(origin, allowedMethods);
  for (const [key, value] of Object.entries(cors)) {
    response.headers.set(key, value);
  }
  if (!cors["Access-Control-Allow-Origin"]) {
    response.headers.delete("Access-Control-Allow-Origin");
    response.headers.delete("Access-Control-Allow-Credentials");
  }
  return response;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
