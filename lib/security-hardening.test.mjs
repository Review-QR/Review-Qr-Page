import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHmac } from "node:crypto";
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const readText = (relPath) => fs.readFileSync(path.join(rootDir, relPath), "utf8");

// Shared controllable runtime mock state for Next.js / Supabase / auth dependencies
const mockState = {
  claimsResult: { data: { claims: null }, error: null },
  userResult: { data: { user: null }, error: null },
  activeAdmin: null,
  activeMerchant: null,
  adminRows: [],
  merchantAccountRow: null,
  businessRow: null,
  hyperlocalOrderRow: null,
  cashfreeWebhookSecret: "test_cashfree_webhook_secret",
  dbUpdates: [],
};
globalThis.__qaSecurityMocks = mockState;

const stubSpecs = new Set([
  "next/server",
  "server-only",
  "@supabase/ssr",
  "@/lib/supabase-config",
  "@/lib/supabase-admin",
  "@/lib/supabase-server",
  "@/lib/merchant-auth",
  "@/lib/cashfree",
  "@/lib/config",
  "@/lib/hyperlocal/hyperlocal-service",
  "@/lib/hyperlocal/rider-session",
  "@/lib/merchant/merchant-remote-config",
  "@/lib/wallet/cashfree-wallet-service",
  "@/lib/product-orders/webhook-handler",
  "@/lib/customer-crm-service",
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (stubSpecs.has(specifier)) {
      return { url: `qa-stub:${encodeURIComponent(specifier)}`, shortCircuit: true };
    }
    if (specifier.startsWith("@/")) {
      const base = path.join(rootDir, specifier.slice(2));
      for (const ext of ["", ".ts", ".tsx", ".mjs", ".js"]) {
        const candidate = base + ext;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.startsWith("qa-stub:")) {
      return nextLoad(url, context);
    }
    const spec = decodeURIComponent(url.slice("qa-stub:".length));

    if (spec === "server-only") {
      return { format: "module", shortCircuit: true, source: "" };
    }

    if (spec === "next/server") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          class CookieJar {
            constructor(initial = {}) {
              this.map = new Map(Object.entries(initial).map(([k, v]) => [k, { name: k, value: String(v) }]));
            }
            get(name) { return this.map.get(name); }
            getAll() { return Array.from(this.map.values()); }
            set(name, value, options = {}) { this.map.set(name, { name, value: String(value), options }); }
          }
          export class NextResponse extends Response {
            constructor(body, init = {}) {
              super(body, init);
              this.cookies = new CookieJar();
            }
            static json(data, init = {}) {
              const headers = new Headers(init.headers);
              if (!headers.has("content-type")) headers.set("content-type", "application/json");
              return new NextResponse(JSON.stringify(data), { ...init, headers });
            }
            static redirect(url, status = 307) {
              const code = typeof status === "number" ? status : (status?.status || 307);
              const headers = new Headers({ location: String(url) });
              return new NextResponse(null, { status: code, headers });
            }
            static next(init = {}) {
              return new NextResponse(null, { status: 200, headers: init?.request?.headers });
            }
          }
          export class NextRequest extends Request {
            constructor(input, init = {}) {
              super(input, init);
              this.nextUrl = new URL(this.url);
              const cookieHeader = this.headers.get("cookie") || "";
              const initial = {};
              for (const part of cookieHeader.split(";")) {
                const idx = part.indexOf("=");
                if (idx > 0) {
                  initial[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
                }
              }
              this.cookies = new CookieJar(initial);
            }
          }
        `,
      };
    }

    if (spec === "@supabase/ssr") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export function createServerClient() {
            return {
              auth: {
                getClaims: async () => globalThis.__qaSecurityMocks.claimsResult,
                getUser: async () => globalThis.__qaSecurityMocks.userResult,
              },
            };
          }
        `,
      };
    }

    if (spec === "@/lib/supabase-config") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export const supabaseUrl = "https://example.supabase.co";
          export const supabasePublishableKey = "sb_publishable_test_key";
          export const merchantSessionCookieName = "sb-trustit-merchant-auth";
        `,
      };
    }

    if (spec === "@/lib/supabase-admin") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          function queryFor(table) {
            const state = globalThis.__qaSecurityMocks;
            let op = "select";
            let updatePayload = null;
            const resolveRows = () => {
              if (table === "admin_users") return { data: state.adminRows, error: null };
              if (table === "merchant_accounts") return { data: state.merchantAccountRow, error: null };
              if (table === "businesses") return { data: state.businessRow, error: null };
              if (table === "hyperlocal_orders") return { data: state.hyperlocalOrderRow, error: null };
              return { data: [], error: null };
            };
            const builder = {
              select() { return builder; },
              update(payload) { op = "update"; updatePayload = payload; return builder; },
              insert() { op = "insert"; return builder; },
              delete() { op = "delete"; return builder; },
              eq() { return builder; },
              is() { return builder; },
              in() { return builder; },
              not() { return builder; },
              or() { return builder; },
              order() { return builder; },
              limit() { return builder; },
              maybeSingle: async () => {
                if (op === "update") state.dbUpdates.push({ table, payload: updatePayload });
                return resolveRows();
              },
              single: async () => resolveRows(),
              then(onFulfilled, onRejected) {
                if (op === "update") state.dbUpdates.push({ table, payload: updatePayload });
                return Promise.resolve(resolveRows()).then(onFulfilled, onRejected);
              },
            };
            return builder;
          }
          export function createSupabaseAdminClient() {
            return {
              from: (table) => queryFor(table),
              rpc: async () => ({ data: null, error: null }),
            };
          }
        `,
      };
    }

    if (spec === "@/lib/supabase-server") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export async function getActiveAdminContext() {
            return globalThis.__qaSecurityMocks.activeAdmin;
          }
        `,
      };
    }

    if (spec === "@/lib/merchant-auth") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export async function getActiveMerchant() {
            return globalThis.__qaSecurityMocks.activeMerchant;
          }
        `,
      };
    }

    if (spec === "@/lib/cashfree") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          import { verifyCashfreeSignature } from ${JSON.stringify(pathToFileURL(path.join(rootDir, "lib/cashfree-signature.ts")).href)};
          export function verifyCashfreeWebhookSignature({ rawBody, timestamp, signature }) {
            return verifyCashfreeSignature({
              rawBody,
              timestamp,
              signature,
              secret: globalThis.__qaSecurityMocks.cashfreeWebhookSecret,
            });
          }
          export async function verifyCashfreeWebhookOrder(orderId) {
            return { status: "NOT_PAID", orderId };
          }
        `,
      };
    }

    if (spec === "@/lib/config") {
      return {
        format: "module",
        shortCircuit: true,
        source: `export const appConfig = { plans: { standard: { name: "Standard" } } };`,
      };
    }

    if (spec === "@/lib/hyperlocal/hyperlocal-service") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export async function createHyperlocalOrder() { return { orderId: "hord_stub" }; }
          export async function merchantAcceptOrder() { return { success: true }; }
          export async function merchantMarkFoodReady() { return { success: true }; }
          export async function adminCancelOrderDoorstepRefusal() { return { success: true }; }
        `,
      };
    }

    if (spec === "@/lib/hyperlocal/rider-session") {
      return {
        format: "module",
        shortCircuit: true,
        source: `export function verifyRiderSessionToken() { return null; }`,
      };
    }

    if (spec === "@/lib/merchant/merchant-remote-config") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export function getMerchantRemoteConfig() { return { isOutletOpen: true }; }
          export function updateMerchantRemoteConfig(patch) { return patch; }
        `,
      };
    }

    if (spec === "@/lib/wallet/cashfree-wallet-service") {
      return {
        format: "module",
        shortCircuit: true,
        source: `export async function createCashfreeWalletRechargeOrder() { return { success: false }; }`,
      };
    }

    if (spec === "@/lib/product-orders/webhook-handler") {
      return {
        format: "module",
        shortCircuit: true,
        source: `export async function handleProductOrderWebhook() { return Response.json({ ok: true }); }`,
      };
    }

    if (spec === "@/lib/customer-crm-service") {
      return {
        format: "module",
        shortCircuit: true,
        source: `export async function creditMerchantConnectWallet() { return { success: true }; }`,
      };
    }

    return nextLoad(url, context);
  },
});

const { NextRequest } = await import("next/server");
const {
  resolveAllowedOrigin,
  buildCorsHeaders,
  handleCorsPreflight,
} = await import("./auth-cors.ts");
const {
  createCustomerSessionToken,
  enforceRateLimit,
  CUSTOMER_SESSION_COOKIE,
} = await import("./auth-api-guards.ts");
const { checkRateLimit } = await import("./rate-limiter.ts");
const { default: nextConfig } = await import("../next.config.ts");
const { proxy } = await import("../proxy.ts");
const adminOrdersRoute = await import("../app/api/hyperlocal/admin/orders/route.ts");
const merchantOpsRoute = await import("../app/api/merchant/app-operations/route.ts");
const hyperlocalOrdersRoute = await import("../app/api/hyperlocal/orders/route.ts");
const cashfreeWebhookRoute = await import("../app/api/cashfree/webhook/route.ts");

function resetMocks() {
  mockState.claimsResult = { data: { claims: null }, error: null };
  mockState.userResult = { data: { user: null }, error: null };
  mockState.activeAdmin = null;
  mockState.activeMerchant = null;
  mockState.adminRows = [];
  mockState.merchantAccountRow = null;
  mockState.businessRow = null;
  mockState.hyperlocalOrderRow = null;
  mockState.dbUpdates = [];
}

function withEnv(vars, fn) {
  const previous = {};
  for (const [k, v] of Object.entries(vars)) {
    previous[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const [k, v] of Object.entries(previous)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
      }
    });
}

test("CORS allowlist permits trusted origins and rejects untrusted origins without wildcard", async () => {
  await withEnv({ NODE_ENV: "production", ALLOWED_CORS_ORIGINS: undefined }, async () => {
    for (const trusted of [
      "https://trustitreview.com",
      "https://www.trustitreview.com",
      "capacitor://localhost",
      "http://localhost",
      "https://localhost",
    ]) {
      assert.equal(resolveAllowedOrigin(trusted), trusted);
      const headers = buildCorsHeaders(trusted);
      assert.equal(headers["Access-Control-Allow-Origin"], trusted);
      assert.equal(headers["Access-Control-Allow-Credentials"], "true");
      assert.equal(headers.Vary, "Origin");

      const preflight = handleCorsPreflight(
        new Request("https://trustitreview.com/api/merchant/auth", {
          method: "OPTIONS",
          headers: { origin: trusted },
        })
      );
      assert.equal(preflight.status, 204);
      assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), trusted);
    }

    for (const untrusted of [
      "https://evil.com",
      "http://trustitreview.com.evil.com",
      "https://localhost:3000",
      "null",
      "",
    ]) {
      assert.equal(resolveAllowedOrigin(untrusted), null);
      const headers = buildCorsHeaders(untrusted);
      assert.equal(headers["Access-Control-Allow-Origin"], undefined);
      assert.notEqual(headers["Access-Control-Allow-Origin"], "*");
    }

    const evilPreflight = handleCorsPreflight(
      new Request("https://trustitreview.com/api/merchant/auth", {
        method: "OPTIONS",
        headers: { origin: "https://evil.com" },
      })
    );
    assert.equal(evilPreflight.status, 403);
    assert.equal(evilPreflight.headers.get("Access-Control-Allow-Origin"), null);

    const headerRules = await nextConfig.headers();
    const apiWildcard = headerRules
      .flatMap((rule) => rule.headers || [])
      .find((h) => h.key === "Access-Control-Allow-Origin" && h.value === "*");
    assert.equal(apiWildcard, undefined, "next.config.ts must never emit Access-Control-Allow-Origin: *");
  });
});

test("proxy.ts enforces fail-closed gates on /api/cron/*, /admin*, /api/hyperlocal/admin/*, and /merchant*", async () => {
  resetMocks();
  await withEnv({ NODE_ENV: "production", CRON_SECRET: "super_secret_cron_value" }, async () => {
    // 1. /api/cron/* requires exact Bearer CRON_SECRET
    const noCronAuth = await proxy(new NextRequest("https://trustitreview.com/api/cron/dispatch-occasions"));
    assert.equal(noCronAuth.status, 401);

    const wrongCronAuth = await proxy(
      new NextRequest("https://trustitreview.com/api/cron/dispatch-occasions", {
        headers: { authorization: "Bearer wrong_secret" },
      })
    );
    assert.equal(wrongCronAuth.status, 401);

    const validCronAuth = await proxy(
      new NextRequest("https://trustitreview.com/api/cron/dispatch-occasions", {
        headers: { authorization: "Bearer super_secret_cron_value" },
      })
    );
    assert.equal(validCronAuth.status, 200);

    // Unset CRON_SECRET must fail closed
    await withEnv({ CRON_SECRET: "" }, async () => {
      const missingEnvRes = await proxy(
        new NextRequest("https://trustitreview.com/api/cron/dispatch-occasions", {
          headers: { authorization: "Bearer " },
        })
      );
      assert.equal(missingEnvRes.status, 401);
    });

    // 2. /admin and /api/hyperlocal/admin/* deny unauthenticated and non-admin callers
    const unauthAdminApi = await proxy(
      new NextRequest("https://trustitreview.com/api/hyperlocal/admin/orders", {
        headers: { origin: "https://evil.com" },
      })
    );
    assert.equal(unauthAdminApi.status, 401);
    assert.equal(unauthAdminApi.headers.get("Access-Control-Allow-Origin"), null);

    const unauthAdminPage = await proxy(new NextRequest("https://trustitreview.com/admin"));
    assert.equal(unauthAdminPage.status, 307);
    assert.match(unauthAdminPage.headers.get("location") || "", /\/login\?next=%2Fadmin/);

    mockState.claimsResult = {
      data: { claims: { sub: "user-non-admin", email: "user@example.com" } },
      error: null,
    };
    mockState.adminRows = [{ user_id: "real-admin-id", email: "admin@trustitreview.com", is_active: true }];
    const nonAdminApi = await proxy(new NextRequest("https://trustitreview.com/api/hyperlocal/admin/orders"));
    assert.equal(nonAdminApi.status, 403);

    mockState.claimsResult = {
      data: { claims: { sub: "real-admin-id", email: "admin@trustitreview.com" } },
      error: null,
    };
    const activeAdminApi = await proxy(new NextRequest("https://trustitreview.com/api/hyperlocal/admin/orders"));
    assert.equal(activeAdminApi.status, 200);

    // 3. Protected /merchant/* and /api/merchant/* fail closed while public onboarding routes pass
    resetMocks();
    const unauthMerchantApi = await proxy(new NextRequest("https://trustitreview.com/api/merchant/app-operations"));
    assert.equal(unauthMerchantApi.status, 401);

    const unauthMerchantDash = await proxy(new NextRequest("https://trustitreview.com/merchant/dashboard"));
    assert.equal(unauthMerchantDash.status, 307);
    assert.match(unauthMerchantDash.headers.get("location") || "", /\/merchant\/login/);

    mockState.claimsResult = { data: { claims: { sub: "merchant-inactive" } }, error: null };
    mockState.merchantAccountRow = { business_id: "biz-inactive" };
    mockState.businessRow = { id: "biz-inactive", merchant_status: "suspended", deleted_at: null };
    const suspendedMerchantApi = await proxy(new NextRequest("https://trustitreview.com/api/merchant/app-operations"));
    assert.equal(suspendedMerchantApi.status, 403);

    resetMocks();
    const publicLoginPage = await proxy(new NextRequest("https://trustitreview.com/merchant/login"));
    assert.equal(publicLoginPage.status, 200);
    const publicMerchantAuth = await proxy(
      new NextRequest("https://trustitreview.com/api/merchant/auth", {
        method: "POST",
        headers: { origin: "https://trustitreview.com" },
      })
    );
    assert.equal(publicMerchantAuth.status, 200);
    assert.equal(publicMerchantAuth.headers.get("Access-Control-Allow-Origin"), "https://trustitreview.com");
  });
});

test("Admin & Merchant API routes reject unauthenticated access and cross-tenant IDOR", async () => {
  resetMocks();

  // Admin API route returns 401 without active admin context
  const adminRes = await adminOrdersRoute.GET(new Request("https://trustitreview.com/api/hyperlocal/admin/orders"));
  assert.equal(adminRes.status, 401);

  // Merchant app-operations returns 401 without active merchant session
  const unauthMerchantGet = await merchantOpsRoute.GET(
    new NextRequest("https://trustitreview.com/api/merchant/app-operations?businessId=biz-a")
  );
  assert.equal(unauthMerchantGet.status, 401);

  // Authenticated merchant biz-a cannot read or mutate biz-b (403 IDOR block)
  mockState.activeMerchant = {
    businessId: "biz-a",
    businessName: "Merchant A",
    registeredMobile: "9876543210",
  };
  const crossMerchantGet = await merchantOpsRoute.GET(
    new NextRequest("https://trustitreview.com/api/merchant/app-operations?businessId=biz-b")
  );
  assert.equal(crossMerchantGet.status, 403);

  const crossMerchantPost = await merchantOpsRoute.POST(
    new NextRequest("https://trustitreview.com/api/merchant/app-operations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "toggle_outlet", businessId: "biz-b", data: { isOpen: false } }),
    })
  );
  assert.equal(crossMerchantPost.status, 403);

  // Hyperlocal orders GET & PUT enforce fail-closed session + ownership
  resetMocks();
  const unauthOrdersGet = await hyperlocalOrdersRoute.GET(
    new NextRequest("https://trustitreview.com/api/hyperlocal/orders?orderId=hord_123")
  );
  assert.equal(unauthOrdersGet.status, 401);

  mockState.hyperlocalOrderRow = {
    id: "hord_123",
    business_id: "biz-a",
    customer_id: "cust-owner",
    customer_phone: "9999988888",
    status: "placed",
    payment_mode: "cod",
    payment_status: "pending",
    total_amount: 250,
  };

  const unauthSwitchCod = await hyperlocalOrdersRoute.PUT(
    new NextRequest("https://trustitreview.com/api/hyperlocal/orders", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "switch_to_cod", orderId: "hord_123" }),
    })
  );
  assert.equal(unauthSwitchCod.status, 401);

  const otherCustomerToken = createCustomerSessionToken({
    customerId: "cust-attacker",
    phone: "1111122222",
  });
  const idorCancel = await hyperlocalOrdersRoute.PUT(
    new NextRequest("https://trustitreview.com/api/hyperlocal/orders", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        cookie: `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(otherCustomerToken)}`,
      },
      body: JSON.stringify({ action: "customer_cancel", orderId: "hord_123" }),
    })
  );
  assert.equal(idorCancel.status, 403);
});

test("Cashfree hyperlocal webhook rejects bad signatures, tampered amounts, and duplicate paid deliveries", async () => {
  resetMocks();
  const makeSignedReq = (payload, sigOverride) => {
    const rawBody = JSON.stringify(payload);
    const timestamp = "1791849600";
    const signature =
      sigOverride ??
      createHmac("sha256", mockState.cashfreeWebhookSecret)
        .update(`${timestamp}${rawBody}`)
        .digest("base64");
    return new Request("https://trustitreview.com/api/cashfree/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-webhook-timestamp": timestamp,
        "x-webhook-signature": signature,
      },
      body: rawBody,
    });
  };

  const basePayload = {
    type: "PAYMENT_SUCCESS_WEBHOOK",
    data: {
      order: { order_id: "hord_sec_test_1", order_amount: 499 },
      payment: { payment_status: "SUCCESS", payment_amount: 499, cf_payment_id: "cf_pay_1" },
    },
  };

  // 1. Signature mismatch -> 401
  const badSigRes = await cashfreeWebhookRoute.POST(makeSignedReq(basePayload, "invalid-sig"));
  assert.equal(badSigRes.status, 401);

  // 2. Tampered amount -> 400 tampered_amount_rejected
  mockState.hyperlocalOrderRow = { total_amount: 499, payment_status: "pending" };
  const tamperedPayload = {
    ...basePayload,
    data: {
      order: { order_id: "hord_sec_test_1", order_amount: 1 },
      payment: { payment_status: "SUCCESS", payment_amount: 1, cf_payment_id: "cf_pay_1" },
    },
  };
  const tamperedRes = await cashfreeWebhookRoute.POST(makeSignedReq(tamperedPayload));
  assert.equal(tamperedRes.status, 400);
  const tamperedBody = await tamperedRes.json();
  assert.equal(tamperedBody.result, "tampered_amount_rejected");

  // 3. Duplicate paid delivery -> 200 idempotent without updating DB
  mockState.hyperlocalOrderRow = { total_amount: 499, payment_status: "paid" };
  const dupRes = await cashfreeWebhookRoute.POST(makeSignedReq(basePayload));
  assert.equal(dupRes.status, 200);
  const dupBody = await dupRes.json();
  assert.equal(dupBody.idempotent, true);
  assert.equal(mockState.dbUpdates.length, 0);
});

test("Rate limiter enforces sliding window, HTTP 429 Retry-After, and MAX_RATE_LIMIT_KEYS cap", async () => {
  const uniqueIp = `203.0.113.${Math.floor(Math.random() * 200) + 10}`;
  const mkReq = () =>
    new Request("https://trustitreview.com/api/customer/auth/send-otp", {
      method: "POST",
      headers: { "x-forwarded-for": uniqueIp },
    });

  for (let i = 0; i < 3; i += 1) {
    assert.equal(enforceRateLimit(mkReq(), "qa_otp_test", 3, 60_000), null);
  }
  const blocked = enforceRateLimit(mkReq(), "qa_otp_test", 3, 60_000);
  assert.ok(blocked, "4th OTP attempt in window should be rate-limited");
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get("Retry-After")) >= 1);

  // Sliding window reset after windowMs elapses
  const origNow = Date.now;
  let fakeNow = origNow();
  Date.now = () => fakeNow;
  try {
    const winKey = "qa_sliding_window_key";
    assert.equal(checkRateLimit(winKey, { maxRequests: 2, windowMs: 1000 }).success, true);
    assert.equal(checkRateLimit(winKey, { maxRequests: 2, windowMs: 1000 }).success, true);
    assert.equal(checkRateLimit(winKey, { maxRequests: 2, windowMs: 1000 }).success, false);
    fakeNow += 1001;
    assert.equal(checkRateLimit(winKey, { maxRequests: 2, windowMs: 1000 }).success, true);
  } finally {
    Date.now = origNow;
  }

  // MAX_RATE_LIMIT_KEYS (20,000) evicts oldest key when exceeded
  const firstKey = "qa_cap_first_key";
  assert.equal(checkRateLimit(firstKey, { maxRequests: 1, windowMs: 60_000 }).success, true);
  assert.equal(checkRateLimit(firstKey, { maxRequests: 1, windowMs: 60_000 }).success, false);
  for (let i = 0; i < 20_050; i += 1) {
    checkRateLimit(`qa_cap_fill_${i}`, { maxRequests: 5, windowMs: 60_000 });
  }
  assert.equal(
    checkRateLimit(firstKey, { maxRequests: 1, windowMs: 60_000 }).success,
    true,
    "Oldest key should have been evicted once MAX_RATE_LIMIT_KEYS (20,000) was exceeded"
  );
});

test("Android build, Capacitor config, and Manifest enforce release hardening invariants", () => {
  const buildGradle = readText("android/app/build.gradle");
  assert.doesNotMatch(
    buildGradle,
    /(?:storePassword|keyPassword)\s+["'][^"']+["']/,
    "android/app/build.gradle must not contain hardcoded keystore passwords"
  );
  assert.match(buildGradle, /System\.getenv\(['"]TRUSTIT_KEYSTORE_PATH['"]\)/);
  assert.match(buildGradle, /System\.getenv\(['"]TRUSTIT_STORE_PASSWORD['"]\)/);
  assert.match(buildGradle, /System\.getenv\(['"]TRUSTIT_KEY_ALIAS['"]\)/);
  assert.match(buildGradle, /System\.getenv\(['"]TRUSTIT_KEY_PASSWORD['"]\)/);
  assert.match(buildGradle, /minifyEnabled\s+true/);
  assert.match(buildGradle, /shrinkResources\s+true/);
  assert.match(buildGradle, /checkReleaseBuilds\s+true/);
  assert.match(buildGradle, /abortOnError\s+true/);
  assert.match(buildGradle, /flavorDimensions\s+["']app["']/);

  const capConfig = JSON.parse(readText("capacitor.config.json"));
  assert.equal(capConfig.android?.allowMixedContent, false);

  for (const scriptPath of [
    "scripts/build_all_three_apps.mjs",
    "scripts/build_customer_native_apk.mjs",
    "scripts/build_partner_native_apk.mjs",
    "scripts/build_rider_native_apk.mjs",
  ]) {
    const src = readText(scriptPath);
    assert.doesNotMatch(src, /allowMixedContent\s*:\s*true/, `${scriptPath} must not enable allowMixedContent`);
  }

  const manifest = readText("android/app/src/main/AndroidManifest.xml");
  assert.match(manifest, /android:allowBackup="false"/);
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
});
