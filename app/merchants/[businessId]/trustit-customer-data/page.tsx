import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient, requireActiveAdmin } from "@/lib/supabase-server";

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

  // Use the signed-in admin session so the existing active-admin RLS policies
  // authorize every read. The service-role key has no SELECT grant on businesses.
  const admin = await createSupabaseServerClient();

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
  const submittedAtLabel = (value: string) => new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand"><div className="brand-mark" aria-hidden="true">QR</div><div><p className="brand-kicker">Review-QR · ADMIN</p><h1>Trustit Customer Data</h1><p className="dashboard-subtitle">{business.name} · {business.id}</p></div></div>
        <Link href="/merchants" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Back to merchants</Link>
      </header>
      <section className="dashboard-panel">
        <div className="section-heading"><div><p className="section-kicker">SUBMITTED TRUSTIT REVIEWS</p><h2>Customer submissions</h2></div><span className="count-badge">{reviews?.length ?? 0}</span></div>
        {!reviews?.length ? <p className="empty-state">No submitted Trustit customer records are available for this merchant.</p> : <div className="max-h-[75vh] overflow-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[2200px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
              <tr>
                <th scope="col" className="px-3 py-3">Customer</th>
                <th scope="col" className="px-3 py-3">Mobile Number</th>
                <th scope="col" className="px-3 py-3">Rating</th>
                <th scope="col" className="px-3 py-3">Review</th>
                <th scope="col" className="px-3 py-3">Selected Experience Points</th>
                <th scope="col" className="px-3 py-3">Date of Birth</th>
                <th scope="col" className="px-3 py-3">Anniversary</th>
                <th scope="col" className="px-3 py-3">Family Members</th>
                <th scope="col" className="px-3 py-3">Family Member Mobile</th>
                <th scope="col" className="px-3 py-3">Family Member DOB</th>
                <th scope="col" className="px-3 py-3">Family Member Anniversary</th>
                <th scope="col" className="px-3 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {reviews.map((review) => {
                const profile = profilesBySession.get(review.review_session_id);
                const family = profile ? familiesByProfile.get(profile.id) ?? [] : [];
                const experiences = experiencesBySession.get(review.review_session_id) ?? [];
                return (
                  <tr key={review.id} className="align-top hover:bg-slate-50">
                    <td className="max-w-48 px-3 py-3 font-medium text-slate-900">{review.customer_name || "Name not shared"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">{review.customer_mobile || "Not shared"}</td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} {review.rating}/5</td>
                    <td className="max-w-[28rem] whitespace-pre-wrap px-3 py-3 text-slate-700">{review.review_text}</td>
                    <td className="max-w-[24rem] px-3 py-3 font-bold text-slate-900">{experiences.length ? experiences.map((point) => `• ${point}`).join(" ") : "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">{profile ? dateLabel(customerOccasion(profile.id, "birthday")) : "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">{profile ? dateLabel(customerOccasion(profile.id, "anniversary")) : "—"}</td>
                    <td className="px-3 py-3 text-slate-700">{family.length ? family.map((member) => <div key={member.id}>{member.name || "Name not shared"} · {member.relationship}</div>) : "—"}</td>
                    <td className="px-3 py-3 text-slate-700">{family.length ? family.map((member) => <div key={member.id}>{member.mobile || "Not shared"}</div>) : "—"}</td>
                    <td className="px-3 py-3 text-slate-700">{family.length ? family.map((member) => <div key={member.id}>{dateLabel(familyOccasion(member.id, "birthday"))}</div>) : "—"}</td>
                    <td className="px-3 py-3 text-slate-700">{family.length ? family.map((member) => <div key={member.id}>{dateLabel(familyOccasion(member.id, "anniversary"))}</div>) : "—"}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">{submittedAtLabel(review.submitted_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>}
      </section>
    </main>
  );
}

function PageError({ message }: { message: string }) {
  return <main className="dashboard-shell"><header className="dashboard-header"><div><p className="brand-kicker">Review-QR · ADMIN</p><h1>Trustit Customer Data</h1></div><Link href="/merchants" className="text-sm text-blue-700 underline">Back to merchants</Link></header><section className="dashboard-alert" role="alert"><span className="alert-icon" aria-hidden="true">!</span><p>{message}</p></section></main>;
}
