import test from "node:test";
import assert from "node:assert/strict";
import { createCashfreePreviewDiagnosticHandler } from "./cashfree-preview-diagnostic.ts";

const previewEnv = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "codex/cashfree-sandbox-preview",
  VERCEL_URL: "review-qr-page-preview.vercel.app",
  VERCEL_PROJECT_PRODUCTION_URL: "trustitreview.com",
  CASHFREE_ENVIRONMENT: "sandbox",
  CASHFREE_API_BASE_URL: "https://sandbox.cashfree.com/pg",
  CASHFREE_CLIENT_ID: "test-app-id",
  CASHFREE_CLIENT_SECRET: "test-app-secret",
};

function request(origin = "https://review-qr-page-preview.vercel.app") {
  return new Request("https://review-qr-page-preview.vercel.app/api/cashfree/preview-diagnostic", {
    method: "POST",
    headers: { origin },
  });
}

function handler(overrides = {}) {
  return createCashfreePreviewDiagnosticHandler({
    getEnvironment: () => previewEnv,
    isActiveAdmin: async () => true,
    fetcher: async () => new Response(null, { status: 404 }),
    makeOrderId: () => `rqr_${"a".repeat(32)}`,
    ...overrides,
  });
}

test("unauthorized, cross-origin, and non-admin requests do not call Cashfree", async () => {
  let cashfreeCalls = 0;
  const endpoint = handler({
    isActiveAdmin: async () => false,
    fetcher: async () => { cashfreeCalls += 1; return new Response(null, { status: 404 }); },
  });
  const unauthorized = await endpoint(request());
  assert.equal(unauthorized.status, 401);
  assert.equal((await unauthorized.json()).authorization, "FAIL");

  const crossOrigin = await handler()(request("https://attacker.example"));
  assert.equal(crossOrigin.status, 401);
  assert.equal(cashfreeCalls, 0);
});

test("Production deployments refuse the diagnostic before auth or provider access", async () => {
  let cashfreeCalls = 0;
  let authCalls = 0;
  const endpoint = handler({
    getEnvironment: () => ({ ...previewEnv, VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: "main" }),
    isActiveAdmin: async () => { authCalls += 1; return true; },
    fetcher: async () => { cashfreeCalls += 1; return new Response(null, { status: 404 }); },
  });
  const response = await endpoint(request());
  assert.equal(response.status, 404);
  assert.equal((await response.json()).deployment, "BLOCKED");
  assert.equal(authCalls, 0);
  assert.equal(cashfreeCalls, 0);
});

test("incorrect Sandbox configuration is reported without a provider request", async () => {
  let cashfreeCalls = 0;
  const endpoint = handler({
    getEnvironment: () => ({ ...previewEnv, CASHFREE_API_BASE_URL: "https://api.cashfree.com/pg" }),
    fetcher: async () => { cashfreeCalls += 1; return new Response(null, { status: 404 }); },
  });
  const response = await endpoint(request());
  const body = await response.json();
  assert.equal(body.environment, "PASS");
  assert.equal(body.apiBaseUrl, "FAIL");
  assert.equal(body.cashfreeAuthentication, "BLOCKED");
  assert.equal(body.errorCategory, "configuration");
  assert.equal(cashfreeCalls, 0);
});

test("provider authentication failure is sanitized and response body is discarded", async () => {
  const endpoint = handler({
    fetcher: async (_url, init) => {
      assert.equal(init.method, "GET");
      return new Response("sensitive provider detail", { status: 401 });
    },
  });
  const response = await endpoint(request());
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.match(text, /"cashfreeAuthentication":"FAIL"/);
  assert.match(text, /"errorCategory":"provider_authentication"/);
  assert.doesNotMatch(text, /sensitive provider detail|test-app-secret|test-app-id/);
});

test("valid configuration reports success for a read-only missing-order lookup", async () => {
  let callCount = 0;
  const endpoint = handler({
    fetcher: async (url, init) => {
      callCount += 1;
      assert.equal(url, "https://sandbox.cashfree.com/pg/orders/rqr_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      assert.equal(init.method, "GET");
      return new Response(null, { status: 404 });
    },
  });
  const response = await endpoint(request());
  const body = await response.json();
  assert.equal(body.deployment, "PASS");
  assert.equal(body.authorization, "PASS");
  assert.equal(body.environment, "PASS");
  assert.equal(body.apiBaseUrl, "PASS");
  assert.equal(body.clientId, "PASS");
  assert.equal(body.clientSecret, "PASS");
  assert.equal(body.cashfreeAuthentication, "PASS");
  assert.equal(Object.hasOwn(body, "errorCategory"), false);
  assert.equal(callCount, 1);
});
