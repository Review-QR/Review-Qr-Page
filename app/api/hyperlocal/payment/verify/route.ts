import { verifyCashfreeHyperlocalPayment } from "@/lib/hyperlocal/cashfree-hyperlocal-service";
import { enforceRateLimit } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

function checkGatewayConfigured(): Response | null {
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.CASHFREE_CLIENT_ID?.trim() || !process.env.CASHFREE_CLIENT_SECRET?.trim())
  ) {
    return Response.json(
      { success: false, error: "Payment gateway verification unavailable." },
      { status: 503 }
    );
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const rateLimited = enforceRateLimit(request, "hyperlocal_payment_verify", 30, 10 * 60_000);
    if (rateLimited) return rateLimited;
    const unconfigured = checkGatewayConfigured();
    if (unconfigured) return unconfigured;

    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId) {
      return Response.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    const result = await verifyCashfreeHyperlocalPayment(orderId);
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Verification error." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const rateLimited = enforceRateLimit(request, "hyperlocal_payment_verify", 30, 10 * 60_000);
    if (rateLimited) return rateLimited;
    const unconfigured = checkGatewayConfigured();
    if (unconfigured) return unconfigured;

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return Response.json({ success: false, error: "Order ID is required." }, { status: 400 });
    }

    const result = await verifyCashfreeHyperlocalPayment(orderId);
    return Response.json(result);
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Verification error." },
      { status: 500 },
    );
  }
}
