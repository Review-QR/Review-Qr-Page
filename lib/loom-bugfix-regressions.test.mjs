import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";

const rootDir = process.cwd();
const readText = (relPath) => fs.readFileSync(path.join(rootDir, relPath), "utf8");

// Runtime mocks for Next.js / Supabase / payment / rider services
const mockState = {
  businessRow: {
    id: "biz-1",
    name: "Bahraich Sweets",
    city: "Bahraich",
    location_latitude: 27.5706,
    location_longitude: 81.5977,
    is_outlet_open: true,
  },
  catalogRows: [
    { id: "cat-1", name: "Kaju Katli", price: 250, is_available: true },
  ],
  existingOrderById: null,
  recentUnpaidOrders: [],
  orderForSession: {
    id: "hord_test_1",
    business_id: "biz-1",
    total_amount: 270,
    payment_status: "pending",
  },
  orderInserts: [],
  sessionCalls: [],
  createOrderCalls: 0,
  createOrderDelayMs: 0,
  riderAuthToken: "rider-secret-token",
  riderOrderAcceptRow: {
    id: "hord_9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    status: "rider_assigned",
    rider_id: "rider-1",
    hyperlocal_order_items: [{ id: "it-1", item_name: "Kaju Katli", quantity: 1, unit_price: 250 }],
    businesses: {
      id: "biz-1",
      name: "Bahraich Sweets",
      city: "Bahraich",
      address: "Clock Tower Road",
      phone: "9876543210",
      location_latitude: 27.5706,
      location_longitude: 81.5977,
    },
  },
};
globalThis.__qaLoomMocks = mockState;

const stubSpecs = new Set([
  "next/server",
  "server-only",
  "@/lib/supabase-admin",
  "@/lib/merchant-auth",
  "@/lib/supabase-server",
  "@/lib/hyperlocal/cashfree-hyperlocal-service",
  "@/lib/hyperlocal/rider-session",
  "@/lib/hyperlocal/rider-fleet-engine",
  "@/lib/auth/email-service",
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (stubSpecs.has(specifier)) {
      return { url: `qa-loom-stub:${encodeURIComponent(specifier)}`, shortCircuit: true };
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
    if (
      (specifier.startsWith("./") || specifier.startsWith("../")) &&
      context.parentURL?.startsWith("file:") &&
      !context.parentURL.includes("/node_modules/") &&
      !context.parentURL.includes("\\node_modules\\")
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const base = path.resolve(parentDir, specifier);
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
    if (!url.startsWith("qa-loom-stub:")) {
      return nextLoad(url, context);
    }
    const spec = decodeURIComponent(url.slice("qa-loom-stub:".length));

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
          }
          export class NextRequest extends Request {
            constructor(input, init = {}) {
              super(input, init);
              this.nextUrl = new URL(this.url);
              const cookieHeader = this.headers.get("cookie") || "";
              const initial = {};
              for (const part of cookieHeader.split(";")) {
                const idx = part.indexOf("=");
                if (idx > 0) initial[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
              }
              this.cookies = new CookieJar(initial);
            }
          }
        `,
      };
    }

    if (spec === "@/lib/supabase-admin") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          function makeQuery(table) {
            const state = globalThis.__qaLoomMocks;
            let op = "select";
            let filters = {};
            let insertPayload = null;
            let selectCols = "*";
            const resolve = async () => {
              if (state.createOrderDelayMs > 0 && table === "hyperlocal_orders" && op === "select" && !filters.id) {
                await new Promise((r) => setTimeout(r, state.createOrderDelayMs));
              }
              if (op === "insert") {
                if (table === "hyperlocal_orders") state.orderInserts.push(insertPayload);
                return { data: insertPayload, error: null };
              }
              if (table === "business_catalog_items") return { data: state.catalogRows, error: null };
              if (table === "businesses") return { data: state.businessRow, error: null };
              if (table === "customers") return { data: null, error: null };
              if (table === "delivery_riders") return { data: [], error: null };
              if (table === "hyperlocal_orders") {
                if (selectCols.includes("hyperlocal_order_items")) {
                  return { data: state.riderOrderAcceptRow, error: null };
                }
                if (filters.id && selectCols.includes("total_amount") && !selectCols.includes("delivery_otp")) {
                  return { data: state.orderForSession, error: null };
                }
                if (filters.id) {
                  return { data: state.existingOrderById, error: null };
                }
                return { data: state.recentUnpaidOrders, error: null };
              }
              return { data: [], error: null };
            };
            const builder = {
              select(cols = "*") { selectCols = cols; return builder; },
              insert(payload) { op = "insert"; insertPayload = payload; return builder; },
              update() { op = "update"; return builder; },
              eq(col, val) { filters[col] = val; return builder; },
              neq() { return builder; },
              gte() { return builder; },
              is() { return builder; },
              in() { return builder; },
              or() { return builder; },
              order() { return builder; },
              limit() { return builder; },
              maybeSingle: () => resolve(),
              single: () => resolve(),
              then: (onFulfilled, onRejected) => resolve().then(onFulfilled, onRejected),
            };
            return builder;
          }
          export function createSupabaseAdminClient() {
            return { from: (t) => makeQuery(t) };
          }
        `,
      };
    }

    if (spec === "@/lib/merchant-auth") {
      return { format: "module", shortCircuit: true, source: `export async function getActiveMerchant() { return null; }` };
    }

    if (spec === "@/lib/supabase-server") {
      return { format: "module", shortCircuit: true, source: `export async function getActiveAdminContext() { return null; }` };
    }

    if (spec === "@/lib/hyperlocal/cashfree-hyperlocal-service") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export async function createCashfreeHyperlocalPaymentOrder(params) {
            globalThis.__qaLoomMocks.sessionCalls.push(params);
            return {
              success: true,
              orderId: params.orderId,
              paymentSessionId: "session_test_123",
              returnUrl: params.returnUrl,
            };
          }
          export async function verifyCashfreeHyperlocalOrder() { return { status: "PENDING" }; }
          export async function refundCashfreeHyperlocalOrder() { return { success: true }; }
        `,
      };
    }

    if (spec === "@/lib/hyperlocal/rider-session") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export function signRiderSessionToken(id) { return "signed:" + id; }
          export function verifyRiderSessionToken(token) { return token === "valid-rider-token" ? "rider-1" : null; }
        `,
      };
    }

    if (spec === "@/lib/hyperlocal/rider-fleet-engine") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export async function riderAcceptOrder(orderId, riderId) { return { success: true, orderId, riderId }; }
          export async function riderDeclineOrder() { return { success: true }; }
          export async function verifyCustomerDeliveryOtp() { return { success: true }; }
          export async function reportDoorstepRefusalRto() { return { success: true }; }
          export async function recordMerchantWaitCompensation() { return { success: true }; }
          export async function refundDoorstepChangeToCustomer() { return { success: true }; }
          export async function claimParkingTollReimbursement() { return { success: true }; }
          export async function requestRiderPayout() { return { success: true }; }
          export async function getRiderScorecard() { return {}; }
          export async function recordRiderGpsHeartbeat() { return {}; }
          export async function getRiderPassbook() { return []; }
        `,
      };
    }

    if (spec === "@/lib/auth/email-service") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export async function sendRiderEmailOtp() { return { success: true }; }
          export async function verifyRiderEmailOtp() { return { success: true }; }
        `,
      };
    }

    return nextLoad(url, context);
  },
});

const { NextRequest } = await import("next/server");
const { createHyperlocalOrder } = await import("../lib/hyperlocal/hyperlocal-service.ts");
const ordersRoute = await import("../app/api/hyperlocal/orders/route.ts");
const paymentSessionRoute = await import("../app/api/hyperlocal/payment/session/route.ts");
const riderRoute = await import("../app/api/hyperlocal/rider/route.ts");

function resetLoomMocks() {
  mockState.existingOrderById = null;
  mockState.recentUnpaidOrders = [];
  mockState.orderInserts = [];
  mockState.sessionCalls = [];
  mockState.createOrderCalls = 0;
  mockState.createOrderDelayMs = 0;
  mockState.orderForSession = {
    id: "hord_test_1",
    business_id: "biz-1",
    total_amount: 270,
    payment_status: "pending",
  };
}

test("createHyperlocalOrder reuses recent unpaid online_cashfree order within 120s without inserting duplicate", async () => {
  resetLoomMocks();
  mockState.recentUnpaidOrders = [
    {
      id: "hord_existing_recent",
      status: "placed",
      payment_status: "pending",
      total_amount: 290, // 250 item + 35 deliveryFee + 5 platformFee
      delivery_otp: "4821",
      created_at: new Date().toISOString(),
    },
  ];

  const result = await createHyperlocalOrder({
    businessId: "biz-1",
    orderType: "food_delivery",
    customerName: "Aarav",
    customerPhone: "9876543210",
    customerAddress: "Bahraich Main Road",
    items: [{ catalogItemId: "cat-1", item_name: "Kaju Katli", quantity: 1, unit_price: 250 }],
    paymentMode: "online_cashfree",
  });

  assert.equal(result.alreadyExists, true);
  assert.equal(result.orderId, "hord_existing_recent");
  assert.equal(mockState.orderInserts.length, 0, "Must not insert a second duplicate order");

  // Existing order belonging to a different business must fail closed
  mockState.existingOrderById = {
    id: "hord_other_store",
    business_id: "biz-other",
    status: "placed",
    payment_status: "pending",
    total_amount: 270,
    delivery_otp: "1111",
  };
  await assert.rejects(
    () =>
      createHyperlocalOrder({
        orderId: "hord_other_store",
        businessId: "biz-1",
        orderType: "food_delivery",
        customerName: "Aarav",
        customerPhone: "9876543210",
        customerAddress: "Bahraich Main Road",
        items: [{ item_name: "Kaju Katli", quantity: 1, unit_price: 250 }],
        paymentMode: "online_cashfree",
      }),
    /does not belong to this business/,
  );
});

test("POST /api/hyperlocal/orders deduplicates concurrent online_cashfree submissions and session enforces allowlisted return_url", async () => {
  resetLoomMocks();
  mockState.createOrderDelayMs = 40;

  const mkOrderReq = (ip = "198.51.100.12") =>
    new NextRequest("https://trustitreview.com/api/hyperlocal/orders", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({
        businessId: "biz-1",
        customerName: "Aarav",
        customerPhone: "9876543210",
        customerAddress: "Civil Lines",
        paymentMode: "online_cashfree",
        items: [{ catalogItemId: "cat-1", item_name: "Kaju Katli", quantity: 1, unit_price: 250 }],
      }),
    });

  const [res1, res2] = await Promise.all([
    ordersRoute.POST(mkOrderReq()),
    ordersRoute.POST(mkOrderReq()),
  ]);
  assert.equal(res1.status, 200);
  assert.equal(res2.status, 200);

  const [body1, body2] = await Promise.all([res1.json(), res2.json()]);
  assert.equal(body1.orderId, body2.orderId);
  assert.equal(body1.alreadyExists, false);
  assert.equal(body2.alreadyExists, true);
  assert.equal(mockState.orderInserts.length, 1, "Concurrent double-tap must insert only 1 DB order");

  // Payment session: fromApp=1 preserved on allowlisted domain; evil returnUrl rejected back to canonical
  const appSessionRes = await paymentSessionRoute.POST(
    new Request("https://trustitreview.com/api/hyperlocal/payment/session", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.13" },
      body: JSON.stringify({
        orderId: "hord_test_1",
        businessId: "biz-1",
        fromApp: true,
        returnUrl: "https://trustitreview.com/pay/cashfree?order_id=hord_test_1&returned=1",
      }),
    }),
  );
  assert.equal(appSessionRes.status, 200);
  const firstCallUrl = new URL(mockState.sessionCalls[0].returnUrl);
  assert.equal(firstCallUrl.hostname, "trustitreview.com");
  assert.equal(firstCallUrl.pathname, "/pay/cashfree");
  assert.equal(firstCallUrl.searchParams.get("fromApp"), "1");

  const evilSessionRes = await paymentSessionRoute.POST(
    new Request("https://trustitreview.com/api/hyperlocal/payment/session", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "198.51.100.14" },
      body: JSON.stringify({
        orderId: "hord_test_1",
        businessId: "biz-1",
        fromApp: true,
        returnUrl: "https://evil.com/steal?fromApp=1",
      }),
    }),
  );
  assert.equal(evilSessionRes.status, 200);
  const safeFallbackUrl = new URL(mockState.sessionCalls[1].returnUrl);
  assert.equal(safeFallbackUrl.hostname, "trustitreview.com");
  assert.equal(safeFallbackUrl.searchParams.get("order_id"), "hord_test_1");
  assert.equal(safeFallbackUrl.searchParams.get("fromApp"), "1");
});

test("POST /api/hyperlocal/rider accept_order returns populated order with items and business", async () => {
  const res = await riderRoute.POST(
    new NextRequest("https://trustitreview.com/api/hyperlocal/rider", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer valid-rider-token",
      },
      body: JSON.stringify({
        action: "accept_order",
        riderId: "rider-1",
        orderId: "hord_9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
      }),
    }),
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.order?.id, "hord_9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e");
  assert.equal(body.order?.businesses?.name, "Bahraich Sweets");
  assert.equal(body.order?.hyperlocal_order_items?.length, 1);
});

test("Customer Android Custom Tab checkout and deep-link return invariants hold", () => {
  const customerManifest = readText("android/app/src/customer/AndroidManifest.xml");
  assert.match(customerManifest, /android:name="com\.trustit\.customer\.MainActivity"/);
  assert.match(customerManifest, /android\.intent\.action\.VIEW/);
  assert.match(customerManifest, /android\.intent\.category\.BROWSABLE/);
  assert.match(customerManifest, /android:scheme="com\.trustit\.customer"/);
  assert.match(customerManifest, /android:host="pay"/);

  assert.doesNotMatch(readText("android/app/src/partner/AndroidManifest.xml"), /com\.trustit\.customer/);
  assert.doesNotMatch(readText("android/app/src/rider/AndroidManifest.xml"), /com\.trustit\.customer/);

  const mainActivity = readText("android/app/src/main/java/com/trustit/customer/MainActivity.java");
  assert.match(mainActivity, /public void onNewIntent\(Intent intent\)/);
  assert.match(mainActivity, /handleDeepLinkIntent\(getIntent\(\),\s*true\)/);
  assert.match(mainActivity, /window\.__trustitLastPaymentReturn/);
  assert.match(mainActivity, /CustomEvent\('trustit:payment-return'/);

  const nativeBridge = readText("android/app/src/main/java/com/trustit/customer/TrustitNativeBridge.java");
  assert.match(nativeBridge, /@PluginMethod\s+public void openInAppCheckout\(PluginCall call\)/);
  assert.match(nativeBridge, /!"https"\.equalsIgnoreCase\(uri\.getScheme\(\)\)/);
  assert.match(nativeBridge, /isAllowedCheckoutEntryHost/);
  assert.match(nativeBridge, /settings\.setAllowFileAccess\(false\)/);
  assert.match(nativeBridge, /WebSettings\.MIXED_CONTENT_NEVER_ALLOW/);
  assert.match(nativeBridge, /ALLOWED_UPI_SCHEMES/);
  assert.match(nativeBridge, /res\.put\("mode",\s*"in_app_webview"\)/);

  const nativeService = readText("lib/native/trustit-native-service.ts");
  assert.match(nativeService, /openInAppCheckout\s*\(/);
  assert.match(nativeService, /plugin\.openInAppCheckout/);

  const payPage = readText("app/pay/cashfree/page.tsx");
  assert.match(payPage, /com\.trustit\.customer:\/\/pay\/return/);
  assert.match(payPage, /shouldDeepLinkToApp/);
  assert.match(payPage, /triggerAppReturn/);

  const portalClient = readText("app/order/order-portal-client.tsx");
  assert.match(portalClient, /openInAppCheckout/);
  assert.match(portalClient, /activeDraftOrderRef/);
  assert.match(portalClient, /inFlightPaymentRef/);
  assert.match(portalClient, /trustit:payment-return/);
  assert.match(portalClient, /__trustitLastPaymentReturn/);

  const customerCheckout = readText("components/customer/CustomerCheckoutAndAddresses.tsx");
  assert.match(customerCheckout, /openInAppCheckout/);
  assert.match(customerCheckout, /isLocalSubmitLocked/);
  assert.match(customerCheckout, /handleCheckoutButtonClick/);
});

test("Rider workflow & Screen12 avoid hardcoded placeholders and stabilize navigation listeners", () => {
  const screen12 = readText("app/rider/components/screens/Screen12StorePickup.tsx");
  assert.doesNotMatch(screen12, /Verified Store Partner/);
  assert.doesNotMatch(screen12, /\+919118643415/);
  assert.doesNotMatch(screen12, /1 × Order Package \(Standard Merchant Pack\)/);
  assert.match(screen12, /itemsSignature/);

  const workflow = readText("app/rider/hooks/useRiderWorkflow.ts");
  assert.doesNotMatch(workflow, /\bfetch\(["']\/api\/hyperlocal\//);
  assert.match(workflow, /TrustitNative\.nativeFetch\(["'`]\/api\/hyperlocal\/rider/);
  assert.match(workflow, /setCurrentScreenId\(12\)/);
  assert.match(workflow, /setCurrentScreenId\(40\)/);
  assert.match(workflow, /if \(data\?\.order\)/);

  const riderPage = readText("app/rider/page.tsx");
  assert.match(riderPage, /hasShownLowBatteryAlertRef/);
  assert.match(riderPage, /currentScreenIdRef/);
  assert.match(riderPage, /activeOrderRef/);
  assert.match(riderPage, /__handleTrustitBack\s*=\s*invokeBack/);
  assert.match(riderPage, /},\s*\[\]\);/);
});

test("Merchant incoming order siren & cockpit remove hardcoded demo data and prevent re-blast loops", () => {
  const screen02 = readText("app/merchant/components/screens/Screen02IncomingOrderSiren.tsx");
  assert.doesNotMatch(screen02, /Aman Sharma/);
  assert.doesNotMatch(screen02, /#ORD-7783-09/);
  assert.doesNotMatch(screen02, /₹340\.00/);
  assert.doesNotMatch(screen02, /01:42 Left/);
  assert.match(screen02, /No new incoming orders right now/);
  assert.match(screen02, /20000/);
  assert.match(screen02, /clearTimeout\(maxPlaybackTimer\)/);

  const screen01 = readText("app/merchant/components/screens/Screen01MainCockpit.tsx");
  assert.doesNotMatch(screen01, /Click to preview siren/);
  assert.doesNotMatch(screen01, /01:45 remaining/);
  assert.match(screen01, /onClick=\{onOpenOrders \|\| onOpenSiren\}/);

  const shell = readText("app/merchant/components/MerchantNativeAppShell.tsx");
  assert.match(shell, /dismissedSirenOrderIdsRef/);
  assert.match(shell, /acknowledgeSirenOrder/);
  assert.doesNotMatch(shell, /merchantAudio\.playIncomingOrderSiren\(7\)/);
});

test("Production SuperApp loop: paused outlets, native Cashfree Drop SDK, dynamic QR/refunds, and strict login gate", () => {
  const customerTypes = readText("components/customer/customer-types.ts");
  assert.match(customerTypes, /Currently not expecting the order/);
  assert.match(customerTypes, /export function isBusinessAcceptingOrders/);

  const homeDiscovery = readText("components/customer/CustomerHomeAndDiscovery.tsx");
  assert.match(homeDiscovery, /grayscale/);
  assert.match(homeDiscovery, /Currently not expecting the order/);

  const storefront = readText("components/customer/CustomerStorefrontAndVerticals.tsx");
  assert.match(storefront, /Currently not expecting the order/);
  assert.match(storefront, /Unavailable/);

  const onboardingModals = readText("components/customer/CustomerOnboardingModals.tsx");
  assert.doesNotMatch(onboardingModals, /Continue as Guest/);

  const hyperlocalService = readText("lib/hyperlocal/hyperlocal-service.ts");
  assert.match(hyperlocalService, /assertBusinessAcceptingOrders/);
  assert.match(hyperlocalService, /cancelHyperlocalOrderWithRefund/);

  const partnerLogin = readText("app/merchant/components/screens/ScreenAuth04PartnerLogin.tsx");
  assert.doesNotMatch(partnerLogin, /demoOtp/);
  assert.doesNotMatch(partnerLogin, /"123456"/);

  const riderQr = readText("app/rider/components/screens/Screen14DynamicQr.tsx");
  assert.doesNotMatch(riderQr, /trustit@icici/);
  assert.match(riderQr, /\/api\/hyperlocal\/rider\/cod-qr/);

  const buildGradle = readText("android/app/build.gradle");
  assert.match(buildGradle, /com\.cashfree\.pg:api:2\.6\.1/);

  const dropHelper = readText("android/app/src/main/java/com/trustit/customer/CashfreeDropCheckoutHelper.java");
  assert.match(dropHelper, /CFPaymentComponent\.CFPaymentModes\.UPI/);
  assert.match(dropHelper, /CFDropCheckoutPayment/);
  assert.match(dropHelper, /trustit:payment-return/);

  const customerBridge = readText("android/app/src/main/java/com/trustit/customer/TrustitNativeBridge.java");
  assert.match(customerBridge, /@PluginMethod\s+public void startNativeDropCheckout\(PluginCall call\)/);
  assert.match(customerBridge, /@PluginMethod\s+public void playEmergencySiren\(PluginCall call\)/);

  const partnerBridge = readText("android/app/src/partner/java/com/trustit/partner/TrustitNativeBridge.java");
  assert.match(partnerBridge, /@PluginMethod\s+public void startNativeDropCheckout\(PluginCall call\)/);
});

test("Merchant store registration satisfies businesses_location_coordinates_range_check constraint", () => {
  const authCode = readText("lib/auth/merchant-unified-auth.ts");
  // Ensure location_captured_at is paired with location_latitude & location_longitude on insert
  assert.match(authCode, /location_latitude:\s*latitude/);
  assert.match(authCode, /location_longitude:\s*longitude/);
  assert.match(authCode, /location_captured_at:\s*nowIso/);
  assert.match(authCode, /businesses_location_coordinates_range_check/);

  const opsCode = readText("app/api/merchant/app-operations/route.ts");
  // Ensure app-operations location updates also capture location_captured_at timestamp
  assert.match(opsCode, /location_captured_at:\s*new Date\(\)\.toISOString\(\)/);

  const registrationScreen = readText("app/merchant/components/screens/ScreenAuth03MobileKycRegistration.tsx");
  assert.match(registrationScreen, /locality:\s*resolvedMohalla\s*\|\|\s*undefined/);
  assert.match(registrationScreen, /pincode:\s*resolvedPincode\s*\|\|\s*undefined/);
});

test("Customer address persistence and in-app Cashfree checkout modal regression guards", () => {
  const addressesRoute = readText("app/api/customer/addresses/route.ts");
  // Ensure SELECT uses valid column 'street' (not non-existent full_address) and maps full_address
  assert.match(addressesRoute, /\.select\("[^"]*street[^"]*"\)/);
  assert.match(addressesRoute, /full_address:\s*a\.street/);
  assert.match(addressesRoute, /phoneParam/);

  const customerAuth = readText("lib/auth/customer-unified-auth.ts");
  // Ensure verifyCustomerPhoneOtp returns customer addresses from customer_addresses table
  assert.match(customerAuth, /\.from\("customer_addresses"\)/);
  assert.match(customerAuth, /addresses:\s*formattedAddrs/);

  const portalCode = readText("app/order/order-portal-client.tsx");
  // Ensure Cashfree modal is launched with background polling and visibility listener
  assert.match(portalCode, /redirectTarget:\s*"_modal"/);
  assert.match(portalCode, /handlePaymentSuccess/);
  assert.match(portalCode, /visibilitychange/);
  assert.match(portalCode, /verifyPaymentStatus/);

  const orderPage = readText("app/order/page.tsx");
  // Ensure Cashfree SDK is preloaded via Next.js Script on order portal page
  assert.match(orderPage, /src="https:\/\/sdk\.cashfree\.com\/js\/v3\/cashfree\.js"/);
});
