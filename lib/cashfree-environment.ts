export type CashfreeEnvironment = "sandbox" | "production";

export const CASHFREE_ENDPOINTS: Record<CashfreeEnvironment, string> = {
  sandbox: "https://sandbox.cashfree.com/pg",
  production: "https://api.cashfree.com/pg",
};

export type CashfreeServerConfiguration = {
  environment: CashfreeEnvironment;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
};

export function cashfreeLivePaymentsEnabled(env: Record<string, string | undefined>): boolean {
  return env.CASHFREE_LIVE_PAYMENTS_ENABLED?.trim() === "true";
}

/** Keep diagnostics and checkout on the same normalized endpoint contract. */
export function cashfreeApiBaseUrlMatchesEnvironment(
  value: string | undefined,
  environment: CashfreeEnvironment,
): boolean {
  const configuredBaseUrl = value?.trim();
  if (!configuredBaseUrl) return false;

  const expectedBaseUrl = CASHFREE_ENDPOINTS[environment];
  try {
    const parsed = new URL(configuredBaseUrl);
    return (
      configuredBaseUrl.replace(/\/$/, "") === expectedBaseUrl &&
      parsed.href.replace(/\/$/, "") === expectedBaseUrl &&
      !parsed.username && !parsed.password && !parsed.search && !parsed.hash
    );
  } catch {
    return false;
  }
}

export function resolveCashfreeServerConfiguration(
  env: Record<string, string | undefined>,
): CashfreeServerConfiguration {
  const environment = env.CASHFREE_ENVIRONMENT?.trim();
  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("Cashfree environment must be sandbox or production");
  }

  const deploymentEnvironment = env.VERCEL_ENV?.trim();
  if (
    (deploymentEnvironment === "production" && environment !== "production") ||
    (deploymentEnvironment === "preview" && environment !== "sandbox")
  ) {
    throw new Error("Cashfree environment does not match the Vercel deployment target");
  }

  const required = (name: string) => {
    const value = env[name]?.trim();
    if (!value) throw new Error("Cashfree server configuration is incomplete");
    return value;
  };
  const clientId = required("CASHFREE_CLIENT_ID");
  const clientSecret = required("CASHFREE_CLIENT_SECRET");
  const configuredBaseUrl = required("CASHFREE_API_BASE_URL");
  try {
    new URL(configuredBaseUrl);
  } catch {
    throw new Error("Cashfree API base URL is invalid");
  }
  if (!cashfreeApiBaseUrlMatchesEnvironment(configuredBaseUrl, environment)) {
    throw new Error("Cashfree API base URL does not match the selected environment");
  }

  const expectedBaseUrl = CASHFREE_ENDPOINTS[environment];
  return { environment, apiBaseUrl: expectedBaseUrl, clientId, clientSecret };
}
