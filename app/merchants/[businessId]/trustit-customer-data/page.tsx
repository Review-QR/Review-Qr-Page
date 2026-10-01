import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireActiveAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type Occasion = {
  customer_profile_id: string | null;
  family_member_id: string | null;
  occasion_key: string;
  month: number;
  day: number;
};

function dateLabel(occasion: Occasion | undefined) {
  return occasion ? `${String(occasion.month).padStart(2, "0")}-${String(occasion.day).padStart(2, "0")}` : "—";
}

export default async function TrustitCustomerDataPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  await requireActiveAdmin();
  const { businessId } = await params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(businessId)) notFound();

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return <PageError message="Customer data is not configured on this server." />;
  }

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .select("id, name")
    .eq("id", businessId)
    .maybeSingle();
  if (businessError) return <PageError message="Merchant customer data could not be loaded." />;
  if (!business) notFound();

  const { data: reviews, error: reviewsError } = await admin
    .from("trustit_reviews")
    .select("id, review_session_id, rating, review_text, customer_name, customer_mobile, submitted_at, status")
    .eq("business_id", businessId)
    .order("submitted_at", { ascending: false });
  if (reviewsError) return <PageError message="Trustit review records could not be loaded." />;

  const sessionIds = (reviews ?? []).map((review) => review.review_session_id);
  const [sessionsResult, experiencesResult, profilesResult] = sessionIds.length
    ? await Promise.all([
        admin.from("review_sessions").select("id, created_at").eq("business_id", businessId).in("id", sessionIds),
        admin.from("review_session_experiences").select("review_session_id, category_label_snapshot").eq("business_id", businessId).in("review_session_id", sessionIds),
        admin.from("review_customer_profiles").select("id, review_session_id").eq("business_id", businessId).in("review_session_id", sessionIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }, { data: [], error: null }];

  if (sessionsResult.error || experiencesResult.error || profilesResult.error) {
    return <PageError message="Trustit session details could not be loaded." />;
  }

  const profileIds = (profilesResult.data ?? []).map((profile) => profile.id);
  const familyResult = profileIds.length
    ? await admin.from("review_family_members").select("id, customer_profile_id, relationship, name, mobile").eq("business_id", businessId).in("customer_profile_id", profileIds)
    : { data: [], error: null };
  if (familyResult.error) return <PageError message="Customer family details could not be loaded." />;

  const familyIds = (familyResult.data ?? []).map((member) => member.id);
  const occasionResults = await Promise.all([
    profileIds.length
      ? admin.from("review_special_occasions").select("customer_profile_id, family_member_id, occasion_key, month, day").eq("business_id", businessId).in("customer_profile_id", profileIds)
      : Promise.resolve({ data: [], error: null }),
    familyIds.length
      ? admin.from("review_special_occasions").select("customer_profile_id, family_member_id, occasion_key, month, day").eq("business_id", businessId).in("family_member_id", familyIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (occasionResults.some((result) => result.error)) return <PageError message="Customer occasion details could not be loaded." />;

  const profilesBySession = new Map((profilesResult.data ?? []).map((profile) => [profile.review_session_id, profile]));
  const experiencesBySession = new Map<string, string[]>();
  for (const item of experiencesResult.data ?? []) {
    experiencesBySession.set(item.review_session_id, [
      ...(experiencesBySession.get(item.review_session_id) ?? []),
      item.category_label_snapshot,
    ]);
  }
  const familiesByProfile = new Map<string, typeof familyResult.data>();
  for (const member of familyResult.data ?? []) {
    familiesByProfile.set(member.customer_profile_id, [...(familiesByProfile.get(member.customer_profile_id) ?? []), member]);
  }
  const occasions = occasionResults.flatMap((result) => result.data ?? []) as Occasion[];
  const customerOccasion = (profileId: string, key: string) => occasions.find((item) => item.customer_profile_id === profileId && item.occasion_key === key);
  const familyOccasion = (familyId: string, key: string) => occasions.find((item) => item.family_member_id === familyId && item.occasion_key === key);

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand"><div className="brand-mark" aria-hidden="true">QR</div><div><p className="brand-kicker">Review-QR · ADMIN</p><h1>Trustit Customer Data</h1><p className="dashboard-subtitle">{business.name} · {business.id}</p></div></div>
        <Link href="/merchants" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to merchants</Link>
      </header>
      <section className="dashboard-panel">
        <div className="section-heading"><div><p className="section-kicker">SUBMITTED TRUSTIT REVIEWS</p><h2>Customer submissions</h2></div><span className="count-badge">{reviews?.length ?? 0}</span></div>
        {!reviews?.length ? <p className="empty-state">No submitted Trustit customer records are available for this merchant.</p> : <div className="space-y-4">
          {reviews.map((review) => {
            const profile = profilesBySession.get(review.review_session_id);
            const family = profile ? familiesByProfile.get(profile.id) ?? [] : [];
            return <article key={review.id} className="rounded-xl border border-slate-200 p-4 sm:p-6">
              <header className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{review.customer_name || "Customer chose not to share a name"}</h3><p className="text-sm text-slate-500">{review.customer_mobile || "Mobile not shared"} · {new Date(review.submitted_at).toLocaleString()}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">{review.rating}/5</span></header>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-800">{review.review_text}</p>
              <p className="mt-4 text-xs text-slate-500">Selected experiences: {(experiencesBySession.get(review.review_session_id) ?? []).join(", ") || "None recorded"}</p>
              {profile && <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                <section><h4 className="text-sm font-semibold text-slate-800">Customer occasions</h4><dl className="mt-2 space-y-1 text-sm text-slate-600"><div>Birthday: {dateLabel(customerOccasion(profile.id, "birthday"))}</div><div>Anniversary: {dateLabel(customerOccasion(profile.id, "anniversary"))}</div></dl></section>
                <section><h4 className="text-sm font-semibold text-slate-800">Family members</h4>{family.length ? <ul className="mt-2 space-y-3">{family.map((member) => <li key={member.id} className="rounded-lg bg-slate-50 p-3 text-sm"><strong>{member.name || "Name not shared"}</strong><span className="text-slate-500"> · {member.relationship}</span><p className="text-slate-600">{member.mobile || "Mobile not shared"}</p><p className="text-slate-600">Birthday: {dateLabel(familyOccasion(member.id, "birthday"))} · Anniversary: {dateLabel(familyOccasion(member.id, "anniversary"))}</p></li>)}</ul> : <p className="mt-2 text-sm text-slate-500">No family members shared.</p>}</section>
              </div>}
            </article>;
          })}
        </div>}
      </section>
    </main>
  );
}

function PageError({ message }: { message: string }) {
  return <main className="dashboard-shell"><header className="dashboard-header"><div><p className="brand-kicker">Review-QR · ADMIN</p><h1>Trustit Customer Data</h1></div><Link href="/merchants" className="text-sm text-blue-700 underline">Back to merchants</Link></header><section className="dashboard-alert" role="alert"><span className="alert-icon" aria-hidden="true">!</span><p>{message}</p></section></main>;
}
