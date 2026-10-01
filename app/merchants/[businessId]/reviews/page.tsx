import Link from "next/link";
import { requireActiveAdmin } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  review_session_id: string;
  rating: number;
  review_text: string;
  customer_name: string;
  customer_mobile: string | null;
  submitted_at: string;
  status: string;
};

type ProfileRow = {
  id: string;
  review_session_id: string;
};

type FamilyRow = {
  id: string;
  customer_profile_id: string;
  relationship: string;
  name: string;
  mobile: string | null;
};

type OccasionRow = {
  customer_profile_id: string | null;
  family_member_id: string | null;
  occasion_key: string;
  month: number;
  day: number;
};

type ExperienceRow = {
  review_session_id: string;
  category_label_snapshot: string;
};

function occasionLabel(row: OccasionRow) {
  const month = new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, row.month - 1, row.day))
  );
  const title = row.occasion_key === "birthday" ? "Birthday" : "Anniversary";
  return `${title}: ${month} ${row.day}`;
}

export default async function AdminMerchantReviewsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  await requireActiveAdmin();
  const { businessId } = await params;
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(businessId)) {
    return <AdminError message="Invalid merchant profile." />;
  }

  const admin = createSupabaseAdminClient();
  const [
    { data: business },
    { data: reviews },
    { data: profiles },
    { data: familyMembers },
    { data: occasions },
    { data: experiences },
  ] = await Promise.all([
    admin.from("businesses").select("id,name,scans").eq("id", businessId).maybeSingle(),
    admin
      .from("trustit_reviews")
      .select("id,review_session_id,rating,review_text,customer_name,customer_mobile,submitted_at,status")
      .eq("business_id", businessId)
      .order("submitted_at", { ascending: false }),
    admin.from("review_customer_profiles").select("id,review_session_id").eq("business_id", businessId),
    admin
      .from("review_family_members")
      .select("id,customer_profile_id,relationship,name,mobile")
      .eq("business_id", businessId),
    admin
      .from("review_special_occasions")
      .select("customer_profile_id,family_member_id,occasion_key,month,day")
      .eq("business_id", businessId),
    admin
      .from("review_session_experiences")
      .select("review_session_id,category_label_snapshot")
      .eq("business_id", businessId),
  ]);

  if (!business) return <AdminError message="Merchant profile was not found." />;

  const profileBySession = new Map(
    ((profiles ?? []) as ProfileRow[]).map((profile) => [profile.review_session_id, profile])
  );
  const familyByProfile = new Map<string, FamilyRow[]>();
  for (const member of (familyMembers ?? []) as FamilyRow[]) {
    const current = familyByProfile.get(member.customer_profile_id) ?? [];
    current.push(member);
    familyByProfile.set(member.customer_profile_id, current);
  }
  const occasionsByProfile = new Map<string, OccasionRow[]>();
  const occasionsByFamily = new Map<string, OccasionRow[]>();
  for (const occasion of (occasions ?? []) as OccasionRow[]) {
    if (occasion.customer_profile_id) {
      const current = occasionsByProfile.get(occasion.customer_profile_id) ?? [];
      current.push(occasion);
      occasionsByProfile.set(occasion.customer_profile_id, current);
    }
    if (occasion.family_member_id) {
      const current = occasionsByFamily.get(occasion.family_member_id) ?? [];
      current.push(occasion);
      occasionsByFamily.set(occasion.family_member_id, current);
    }
  }
  const experiencesBySession = new Map<string, string[]>();
  for (const experience of (experiences ?? []) as ExperienceRow[]) {
    const current = experiencesBySession.get(experience.review_session_id) ?? [];
    current.push(experience.category_label_snapshot);
    experiencesBySession.set(experience.review_session_id, current);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">ADMIN · MERCHANT PROFILE</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{business.name}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Trustit customer reviews and personal details · QR scans: {business.scans ?? 0}
            </p>
          </div>
          <Link href="/merchants" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to Merchants
          </Link>
        </header>

        {reviews?.length ? (
          <section className="space-y-5">
            {(reviews as ReviewRow[]).map((review) => {
              const profile = profileBySession.get(review.review_session_id);
              const members = profile ? familyByProfile.get(profile.id) ?? [] : [];
              const customerOccasions = profile ? occasionsByProfile.get(profile.id) ?? [] : [];
              const selected = experiencesBySession.get(review.review_session_id) ?? [];

              return (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{review.customer_name || "Customer"}</h2>
                      <p className="mt-1 text-sm font-semibold text-amber-600">{"★".repeat(Math.max(0, Math.min(5, Number(review.rating))))} <span className="text-slate-500">{review.rating}/5</span></p>
                    </div>
                    <div className="text-xs text-slate-500">
                      <p>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(review.submitted_at))}</p>
                      <p className="mt-1">Status: {review.status}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Trustit Review</h3>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">{review.review_text}</p>

                      <h3 className="mt-5 text-sm font-semibold text-slate-800">Selected experience points</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.length ? selected.map((item) => (
                          <span key={item} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">{item}</span>
                        )) : <span className="text-sm text-slate-500">None recorded</span>}
                      </div>
                    </div>

                    <section className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                      <h3 className="text-sm font-semibold text-slate-900">Customer personal details</h3>
                      <dl className="mt-3 space-y-3">
                        <div><dt className="text-xs text-slate-500">Mobile</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{review.customer_mobile || "Not shared"}</dd></div>
                        <div><dt className="text-xs text-slate-500">Details shared</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{profile ? "Yes" : "No"}</dd></div>
                        <div>
                          <dt className="text-xs text-slate-500">Birthday / Anniversary</dt>
                          <dd className="mt-1 space-y-1 text-sm text-slate-800">
                            {customerOccasions.length ? customerOccasions.map((item) => <div key={`${item.occasion_key}-${item.month}-${item.day}`}>{occasionLabel(item)}</div>) : "Not shared"}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>

                  <section className="mt-5 rounded-xl border border-slate-200 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Family members</h3>
                    {members.length ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {members.map((member) => {
                          const memberOccasions = occasionsByFamily.get(member.id) ?? [];
                          return (
                            <div key={member.id} className="rounded-lg bg-slate-50 p-4">
                              <p className="font-semibold text-slate-900">{member.name}</p>
                              <p className="mt-1 text-sm text-slate-600">Relation: {member.relationship}</p>
                              <p className="mt-1 text-sm text-slate-600">Mobile: {member.mobile || "Not shared"}</p>
                              <div className="mt-2 text-sm text-slate-600">
                                {memberOccasions.length ? memberOccasions.map((item) => <div key={`${member.id}-${item.occasion_key}-${item.month}-${item.day}`}>{occasionLabel(item)}</div>) : "No special dates shared"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">No family members shared.</p>
                    )}
                  </section>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">No Trustit reviews yet</h2>
            <p className="mt-2 text-sm text-slate-500">Personal details will appear here only when a customer chooses to share them.</p>
          </section>
        )}
      </div>
    </main>
  );
}

function AdminError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Merchant profile unavailable</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
        <Link href="/merchants" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Back to Merchants</Link>
      </section>
    </main>
  );
}
