import "server-only";

import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { isIP } from "node:net";
import { appConfig, type PlanId } from "@/lib/config";
import { cashfreeLivePaymentsEnabled, resolveCashfreeServerConfiguration, type CashfreeEnvironment } from "@/lib/cashfree-environment";
import { verifyCashfreeSignature } from "@/lib/cashfree-signature";
import { logTrustitCheckoutStage, type TrustitCheckoutDiagnosticStage } from "@/lib/trustit-checkout-diagnostics";

const CASHFREE_API_VERSION = "2026-01-01";

function logTrustitCashfreeHttpCategory(operation: "lookup" | "create", status: number): void {
  const category = status >= 200 && status < 300
    ? "2xx"
    : status >= 300 && status < 400
      ? "3xx"
      : status >= 400 && status < 500
        ? "4xx"
        : status >= 500 && status < 600
          ? "5xx"
          : "other";
  const stages = {
    lookup: {
      "2xx": "cashfree_lookup_http_2xx",
      "3xx": "cashfree_lookup_http_3xx",
      "4xx": "cashfree_lookup_http_4xx",
      "5xx": "cashfree_lookup_http_5xx",
      other: "cashfree_lookup_http_other",
    },
    create: {
      "2xx": "cashfree_create_http_2xx",
      "3xx": "cashfree_create_http_3xx",
      "4xx": "cashfree_create_http_4xx",
      "5xx": "cashfree_create_http_5xx",
      other: "cashfree_create_http_other",
    },
  } as const;
  logTrustitCheckoutStage(stages[operation][category]);
}

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
      environment: CashfreeEnvironment;
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
  readonly environment: CashfreeEnvironment;
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
  | { status: "NOT_SUCCESS"; httpStatus: number; terminalFailure: boolean }
  | { status: "VERIFICATION_ERROR"; httpStatus: number | null };

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

export function configuredTrustitPaymentReturnUrl(): string | null {
  const webhookUrl = configuredWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const origin = new URL(webhookUrl).origin;
    return `${origin}/register/payment?order_id={order_id}`;
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
  const configuration = resolveCashfreeServerConfiguration(process.env);

  return {
    apiBaseUrl: configuration.apiBaseUrl,
    apiVersion: CASHFREE_API_VERSION,
    environment: configuration.environment,
    createRequestInit(init = {}) {
      const headers = new Headers(init.headers);
      headers.set("x-client-id", configuration.clientId);
      headers.set("x-client-secret", configuration.clientSecret);
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
  returnUrl?: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  diagnosticScope?: "trustit_registration";
}): Promise<CashfreeOrderResult> {
  if (!Number.isFinite(input.amount) || input.amount < 1 || !input.customerId) {
    return {
      success: false,
      httpStatus: null,
      error: "The Cashfree Sandbox order details are invalid.",
    };
  }

  let client: CashfreeClient;
  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_client_configuration_start");
  try {
    client = createCashfreeClient();
  } catch {
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_client_configuration_failed");
    return {
      success: false,
      httpStatus: null,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }
  if (client.environment === "production" && !cashfreeLivePaymentsEnabled(process.env)) {
    return { success: false, httpStatus: null, error: "Cashfree live payments are disabled until explicitly enabled." };
  }
  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_client_configuration_success");

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
            customer_name: input.customerName ?? "Review QR Sandbox Test",
            customer_email: "sandbox-test@example.com",
            customer_phone: input.customerPhone ?? "9999999999",
          },
          order_note: input.orderNote,
          ...(input.orderTags ? { order_tags: input.orderTags } : {}),
          ...(input.notifyUrl || input.returnUrl
            ? {
                order_meta: {
                  ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
                  ...(input.returnUrl ? { return_url: input.returnUrl } : {}),
                },
              }
            : {}),
        }),
      }),
    );
  } catch {
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_create_network_error");
    return {
      success: false,
      httpStatus: null,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  if (input.diagnosticScope === "trustit_registration") logTrustitCashfreeHttpCategory("create", response.status);
  if (!response.ok) {
    await response.body?.cancel();
    return {
      success: false,
      httpStatus: response.status,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("order_response_validation_start");
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
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("order_response_validation_failed");
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
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("order_response_validation_failed");
    return {
      success: false,
      httpStatus: response.status,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }

  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("order_response_validation_success");
  return {
    success: true,
    httpStatus: response.status,
    orderId,
    orderStatus: result.order_status,
    paymentSessionId: result.payment_session_id,
    environment: client.environment,
  };
}

export async function createCashfreeMerchantCheckoutOrder(input: {
  planId: PlanId;
  businessId: string;
  customerName?: string;
  customerPhone?: string;
  orderId?: string;
  returnUrl?: string;
  diagnosticScope?: "trustit_registration";
}): Promise<CashfreeOrderResult> {
  if (process.env.CASHFREE_ENVIRONMENT?.trim() === "production" && !cashfreeLivePaymentsEnabled(process.env)) {
    return { success: false, httpStatus: null, error: "Cashfree live payments are disabled until explicitly enabled." };
  }
  const diagnoseTrustitRegistration = input.diagnosticScope === "trustit_registration";
  const plan = appConfig.plans[input.planId];
  if (diagnoseTrustitRegistration) logTrustitCheckoutStage("cashfree_webhook_configuration_start");
  const notifyUrl = configuredWebhookUrl();
  if (!notifyUrl) {
    if (diagnoseTrustitRegistration) logTrustitCheckoutStage("cashfree_webhook_configuration_failed");
    return {
      success: false,
      httpStatus: null,
      error: "Payment service is temporarily unavailable. Please try again.",
    };
  }
  if (diagnoseTrustitRegistration) logTrustitCheckoutStage("cashfree_webhook_configuration_success");

  const orderId = input.orderId ?? `rqr_${randomUUID().replaceAll("-", "")}`;
  if (!ORDER_ID_PATTERN.test(orderId)) {
    return { success: false, httpStatus: null, error: "The payment reference is invalid." };
  }

  let result: CashfreeOrderResult;
  if (input.orderId) {
    const existing = await fetchExistingMerchantOrder({
      orderId,
      businessId: input.businessId,
      planId: input.planId,
      diagnosticScope: input.diagnosticScope,
    });
    if (existing.status === "FOUND") result = existing.order;
    else if (existing.status === "ERROR") {
      return { success: false, httpStatus: existing.httpStatus, error: "Payment service is temporarily unavailable. Please try again." };
    } else result = await createOrder({
      amount: plan.price,
      customerId: input.businessId,
      orderNote: `Trustit ${plan.name} checkout`,
      orderId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      diagnosticScope: input.diagnosticScope,
      orderTags: {
        review_qr_context: signOrderContext({ orderId, businessId: input.businessId, planId: input.planId }),
      },
      notifyUrl,
      returnUrl: input.returnUrl,
    });
    if (!result.success) {
      const recovered = await fetchExistingMerchantOrder({ orderId, businessId: input.businessId, planId: input.planId, diagnosticScope: input.diagnosticScope });
      if (recovered.status === "FOUND") result = recovered.order;
    }
  } else result = await createOrder({
    amount: plan.price,
    customerId: input.businessId,
    orderNote: `Trustit ${plan.name} checkout`,
    orderId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    diagnosticScope: input.diagnosticScope,
    orderTags: {
      review_qr_context: signOrderContext({
        orderId,
        businessId: input.businessId,
        planId: input.planId,
      }),
    },
    notifyUrl,
    returnUrl: input.returnUrl,
  });
  if (!result.success) return result;
  return {
    ...result,
    verificationToken: createCheckoutVerificationToken({
      orderId: result.orderId,
      businessId: input.businessId,
      planId: input.planId,
    }),
  };
}

async function fetchExistingMerchantOrder(input: {
  orderId: string;
  businessId: string;
  planId: PlanId;
  diagnosticScope?: "trustit_registration";
}): Promise<
  | { status: "FOUND"; order: CashfreeOrderResult & { success: true } }
  | { status: "MISSING" }
  | { status: "ERROR"; httpStatus: number | null }
> {
  let client: CashfreeClient;
  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_client_configuration_start");
  try { client = createCashfreeClient(); } catch {
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_client_configuration_failed");
    return { status: "ERROR", httpStatus: null };
  }
  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_client_configuration_success");
  let response: Response;
  try {
    response = await fetch(`${client.apiBaseUrl}/orders/${encodeURIComponent(input.orderId)}`, client.createRequestInit({
      method: "GET", cache: "no-store", signal: AbortSignal.timeout(20_000),
    }));
  } catch {
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_lookup_network_error");
    return { status: "ERROR", httpStatus: null };
  }
  if (input.diagnosticScope === "trustit_registration") logTrustitCashfreeHttpCategory("lookup", response.status);
  if (response.status === 404) { await response.body?.cancel(); return { status: "MISSING" }; }
  if (!response.ok) { await response.body?.cancel(); return { status: "ERROR", httpStatus: response.status }; }
  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_lookup_response_validation_start");
  let payload: unknown;
  try { payload = await response.json(); } catch {
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_lookup_response_validation_failed");
    return { status: "ERROR", httpStatus: response.status };
  }
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_lookup_response_validation_failed");
    return { status: "ERROR", httpStatus: response.status };
  }
  const order = payload as { order_id?: unknown; order_status?: unknown; order_amount?: unknown; order_currency?: unknown; payment_session_id?: unknown; order_tags?: unknown };
  const tags = typeof order.order_tags === "object" && order.order_tags !== null && !Array.isArray(order.order_tags)
    ? order.order_tags as Record<string, unknown> : {};
  const context = readSignedOrderContext(tags.review_qr_context, input.orderId);
  if (order.order_id !== input.orderId || order.order_status !== "ACTIVE"
    || order.order_amount !== appConfig.plans[input.planId].price || order.order_currency !== "INR"
    || typeof order.payment_session_id !== "string" || !order.payment_session_id
    || context?.businessId !== input.businessId || context.planId !== input.planId) {
    if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_lookup_response_validation_failed");
    return { status: "ERROR", httpStatus: response.status };
  }
  if (input.diagnosticScope === "trustit_registration") logTrustitCheckoutStage("cashfree_lookup_response_validation_success");
  return { status: "FOUND", order: { success: true, httpStatus: response.status, orderId: input.orderId, orderStatus: "ACTIVE", paymentSessionId: order.payment_session_id, environment: client.environment } };
}

export type CashfreeWebhookOrderVerification =
  | { status: "VERIFIED_SUCCESS"; orderId: string; businessId: string; planId: PlanId; amount: number; paidAt: string }
  | { status: "NOT_SUCCESS" }
  | { status: "UNMAPPED" }
  | { status: "VERIFICATION_ERROR" };

type SignedCashfreeOrderContext = {
  businessId: string;
  planId: PlanId;
  amount: number;
};

type CashfreeOrderContextResult =
  | {
      status: "FOUND";
      httpStatus: number;
      context: SignedCashfreeOrderContext;
    }
  | { status: "UNMAPPED" }
  | { status: "VERIFICATION_ERROR"; httpStatus: number | null };

type CashfreePaymentVerification =
  | {
      status: "VERIFIED_SUCCESS";
      httpStatus: number;
      amount: number;
      currency: "INR";
      paidAt: string;
    }
  | { status: "NOT_SUCCESS"; httpStatus: number; terminalFailure: boolean }
  | { status: "VERIFICATION_ERROR"; httpStatus: number | null };

/** Reads the order only to confirm its ID and verify its signed merchant context. */
async function fetchSignedCashfreeOrderContext(input: {
  orderId: string;
  client: CashfreeClient;
}): Promise<CashfreeOrderContextResult> {
  let response: Response;
  try {
    response = await fetch(
      `${input.client.apiBaseUrl}/orders/${encodeURIComponent(input.orderId)}`,
      input.client.createRequestInit({
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      }),
    );
  } catch {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  if (!response.ok) {
    await response.body?.cancel();
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  const order = payload as {
    order_id?: unknown;
    order_amount?: unknown;
    order_currency?: unknown;
    order_tags?: unknown;
  };
  if (order.order_id !== input.orderId) {
    return { status: "UNMAPPED" };
  }
  if (
    typeof order.order_amount !== "number" ||
    typeof order.order_currency !== "string" ||
    typeof order.order_tags !== "object" ||
    order.order_tags === null ||
    Array.isArray(order.order_tags)
  ) {
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  const orderTags = order.order_tags as Record<string, unknown>;
  const context = readSignedOrderContext(
    orderTags.review_qr_context,
    input.orderId,
  );
  if (!context) {
    return { status: "UNMAPPED" };
  }
  if (
    order.order_amount !== context.amount ||
    order.order_currency !== "INR"
  ) {
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  return { status: "FOUND", httpStatus: response.status, context };
}

/** Uses Cashfree payment attempts, not order_status, as the payment authority. */
async function verifyCashfreePaymentForContext(input: {
  orderId: string;
  client: CashfreeClient;
  context: SignedCashfreeOrderContext;
}): Promise<CashfreePaymentVerification> {
  let response: Response;
  try {
    response = await fetch(
      `${input.client.apiBaseUrl}/orders/${encodeURIComponent(input.orderId)}/payments`,
      input.client.createRequestInit({
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      }),
    );
  } catch {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  if (!response.ok) {
    await response.body?.cancel();
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }
  if (!Array.isArray(payload)) {
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  const payments = payload.filter(
    (payment): payment is Record<string, unknown> =>
      typeof payment === "object" && payment !== null && !Array.isArray(payment),
  );
  if (payments.length !== payload.length) {
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  const successfulPayments = payments.filter(
    (payment) => payment.payment_status === "SUCCESS",
  );
  if (successfulPayments.length === 0) {
    const terminalFailure = payments.length > 0 && payments.every((payment) =>
      payment.payment_status === "FAILED" || payment.payment_status === "USER_DROPPED",
    );
    return { status: "NOT_SUCCESS", httpStatus: response.status, terminalFailure };
  }

  const payment = successfulPayments.find(
    (candidate) =>
      candidate.payment_amount === input.context.amount &&
      candidate.payment_currency === "INR",
  );
  if (!payment) {
    const mismatchedPayment = successfulPayments[0];
    return { status: "VERIFICATION_ERROR", httpStatus: response.status };
  }

  const paymentTime =
    typeof payment.payment_time === "string"
      ? Date.parse(payment.payment_time)
      : Number.NaN;
  const completionTime =
    typeof payment.payment_completion_time === "string"
      ? Date.parse(payment.payment_completion_time)
      : Number.NaN;
  const paidAt = Number.isFinite(completionTime)
    ? completionTime
    : paymentTime;

  return {
    status: "VERIFIED_SUCCESS",
    httpStatus: response.status,
    amount: input.context.amount,
    currency: "INR",
    paidAt: Number.isFinite(paidAt)
      ? new Date(paidAt).toISOString()
      : new Date().toISOString(),
  };
}

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

  const orderContext = await fetchSignedCashfreeOrderContext({ orderId, client });
  if (orderContext.status !== "FOUND") {
    if (orderContext.status === "UNMAPPED") return { status: "UNMAPPED" };
    return { status: "VERIFICATION_ERROR" };
  }

  const payment = await verifyCashfreePaymentForContext({
    orderId,
    client,
    context: orderContext.context,
  });
  if (payment.status !== "VERIFIED_SUCCESS") {
    if (payment.status === "NOT_SUCCESS") return { status: "NOT_SUCCESS" };
    return { status: "VERIFICATION_ERROR" };
  }

  return {
    status: "VERIFIED_SUCCESS",
    orderId,
    businessId: orderContext.context.businessId,
    planId: orderContext.context.planId,
    amount: payment.amount,
    paidAt: payment.paidAt,
  };
}

/** Verifies Cashfree's timestamp + raw-body HMAC-SHA256 webhook signature. */
export function verifyCashfreeWebhookSignature(input: {
  rawBody: string;
  timestamp: string | null;
  signature: string | null;
}): boolean {
  try {
    const secret = requiredEnvironmentVariable("CASHFREE_CLIENT_SECRET");
    return verifyCashfreeSignature({ ...input, secret });
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

  const orderContext = await fetchSignedCashfreeOrderContext({
    orderId: input.orderId,
    client,
  });
  if (orderContext.status !== "FOUND") {
    return {
      status: "VERIFICATION_ERROR",
      httpStatus:
        orderContext.status === "VERIFICATION_ERROR"
          ? orderContext.httpStatus
          : null,
    };
  }

  const context = orderContext.context;
  if (
    context.businessId !== input.authenticatedBusinessId ||
    context.businessId !== claims.businessId ||
    context.planId !== claims.planId ||
    context.amount !== claims.amount
  ) {
    return { status: "VERIFICATION_ERROR", httpStatus: orderContext.httpStatus };
  }

  const payment = await verifyCashfreePaymentForContext({
    orderId: input.orderId,
    client,
    context,
  });
  if (payment.status !== "VERIFIED_SUCCESS") return payment;

  return {
    status: "VERIFIED_SUCCESS",
    httpStatus: payment.httpStatus,
    planId: context.planId,
    amount: payment.amount,
    currency: payment.currency,
    paidAt: payment.paidAt,
  };
}

/** Recovers a merchant order using only its server-signed Cashfree order context. */
export async function verifyCashfreeMerchantOrderBySignedContext(input: {
  orderId: string;
  authenticatedBusinessId: string;
}): Promise<CashfreeVerificationResult> {
  if (!ORDER_ID_PATTERN.test(input.orderId)) {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  let client: CashfreeClient;
  try {
    client = createCashfreeClient();
  } catch {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  const orderContext = await fetchSignedCashfreeOrderContext({
    orderId: input.orderId,
    client,
  });
  if (orderContext.status !== "FOUND") {
    return {
      status: "VERIFICATION_ERROR",
      httpStatus:
        orderContext.status === "VERIFICATION_ERROR"
          ? orderContext.httpStatus
          : null,
    };
  }
  if (orderContext.context.businessId !== input.authenticatedBusinessId) {
    return {
      status: "VERIFICATION_ERROR",
      httpStatus: orderContext.httpStatus,
    };
  }

  const payment = await verifyCashfreePaymentForContext({
    orderId: input.orderId,
    client,
    context: orderContext.context,
  });
  if (payment.status !== "VERIFIED_SUCCESS") return payment;

  return {
    status: "VERIFIED_SUCCESS",
    httpStatus: payment.httpStatus,
    planId: orderContext.context.planId,
    amount: payment.amount,
    currency: payment.currency,
    paidAt: payment.paidAt,
  };
}

/** Explicitly creates one test-only ₹29 Sandbox order for connectivity checks. */
export async function createCashfreeSandboxTestOrder(): Promise<CashfreeSandboxTestOrderResult> {
  if (process.env.CASHFREE_ENVIRONMENT?.trim() !== "sandbox") {
    return { success: false, httpStatus: null, error: "Sandbox test orders are only available in the Sandbox environment." };
  }
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
