import "server-only";

import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { isIP } from "node:net";
import { appConfig, type PlanId } from "@/lib/config";

const CASHFREE_API_VERSION = "2026-01-01";
const CASHFREE_SANDBOX_ORIGIN = "https://sandbox.cashfree.com";
const CASHFREE_SANDBOX_PATH = "/pg";

export type CashfreeSandboxTestOrderResult =
  | {
      success: true;
      httpStatus: number;
      orderId: string;
      orderStatus: string;
    }
  | {
      success: false;
      httpStatus: number | null;
      error: string;
    };

type CashfreeOrderResult =
  | {
      success: true;
      httpStatus: number;
      orderId: string;
      orderStatus: string;
      paymentSessionId: string;
      verificationToken?: string;
    }
  | {
      success: false;
      httpStatus: number | null;
      error: string;
    };

export interface CashfreeClient {
  readonly apiBaseUrl: string;
  readonly apiVersion: string;
  createRequestInit(init?: RequestInit): RequestInit;
}

export type CashfreeVerificationResult =
  | {
      status: "VERIFIED_SUCCESS";
      httpStatus: number;
      planId: PlanId;
      amount: number;
      currency: "INR";
      paidAt: string;
    }
  | { status: "NOT_SUCCESS"; httpStatus: number }
  | { status: "VERIFICATION_ERROR"; httpStatus: number | null };

const CASHFREE_DIAGNOSTIC_ORDER_ID =
  "rqr_1fd0c151ae9d4340b01f34dec39b8182";

function logCashfreeVerificationDiagnostic(input: {
  orderId: string;
  responseOrderId?: unknown;
  httpStatus: number | null;
  orderStatus: unknown;
  orderAmount: unknown;
  orderCurrency: unknown;
  requiredFieldsValid: boolean;
  branch: "PAID_MATCH" | "NOT_SUCCESS" | "RESPONSE_INVALID" | "API_ERROR";
}): void {
  if (input.orderId !== CASHFREE_DIAGNOSTIC_ORDER_ID) return;

  console.info("[cashfree-verification-diagnostic]", {
    httpStatus: input.httpStatus,
    order_id:
      typeof input.responseOrderId === "string"
        ? input.responseOrderId
        : input.orderId,
    order_status:
      typeof input.orderStatus === "string" ? input.orderStatus : null,
    order_amount:
      typeof input.orderAmount === "number" ? input.orderAmount : null,
    order_currency:
      typeof input.orderCurrency === "string" ? input.orderCurrency : null,
    requiredFieldsValid: input.requiredFieldsValid,
    branch: input.branch,
  });
}

type CheckoutOrderClaims = {
  version: 1;
  orderId: string;
  businessId: string;
  planId: PlanId;
  amount: number;
  currency: "INR";
  issuedAt: number;
  expiresAt: number;
};

const CHECKOUT_PROOF_TTL_MS = 24 * 60 * 60 * 1000;
const ORDER_ID_PATTERN = /^rqr_[a-f0-9]{32}$/;

function proofSigningKey(): Buffer {
  const secret = requiredEnvironmentVariable("CASHFREE_CLIENT_SECRET");
  return createHmac("sha256", secret)
    .update("Review-QR:Cashfree:CheckoutOrderProof:v1")
    .digest();
}

function orderContextSigningKey(): Buffer {
  const secret = requiredEnvironmentVariable("CASHFREE_CLIENT_SECRET");
  return createHmac("sha256", secret)
    .update("Review-QR:Cashfree:OrderContext:v1")
    .digest();
}

function signOrderContext(input: {
  orderId: string;
  businessId: string;
  planId: PlanId;
}): string {
  const amount = appConfig.plans[input.planId].price;
  const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      orderId: input.orderId,
      businessId: input.businessId,
      planId: input.planId,
      amount,
      currency: "INR",
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", orderContextSigningKey())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function readSignedOrderContext(
  value: unknown,
  expectedOrderId: string,
): { businessId: string; planId: PlanId; amount: number } | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  const [payload, suppliedSignature, ...extra] = value.split(".");
  if (!payload || !suppliedSignature || extra.length) return null;

  const expectedSignature = Buffer.from(
    createHmac("sha256", orderContextSigningKey())
      .update(payload)
      .digest("base64url"),
    "base64url",
  );
  const actualSignature = Buffer.from(suppliedSignature, "base64url");
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
    if (
      claims.version !== 1 ||
      claims.orderId !== expectedOrderId ||
      typeof claims.businessId !== "string" ||
      !claims.businessId.trim() ||
      (claims.planId !== "basic" &&
        claims.planId !== "standard" &&
        claims.planId !== "premium") ||
      claims.amount !== appConfig.plans[claims.planId].price ||
      claims.currency !== "INR"
    ) {
      return null;
    }
    return {
      businessId: claims.businessId,
      planId: claims.planId,
      amount: appConfig.plans[claims.planId].price,
    };
  } catch {
    return null;
  }
}

function configuredWebhookUrl(): string | null {
  const configured =
    process.env.CASHFREE_WEBHOOK_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}/api/cashfree/webhook`
      : "");
  if (!configured) return null;

  try {
    const url = new URL(configured);
    const hostname = url.hostname
      .toLowerCase()
      .replace(/^\[|\]$/g, "")
      .replace(/\.$/, "");
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/api/cashfree/webhook" ||
      isLocalOrPrivateWebhookHost(hostname)
    ) {
      return null;
    }
    return url.toString();
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

function signClaims(encodedClaims: string): string {
  return createHmac("sha256", proofSigningKey())
    .update(encodedClaims)
    .digest("base64url");
}

function createCheckoutVerificationToken(input: {
  orderId: string;
  businessId: string;
  planId: PlanId;
}): string {
  const now = Date.now();
  const claims: CheckoutOrderClaims = {
    version: 1,
    orderId: input.orderId,
    businessId: input.businessId,
    planId: input.planId,
    amount: appConfig.plans[input.planId].price,
    currency: "INR",
    issuedAt: now,
    expiresAt: now + CHECKOUT_PROOF_TTL_MS,
  };
  const encodedClaims = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${encodedClaims}.${signClaims(encodedClaims)}`;
}

function readCheckoutVerificationToken(token: string): CheckoutOrderClaims | null {
  if (token.length > 2048) return null;
  const [encodedClaims, suppliedSignature, ...extra] = token.split(".");
  if (!encodedClaims || !suppliedSignature || extra.length) return null;

  let expectedSignature: Buffer;
  let actualSignature: Buffer;
  try {
    expectedSignature = Buffer.from(signClaims(encodedClaims), "base64url");
    actualSignature = Buffer.from(suppliedSignature, "base64url");
  } catch {
    return null;
  }
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(encodedClaims, "base64url").toString("utf8"),
    ) as Partial<CheckoutOrderClaims>;
    const now = Date.now();
    if (
      claims.version !== 1 ||
      typeof claims.orderId !== "string" ||
      !ORDER_ID_PATTERN.test(claims.orderId) ||
      typeof claims.businessId !== "string" ||
      !claims.businessId ||
      (claims.planId !== "basic" &&
        claims.planId !== "standard" &&
        claims.planId !== "premium") ||
      claims.amount !== appConfig.plans[claims.planId].price ||
      claims.currency !== "INR" ||
      typeof claims.issuedAt !== "number" ||
      typeof claims.expiresAt !== "number" ||
      claims.issuedAt > now ||
      claims.expiresAt <= now ||
      claims.expiresAt - claims.issuedAt !== CHECKOUT_PROOF_TTL_MS
    ) {
      return null;
    }
    return claims as CheckoutOrderClaims;
  } catch {
    return null;
  }
}

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error("Cashfree server configuration is incomplete");
  }

  return value;
}

export function createCashfreeClient(): CashfreeClient {
  const clientId = requiredEnvironmentVariable("CASHFREE_CLIENT_ID");
  const clientSecret = requiredEnvironmentVariable("CASHFREE_CLIENT_SECRET");
  const environment = requiredEnvironmentVariable("CASHFREE_ENVIRONMENT");
  const configuredBaseUrl = requiredEnvironmentVariable(
    "CASHFREE_API_BASE_URL",
  );

  if (environment !== "sandbox") {
    throw new Error("Only the Cashfree Sandbox environment is configured");
  }

  let apiBaseUrl: URL;
  try {
    apiBaseUrl = new URL(configuredBaseUrl);
  } catch {
    throw new Error("Cashfree Sandbox API base URL is invalid");
  }

  if (
    apiBaseUrl.origin !== CASHFREE_SANDBOX_ORIGIN ||
    ![CASHFREE_SANDBOX_PATH, `${CASHFREE_SANDBOX_PATH}/`].includes(
      apiBaseUrl.pathname,
    ) ||
    apiBaseUrl.username ||
    apiBaseUrl.password ||
    apiBaseUrl.search ||
    apiBaseUrl.hash
  ) {
    throw new Error("Cashfree Sandbox API base URL is invalid");
  }

  return {
    apiBaseUrl: `${apiBaseUrl.origin}${CASHFREE_SANDBOX_PATH}`,
    apiVersion: CASHFREE_API_VERSION,
    createRequestInit(init = {}) {
      const headers = new Headers(init.headers);
      headers.set("x-client-id", clientId);
      headers.set("x-client-secret", clientSecret);
      headers.set("x-api-version", CASHFREE_API_VERSION);

      return { ...init, headers };
    },
  };
}

async function createOrder(input: {
  amount: number;
  customerId: string;
  orderNote: string;
  orderTags?: Record<string, string>;
  notifyUrl?: string;
  orderId?: string;
}): Promise<CashfreeOrderResult> {
  if (!Number.isFinite(input.amount) || input.amount < 1 || !input.customerId) {
    return {
      success: false,
      httpStatus: null,
      error: "The Cashfree Sandbox order details are invalid.",
    };
  }

  let client: CashfreeClient;
  try {
    client = createCashfreeClient();
  } catch {
    return {
      success: false,
      httpStatus: null,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  const orderId = input.orderId ?? `rqr_${randomUUID().replaceAll("-", "")}`;
  const idempotencyKey = randomUUID();
  let response: Response;

  try {
    response = await fetch(`${client.apiBaseUrl}/orders`,
      client.createRequestInit({
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: input.amount,
          order_currency: "INR",
          customer_details: {
            customer_id: input.customerId,
            customer_name: "Review QR Sandbox Test",
            customer_email: "sandbox-test@example.com",
            customer_phone: "9999999999",
          },
          order_note: input.orderNote,
          ...(input.orderTags ? { order_tags: input.orderTags } : {}),
          ...(input.notifyUrl
            ? { order_meta: { notify_url: input.notifyUrl } }
            : {}),
        }),
      }),
    );
  } catch {
    return {
      success: false,
      httpStatus: null,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  if (!response.ok) {
    await response.body?.cancel();
    return {
      success: false,
      httpStatus: response.status,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  let result: {
    order_id?: unknown;
    order_status?: unknown;
    payment_session_id?: unknown;
  };
  try {
    result = (await response.json()) as {
      order_id?: unknown;
      order_status?: unknown;
      payment_session_id?: unknown;
    };
  } catch {
    return {
      success: false,
      httpStatus: response.status,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  if (
    result.order_id !== orderId ||
    typeof result.order_status !== "string" ||
    typeof result.payment_session_id !== "string" ||
    !result.payment_session_id
  ) {
    return {
      success: false,
      httpStatus: response.status,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  return {
    success: true,
    httpStatus: response.status,
    orderId,
    orderStatus: result.order_status,
    paymentSessionId: result.payment_session_id,
  };
}

export async function createCashfreeMerchantCheckoutOrder(input: {
  planId: PlanId;
  businessId: string;
}): Promise<CashfreeOrderResult> {
  const plan = appConfig.plans[input.planId];
  const notifyUrl = configuredWebhookUrl();
  if (!notifyUrl) {
    return {
      success: false,
      httpStatus: null,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  const orderId = `rqr_${randomUUID().replaceAll("-", "")}`;

  return createOrder({
    amount: plan.price,
    customerId: input.businessId,
    orderNote: `Review-QR ${plan.name} Sandbox checkout`,
    orderId,
    orderTags: {
      review_qr_context: signOrderContext({
        orderId,
        businessId: input.businessId,
        planId: input.planId,
      }),
    },
    notifyUrl,
  }).then((result) => {
    if (!result.success) return result;
    return {
      ...result,
      verificationToken: createCheckoutVerificationToken({
        orderId: result.orderId,
        businessId: input.businessId,
        planId: input.planId,
      }),
    };
  });
}

export type CashfreeWebhookOrderVerification =
  | { status: "VERIFIED_SUCCESS"; orderId: string; businessId: string; planId: PlanId; amount: number; paidAt: string }
  | { status: "NOT_SUCCESS" }
  | { status: "UNMAPPED" }
  | { status: "VERIFICATION_ERROR" };

/** Verifies a webhook order through Cashfree and resolves only signed server-created order tags. */
export async function verifyCashfreeWebhookOrder(
  orderId: string,
): Promise<CashfreeWebhookOrderVerification> {
  if (!ORDER_ID_PATTERN.test(orderId)) return { status: "UNMAPPED" };

  let client: CashfreeClient;
  try {
    client = createCashfreeClient();
  } catch {
    return { status: "VERIFICATION_ERROR" };
  }

  let response: Response;
  try {
    response = await fetch(
      `${client.apiBaseUrl}/orders/${encodeURIComponent(orderId)}`,
      client.createRequestInit({
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      }),
    );
  } catch {
    return { status: "VERIFICATION_ERROR" };
  }
  if (!response.ok) {
    await response.body?.cancel();
    return { status: "VERIFICATION_ERROR" };
  }

  let order: {
    order_id?: unknown;
    order_status?: unknown;
    order_amount?: unknown;
    order_currency?: unknown;
    order_paid_at?: unknown;
    order_tags?: unknown;
  };
  try {
    order = (await response.json()) as typeof order;
  } catch {
    return { status: "VERIFICATION_ERROR" };
  }
  if (order.order_id !== orderId) return { status: "UNMAPPED" };
  if (order.order_status !== "PAID") return { status: "NOT_SUCCESS" };

  const tags =
    order.order_tags && typeof order.order_tags === "object"
      ? (order.order_tags as Record<string, unknown>)
      : null;
  const context = readSignedOrderContext(
    tags?.review_qr_context,
    orderId,
  );
  if (!context) return { status: "UNMAPPED" };

  if (
    order.order_amount !== context.amount ||
    order.order_currency !== "INR"
  ) {
    return { status: "VERIFICATION_ERROR" };
  }

  const parsedPaidAt =
    typeof order.order_paid_at === "string"
      ? Date.parse(order.order_paid_at)
      : Number.NaN;
  return {
    status: "VERIFIED_SUCCESS",
    orderId,
    businessId: context.businessId,
    planId: context.planId,
    amount: context.amount,
    paidAt: Number.isFinite(parsedPaidAt)
      ? new Date(parsedPaidAt).toISOString()
      : new Date().toISOString(),
  };
}

/** Verifies Cashfree's timestamp + raw-body HMAC-SHA256 webhook signature. */
export function verifyCashfreeWebhookSignature(input: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
}): boolean {
  if (
    !input.timestamp ||
    !/^\d{10,16}$/.test(input.timestamp) ||
    !input.signature ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(input.signature)
  ) {
    return false;
  }

  try {
    const secret = requiredEnvironmentVariable("CASHFREE_CLIENT_SECRET");
    const expected = createHmac("sha256", secret)
      .update(`${input.timestamp}${input.rawBody}`)
      .digest();
    const supplied = Buffer.from(input.signature, "base64");
    return (
      expected.length === supplied.length &&
      timingSafeEqual(expected, supplied)
    );
  } catch {
    return false;
  }
}

/** Read-only Cashfree order verification bound to the merchant checkout claim. */
export async function verifyCashfreeMerchantCheckoutOrder(input: {
  orderId: string;
  verificationToken: string;
  authenticatedBusinessId: string;
}): Promise<CashfreeVerificationResult> {
  if (!ORDER_ID_PATTERN.test(input.orderId)) {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  let claims: CheckoutOrderClaims | null;
  let client: CashfreeClient;
  try {
    claims = readCheckoutVerificationToken(input.verificationToken);
    client = createCashfreeClient();
  } catch {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  if (
    !claims ||
    claims.orderId !== input.orderId ||
    claims.businessId !== input.authenticatedBusinessId
  ) {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  let response: Response;
  try {
    response = await fetch(
      `${client.apiBaseUrl}/orders/${encodeURIComponent(input.orderId)}`,
      client.createRequestInit({
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      }),
    );
  } catch {
    logCashfreeVerificationDiagnostic({
      orderId: input.orderId,
      httpStatus: null,
      orderStatus: null,
      orderAmount: null,
      orderCurrency: null,
      requiredFieldsValid: false,
      branch: "API_ERROR",
    });
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  if (!response.ok) {
    await response.body?.cancel();
    logCashfreeVerificationDiagnostic({
      orderId: input.orderId,
      httpStatus: response.status,
      orderStatus: null,
      orderAmount: null,
      orderCurrency: null,
      requiredFieldsValid: false,
      branch: "API_ERROR",
    });
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  let result: {
    order_id?: unknown;
    order_status?: unknown;
    order_amount?: unknown;
    order_currency?: unknown;
    order_paid_at?: unknown;
  };
  try {
    result = (await response.json()) as typeof result;
  } catch {
    logCashfreeVerificationDiagnostic({
      orderId: input.orderId,
      httpStatus: response.status,
      orderStatus: null,
      orderAmount: null,
      orderCurrency: null,
      requiredFieldsValid: false,
      branch: "RESPONSE_INVALID",
    });
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  const requiredFieldsValid =
    result.order_id === input.orderId &&
    typeof result.order_status === "string" &&
    typeof result.order_amount === "number" &&
    typeof result.order_currency === "string";

  if (!requiredFieldsValid) {
    logCashfreeVerificationDiagnostic({
      orderId: input.orderId,
      responseOrderId: result.order_id,
      httpStatus: response.status,
      orderStatus: result.order_status,
      orderAmount: result.order_amount,
      orderCurrency: result.order_currency,
      requiredFieldsValid: false,
      branch: "RESPONSE_INVALID",
    });
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  if (
    result.order_status === "PAID" &&
    result.order_amount === claims.amount &&
    result.order_currency === claims.currency
  ) {
    logCashfreeVerificationDiagnostic({
      orderId: input.orderId,
      httpStatus: response.status,
      orderStatus: result.order_status,
      orderAmount: result.order_amount,
      orderCurrency: result.order_currency,
      requiredFieldsValid: true,
      branch: "PAID_MATCH",
    });
    const parsedPaidAt =
      typeof result.order_paid_at === "string"
        ? Date.parse(result.order_paid_at)
        : Number.NaN;
    return {
      status: "VERIFIED_SUCCESS",
      httpStatus: response.status,
      planId: claims.planId,
      amount: claims.amount,
      currency: claims.currency,
      paidAt: Number.isFinite(parsedPaidAt)
        ? new Date(parsedPaidAt).toISOString()
        : new Date().toISOString(),
    };
  }

  logCashfreeVerificationDiagnostic({
    orderId: input.orderId,
    httpStatus: response.status,
    orderStatus: result.order_status,
    orderAmount: result.order_amount,
    orderCurrency: result.order_currency,
    requiredFieldsValid: true,
    branch: "NOT_SUCCESS",
  });
  return { status: "NOT_SUCCESS", httpStatus: response.status };
}

/** Explicitly creates one test-only ₹29 Sandbox order for connectivity checks. */
export async function createCashfreeSandboxTestOrder(): Promise<CashfreeSandboxTestOrderResult> {
  const result = await createOrder({
    amount: 29,
    customerId: "reviewqr_sandbox_test",
    orderNote: "Review-QR Sandbox test order",
  });

  if (!result.success) return result;

  return {
    success: true,
    httpStatus: result.httpStatus,
    orderId: result.orderId,
    orderStatus: result.orderStatus,
  };
}
