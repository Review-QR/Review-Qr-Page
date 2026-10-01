import Link from "next/link";
import { requireActiveAdmin, createSupabaseServerClient } from "@/lib/supabase-server";
import InviteMerchantForm from "./invite-merchant-form";
import { listMerchantInvites } from "./actions";
import RevokeInviteButton from "./revoke-invite-button";

export const dynamic = "force-dynamic";

export default async function MerchantInvitePage() {
  await requireActiveAdmin();
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  const [{ data: businesses }, invites] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, owner, phone, merchant_status, deleted_at")
      .eq("merchant_status", "pending")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    listMerchantInvites(),
  ]);

  const pendingBusinessIds = new Set(
    (invites ?? [])
      .filter((invite: any) => invite.status === "pending")
      .map((invite: any) => invite.business_id),
  );

  const eligibleBusinesses = (businesses ?? []).filter(
    (business: any) => !pendingBusinessIds.has(business.id),
  );

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark" aria-hidden="true">QR</div>
          <div>
            <p className="brand-kicker">Review-QR · ADMIN</p>
            <h1>Invite Merchant</h1>
            <p className="dashboard-subtitle">Create a secure one-time registration link</p>
          </div>
        </div>
        <div className="dashboard-header-actions flex-wrap">
          <Link href="/merchants" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Back to Merchants
          </Link>
        </div>
      </header>

      <section className="dashboard-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">SECURE REGISTRATION</p>
            <h2>Generate merchant registration link</h2>
            <p className="mt-1 text-sm text-slate-500">The link expires after 48 hours, is stored only as a hash, and can be consumed once.</p>
          </div>
        </div>
        <InviteMerchantForm businesses={eligibleBusinesses as any[]} />
      </section>

      <section className="dashboard-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">INVITATION HISTORY</p>
            <h2>Merchant invitations</h2>
          </div>
          <span className="count-badge">{invites?.length ?? 0}</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Merchant</th>
                <th className="px-3 py-3">Business ID</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Expires</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {(invites ?? []).map((invite: any) => (
                <tr key={invite.id}>
                  <td className="px-3 py-4">
                    <div className="font-semibold text-slate-800">{invite.businesses?.name ?? "—"}</div>
                    <div className="mt-1 text-xs text-slate-500">{invite.businesses?.owner ?? ""} · {invite.businesses?.phone ?? ""}</div>
                  </td>
                  <td className="px-3 py-4 font-mono text-xs text-slate-600">{invite.business_id}</td>
                  <td className="px-3 py-4 text-sm text-slate-600">{new Date(invite.created_at).toLocaleString("en-IN")}</td>
                  <td className="px-3 py-4 text-sm text-slate-600">{new Date(invite.expires_at).toLocaleString("en-IN")}</td>
                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">{invite.status}</span>
                  </td>
                  <td className="px-3 py-4">
                    {invite.status === "pending" ? <InviteRevokeButton inviteId={invite.id} /> : <span className="text-xs text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
              {(invites ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">No merchant invitations yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

async function InviteRevokeButton({ inviteId }: { inviteId: string }) {
  const { default: RevokeInviteButton } = await import("./revoke-invite-button");
  return <RevokeInviteButton inviteId={inviteId} />;
}
