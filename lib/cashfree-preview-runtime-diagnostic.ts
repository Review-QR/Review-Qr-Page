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
const EMPTY_BODY_READ_TIMEOUT_MS = 3_000;

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

type RequestGuardResults = {
  urlPathValid: boolean;
  queryHashAbsent: boolean;
  originMatches: boolean;
  secFetchSiteSameOrigin: boolean;
  bodyAbsent: boolean;
};

const REQUEST_GUARD_LOG_EVENT = "cashfree_preview_runtime_guard_rejected";

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

function cancelRequestBodyReader(reader: ReadableStreamDefaultReader<Uint8Array>): void {
  try {
    void reader.cancel().catch(() => undefined).finally(() => {
      try {
        reader.releaseLock();
      } catch {
        // A pending source read can keep the lock until the source settles.
      }
    });
  } catch {
    // Cancellation is best-effort; the caller still fails closed.
  }
}

async function isRequestBodyAbsent(request: Request): Promise<boolean> {
  if (request.body === null) return true;

  // Some Fetch-compatible runtimes expose a stream even when it carries no
  // bytes. Consume only enough to distinguish an empty stream from a body;
  // this route never uses the body for anything else.
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    reader = request.body.getReader();
    const deadline = new Promise<{ kind: "timeout" }>((resolve) => {
      timeout = setTimeout(() => {
        resolve({ kind: "timeout" });
      }, EMPTY_BODY_READ_TIMEOUT_MS);
    });

    while (true) {
      const read = reader.read().then(
        (result) => ({ kind: "read" as const, result }),
        () => ({ kind: "error" as const }),
      );
      const outcome = await Promise.race([read, deadline]);
      if (outcome.kind === "timeout") {
        // Do not await cancellation: a stream source may not settle cancel().
        cancelRequestBodyReader(reader);
        return false;
      }
      if (outcome.kind === "error") return false;
      if (outcome.result.done) return true;
      if (outcome.result.value?.byteLength) {
        cancelRequestBodyReader(reader);
        return false;
      }
    }
  } catch {
    return false;
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
    try {
      reader?.releaseLock();
    } catch {
      // Preserve fail-closed handling if the stream cannot be unlocked.
    }
  }
}

async function getRequestGuardResults(request: Request): Promise<RequestGuardResults> {
  let urlPathValid = false;
  let queryHashAbsent = false;
  try {
    const requestUrl = new URL(request.url);
    urlPathValid =
      requestUrl.origin === EXPECTED_PREVIEW_ORIGIN &&
      requestUrl.pathname === DIAGNOSTIC_PATH;
    queryHashAbsent = requestUrl.search === "" && requestUrl.hash === "";
  } catch {
    // Keep malformed request URLs fail-closed without recording their contents.
  }

  return {
    urlPathValid,
    queryHashAbsent,
    originMatches: request.headers.get("origin") === EXPECTED_PREVIEW_ORIGIN,
    secFetchSiteSameOrigin: request.headers.get("sec-fetch-site") === "same-origin",
    bodyAbsent: await isRequestBodyAbsent(request),
  };
}

function requestPassesSameOriginGuards(guards: RequestGuardResults): boolean {
  return Object.values(guards).every((passed) => passed);
}

function logRejectedRequestGuardsInExpectedPreview(
  env: PreviewCashfreeDiagnosticEnvironment,
  guards: RequestGuardResults,
): void {
  if (!isExpectedPreviewRuntime(env) || !hasRequiredSupabaseTarget(env)) return;

  // Deliberately log only fixed labels and booleans; never include request data.
  console.warn(REQUEST_GUARD_LOG_EVENT, {
    urlPathValid: guards.urlPathValid,
    queryHashAbsent: guards.queryHashAbsent,
    originMatches: guards.originMatches,
    secFetchSiteSameOrigin: guards.secFetchSiteSameOrigin,
    bodyAbsent: guards.bodyAbsent,
  });
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
  const requestGuards = await getRequestGuardResults(request);
  if (!requestPassesSameOriginGuards(requestGuards)) {
    logRejectedRequestGuardsInExpectedPreview(env, requestGuards);
    return emptyResponse(403);
  }

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
