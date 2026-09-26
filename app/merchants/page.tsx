import type { Business } from "@/lib/types";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  createSupabaseServerClient,
  requireActiveAdmin,
} from "@/lib/supabase-server";
import MerchantManagement from "./merchant-management";

export const dynamic = "force-dynamic";

export default async function MerchantsPage() {
  await requireActiveAdmin();

  const supabase = await createSupabaseServerClient();
  let businessResult: {
    data: Business[] | null;
    error: { message: string } | null;
  };
  let mappingResult: {
    data: { business_id: string }[] | null;
    error: { message: string } | null;
  };

  try {
    const adminClient = createSupabaseAdminClient();
    [businessResult, mappingResult] = await Promise.all([
      supabase
        .from("businesses")
        .select(
          "id, name, owner, phone, type, plan, expiry, status, qr_status, registration_date, merchant_status, address, review_link"
        )
        .order("created_at", { ascending: false }),
      adminClient.from("merchant_accounts").select("business_id"),
    ]);
  } catch {
    return <MerchantListError />;
  }

  if (businessResult.error || mappingResult.error) return <MerchantListError />;

  return (
    <MerchantManagement
      businesses={businessResult.data ?? []}
      provisionedBusinessIds={(mappingResult.data ?? []).map(
        (mapping) => mapping.business_id
      )}
    />
  );
}

function MerchantListError() {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark" aria-hidden="true">QR</div>
          <div>
            <p className="brand-kicker">Review-QR · ADMIN</p>
            <h1>Merchants</h1>
            <p className="dashboard-subtitle">Manage merchant accounts and access</p>
          </div>
        </div>
      </header>
      <section className="dashboard-alert" role="alert">
        <span className="alert-icon" aria-hidden="true">!</span>
        <div>
          <strong>Merchant list unavailable</strong>
          <p>Merchant data could not be loaded. Please try again.</p>
        </div>
      </section>
    </main>
  );
}
