import { verifyCashfreeHyperlocalPayment } from "@/lib/hyperlocal/cashfree-hyperlocal-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
