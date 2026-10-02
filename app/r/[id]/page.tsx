import { randomUUID } from "node:crypto";
import { supabase } from "@/lib/supabase";
import { safeReviewLink } from "@/lib/safe-review-link";
import ReviewExperience from "./review-experience";
import {
  createReviewSessionForBusiness,
  generateReviewDraftForBusiness,
  getReviewSessionCookie,
  getReviewExperienceCategoriesForBusiness,
  handoffGoogleReviewForBusiness,
  restoreReviewSessionForBusiness,
  saveReviewDraftEditForBusiness,
  setReviewSessionCookie,
  saveReviewSessionExperiencesForBusiness,
  submitTrustitReviewForBusiness,
} from "./review-session";

type ScanPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScanPage({ params }: ScanPageProps) {
  const { id } = await params;

  const { data, error } = await supabase.rpc("get_business_for_qr", {
    p_business_id: id,
  });

  const business = Array.isArray(data) ? data[0] : data;

  if (error || !business) {
    return (
      <ScanMessage icon="🔍" title="QR Not Found">
        This QR code does not exist or could not be found.
      </ScanMessage>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  const active =
    String(business.qr_status ?? "").toLowerCase() === "active" &&
    (!business.expiry || business.expiry >= today);

  if (!active) {
    return (
      <ScanMessage icon="⏸️" title="QR Temporarily Inactive">
        <p>
          This QR code is currently inactive or its subscription has expired.
        </p>
        <p className="mt-4 text-xs text-slate-400">Business: {business.name}</p>
      </ScanMessage>
    );
  }

  const reviewLink = safeReviewLink(business.review_link);
  if (!reviewLink) {
    return (
      <ScanMessage icon="⚠️" title="Review Link Missing">
        <p>The review link for this business has not been configured yet.</p>
        <p className="mt-4 text-xs text-slate-400">Business: {business.name}</p>
      </ScanMessage>
    );
  }

  // Keep the existing one-time-per-page-visit scan count behavior.
  await supabase.rpc("increment_business_scan", {
    p_business_id: business.id,
  });

  const experienceCategories = await getReviewExperienceCategoriesForBusiness(
    business.id,
  );
  if (experienceCategories.length === 0) {
    return (
      <ScanMessage icon="💬" title="Feedback is temporarily unavailable">
        Please try again later. This business’s feedback options are being
        prepared.
      </ScanMessage>
    );
  }

  const qrBusinessId = business.id;
  const cookieSessionId = await getReviewSessionCookie(qrBusinessId);
  const restoredSession = cookieSessionId
    ? await restoreReviewSessionForBusiness(qrBusinessId, cookieSessionId)
    : null;
  // On the first rating action this render's UUID is persisted in an HttpOnly
  // cookie. The action response re-renders this route with that same ID, so all
  // later server actions remain bound to the restored session.
  const reviewSessionId = restoredSession && cookieSessionId ? cookieSessionId : randomUUID();
  const restoredCategories = restoredSession?.selectedExperiences ?? [];
  const customerCategories = [...experienceCategories];
  for (const saved of restoredCategories) {
    if (!customerCategories.some((category) => category.key === saved.key)) {
      customerCategories.push(saved);
    }
  }
  async function createSessionAction(rating: number) {
    "use server";
    const result = await createReviewSessionForBusiness(qrBusinessId, reviewSessionId, rating);
    if (result.ok) await setReviewSessionCookie(qrBusinessId, result.sessionId);
    return result;
  }
  async function saveExperiencesAction(categoryKeys: string[]) {
    "use server";
    return saveReviewSessionExperiencesForBusiness(
      qrBusinessId,
      reviewSessionId,
      categoryKeys,
    );
  }
  async function generateReviewDraftAction() {
    "use server";
    return generateReviewDraftForBusiness(qrBusinessId, reviewSessionId);
  }
  async function googleReviewHandoffAction(editedText: string) {
    "use server";
    return handoffGoogleReviewForBusiness(qrBusinessId, reviewSessionId, editedText);
  }
  async function saveReviewDraftAction(editedText: string) {
    "use server";
    return saveReviewDraftEditForBusiness(qrBusinessId, reviewSessionId, editedText);
  }
  async function submitTrustitReviewAction(submission: import("./review-session-types").TrustitReviewSubmission) {
    "use server";
    return submitTrustitReviewForBusiness(qrBusinessId, reviewSessionId, submission);
  }

  return (
    <ReviewExperience
      businessName={business.name}
      googleReviewUrl={reviewLink}
      experienceCategories={customerCategories}
      initialSession={restoredSession}
      createReviewSession={createSessionAction}
      saveExperiences={saveExperiencesAction}
      generateReviewDraft={generateReviewDraftAction}
      googleReviewHandoff={googleReviewHandoffAction}
      saveReviewDraft={saveReviewDraftAction}
      submitTrustitReview={submitTrustitReviewAction}
    />
  );
}

function ScanMessage({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div aria-hidden="true" className="mb-4 text-5xl">
          {icon}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <div className="mt-3 text-sm leading-6 text-slate-600">{children}</div>
      </section>
    </main>
  );
}
