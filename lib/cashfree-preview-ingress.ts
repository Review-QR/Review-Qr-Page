export type CashfreePreviewIngressDecision = "continue" | "allow" | "reject";

type CashfreePreviewIngressInput = {
  vercelEnvironment?: string;
  vercelGitCommitRef?: string;
  cashfreeEnvironment?: string;
  cashfreeApiBaseUrl?: string;
  requestHost: string;
  requestPath: string;
  requestMethod: string;
  webhookUrl?: string;
  ingressEnabled?: string;
  vercelUrl?: string;
  vercelBranchUrl?: string;
};

function normalizedHost(value: string | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    const candidate = value.includes("://") ? value : `https://${value}`;
    return new URL(candidate).host.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

function isVercelDeploymentHost(
  requestHost: string,
  vercelUrl?: string,
  vercelBranchUrl?: string,
): boolean {
  const host = normalizedHost(requestHost);
  if (!host) return false;

  const knownDeploymentHosts = [vercelUrl, vercelBranchUrl]
    .map(normalizedHost)
    .filter((value): value is string => value !== null);

  return (
    knownDeploymentHosts.includes(host) ||
    host === "vercel.app" ||
    host.endsWith(".vercel.app")
  );
}

function configuredWebhookHost(webhookUrl?: string): string | null {
  if (!webhookUrl?.trim()) return null;

  try {
    const url = new URL(webhookUrl);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/api/cashfree/webhook"
    ) {
      return null;
    }
    return url.host.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}

/**
 * Limits the public Preview custom domain to the signed Cashfree webhook on
 * the dedicated Sandbox branch. The ordinary Vercel deployment host remains
 * subject to Vercel Deployment Protection.
 */
export function resolveCashfreePreviewIngressDecision(
  input: CashfreePreviewIngressInput,
): CashfreePreviewIngressDecision {
  if (input.vercelEnvironment !== "preview") return "continue";

  if (
    isVercelDeploymentHost(
      input.requestHost,
      input.vercelUrl,
      input.vercelBranchUrl,
    )
  ) {
    return "continue";
  }

  const requestHost = normalizedHost(input.requestHost);
  const webhookHost = configuredWebhookHost(input.webhookUrl);

  if (!requestHost || !webhookHost || requestHost !== webhookHost) {
    return "reject";
  }

  const apiBaseUrl = input.cashfreeApiBaseUrl?.trim().replace(/\/$/, "");
  if (
    input.vercelGitCommitRef !== "codex/cashfree-sandbox-preview" ||
    input.cashfreeEnvironment !== "sandbox" ||
    apiBaseUrl !== "https://sandbox.cashfree.com/pg" ||
    input.ingressEnabled?.trim() !== "true" ||
    input.requestMethod.toUpperCase() !== "POST" ||
    input.requestPath !== "/api/cashfree/webhook"
  ) {
    return "reject";
  }

  return "allow";
}
