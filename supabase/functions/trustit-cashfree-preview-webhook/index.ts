import {
  createCashfreePreviewWebhookHandler,
  isPreviewSupabaseProject,
  verifyCashfreeSandboxOrder,
  verifyCashfreeWebhookSignature,
} from "../_shared/cashfree-preview-webhook.ts";

const PREVIEW_SUPABASE_URL = "https://piqwsyzktzjhafkcstjl.supabase.co";
const SANDBOX_API_BASE_URL = "https://sandbox.cashfree.com/pg";

type EdgeRuntime = {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const runtime = (globalThis as typeof globalThis & { Deno?: EdgeRuntime }).Deno;
if (!runtime) throw new Error("Supabase Edge Runtime is required");

function requiredEnvironment(name: string): string {
  return runtime!.env.get(name)?.trim() ?? "";
}

function readAdminApiKey(): { value: string; legacyJwt: boolean } | null {
  // Supabase's current Edge Runtime injects named secret API keys as JSON.
  try {
    const keys = JSON.parse(requiredEnvironment("SUPABASE_SECRET_KEYS")) as Record<string, unknown>;
    if (typeof keys.default === "string" && keys.default) return { value: keys.default, legacyJwt: false };
  } catch { /* Use the legacy injected key where the new key map is unavailable. */ }
  const legacy = requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY");
  return legacy ? { value: legacy, legacyJwt: true } : null;
}

const supabaseUrl = requiredEnvironment("SUPABASE_URL");
const adminApiKey = readAdminApiKey();
const clientId = requiredEnvironment("CASHFREE_CLIENT_ID");
const clientSecret = requiredEnvironment("CASHFREE_CLIENT_SECRET");
const environment = {
  supabaseUrl,
  apiBaseUrl: SANDBOX_API_BASE_URL,
  clientId,
  clientSecret,
};

function createAdminGateway() {
  const adminKey = adminApiKey?.value ?? "";
  const headers = {
    apikey: adminKey,
    ...(adminApiKey?.legacyJwt ? { authorization: `Bearer ${adminKey}` } : {}),
    "content-type": "application/json",
    accept: "application/json",
  };
  const restUrl = `${PREVIEW_SUPABASE_URL}/rest/v1`;

  return {
    async findOnboarding(orderId: string, businessId: string) {
      if (!adminApiKey) return { data: null, error: new Error("admin_unavailable") };
      const query = new URLSearchParams({
        select: "business_id,selected_plan,payment_mode,status,user_id",
        payment_reference: `eq.${orderId}`,
        business_id: `eq.${businessId}`,
        limit: "1",
      });
      try {
        const response = await fetch(`${restUrl}/onboarding_sessions?${query}`, {
          method: "GET", headers, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(8_000),
        });
        if (!response.ok) {
          await response.body?.cancel();
          return { data: null, error: new Error("onboarding_lookup_failed") };
        }
        const rows: unknown = await response.json();
        if (!Array.isArray(rows) || rows.length > 1) return { data: null, error: new Error("invalid_onboarding_result") };
        return { data: rows[0] ?? null, error: null };
      } catch {
        return { data: null, error: new Error("onboarding_lookup_failed") };
      }
    },
    async finalizeOneTimePayment(input: { businessId: string; orderId: string; plan: string; amount: number; currency: "INR"; paidAt: string }) {
      return callRpc("finalize_trustit_one_time_payment", input);
    },
    async applyPayment(input: { businessId: string; orderId: string; plan: string; amount: number; currency: "INR"; paidAt: string }) {
      return callRpc("apply_verified_cashfree_payment", input);
    },
  };

  async function callRpc(name: string, input: { businessId: string; orderId: string; plan: string; amount: number; currency: "INR"; paidAt: string }) {
    if (!adminApiKey) return { data: null, error: new Error("admin_unavailable") };
    const body = {
      p_business_id: input.businessId,
      p_cashfree_order_id: input.orderId,
      p_plan: input.plan,
      p_amount: input.amount,
      p_currency: input.currency,
      p_paid_at: input.paidAt,
    };
    try {
      const response = await fetch(`${restUrl}/rpc/${name}`, {
        method: "POST", headers, body: JSON.stringify(body), redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) {
        await response.body?.cancel();
        return { data: null, error: new Error("payment_application_failed") };
      }
      return { data: await response.json(), error: null };
    } catch {
      return { data: null, error: new Error("payment_application_failed") };
    }
  }
}

const handler = createCashfreePreviewWebhookHandler({
  environment,
  verifySignature: (rawBody, timestamp, signature) => verifyCashfreeWebhookSignature({
    secret: clientSecret, rawBody, timestamp, signature,
  }),
  verifyOrder: (orderId) => verifyCashfreeSandboxOrder({ orderId, clientId, clientSecret }),
  createAdminGateway,
});

const configurationIsValid = isPreviewSupabaseProject(supabaseUrl) &&
  supabaseUrl === PREVIEW_SUPABASE_URL && Boolean(adminApiKey) && Boolean(clientId) && Boolean(clientSecret);

runtime.serve((request) => {
  if (!configurationIsValid) return Response.json({ result: "unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  return handler(request);
});
