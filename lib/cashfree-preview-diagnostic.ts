import { randomUUID } from "node:crypto";
import { CASHFREE_ENDPOINTS } from "./cashfree-environment.ts";

export type PreviewDiagnosticStatus = "PASS" | "FAIL" | "BLOCKED";

type PreviewDiagnosticResult = {
  deployment: PreviewDiagnosticStatus;
  authorization: PreviewDiagnosticStatus;
  environment: PreviewDiagnosticStatus;
  apiBaseUrl: PreviewDiagnosticStatus;
  clientId: PreviewDiagnosticStatus;
  clientSecret: PreviewDiagnosticStatus;
  cashfreeAuthentication?: PreviewDiagnosticStatus;
  errorCategory?: "configuration" | "provider_authentication" | "provider_unavailable" | "network" | "unexpected_response";
};

type DiagnosticDependencies = {
  getEnvironment(): Record<string, string | undefined>;
  isActiveAdmin(): Promise<boolean>;
  fetcher?: typeof fetch;
  makeOrderId?: () => string;
};

const ROUTE_HEADERS = {
  "cache-control": "no-store, max-age=0",
  pragma: "no-cache",
  vary: "Cookie, Origin",
  "x-content-type-options": "nosniff",
};

function response(statusCode: number, body: PreviewDiagnosticResult): Response {
  return Response.json(body, { status: statusCode, headers: ROUTE_HEADERS });
}

function normalizedHost(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value.includes("://") ? value : `https://${value}`).host.toLowerCase();
  } catch {
    return null;
  }
}

function isAllowedPreviewDeployment(env: Record<string, string | undefined>): boolean {
  if (
    env.VERCEL_ENV !== "preview" ||
    env.VERCEL_GIT_COMMIT_REF !== "codex/cashfree-sandbox-preview"
  ) return false;

  const deploymentHost = normalizedHost(env.VERCEL_URL);
  const productionHost = normalizedHost(env.VERCEL_PROJECT_PRODUCTION_URL);
  return Boolean(deploymentHost && productionHost && deploymentHost !== productionHost);
}

function isSameOriginPreviewRequest(request: Request, env: Record<string, string | undefined>): boolean {
  const origin = normalizedHost(request.headers.get("origin") ?? undefined);
  const deploymentHost = normalizedHost(env.VERCEL_URL);
  return Boolean(origin && deploymentHost && origin === deploymentHost);
}

function generatedProbeOrderId(): string {
  return `rqr_${randomUUID().replaceAll("-", "")}`;
}

async function cancelBody(response: globalThis.Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // The diagnostic never needs provider response content.
  }
}

/**
 * Temporarily verifies the effective Preview Cashfree configuration without
 * creating an order. A random read-only order lookup distinguishes accepted
 * credentials (404 or 2xx) from rejected credentials (401/403).
 */
export function createCashfreePreviewDiagnosticHandler(deps: DiagnosticDependencies) {
  return async function POST(request: Request): Promise<Response> {
    const env = deps.getEnvironment();
    if (!isAllowedPreviewDeployment(env)) {
      return response(404, {
        deployment: "BLOCKED",
        authorization: "BLOCKED",
        environment: "BLOCKED",
        apiBaseUrl: "BLOCKED",
        clientId: "BLOCKED",
        clientSecret: "BLOCKED",
      });
    }

    if (
      request.method !== "POST" ||
      !isSameOriginPreviewRequest(request, env) ||
      !(await deps.isActiveAdmin().catch(() => false))
    ) {
      return response(401, {
        deployment: "PASS",
        authorization: "FAIL",
        environment: "BLOCKED",
        apiBaseUrl: "BLOCKED",
        clientId: "BLOCKED",
        clientSecret: "BLOCKED",
      });
    }

    const environmentStatus: PreviewDiagnosticStatus = env.CASHFREE_ENVIRONMENT === "sandbox" ? "PASS" : "FAIL";
    const apiBaseUrlStatus: PreviewDiagnosticStatus = env.CASHFREE_API_BASE_URL === CASHFREE_ENDPOINTS.sandbox ? "PASS" : "FAIL";
    const clientIdStatus: PreviewDiagnosticStatus = env.CASHFREE_CLIENT_ID?.trim() ? "PASS" : "BLOCKED";
    const clientSecretStatus: PreviewDiagnosticStatus = env.CASHFREE_CLIENT_SECRET?.trim() ? "PASS" : "BLOCKED";
    const configIsValid =
      environmentStatus === "PASS" &&
      apiBaseUrlStatus === "PASS" &&
      clientIdStatus === "PASS" &&
      clientSecretStatus === "PASS";

    const baseResult: PreviewDiagnosticResult = {
      deployment: "PASS",
      authorization: "PASS",
      environment: environmentStatus,
      apiBaseUrl: apiBaseUrlStatus,
      clientId: clientIdStatus,
      clientSecret: clientSecretStatus,
    };

    if (!configIsValid) {
      return response(200, { ...baseResult, cashfreeAuthentication: "BLOCKED", errorCategory: "configuration" });
    }

    const orderId = (deps.makeOrderId ?? generatedProbeOrderId)();
    if (!/^rqr_[a-f0-9]{32}$/.test(orderId)) {
      return response(200, { ...baseResult, cashfreeAuthentication: "BLOCKED", errorCategory: "unexpected_response" });
    }

    let providerResponse: globalThis.Response;
    try {
      providerResponse = await (deps.fetcher ?? fetch)(
        `${CASHFREE_ENDPOINTS.sandbox}/orders/${encodeURIComponent(orderId)}`,
        {
          method: "GET",
          cache: "no-store",
          // Never forward Cashfree credentials if the endpoint redirects.
          redirect: "manual",
          signal: AbortSignal.timeout(8_000),
          headers: {
            accept: "application/json",
            "x-client-id": env.CASHFREE_CLIENT_ID!.trim(),
            "x-client-secret": env.CASHFREE_CLIENT_SECRET!.trim(),
            "x-api-version": "2026-01-01",
          },
        },
      );
    } catch {
      return response(200, { ...baseResult, cashfreeAuthentication: "BLOCKED", errorCategory: "network" });
    }

    const status = providerResponse.status;
    await cancelBody(providerResponse);

    if (status === 401 || status === 403) {
      return response(200, { ...baseResult, cashfreeAuthentication: "FAIL", errorCategory: "provider_authentication" });
    }
    if ((status >= 200 && status < 300) || status === 404) {
      return response(200, { ...baseResult, cashfreeAuthentication: "PASS" });
    }
    if (status === 429 || status >= 500) {
      return response(200, { ...baseResult, cashfreeAuthentication: "BLOCKED", errorCategory: "provider_unavailable" });
    }
    return response(200, { ...baseResult, cashfreeAuthentication: "BLOCKED", errorCategory: "unexpected_response" });
  };
}
