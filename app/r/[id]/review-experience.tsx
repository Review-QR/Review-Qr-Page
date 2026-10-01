"use client";

import { useRef, useState, useTransition } from "react";
import { TRUSTIT_RELATIONS, isValidMonthDay, validDaysForMonth, validateTrustitReviewInput } from "@/lib/trustit-review-validation";
import type {
  CreateReviewSessionAction,
  GenerateReviewDraftAction,
  GoogleReviewHandoffAction,
  ReviewExperienceCategory,
  SaveReviewExperiencesAction,
  SubmitTrustitReviewAction,
  TrustitReviewSubmission,
} from "./review-session-types";

type ReviewExperienceProps = {
  businessName: string;
  experienceCategories: ReviewExperienceCategory[];
  createReviewSession: CreateReviewSessionAction;
  saveExperiences: SaveReviewExperiencesAction;
  generateReviewDraft: GenerateReviewDraftAction;
  googleReviewHandoff: GoogleReviewHandoffAction;
  submitTrustitReview: SubmitTrustitReviewAction;
};

type Occasion = { enabled: boolean; month: string; day: string };
type FamilyMember = {
  name: string;
  relation: string;
  mobile: string;
  birthday: Occasion;
  anniversary: Occasion;
};
const emptyOccasion = (): Occasion => ({ enabled: false, month: "", day: "" });
const emptyFamilyMember = (): FamilyMember => ({
  name: "", relation: "", mobile: "", birthday: emptyOccasion(), anniversary: emptyOccasion(),
});
const relations = TRUSTIT_RELATIONS;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthDays(month: string) {
  const index = months.indexOf(month);
  return validDaysForMonth(index);
}

function OccasionRow({ label, value, onChange }: {
  label: string; value: Occasion; onChange: (next: Occasion) => void;
}) {
  const validDays = monthDays(value.month);
  return (
    <div className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 py-2">
      <label className="flex min-w-28 items-center gap-2 text-sm font-medium text-slate-800">
        <input type="checkbox" checked={value.enabled} onChange={(e) => onChange({ enabled: e.target.checked, month: e.target.checked ? value.month : "", day: e.target.checked ? value.day : "" })} />
        {label}
      </label>
      {value.enabled ? <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-nowrap">
        <label className="sr-only">{label} month</label>
        <select value={value.month} onChange={(e) => onChange({ ...value, month: e.target.value, day: "" })} className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
          <option value="">Month *</option>{months.map((month) => <option key={month}>{month}</option>)}
        </select>
        <label className="sr-only">{label} date</label>
        <select disabled={!value.month} value={value.day} onChange={(e) => onChange({ ...value, day: e.target.value })} className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
          <option value="">Date *</option>{validDays.map((day) => <option key={day} value={day}>{day}</option>)}
        </select>
      </div> : null}
    </div>
  );
}

export default function ReviewExperience({
  businessName, experienceCategories, createReviewSession, saveExperiences,
  generateReviewDraft, googleReviewHandoff, submitTrustitReview,
}: ReviewExperienceProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const [step, setStep] = useState<"feedback" | "draft" | "trustit" | "submitted">("feedback");
  const [shareDetails, setShareDetails] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [birthday, setBirthday] = useState<Occasion>(emptyOccasion());
  const [anniversary, setAnniversary] = useState<Occasion>(emptyOccasion());
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const requestInProgress = useRef(false);

  function runAction(work: () => Promise<void>) {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setError(null);
    startTransition(async () => {
      try { await work(); }
      catch { setError("We couldn't complete that step. Please try again."); }
      finally { requestInProgress.current = false; }
    });
  }

  function selectRating(rating: number) {
    if (requestInProgress.current || sessionId || selectedRating !== null) return;
    runAction(async () => {
      const result = await createReviewSession(rating);
      if (!result.ok) { setError(result.message); return; }
      setSelectedRating(result.rating);
      setSessionId(result.sessionId);
    });
  }

  function toggleExperience(categoryKey: string) {
    if (isPending) return;
    setSelectedCategories((current) => current.includes(categoryKey)
      ? current.filter((key) => key !== categoryKey)
      : current.length >= 10 ? current : [...current, categoryKey]);
  }

  function makeDraft(regenerate = false) {
    if (!sessionId || !selectedRating || selectedCategories.length < 1) return;
    const returnStep = step;
    runAction(async () => {
      if (!regenerate) {
        const saved = await saveExperiences(selectedCategories);
        if (!saved.ok) { setError(saved.message); return; }
        setSelectedCategories(saved.categoryKeys);
      }
      const result = await generateReviewDraft();
      if (!result.ok) { setError(result.message); return; }
      setDraft(result.draft);
      setCopied(false);
      const nextStep = regenerate && returnStep === "trustit" ? "trustit" : "draft";
      setStep(nextStep);
      setTimeout(() => document.getElementById(nextStep === "trustit" ? "trustit-review-form" : "review-draft-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    });
  }

  async function copyAndGoogle() {
    if (!draft.trim()) return;
    setError(null);
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      const result = await googleReviewHandoff(draft);
      if (!result.ok) { setError(result.message); return; }
      window.location.assign(result.reviewUrl);
    } catch { setError("Copy or review-page opening is unavailable. Please try again."); }
  }

  function updateFamily(index: number, updater: (member: FamilyMember) => FamilyMember) {
    setFamily((current) => current.map((member, i) => i === index ? updater(member) : member));
  }

  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const occasions: TrustitReviewSubmission["occasions"] = [];
    const addOccasion = (owner: "customer" | "family", item: Occasion, occasion: "birthday" | "anniversary", familyIndex?: number) => {
      if (item.enabled) occasions.push({ owner, familyIndex, occasion, month: months.indexOf(item.month) + 1, day: Number(item.day) });
    };
    if (shareDetails) {
      addOccasion("customer", birthday, "birthday"); addOccasion("customer", anniversary, "anniversary");
      family.forEach((member, index) => { addOccasion("family", member.birthday, "birthday", index); addOccasion("family", member.anniversary, "anniversary", index); });
    }
    const payload: TrustitReviewSubmission = {
      reviewText: draft, customerName: customerName.trim(), customerMobile: shareDetails ? customerMobile.trim() : "",
      shareDetails, occasions, familyMembers: shareDetails ? family.map(({ name, relation, mobile }) => ({ name: name.trim(), relation, mobile: mobile.trim() })) : [],
    };
    const issues = validateTrustitReviewInput(payload);
    const validateOccasion = (item: Occasion, label: string) => {
      if (item.enabled && (!item.month || !item.day || !isValidMonthDay(months.indexOf(item.month), Number(item.day)))) issues.push(`Choose a valid month and date for ${label}.`);
    };
    if (shareDetails) {
      validateOccasion(birthday, "your birthday");
      validateOccasion(anniversary, "your anniversary");
      family.forEach((member, index) => {
        validateOccasion(member.birthday, `family member ${index + 1} birthday`);
        validateOccasion(member.anniversary, `family member ${index + 1} anniversary`);
      });
    }
    setFormErrors(issues);
    if (issues.length || !sessionId || !selectedRating || !draft.trim()) return;
    runAction(async () => {
      const result = await submitTrustitReview(payload);
      if (!result.ok) { setError(result.message); return; }
      setStep("submitted");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-5 flex items-center justify-center gap-2" aria-label="Trustit">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">T</span>
          <span className="text-lg font-bold text-slate-900">Trustit</span>
        </header>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-indigo-600">Your feedback matters</p>
            <h1 className="mt-2 break-words text-2xl font-bold text-slate-950">{businessName}</h1>
            {step !== "submitted" && <><p className="mt-3 text-lg font-semibold text-slate-800">How was your experience?</p><p className="mt-1 text-sm text-slate-500">Rate your experience</p></>}
            {selectedRating && <p className="mt-2 text-sm text-slate-600">{selectedRating} of 5 stars · saved for this session</p>}
          </div>

          {step === "submitted" ? <div className="py-10 text-center" role="status"><p className="text-2xl font-bold text-emerald-800">Thank you for sharing your review.</p><p className="mt-2 text-sm text-slate-600">Your feedback has been shared on Trustit.</p></div> : <>
            <div className="mt-5 flex justify-center gap-1" role="group" aria-label="Choose a rating from 1 to 5 stars">
              {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`} aria-pressed={selectedRating === rating} disabled={isPending || selectedRating !== null} onClick={() => selectRating(rating)} className={`grid size-12 place-items-center rounded-lg text-4xl disabled:cursor-default ${selectedRating && rating <= selectedRating ? "text-amber-400" : "text-slate-300 hover:bg-slate-50"}`}><span aria-hidden="true">★</span></button>)}
            </div>
            {isPending && !sessionId ? <p className="mt-2 text-center text-sm text-indigo-700">Saving your rating…</p> : null}
            {sessionId && step === "feedback" && <section className="mt-6 border-t border-slate-100 pt-5" aria-live="polite">
              <h2 className="text-lg font-bold text-slate-900">What stood out in your experience?</h2>
              <p className="mt-1 text-sm text-slate-500">Choose up to 10 that reflect your visit.</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{experienceCategories.map((category) => {
                const active = selectedCategories.includes(category.key);
                return <button key={category.key} type="button" aria-pressed={active} disabled={isPending} onClick={() => toggleExperience(category.key)} className={`min-h-12 rounded-lg border px-3 py-2 text-left text-sm font-medium ${active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"}`}><span className="flex justify-between gap-2"><span>{category.label}</span><span>{active ? "✓" : "+"}</span></span></button>;
              })}</div>
              {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
              <button type="button" disabled={isPending || selectedCategories.length === 0} onClick={() => makeDraft()} className="mt-5 min-h-12 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300">{isPending ? "Preparing your draft…" : "Continue"}</button>
            </section>}
            {step === "draft" && <section id="review-draft-section" className="mt-6 border-t border-slate-100 pt-5">
              <h2 className="text-lg font-bold text-slate-900">Your Review Draft</h2>
              <p className="mt-1 text-sm text-slate-500">Edit this in your own words before sharing.</p>
              <textarea aria-label="Your editable review draft" value={draft} maxLength={10000} rows={5} onChange={(e) => { setDraft(e.target.value); setCopied(false); }} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm leading-6 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" />
              {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}{copied && <p role="status" className="mt-2 text-sm text-emerald-700">Draft copied.</p>}
              <button type="button" disabled={isPending} onClick={() => makeDraft(true)} className="mt-3 min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-800 disabled:opacity-50">{isPending ? "Regenerating…" : "Regenerate Review"}</button>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" disabled={isPending || !draft.trim()} onClick={copyAndGoogle} className="min-h-12 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300">Copy Draft &amp; Review on Google Business</button>
                <button type="button" disabled={isPending || !draft.trim()} onClick={() => { setError(null); setStep("trustit"); setTimeout(() => document.getElementById("trustit-review-form")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} className="min-h-12 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-900">Review on Trustit Platform</button>
              </div>
            </section>}
            {step === "trustit" && <form id="trustit-review-form" onSubmit={submitReview} className="mt-6 border-t border-slate-100 pt-5">
              <h2 className="text-lg font-bold text-slate-900">Your Review</h2>
              <p className="mt-1 text-sm text-slate-600">Your {selectedRating}-star rating is retained.</p>
              <textarea aria-label="Review text" value={draft} maxLength={10000} rows={4} onChange={(e) => setDraft(e.target.value)} className="mt-3 w-full rounded-lg border border-slate-300 p-3 text-sm leading-6" />
              <button type="button" disabled={isPending} onClick={() => makeDraft(true)} className="mt-2 min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold">{isPending ? "Regenerating…" : "Regenerate Review"}</button>
              <label className="mt-5 block text-sm font-semibold text-slate-800">Your Name *</label>
              <input maxLength={160} value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Enter your name" />
              <label className="mt-4 flex min-h-11 items-center gap-2 text-sm text-slate-800"><input type="checkbox" checked={shareDetails} onChange={(e) => { setShareDetails(e.target.checked); if (!e.target.checked) { setCustomerMobile(""); setBirthday(emptyOccasion()); setAnniversary(emptyOccasion()); setFamily([]); } }} />Want to share some personal details?</label>
              {shareDetails && <div className="mt-2 border-l-2 border-indigo-100 pl-3">
                <label className="block text-sm font-semibold text-slate-800">Mobile Number *</label>
                <input type="tel" maxLength={32} value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} autoComplete="tel" className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Mobile number" />
                <div className="mt-3 rounded-lg border border-slate-200 px-3"><OccasionRow label="Birthday" value={birthday} onChange={setBirthday} /><OccasionRow label="Anniversary" value={anniversary} onChange={setAnniversary} /></div>
                <div className="mt-4 space-y-3">{family.map((member, index) => <fieldset key={index} className="rounded-lg border border-slate-200 p-3"><legend className="px-1 text-sm font-semibold">Family member {index + 1}</legend>
                  <div className="grid gap-2 sm:grid-cols-3"><input maxLength={160} aria-label="Family member name" placeholder="Name *" value={member.name} onChange={(e) => updateFamily(index, (m) => ({ ...m, name: e.target.value }))} className="min-h-10 rounded-md border border-slate-300 px-2 text-sm" /><select aria-label="Family member relation" value={member.relation} onChange={(e) => updateFamily(index, (m) => ({ ...m, relation: e.target.value }))} className="min-h-10 rounded-md border border-slate-300 px-2 text-sm"><option value="">Relation *</option>{relations.map((relation) => <option key={relation} value={relation}>{relation[0].toUpperCase() + relation.slice(1)}</option>)}</select><input type="tel" maxLength={32} aria-label="Family member mobile optional" placeholder="Mobile (optional)" value={member.mobile} onChange={(e) => updateFamily(index, (m) => ({ ...m, mobile: e.target.value }))} className="min-h-10 rounded-md border border-slate-300 px-2 text-sm" /></div>
                  <div className="mt-2 rounded-md border border-slate-100 px-2"><OccasionRow label="Birthday" value={member.birthday} onChange={(v) => updateFamily(index, (m) => ({ ...m, birthday: v }))} /><OccasionRow label="Anniversary" value={member.anniversary} onChange={(v) => updateFamily(index, (m) => ({ ...m, anniversary: v }))} /></div>
                  <button type="button" onClick={() => setFamily((current) => current.filter((_, i) => i !== index))} className="mt-2 text-xs font-semibold text-rose-700">Remove</button>
                </fieldset>)}</div>
                <button type="button" disabled={family.length >= 8} onClick={() => setFamily((current) => [...current, emptyFamilyMember()])} className="mt-3 min-h-10 text-sm font-semibold text-indigo-700">+ Add Family Member</button>
              </div>}
              {formErrors.length > 0 && <ul className="mt-3 list-inside list-disc text-sm text-rose-700" role="alert">{formErrors.map((item) => <li key={item}>{item}</li>)}</ul>}
              {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
              <button type="submit" disabled={isPending || !draft.trim()} className="mt-4 min-h-12 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-slate-300">{isPending ? "Sharing your review…" : "Share Your Review on Trustit"}</button>
            </form>}
          </>}
          {error && step !== "feedback" && step !== "draft" && step !== "trustit" ? <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p> : null}
        </section>
        <p className="mt-4 text-center text-xs text-slate-500">Your feedback helps {businessName} understand how it can serve you better.</p>
      </div>
    </main>
  );
}
