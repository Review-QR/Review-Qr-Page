import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { handlePreviewCashfreeRuntimeDiagnostic } from "../../../../lib/cashfree-preview-runtime-diagnostic.ts";
import { shouldSkipSupabaseSessionRefresh } from "../../../../lib/supabase-proxy-routing.ts";

const origin = "https://review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app";
const baseEnvironment = {
  VERCEL_PROJECT_ID: "prj_mKkYk1wDcdwzQzWw2JUNBsAiuhRS",
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "codex/cashfree-sandbox-preview",
  VERCEL_BRANCH_URL: "review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app",
  NEXT_PUBLIC_SUPABASE_URL: "https://piqwsyzktzjhafkcstjl.supabase.co",
  CASHFREE_PREVIEW_WEBHOOK_INGRESS_ENABLED: "true",
  CASHFREE_ENVIRONMENT: "sandbox",
  CASHFREE_API_BASE_URL: "https://sandbox.cashfree.com/pg",
  CASHFREE_CLIENT_ID: "test-only-client-id-canary",
  CASHFREE_CLIENT_SECRET: "test-only-client-secret-canary",
};

function request({ url = `${origin}/api/admin/cashfree-preview-runtime-check`, headers = {}, body } = {}) {
  return new Request(url, {
    method: "POST",
    headers: {
      origin,
      "sec-fetch-site": "same-origin",
      ...headers,
    },
    body,
  });
}

test("global Supabase session refresh skips only the exact diagnostic path", () => {
  assert.equal(shouldSkipSupabaseSessionRefresh("/api/admin/cashfree-preview-runtime-check"), true);
  for (const pathname of [
    "/api/admin/cashfree-preview-runtime-check/extra",
    "/api/admin/cashfree-preview-runtime-check-extra",
    "/api/admin/other",
    "/admin",
    "/",
  ]) {
    assert.equal(shouldSkipSupabaseSessionRefresh(pathname), false, pathname);
  }
});

test("proxy returns NextResponse.next for the exact diagnostic path before session refresh", async () => {
  const proxy = await readFile(new URL("../../../../proxy.ts", import.meta.url), "utf8");
  const earlyReturn = proxy.indexOf("if (shouldSkipSupabaseSessionRefresh(pathname))");
  const nextResponse = proxy.indexOf("return NextResponse.next();", earlyReturn);
  const refreshCall = proxy.indexOf("return updateSupabaseSession(", earlyReturn);
  assert.ok(earlyReturn >= 0);
  assert.ok(nextResponse > earlyReturn);
  assert.ok(refreshCall > nextResponse);
});

async function run(env = baseEnvironment, authorized = true, req = request()) {
  let authorizationCalls = 0;
  const response = await handlePreviewCashfreeRuntimeDiagnostic(req, env, async () => {
    authorizationCalls += 1;
    return authorized;
  });
  return { response, authorizationCalls };
}

test("wrong project, deployment environment, branch, or branch host fails before Supabase authorization", async (t) => {
  const cases = [
    ["missing project ID", { VERCEL_PROJECT_ID: undefined }],
    ["wrong project ID", { VERCEL_PROJECT_ID: "other-project" }],
    ["missing deployment environment", { VERCEL_ENV: undefined }],
    ["wrong deployment environment", { VERCEL_ENV: "production" }],
    ["missing branch", { VERCEL_GIT_COMMIT_REF: undefined }],
    ["wrong branch", { VERCEL_GIT_COMMIT_REF: "main" }],
    ["wrong branch deployment host", { VERCEL_BRANCH_URL: "other.vercel.app" }],
  ];
  for (const [name, overrides] of cases) {
    await t.test(name, async () => {
      const { response, authorizationCalls } = await run({ ...baseEnvironment, ...overrides });
      assert.equal(response.status, 404);
      assert.equal(authorizationCalls, 0);
      assert.equal(await response.text(), "");
    });
  }
});

test("wrong Preview Supabase target fails before any Supabase client or network call", async () => {
  for (const wrongUrl of [
    undefined,
    "https://czzeyhpelwafmoiufhvu.supabase.co",
    "http://piqwsyzktzjhafkcstjl.supabase.co",
    "https://piqwsyzktzjhafkcstjl.supabase.co/?unexpected=1",
  ]) {
    let fetchCalls = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => { fetchCalls += 1; throw new Error("unexpected network call"); };
    try {
      const { response, authorizationCalls } = await run({
        ...baseEnvironment,
        NEXT_PUBLIC_SUPABASE_URL: wrongUrl,
      });
      assert.equal(response.status, 404);
      assert.equal(authorizationCalls, 0);
      assert.equal(fetchCalls, 0);
      assert.equal(await response.text(), "");
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
});

test("anonymous, non-admin, and inactive-admin authorization failures return no findings", async (t) => {
  for (const authCase of ["anonymous", "non-admin", "inactive-admin"]) {
    await t.test(authCase, async () => {
      const { response } = await run(baseEnvironment, false);
      assert.equal(response.status, 401);
      assert.equal(await response.text(), "");
    });
  }
});

test("authorized response has only fixed check keys and status enums", async () => {
  const { response } = await run();
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.deepEqual(Object.keys(payload), ["checks"]);
  assert.deepEqual(Object.keys(payload.checks), [
    "cashfreeEnvironment",
    "cashfreeApiBaseUrl",
    "cashfreePreviewWebhookIngress",
    "previewSupabaseTarget",
    "cashfreeClientIdPresent",
    "cashfreeClientSecretPresent",
    "cashfreeCredentialPairIdentity",
    "cashfreeLivePaymentsDisabled",
  ]);
  for (const status of Object.values(payload.checks)) {
    assert.ok(["PASS", "FAIL", "NOT VERIFIED"].includes(status));
  }
  assert.equal(payload.checks.cashfreeCredentialPairIdentity, "NOT VERIFIED");
  assert.deepEqual(payload.checks, {
    cashfreeEnvironment: "PASS",
    cashfreeApiBaseUrl: "PASS",
    cashfreePreviewWebhookIngress: "PASS",
    previewSupabaseTarget: "PASS",
    cashfreeClientIdPresent: "PASS",
    cashfreeClientSecretPresent: "PASS",
    cashfreeCredentialPairIdentity: "NOT VERIFIED",
    cashfreeLivePaymentsDisabled: "PASS",
  });
});

test("configuration checks follow the existing trim and endpoint normalization semantics", async () => {
  const { response } = await run({
    ...baseEnvironment,
    CASHFREE_ENVIRONMENT: " sandbox ",
    CASHFREE_API_BASE_URL: " https://sandbox.cashfree.com/pg/ ",
    CASHFREE_PREVIEW_WEBHOOK_INGRESS_ENABLED: " true ",
    CASHFREE_CLIENT_ID: " id ",
    CASHFREE_CLIENT_SECRET: " secret ",
    CASHFREE_LIVE_PAYMENTS_ENABLED: " false ",
  });
  const { checks } = await response.json();
  assert.equal(checks.cashfreeEnvironment, "PASS");
  assert.equal(checks.cashfreeApiBaseUrl, "PASS");
  assert.equal(checks.cashfreePreviewWebhookIngress, "PASS");
  assert.equal(checks.cashfreeClientIdPresent, "PASS");
  assert.equal(checks.cashfreeClientSecretPresent, "PASS");
  assert.equal(checks.cashfreeLivePaymentsDisabled, "PASS");
});

test("each failed setting reports FAIL without disclosing configuration", async () => {
  const cases = [
    [{ CASHFREE_ENVIRONMENT: "production" }, "cashfreeEnvironment"],
    [{ CASHFREE_API_BASE_URL: "https://api.cashfree.com/pg" }, "cashfreeApiBaseUrl"],
    [{ CASHFREE_PREVIEW_WEBHOOK_INGRESS_ENABLED: "false" }, "cashfreePreviewWebhookIngress"],
    [{ CASHFREE_CLIENT_ID: " " }, "cashfreeClientIdPresent"],
    [{ CASHFREE_CLIENT_SECRET: "" }, "cashfreeClientSecretPresent"],
    [{ CASHFREE_LIVE_PAYMENTS_ENABLED: " true " }, "cashfreeLivePaymentsDisabled"],
  ];
  for (const [overrides, key] of cases) {
    const { response } = await run({ ...baseEnvironment, ...overrides });
    const { checks } = await response.json();
    assert.equal(checks[key], "FAIL");
  }
});

test("same-origin, body-free requests are required and responses are never cacheable", async () => {
  const cases = [
    request({ headers: { origin: "https://attacker.example" } }),
    request({ headers: { "sec-fetch-site": "cross-site" } }),
    request({ headers: { origin: undefined } }),
    request({ url: `${origin}/api/admin/cashfree-preview-runtime-check?token=do-not-accept` }),
    request({ body: "ignored" }),
  ];
  for (const req of cases) {
    const { response, authorizationCalls } = await run(baseEnvironment, true, req);
    assert.equal(response.status, 403);
    assert.equal(authorizationCalls, 0);
    assert.equal(await response.text(), "");
    assert.equal(response.headers.get("access-control-allow-origin"), null);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("vary"), "Cookie");
  }
  const { response } = await run();
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("vary"), "Cookie");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("secret canaries never appear in response bodies or captured logs; no Cashfree fetch runs", async () => {
  const originalFetch = globalThis.fetch;
  const originalInfo = console.info;
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const logs = [];
  let fetchCalls = 0;
  globalThis.fetch = async () => { fetchCalls += 1; throw new Error("unexpected fetch"); };
  console.info = (...args) => logs.push(args.join(" "));
  console.log = (...args) => logs.push(args.join(" "));
  console.warn = (...args) => logs.push(args.join(" "));
  console.error = (...args) => logs.push(args.join(" "));
  try {
    const { response } = await run();
    const body = await response.text();
    assert.equal(fetchCalls, 0);
    assert.deepEqual(logs, []);
    assert.equal(body.includes("test-only-client-id-canary"), false);
    assert.equal(body.includes("test-only-client-secret-canary"), false);
    assert.equal(body.includes("piqwsyzktzjhafkcstjl"), false);
    assert.equal(body.includes("do-not-accept"), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.info = originalInfo;
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  }
});

test("route is server-only, uses active-admin auth, and has no payment/provider dependency", async () => {
  const route = await readFile(new URL("./route.ts", import.meta.url), "utf8");
  const handler = await readFile(new URL("../../../../lib/cashfree-preview-runtime-diagnostic.ts", import.meta.url), "utf8");
  const auth = await readFile(new URL("../../../../lib/supabase-server.ts", import.meta.url), "utf8");
  assert.match(route, /import\s+["']server-only["']/);
  assert.match(route, /requireActiveAdmin/);
  assert.match(route, /handlePreviewCashfreeRuntimeDiagnostic/);
  assert.doesNotMatch(route, /createSupabaseAdminClient|SUPABASE_SERVICE_ROLE_KEY|CASHFREE/);
  assert.match(auth, /supabase\.auth\.getClaims\(\)/);
  assert.match(auth, /\.from\(["']admin_users["']\)/);
  assert.match(auth, /\.eq\(["']is_active["'],\s*true\)/);
  assert.doesNotMatch(handler, /fetch\s*\(|createCashfree|createOrder|paymentSession|rpc\(/);
});
