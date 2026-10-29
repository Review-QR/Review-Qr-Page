import { NextRequest, NextResponse } from "next/server";
import {
  saveCustomerAddress,
  deleteCustomerAddress,
} from "@/lib/auth/email-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID is required." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: addresses, error } = await admin
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ addresses: addresses || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, address } = body;

    if (!customerId || !address) {
      return NextResponse.json({ error: "Customer ID and address data are required." }, { status: 400 });
    }

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
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const addressId = searchParams.get("addressId");

    if (!customerId || !addressId) {
      return NextResponse.json({ error: "Customer ID and address ID are required." }, { status: 400 });
    }

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
