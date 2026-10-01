import { createSupabaseServerClient, requireActiveAdmin } from "@/lib/supabase-server";
import type { Business } from "@/lib/types";
import DeletedMerchantManagement from "./deleted-merchant-management";

export const dynamic = "force-dynamic";

export default async function DeletedMerchantsPage() {
  await requireActiveAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, owner, phone, type, plan, expiry, status, qr_status, registration_date, merchant_status, deleted_at, deleted_by")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) {
    return <main className="dashboard-shell"><section className="dashboard-alert" role="alert"><strong>Deleted Merchants unavailable</strong><p>Deleted merchant records could not be loaded. Please try again.</p></section></main>;
  }

  const merchants = (data ?? []) as Business[];
  const actorIds = [...new Set(merchants.map((business) => business.deleted_by).filter((id): id is string => Boolean(id)))];
  let actorNames = new Map<string, string>();
  if (actorIds.length) {
    const { data: admins } = await supabase.rpc("get_deleted_merchant_actors", { p_user_ids: actorIds });
    actorNames = new Map<string, string>((admins ?? []).map((admin: { user_id: string; email: string }) => [admin.user_id, admin.email]));
  }

  return <DeletedMerchantManagement merchants={merchants.map((business) => ({
    business,
    deletedByName: business.deleted_by ? actorNames.get(business.deleted_by) ?? "Administrator" : "Administrator",
  }))} />;
}
