import { bookDigitalServiceToken } from "@/lib/hyperlocal/hyperlocal-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await bookDigitalServiceToken({
      businessId: body.businessId,
      serviceType: body.serviceType,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      vehicleOrNotes: body.vehicleOrNotes,
      slotTime: body.slotTime,
    });
    return Response.json({ success: true, ...result });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Token booking failed" },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  const phone = searchParams.get("phone");
  const tokenId = searchParams.get("tokenId");

  const today = new Date().toISOString().slice(0, 10);
  const admin = createSupabaseAdminClient();

  if (phone) {
    const { data, error } = await admin
      .from("service_tokens_and_slots")
      .select("*, businesses (name, city, address, phone)")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ tokens: data || [] });
  }

  if (tokenId) {
    const { data, error } = await admin
      .from("service_tokens_and_slots")
      .select("*, businesses (name, city, address, phone)")
      .eq("id", tokenId)
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ token: data });
  }

  if (!businessId) {
    return Response.json({ error: "businessId or phone is required" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("service_tokens_and_slots")
    .select("*")
    .eq("business_id", businessId)
    .eq("booking_date", today)
    .order("token_number", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const tokens = data || [];
  const currentServing = tokens.find((t) => t.status === "in_progress") || null;
  const waitingCount = tokens.filter((t) => t.status === "waiting").length;

  return Response.json({
    today,
    tokens,
    currentServing,
    waitingCount,
  });
}
