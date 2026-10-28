const MAX_WEBHOOK_BYTES = 1_000_000;
const CASHFREE_WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;
const ORDER_ID_PATTERN = /^rqr_[a-f0-9]{32}$/;
const CASHFREE_SANDBOX_API_BASE_URL = "https://sandbox.cashfree.com/pg";
const SUPABASE_PREVIEW_PROJECT_REF = "piqwsyzktzjhafkcstjl";
const PLAN_DETAILS = {
  basic: { name: "Basic", amount: 29 },
  standard: { name: "Standard", amount: 49 },
  premium: { name: "Premium", amount: 99 },
} as const;

type PlanId = keyof typeof PLAN_DETAILS;
type OrderContext = { businessId: string; planId: PlanId; amount: number };
type VerifiedPayment = { orderId: string; context: OrderContext; amount: number; paidAt: string };
type Application = { businessId: string; orderId: string; plan: string; amount: number; currency: "INR"; paidAt: string };
type RpcResult = { data: unknown; error: unknown };

type PreviewCashfreeEnvironment = {
  supabaseUrl: string;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
};

type WebhookPayload = {
  type?: unknown;
  data?: {
    order?: { order_id?: unknown; order_amount?: unknown; order_currency?: unknown };
    payment?: { payment_status?: unknown; payment_amount?: unknown; payment_currency?: unknown };
  };
};

type AdminGateway = {
  findOnboarding(orderId: string, businessId: string): PromiseLike<{
    data: { payment_mode?: unknown; selected_plan?: unknown; user_id?: unknown } | null;
    error: unknown;
  }>;
  finalizeOneTimePayment(input: Application): PromiseLike<RpcResult>;
  applyPayment(input: Application): PromiseLike<RpcResult>;
};

export type PreviewWebhookDependencies = {
  environment: PreviewCashfreeEnvironment;
  verifySignature(rawBody: string, timestamp: string | null, signature: string | null): Promise<boolean>;
  verifyOrder(orderId: string): Promise<VerifiedPayment | "not-success" | "unmapped" | "error">;
  createAdminGateway(): AdminGateway;
};

function response(status: number, result: string): Response {
  return Response.json({ result }, { status, headers: { "cache-control": "no-store" } });
}

function safeConstantTimeEqual(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ received.charCodeAt(index);
  }
  return difference === 0;
}

/** Cashfree recommends rejecting Payment Gateway webhook timestamps older than five minutes. */
export function isFreshCashfreeWebhookTimestamp(timestamp: string | null, now = Date.now()): boolean {
  if (!timestamp || !/^\d{13}$/.test(timestamp)) return false;
  const timestampMs = Number(timestamp);
  return Number.isSafeInteger(timestampMs) && timestampMs >= 0 && timestampMs <= now &&
    now - timestampMs <= CASHFREE_WEBHOOK_MAX_AGE_MS;
}

function decodeBase64Url(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(base64);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function hmac(keyBytes: Uint8Array, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", keyBytes.slice().buffer as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

export async function verifyCashfreeWebhookSignature(input: {
  secret: string;
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
}): Promise<boolean> {
  if (!input.secret || !input.timestamp || !/^\d{10,16}$/.test(input.timestamp) ||
      !input.signature || !/^[A-Za-z0-9+/]+={0,2}$/.test(input.signature)) return false;
  try {
    const root = await crypto.subtle.importKey("raw", new TextEncoder().encode(input.secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const digest = new Uint8Array(await crypto.subtle.sign("HMAC", root, new TextEncoder().encode(`${input.timestamp}${input.rawBody}`)));
    return safeConstantTimeEqual(encodeBase64(digest), input.signature);
  } catch {
    return false;
  }
}

export async function readSignedOrderContext(
  secret: string,
  signedContext: unknown,
  expectedOrderId: string,
): Promise<OrderContext | null> {
  if (typeof signedContext !== "string" || signedContext.length > 2048) return null;
  const [payload, suppliedSignature, ...extra] = signedContext.split(".");
  if (!payload || !suppliedSignature || extra.length || !/^[A-Za-z0-9_-]+$/.test(suppliedSignature)) return null;
  try {
    const root = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const contextKey = new Uint8Array(await crypto.subtle.sign("HMAC", root, new TextEncoder().encode("Review-QR:Cashfree:OrderContext:v1")));
    const expected = await hmac(contextKey, payload);
    const expectedSignature = encodeBase64(expected).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    if (!safeConstantTimeEqual(expectedSignature, suppliedSignature)) return null;

    const bytes = decodeBase64Url(payload);
    if (!bytes) return null;
    const claims = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as Record<string, unknown>;
    if (claims.version !== 1 || claims.orderId !== expectedOrderId || typeof claims.businessId !== "string" ||
        !claims.businessId.trim() || typeof claims.planId !== "string" ||
        !Object.hasOwn(PLAN_DETAILS, claims.planId) || claims.currency !== "INR") return null;
    const planId = claims.planId as PlanId;
    if (claims.amount !== PLAN_DETAILS[planId].amount) return null;
    return { businessId: claims.businessId, planId, amount: PLAN_DETAILS[planId].amount };
  } catch {
    return null;
  }
}

function isPreviewEnvironment(environment: PreviewCashfreeEnvironment): boolean {
  try {
    const url = new URL(environment.supabaseUrl);
    return url.protocol === "https:" && url.hostname === `${SUPABASE_PREVIEW_PROJECT_REF}.supabase.co` &&
      !url.username && !url.password && !url.port && !url.search && !url.hash &&
      environment.apiBaseUrl === CASHFREE_SANDBOX_API_BASE_URL &&
      Boolean(environment.clientId.trim()) && Boolean(environment.clientSecret.trim());
  } catch {
    return false;
  }
}

export function createCashfreePreviewWebhookHandler(deps: PreviewWebhookDependencies) {
  return async function POST(request: Request): Promise<Response> {
    if (request.method !== "POST") return response(405, "rejected");
    if (!isPreviewEnvironment(deps.environment)) return response(503, "unavailable");

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BYTES) return response(413, "rejected");
    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return response(400, "rejected");
    }
    if (new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BYTES) return response(413, "rejected");

    const timestamp = request.headers.get("x-webhook-timestamp");
    if (!isFreshCashfreeWebhookTimestamp(timestamp)) return response(401, "unauthorized");
    if (!await deps.verifySignature(rawBody, timestamp, request.headers.get("x-webhook-signature"))) {
      return response(401, "unauthorized");
    }

    let payload: WebhookPayload;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return response(400, "rejected");
      payload = parsed as WebhookPayload;
    } catch {
      return response(400, "rejected");
    }

    const eventType = payload.type;
    const order = payload.data?.order;
    const payment = payload.data?.payment;
    const paymentStatus = payment?.payment_status;
    const nonSuccess = (eventType === "PAYMENT_FAILED_WEBHOOK" && paymentStatus === "FAILED") ||
      (eventType === "PAYMENT_USER_DROPPED_WEBHOOK" && paymentStatus === "USER_DROPPED") ||
      (eventType === "PAYMENT_PENDING_WEBHOOK" && paymentStatus === "PENDING") ||
      (eventType === "PAYMENT_CANCELLED_WEBHOOK" && paymentStatus === "CANCELLED");
    if (nonSuccess) return response(200, "acknowledged");
    if (eventType !== "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus !== "SUCCESS" ||
        typeof order?.order_id !== "string" || !ORDER_ID_PATTERN.test(order.order_id) ||
        typeof order.order_amount !== "number" || !Number.isFinite(order.order_amount) ||
        order.order_currency !== "INR" || typeof payment?.payment_amount !== "number" ||
        !Number.isFinite(payment.payment_amount) || payment.payment_currency !== "INR") {
      return response(400, "rejected");
    }

    let verified: VerifiedPayment | "not-success" | "unmapped" | "error";
    try {
      verified = await deps.verifyOrder(order.order_id);
    } catch {
      return response(503, "retry");
    }
    if (verified === "error" || verified === "not-success") return response(503, "retry");
    if (verified === "unmapped") return response(200, "ignored_unmapped");
    if (verified.orderId !== order.order_id || verified.context.amount !== order.order_amount ||
        verified.amount !== order.order_amount || payment.payment_amount !== order.order_amount) {
      return response(400, "rejected");
    }

    const plan = PLAN_DETAILS[verified.context.planId].name;
    const application: Application = {
      businessId: verified.context.businessId,
      orderId: verified.orderId,
      plan,
      amount: verified.amount,
      currency: "INR",
      paidAt: verified.paidAt,
    };

    try {
      const admin = deps.createAdminGateway();
      const { data: onboarding, error: lookupError } = await admin.findOnboarding(application.orderId, application.businessId);
      if (lookupError) return response(503, "retry");
      let result: unknown;
      if (onboarding?.payment_mode === "one_time") {
        if (onboarding.selected_plan !== plan || typeof onboarding.user_id !== "string") return response(400, "rejected");
        const finalized = await admin.finalizeOneTimePayment(application);
        if (finalized.error || !Array.isArray(finalized.data) || !finalized.data[0]) return response(503, "retry");
        result = (finalized.data[0] as { result?: unknown }).result;
      } else {
        const applied = await admin.applyPayment(application);
        if (applied.error || !Array.isArray(applied.data) || !applied.data[0]) return response(503, "retry");
        result = (applied.data[0] as { result?: unknown }).result;
      }
      return result === "applied" || result === "already_applied"
        ? response(200, result)
        : response(503, "retry");
    } catch {
      return response(503, "retry");
    }
  };
}

export async function verifyCashfreeSandboxOrder(input: {
  orderId: string;
  clientId: string;
  clientSecret: string;
  fetcher?: typeof fetch;
}): Promise<VerifiedPayment | "not-success" | "unmapped" | "error"> {
  if (!ORDER_ID_PATTERN.test(input.orderId)) return "unmapped";
  const fetcher = input.fetcher ?? fetch;
  const apiHeaders = {
    "x-client-id": input.clientId,
    "x-client-secret": input.clientSecret,
    "x-api-version": "2026-01-01",
    accept: "application/json",
  };
  const request = (url: string) => fetcher(url, {
    method: "GET", headers: apiHeaders, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(8_000),
  });
  let orderResponse: Response;
  try {
    orderResponse = await request(`${CASHFREE_SANDBOX_API_BASE_URL}/orders/${encodeURIComponent(input.orderId)}`);
  } catch {
    return "error";
  }
  if (!orderResponse.ok) {
    await orderResponse.body?.cancel();
    return "error";
  }
  let order: Record<string, unknown>;
  try {
    const value: unknown = await orderResponse.json();
    if (typeof value !== "object" || value === null || Array.isArray(value)) return "error";
    order = value as Record<string, unknown>;
  } catch {
    return "error";
  }
  if (order.order_id !== input.orderId || typeof order.order_amount !== "number" ||
      order.order_currency !== "INR" || typeof order.order_tags !== "object" || order.order_tags === null ||
      Array.isArray(order.order_tags)) return "unmapped";
  const context = await readSignedOrderContext(input.clientSecret,
    (order.order_tags as Record<string, unknown>).review_qr_context, input.orderId);
  if (!context || order.order_amount !== context.amount) return "unmapped";

  let paymentsResponse: Response;
  try {
    paymentsResponse = await request(`${CASHFREE_SANDBOX_API_BASE_URL}/orders/${encodeURIComponent(input.orderId)}/payments`);
  } catch {
    return "error";
  }
  if (!paymentsResponse.ok) {
    await paymentsResponse.body?.cancel();
    return "error";
  }
  let payments: unknown;
  try {
    payments = await paymentsResponse.json();
  } catch {
    return "error";
  }
  if (!Array.isArray(payments) || payments.some((entry) => typeof entry !== "object" || entry === null || Array.isArray(entry))) return "error";
  const successes = payments.filter((entry) => (entry as Record<string, unknown>).payment_status === "SUCCESS") as Record<string, unknown>[];
  if (successes.length === 0) return "not-success";
  const successfulPayment = successes.find((entry) => entry.payment_amount === context.amount && entry.payment_currency === "INR");
  if (!successfulPayment) return "error";
  const paymentTime = typeof successfulPayment.payment_completion_time === "string"
    ? Date.parse(successfulPayment.payment_completion_time)
    : typeof successfulPayment.payment_time === "string" ? Date.parse(successfulPayment.payment_time) : Number.NaN;
  return {
    orderId: input.orderId,
    context,
    amount: context.amount,
    paidAt: Number.isFinite(paymentTime) ? new Date(paymentTime).toISOString() : new Date().toISOString(),
  };
}

export function isPreviewSupabaseProject(url: string): boolean {
  return isPreviewEnvironment({
    supabaseUrl: url,
    apiBaseUrl: CASHFREE_SANDBOX_API_BASE_URL,
    clientId: "configured",
    clientSecret: "configured",
  });
}
