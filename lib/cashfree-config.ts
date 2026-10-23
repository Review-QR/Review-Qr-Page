import { CASHFREE_ENDPOINTS, type CashfreeEnvironment } from "./cashfree-environment.ts";

/** Compatibility validator for callers that supply a mode and API URL directly. */
export function resolveCashfreeApiBaseUrl(
  environment: string,
  configuredBaseUrl: string,
): { environment: CashfreeEnvironment; apiBaseUrl: string } | null {
  if (environment !== "sandbox" && environment !== "production") return null;
  try {
    const url = new URL(configuredBaseUrl);
    const expected = CASHFREE_ENDPOINTS[environment];
    if (
      url.origin + url.pathname.replace(/\/$/, "") !== expected ||
      url.username || url.password || url.search || url.hash
    ) return null;
    return { environment, apiBaseUrl: expected };
  } catch {
    return null;
  }
}
