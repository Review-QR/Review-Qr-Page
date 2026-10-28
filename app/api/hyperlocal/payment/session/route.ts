import { createCashfreeHyperlocalPaymentOrder } from "@/lib/hyperlocal/cashfree-hyperlocal-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, businessId, customerName, customerPhone, customerEmail, returnUrl } = body;

    if (!orderId || !amount || !businessId) {
      return Response.json(
        { success: false, error: "Missing required order fields (orderId, amount, businessId)." },
        { status: 400 },
      );
    }

    const result = await createCashfreeHyperlocalPaymentOrder({
      orderId,
      amount: Number(amount),
      businessId,
      customerName,
      customerPhone,
      customerEmail,
      returnUrl,
    });

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: result.httpStatus || 400 });
    }

    return Response.json(result);
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Payment session creation failed." },
      { status: 500 },
    );
  }
}
