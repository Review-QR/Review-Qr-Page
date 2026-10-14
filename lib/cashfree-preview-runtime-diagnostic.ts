import {
  cashfreeApiBaseUrlMatchesEnvironment,
  cashfreeLivePaymentsEnabled,
} from "./cashfree-environment.ts";
import {
  cashfreePreviewWebhookIngressEnabled,
  isPinnedPreviewSupabaseUrl,
} from "./cashfree-webhook-url.ts";

const EXPECTED_VERCEL_PROJECT_ID = "prj_mKkYk1wDcdwzQzWw2JUNBsAiuhRS";
const EXPECTED_BRANCH = "codex/cashfree-sandbox-preview";
const EXPECTED_BRANCH_HOST =
  "review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app";
const EXPECTED_PREVIEW_ORIGIN = `https://${EXPECTED_BRANCH_HOST}`;
const DIAGNOSTIC_PATH = "/api/admin/cashfree-preview-runtime-check";

export type DiagnosticStatus = "PASS" | "FAIL" | "NOT VERIFIED";

export type PreviewCashfreeDiagnosticEnvironment = Record<string, string | undefined>;

export type PreviewCashfreeDiagnosticChecks = {
  cashfreeEnvironment: DiagnosticStatus;
  cashfreeApiBaseUrl: DiagnosticStatus;
  cashfreePreviewWebhookIngress: DiagnosticStatus;
  previewSupabaseTarget: DiagnosticStatus;
  cashfreeClientIdPresent: DiagnosticStatus;
  cashfreeClientSecretPresent: DiagnosticStatus;
  cashfreeCredentialPairIdentity: "NOT VERIFIED";
  cashfreeLivePaymentsDisabled: DiagnosticStatus;
};

type AuthorizeActiveAdmin = () => Promise<boolean>;

function commonHeaders(): HeadersInit {
  return {
    "Cache-Control": "private, no-store",
    Vary: "Cookie",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
}

function emptyResponse(status: number): Response {
  return new Response(null, { status, headers: commonHeaders() });
}

function hasSameOriginRequest(request: Request): boolean {
  try {
    const requestUrl = new URL(request.url);
    return (
      requestUrl.origin === EXPECTED_PREVIEW_ORIGIN &&
      requestUrl.pathname === DIAGNOSTIC_PATH &&
      requestUrl.search === "" &&
      requestUrl.hash === "" &&
      request.headers.get("origin") === EXPECTED_PREVIEW_ORIGIN &&
      request.headers.get("sec-fetch-site") === "same-origin"
    );
  } catch {
    return false;
  }
}

function isExpectedPreviewRuntime(env: PreviewCashfreeDiagnosticEnvironment): boolean {
  return (
    env.VERCEL_PROJECT_ID === EXPECTED_VERCEL_PROJECT_ID &&
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_GIT_COMMIT_REF === EXPECTED_BRANCH &&
    env.VERCEL_BRANCH_URL === EXPECTED_BRANCH_HOST
  );
}

function hasRequiredSupabaseTarget(env: PreviewCashfreeDiagnosticEnvironment): boolean {
  return isPinnedPreviewSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL);
}

function present(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function buildChecks(env: PreviewCashfreeDiagnosticEnvironment): PreviewCashfreeDiagnosticChecks {
  return {
    cashfreeEnvironment:
      env.CASHFREE_ENVIRONMENT?.trim() === "sandbox" ? "PASS" : "FAIL",
    cashfreeApiBaseUrl:
      cashfreeApiBaseUrlMatchesEnvironment(env.CASHFREE_API_BASE_URL, "sandbox") ? "PASS" : "FAIL",
    cashfreePreviewWebhookIngress:
      cashfreePreviewWebhookIngressEnabled(env.CASHFREE_PREVIEW_WEBHOOK_INGRESS_ENABLED) ? "PASS" : "FAIL",
    previewSupabaseTarget: "PASS",
    cashfreeClientIdPresent: present(env.CASHFREE_CLIENT_ID) ? "PASS" : "FAIL",
    cashfreeClientSecretPresent: present(env.CASHFREE_CLIENT_SECRET) ? "PASS" : "FAIL",
    cashfreeCredentialPairIdentity: "NOT VERIFIED",
    cashfreeLivePaymentsDisabled: cashfreeLivePaymentsEnabled(env) ? "FAIL" : "PASS",
  };
}

/**
 * Read-only status handler. It authorizes only after deployment and Supabase
 * target checks, and deliberately has no provider, fetch, or payment dependency.
 */
export async function handlePreviewCashfreeRuntimeDiagnostic(
  request: Request,
  env: PreviewCashfreeDiagnosticEnvironment,
  authorizeActiveAdmin: AuthorizeActiveAdmin,
): Promise<Response> {
  if (request.method !== "POST") return emptyResponse(405);
  if (!hasSameOriginRequest(request) || request.body !== null) return emptyResponse(403);

  // These checks must precede admin-client creation so a wrong URL can never
  // cause an auth request to Production or another Supabase project.
  if (!isExpectedPreviewRuntime(env) || !hasRequiredSupabaseTarget(env)) {
    return emptyResponse(404);
  }

  try {
    if (!(await authorizeActiveAdmin())) return emptyResponse(401);
  } catch {
    return emptyResponse(401);
  }

  const body = JSON.stringify({ checks: buildChecks(env) });
  return new Response(body, {
    status: 200,
    headers: { ...commonHeaders(), "Content-Type": "application/json; charset=utf-8" },
  });
}
