import { NextRequest, NextResponse } from "next/server";
import {
  saveCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/auth/email-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  CUSTOMER_SESSION_COOKIE,
  enforceRateLimit,
  isUuid,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

function checkCustomerSessionOwnership(request: NextRequest, customerId: string): NextResponse | null {
  const session = verifyCustomerSessionToken(
    request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
  );
  if (session && session.customerId && session.customerId !== customerId) {
    return NextResponse.json({ error: "Forbidden: customer session mismatch." }, { status: 403 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request, "customer_addresses_get", 60, 60_000);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!isUuid(customerId)) {
    return NextResponse.json({ error: "Valid Customer ID is required." }, { status: 400 });
  }
  const forbidden = checkCustomerSessionOwnership(request, customerId);
  if (forbidden) return forbidden;

  const admin = createSupabaseAdminClient();
  const { data: addresses, error } = await admin
    .from("customer_addresses")
    .select("id, customer_id, label, full_address, landmark, latitude, longitude, is_default, created_at")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addresses: addresses || [] });
}

export async function POST(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "customer_addresses_write", 30, 5 * 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { customerId, address } = body;

    if (!isUuid(customerId) || !address) {
      return NextResponse.json({ error: "Valid Customer ID and address data are required." }, { status: 400 });
    }
    const forbidden = checkCustomerSessionOwnership(request, customerId);
    if (forbidden) return forbidden;

    const result = await saveCustomerAddress(customerId, address);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to save address." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "customer_addresses_write", 30, 5 * 60_000);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const addressId = searchParams.get("addressId");

    if (!isUuid(customerId) || !isUuid(addressId)) {
      return NextResponse.json({ error: "Valid Customer ID and address ID are required." }, { status: 400 });
    }
    const forbidden = checkCustomerSessionOwnership(request, customerId);
    if (forbidden) return forbidden;

    const result = await deleteCustomerAddress(customerId, addressId);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to delete address." },
      { status: 500 },
    );
  }
}
