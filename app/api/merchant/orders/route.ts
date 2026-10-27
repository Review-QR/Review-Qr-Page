import { requireActiveMerchant } from "@/lib/merchant-auth";
import { getMerchantProductOrders } from "@/lib/product-orders/product-order-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await requireActiveMerchant();
    const orders = await getMerchantProductOrders(merchant.businessId);
    return Response.json({ orders });
  } catch (err) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
