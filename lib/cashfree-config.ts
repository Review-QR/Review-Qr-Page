export type CashfreeEnvironment = "sandbox" | "production";

const API_PATH = "/pg";
const API_ORIGINS: Record<CashfreeEnvironment, string> = {
  sandbox: "https://sandbox.cashfree.com",
  production: "https://api.cashfree.com",
};

export function resolveCashfreeApiBaseUrl(
  environment: string,
  configuredBaseUrl: string,
): { environment: CashfreeEnvironment; apiBaseUrl: string } | null {
  if (environment !== "sandbox" && environment !== "production") return null;
  try {
    const url = new URL(configuredBaseUrl);
    const expectedOrigin = API_ORIGINS[environment];
    if (
      url.origin !== expectedOrigin ||
      ![API_PATH, `${API_PATH}/`].includes(url.pathname) ||
      url.username || url.password || url.search || url.hash
    ) return null;
    return { environment, apiBaseUrl: `${expectedOrigin}${API_PATH}` };
  } catch {
    return null;
  }
}
