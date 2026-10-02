import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { hashMerchantInviteToken, isValidMerchantInviteToken } from "@/app/merchants/invite/invite-utils";
import MerchantInviteRegistrationForm from "./registration-form";

export const dynamic = "force-dynamic";

export default async function MerchantInviteRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isValidMerchantInviteToken(token)) notFound();

  const admin = createSupabaseAdminClient();
  const { data: inviteRows, error } = await admin.rpc("get_merchant_invite_registration", {
    p_token_hash: hashMerchantInviteToken(token),
  });
  const invite = (inviteRows?.[0] ?? null) as {
    business_id: string;
    status: "pending" | "used" | "expired" | "revoked";
    expires_at: string;
    business_name: string | null;
    merchant_name: string | null;
    merchant_phone: string | null;
    merchant_status: string | null;
    business_deleted: boolean;
    has_account: boolean;
  } | null;

  if (error || !invite) notFound();

  const expired = invite.status === "pending" && new Date(invite.expires_at).getTime() <= Date.now();
  if (invite.status !== "pending" || expired || invite.business_deleted || invite.merchant_status !== "pending" || invite.has_account) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">TRUSTIT MERCHANT REGISTRATION</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">This registration link is no longer valid</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">The invitation may have expired, already been used, been revoked, or the merchant account may already be registered.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">TRUSTIT MERCHANT REGISTRATION</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your merchant account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">This secure invitation is for <strong>{invite.business_name}</strong>.</p>
        <dl className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Business ID</dt><dd className="font-mono font-semibold text-slate-800">{invite.business_id}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Merchant</dt><dd className="font-semibold text-slate-800">{invite.merchant_name || "—"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Mobile</dt><dd className="text-slate-800">{invite.merchant_phone || "—"}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Link expires</dt><dd className="text-slate-800">{new Date(invite.expires_at).toLocaleString("en-IN")}</dd></div>
        </dl>
        <MerchantInviteRegistrationForm token={token} businessId={invite.business_id} />
      </section>
    </main>
  );
}
