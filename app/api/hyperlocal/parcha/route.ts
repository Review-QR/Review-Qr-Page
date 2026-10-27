import { createParchaOrder, updateParchaMerchantQuote } from "@/lib/hyperlocal/hyperlocal-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "update_quote") {
      const result = await updateParchaMerchantQuote({
        orderId: body.orderId,
        merchantQuoteAmount: Number(body.merchantQuoteAmount || 0),
        merchantQuoteItems: body.merchantQuoteItems || [],
      });
      return Response.json(result);
    }

    const result = await createParchaOrder({
      businessId: body.businessId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      handwrittenText: body.handwrittenText,
      parchaImageUrl: body.parchaImageUrl,
      customerNotes: body.customerNotes,
    });

    return Response.json({ success: true, ...result });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Parcha submission failed" },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const businessId = searchParams.get("businessId");

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("grocery_parcha_orders")
    .select(`
      *,
      hyperlocal_orders (*)
    `)
    .order("created_at", { ascending: false });

  if (orderId) query = query.eq("order_id", orderId);
  else if (businessId) query = query.eq("hyperlocal_orders.business_id", businessId);
  else query = query.limit(20);

  const { data, error } = await query;
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ parchas: data || [] });
}
