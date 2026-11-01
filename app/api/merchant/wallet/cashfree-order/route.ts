import { NextResponse } from "next/server";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { createCashfreeWalletRechargeOrder } from "@/lib/wallet/cashfree-wallet-service";

export async function POST(req: Request) {
  try {
    const merchant = await getActiveMerchant();
    if (!merchant) {
      return NextResponse.json({ message: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = (await req.json()) as {
      amount?: number;
      credits?: number;
      businessId?: string;
    };

    const amount = Number(body.amount);
    const credits = Number(body.credits || amount);

    if (!amount || amount < 10) {
      return NextResponse.json({ message: "Minimum recharge amount is ₹10." }, { status: 400 });
    }

    const orderResult = await createCashfreeWalletRechargeOrder({
      businessId: merchant.businessId,
      amount,
      credits,
      merchantName: merchant.businessName,
      merchantPhone: merchant.registeredMobile || undefined,
      merchantEmail: merchant.email || undefined,
    });

    if (!orderResult.success) {
      return NextResponse.json({ message: orderResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      paymentSessionId: orderResult.paymentSessionId,
      checkoutMode: orderResult.environment,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}
