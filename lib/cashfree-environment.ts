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

export function resolveCashfreeServerConfiguration(
  env: Record<string, string | undefined>,
): CashfreeServerConfiguration {
  const environment = env.CASHFREE_ENVIRONMENT?.trim();
  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("Cashfree environment must be sandbox or production");
  }

  const required = (name: string) => {
    const value = env[name]?.trim();
    if (!value) throw new Error("Cashfree server configuration is incomplete");
    return value;
  };
  const clientId = required("CASHFREE_CLIENT_ID");
  const clientSecret = required("CASHFREE_CLIENT_SECRET");
  const configuredBaseUrl = required("CASHFREE_API_BASE_URL");
  const expectedBaseUrl = CASHFREE_ENDPOINTS[environment];

  let parsed: URL;
  try {
    parsed = new URL(configuredBaseUrl);
  } catch {
    throw new Error("Cashfree API base URL is invalid");
  }
  if (
    configuredBaseUrl.replace(/\/$/, "") !== expectedBaseUrl ||
    parsed.href.replace(/\/$/, "") !== expectedBaseUrl ||
    parsed.username || parsed.password || parsed.search || parsed.hash
  ) {
    throw new Error("Cashfree API base URL does not match the selected environment");
  }

  return { environment, apiBaseUrl: expectedBaseUrl, clientId, clientSecret };
}
