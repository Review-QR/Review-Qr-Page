import { isIP } from "node:net";

type WebhookUrlEnvironment = Record<string, string | undefined>;

function deploymentUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^https:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function originOf(value: string | undefined): string | null {
  const candidate = deploymentUrl(value);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
    const authorityHost = hostname.includes(":") ? `[${hostname}]` : hostname;
    return `https://${authorityHost}${url.port ? `:${url.port}` : ""}`;
  } catch {
    return null;
  }
}

function isLocalOrPrivateWebhookHost(hostname: string): boolean {
  if (
    hostname === "localhost" ||
    !hostname.includes(".") ||
    hostname.split(".").some((label) => !label) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".invalid") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".onion") ||
    hostname === "0.0.0.0"
  ) {
    return true;
  }

  const addressType = isIP(hostname);
  if (addressType === 4) {
    const octets = hostname.split(".").map(Number);
    return (
      octets[0] === 0 ||
      octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168)
    );
  }
  if (addressType === 6) {
    return (
      hostname === "::" ||
      hostname === "::1" ||
      hostname.startsWith("fc") ||
      hostname.startsWith("fd") ||
      hostname.startsWith("fe8") ||
      hostname.startsWith("fe9") ||
      hostname.startsWith("fea") ||
      hostname.startsWith("feb")
    );
  }
  return false;
}

export function resolveCashfreeWebhookUrl(env: WebhookUrlEnvironment): string | null {
  const deploymentEnvironment = env.VERCEL_ENV?.trim();
  if (deploymentEnvironment === "preview") {
    // Cashfree's Create Order API accepts a callback URL, not custom request
    // headers. Do not place Vercel's project-wide protection bypass secret in
    // that URL. Until Preview has a separately approved callback transport,
    // fail closed instead of sending callbacks that cannot reach protected
    // deployments or leaking a bypass credential to Cashfree.
    return null;
  }

  const productionOrigin = originOf(env.VERCEL_PROJECT_PRODUCTION_URL);
  const explicitUrl = env.CASHFREE_WEBHOOK_URL?.trim();

  let configured: string | null = null;
  if (deploymentEnvironment === "production") {
    configured = explicitUrl || (deploymentUrl(env.VERCEL_PROJECT_PRODUCTION_URL)
      ? `${deploymentUrl(env.VERCEL_PROJECT_PRODUCTION_URL)}/api/cashfree/webhook`
      : null);
  } else {
    configured = explicitUrl || (deploymentUrl(env.VERCEL_URL)
      ? `${deploymentUrl(env.VERCEL_URL)}/api/cashfree/webhook`
      : null) || (deploymentUrl(env.VERCEL_PROJECT_PRODUCTION_URL)
      ? `${deploymentUrl(env.VERCEL_PROJECT_PRODUCTION_URL)}/api/cashfree/webhook`
      : null);
  }
  if (!configured) return null;

  try {
    const url = new URL(configured);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
    const webhookOrigin = originOf(url.toString());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/api/cashfree/webhook" ||
      isLocalOrPrivateWebhookHost(hostname) ||
      (env.CASHFREE_ENVIRONMENT?.trim() === "sandbox" && webhookOrigin === productionOrigin)
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
