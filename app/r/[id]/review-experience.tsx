"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { TRUSTIT_RELATIONS, isValidMonthDay, validDaysForMonth, validateTrustitReviewInput } from "@/lib/trustit-review-validation";
import type {
  CreateReviewSessionAction,
  GenerateReviewDraftAction,
  GoogleReviewHandoffAction,
  ReviewExperienceCategory,
  RestoredReviewSession,
  SaveReviewDraftAction,
  SaveReviewExperiencesAction,
  SubmitTrustitReviewAction,
  TrustitReviewSubmission,
} from "./review-session-types";

type ReviewExperienceProps = {
  businessName: string;
  googleReviewUrl: string;
  experienceCategories: ReviewExperienceCategory[];
  initialSession: RestoredReviewSession;
  createReviewSession: CreateReviewSessionAction;
  saveExperiences: SaveReviewExperiencesAction;
  generateReviewDraft: GenerateReviewDraftAction;
  googleReviewHandoff: GoogleReviewHandoffAction;
  saveReviewDraft: SaveReviewDraftAction;
  submitTrustitReview: SubmitTrustitReviewAction;
};

type Occasion = { enabled: boolean; month: string; day: string };
type FamilyMember = { name: string; relation: string; mobile: string; birthday: Occasion; anniversary: Occasion };
type Step = "rating" | "experience" | "review" | "details" | "submitted" | "failed";
const emptyOccasion = (): Occasion => ({ enabled: false, month: "", day: "" });
const emptyFamilyMember = (): FamilyMember => ({ name: "", relation: "", mobile: "", birthday: emptyOccasion(), anniversary: emptyOccasion() });
const relations = TRUSTIT_RELATIONS;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const stages: { id: Exclude<Step, "submitted" | "failed">; label: string }[] = [
  { id: "rating", label: "Rating" }, { id: "experience", label: "Experience" }, { id: "review", label: "Review" }, { id: "details", label: "Details" },
];
const stageForNumber = (value: number): Step => stages[Math.max(0, Math.min(3, value))].id;
function monthDays(month: string) { return validDaysForMonth(months.indexOf(month)); }
function ratingCopy(rating: number | null) {
  if (!rating) return "Tap a star to rate your visit";
  return ["We appreciate your honest feedback.", "Thanks for letting us know.", "Tell us what could be better.", "We’re glad your visit went well.", "We’re delighted you enjoyed your visit."][rating - 1];
}
function toneFor(rating: number | null) { return rating && rating <= 2 ? "negative" : rating === 3 ? "mixed" : "positive"; }

function OccasionRow({ label, value, onChange }: { label: string; value: Occasion; onChange: (next: Occasion) => void }) {
  const inputId = useId();
  return <div className="flex min-h-12 flex-nowrap items-center gap-2 border-t border-slate-100 py-2">
    <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={value.enabled} onChange={(e) => onChange({ enabled: e.target.checked, month: e.target.checked ? value.month : "", day: e.target.checked ? value.day : "" })} />{label}</label>
    {value.enabled && <div className="flex min-w-0 flex-1 gap-2"><label htmlFor={`${inputId}-month`} className="sr-only">{label} month</label><select id={`${inputId}-month`} value={value.month} onChange={(e) => onChange({ ...value, month: e.target.value, day: "" })} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-sm"><option value="">Month *</option>{months.map((month) => <option key={month}>{month}</option>)}</select><label htmlFor={`${inputId}-day`} className="sr-only">{label} date</label><select id={`${inputId}-day`} disabled={!value.month} value={value.day} onChange={(e) => onChange({ ...value, day: e.target.value })} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-sm"><option value="">Date *</option>{monthDays(value.month).map((day) => <option key={day} value={day}>{day}</option>)}</select></div>}
  </div>;
}

function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#bd7216] to-[#8d4b0b] px-5 py-3 text-sm font-bold text-white shadow-[0_9px_20px_rgba(151,87,16,.19)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:bg-none disabled:text-slate-500 disabled:shadow-none ${props.className ?? ""}`}>{children}</button>;
}

export default function ReviewExperience({
  businessName, googleReviewUrl, experienceCategories, initialSession, createReviewSession, saveExperiences,
  generateReviewDraft, googleReviewHandoff, saveReviewDraft, submitTrustitReview,
}: ReviewExperienceProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRating, setSelectedRating] = useState<number | null>(initialSession?.rating ?? null);
  const [hasSession, setHasSession] = useState(Boolean(initialSession));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSession?.selectedExperiences.map((item) => item.key) ?? []);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(initialSession?.draft ?? "");
  const [step, setStep] = useState<Step>(initialSession?.submitted ? "submitted" : initialSession?.draft ? "review" : initialSession ? "experience" : "rating");
  const [unlockedStage, setUnlockedStage] = useState(initialSession?.submitted ? 4 : initialSession?.draft ? 3 : initialSession ? 1 : 0);
  const [shareDetails, setShareDetails] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [birthday, setBirthday] = useState<Occasion>(emptyOccasion());
  const [anniversary, setAnniversary] = useState<Occasion>(emptyOccasion());
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isOpeningGoogle, setIsOpeningGoogle] = useState(false);
  const requestInProgress = useRef(false);
  const selectedLabels = experienceCategories.filter((item) => selectedCategories.includes(item.key)).map((item) => item.label);
  const tone = toneFor(selectedRating);

  useEffect(() => {
    const sections = stages
      .map((stage) => document.getElementById(`review-stage-${stage.id}`))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (!visible) return;
      const index = Number((visible.target as HTMLElement).dataset.stageIndex);
      if (Number.isInteger(index) && index <= unlockedStage) setStep(stageForNumber(index));
    }, { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.15, 0.35, 0.6] });
    sections.forEach((section, index) => {
      section.dataset.stageIndex = String(index);
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, [unlockedStage]);

  function navigateToStage(index: number) {
    if (index > unlockedStage || index < 0 || index > 3) return;
    const target = stages[index];
    if (!target) return;
    setStep(target.id);
    window.setTimeout(() => document.getElementById(`review-stage-${target.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }

  function runAction(work: () => Promise<void>) {
    if (requestInProgress.current) return;
    requestInProgress.current = true; setError(null);
    startTransition(async () => {
      try { await work(); } catch { setError("We couldn’t complete that step. Please try again."); }
      finally { requestInProgress.current = false; }
    });
  }

  function selectRating(rating: number) {
    if (requestInProgress.current || hasSession || selectedRating !== null) return;
    runAction(async () => {
      const result = await createReviewSession(rating);
      if (!result.ok) { setError("We couldn’t save your rating. Please try again."); return; }
      setSelectedRating(result.rating); setHasSession(true); setError(null);
    });
  }

  function toggleExperience(categoryKey: string) {
    if (isPending) return;
    setSelectedCategories((current) => current.includes(categoryKey) ? current.filter((key) => key !== categoryKey) : current.length >= 10 ? current : [...current, categoryKey]);
  }

  function makeDraft(regenerate = false) {
    if (!hasSession || !selectedRating || selectedCategories.length < 1) return;
    runAction(async () => {
      if (!regenerate) {
        const saved = await saveExperiences(selectedCategories);
        if (!saved.ok) { setError("Those choices could not be saved. Please try again."); return; }
        setSelectedCategories(saved.categoryKeys);
      } else {
        const savedDraft = await saveReviewDraft(draft);
        if (!savedDraft.ok) { setError("Your current draft could not be saved. Please try again."); return; }
      }
      const result = await generateReviewDraft();
      if (!result.ok) { setError("We couldn’t prepare a review suggestion. Please try again."); return; }
      setDraft(result.draft); setCopied(false); setUnlockedStage((current) => Math.max(current, 2)); setStep("review");
      setTimeout(() => document.getElementById("review-stage-review")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    });
  }

  async function copyAndGoogle() {
    if (!draft.trim() || !hasSession || requestInProgress.current) return;
    requestInProgress.current = true; setIsOpeningGoogle(true); setError(null);
    try {
      await navigator.clipboard.writeText(draft); setCopied(true);
      const result = await googleReviewHandoff(draft);
      if (!result.ok) { setError("We couldn’t open this business’s Google review page. You can continue here instead."); return; }
      window.location.assign(result.reviewUrl);
    } catch { setError("Copy or review-page opening isn’t available. Please try again."); }
    finally { requestInProgress.current = false; setIsOpeningGoogle(false); }
  }

  function openGoogleAfterSubmit() {
    void navigator.clipboard?.writeText(draft).catch(() => undefined);
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  function continueToDetails() {
    if (!hasSession || !draft.trim()) return;
    runAction(async () => {
      const result = await saveReviewDraft(draft);
      if (!result.ok) { setError("Your draft could not be saved. Please try again."); return; }
      setUnlockedStage((current) => Math.max(current, 3)); setStep("details"); setError(null);
      setTimeout(() => document.getElementById("review-stage-details")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    });
  }

  function updateFamily(index: number, updater: (member: FamilyMember) => FamilyMember) { setFamily((current) => current.map((member, i) => i === index ? updater(member) : member)); }

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
    const payload: TrustitReviewSubmission = { reviewText: draft, customerName: customerName.trim(), customerMobile: shareDetails ? customerMobile.trim() : "", shareDetails, occasions, familyMembers: shareDetails ? family.map(({ name, relation, mobile }) => ({ name: name.trim(), relation, mobile: mobile.trim() })) : [] };
    const issues = validateTrustitReviewInput(payload);
    const validateOccasion = (item: Occasion, label: string) => { if (item.enabled && (!item.month || !item.day || !isValidMonthDay(months.indexOf(item.month), Number(item.day)))) issues.push(`Choose a valid month and date for ${label}.`); };
    if (shareDetails) {
      validateOccasion(birthday, "your birthday"); validateOccasion(anniversary, "your anniversary");
      family.forEach((member, index) => { validateOccasion(member.birthday, `family member ${index + 1} birthday`); validateOccasion(member.anniversary, `family member ${index + 1} anniversary`); });
    }
    setFormErrors(issues);
    if (issues.length || !hasSession || !selectedRating || !draft.trim()) return;
    runAction(async () => {
      const result = await submitTrustitReview(payload);
      if (!result.ok) { setStep("failed"); setError("We couldn’t submit your review. Please check your connection and try again."); return; }
      setError(null); setUnlockedStage(4); setStep("submitted"); setTimeout(() => document.getElementById("review-stage-thank-you")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    });
  }

  const stageIndex = step === "rating" ? 0 : step === "experience" ? 1 : step === "review" ? 2 : 3;

  return <main className="min-h-screen bg-[#fff8ed] px-3 pb-12 pt-5 text-slate-900 sm:px-6 sm:pt-8">
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-80 bg-[radial-gradient(ellipse_at_top,_#ffe4b7_0%,_#fff8ed_72%)]" />
    <div className="relative mx-auto w-full max-w-3xl">
      <header className="mb-5 flex items-center justify-center gap-2.5 sm:mb-7">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 text-lg font-black text-white shadow-md shadow-blue-200">T</span>
        <span><strong className="block text-lg font-extrabold tracking-tight">Trustit</strong><small className="block text-[11px] leading-4 text-slate-500">Your Feedback Matters</small></span>
      </header>
      <section className="rounded-[28px] border border-orange-100 bg-white/95 shadow-[0_18px_60px_rgba(112,81,40,.10)] sm:rounded-[32px]">
        <div className="relative overflow-hidden rounded-t-[28px] border-b border-amber-100 bg-[linear-gradient(120deg,#fffdf8,#fff4e2)] px-5 pb-6 pt-7 text-center sm:rounded-t-[32px] sm:px-9 sm:pb-7 sm:pt-9">
          <span aria-hidden="true" className="pointer-events-none absolute -right-7 top-3 text-5xl text-amber-200/70">✧</span>
          <span className="mx-auto mb-3 grid size-16 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-amber-100 to-orange-200 text-2xl font-extrabold text-orange-800 shadow-md shadow-orange-100">{businessName.trim().slice(0, 1).toUpperCase()}</span>
          <p className="text-xs font-semibold text-slate-500">Your feedback helps us serve you better</p>
          <h1 className="mt-1 break-words text-[22px] font-extrabold leading-tight tracking-[-.035em] text-[#10153f] sm:text-3xl">{businessName}</h1>
        </div>

        {step !== "submitted" && step !== "failed" && <nav aria-label="Review progress" className="sticky top-0 z-30 border-b border-amber-100 bg-[#fffdf8]/95 px-3 py-3 shadow-sm backdrop-blur sm:px-8 sm:py-4">
          <ol className="grid grid-cols-4">
            {stages.map((stage, index) => <li key={stage.id} className="relative flex min-w-0 flex-col items-center text-center">
              {index < stages.length - 1 && <span aria-hidden="true" className={`absolute left-1/2 top-3.5 h-0.5 w-full ${index < unlockedStage ? "bg-emerald-400" : "bg-slate-200"}`} />}
              <button type="button" disabled={index > unlockedStage} onClick={() => navigateToStage(index)} aria-current={index === stageIndex ? "step" : undefined} aria-label={`${stage.label}${index < unlockedStage ? ", completed" : index === stageIndex ? ", current step" : ", not available yet"}`} className={`relative z-10 grid size-7 place-items-center rounded-full text-[11px] font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed sm:size-8 ${index === stageIndex ? "bg-[#bf7012] text-white shadow-sm shadow-amber-200" : index < unlockedStage ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>{index < unlockedStage ? "✓" : index + 1}</button>
              <span className={`mt-1 text-[9px] font-semibold sm:mt-1.5 sm:text-xs ${index === stageIndex ? "text-[#a05a0c]" : index < unlockedStage ? "text-emerald-800" : "text-slate-400"}`}>{stage.label}</span>
            </li>)}
          </ol>
        </nav>}

        {unlockedStage >= 0 && step !== "submitted" && step !== "failed" && <section id="review-stage-rating" className="scroll-mt-24 border-b border-amber-100 px-5 py-8 text-center sm:px-10 sm:py-10">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-orange-50 text-2xl text-orange-500">✦</span>
          <h2 className="mt-4 text-xl font-extrabold tracking-tight text-[#10153f] sm:text-2xl">How was your experience?</h2>
          <p className="mt-1 text-sm text-slate-500">Tap a star to rate your visit</p>
          <div className="mt-5 flex justify-center gap-1 sm:gap-2" role="group" aria-label="Choose a rating from 1 to 5 stars">
            {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`} aria-pressed={selectedRating === rating} disabled={isPending || selectedRating !== null} onClick={() => selectRating(rating)} className={`grid size-14 place-items-center rounded-2xl transition hover:-translate-y-0.5 hover:bg-amber-50 disabled:cursor-default sm:size-16 ${selectedRating && rating <= selectedRating ? "text-amber-400 drop-shadow-sm" : "text-amber-300"}`}><svg aria-hidden="true" viewBox="0 0 24 24" className="size-10 fill-current sm:size-12"><path d="M12 2.25 14.92 8.18l6.54.95-4.73 4.61 1.12 6.52L12 17.18l-5.85 3.08 1.12-6.52L2.54 9.13l6.54-.95L12 2.25Z" /></svg></button>)}
          </div>
          <p className="mt-2 min-h-6 text-sm font-medium text-slate-600" aria-live="polite">{selectedRating ? `${selectedRating} out of 5 stars · ${ratingCopy(selectedRating)}` : ratingCopy(null)}</p>
          {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {isPending && <p className="mt-2 text-sm text-amber-800">Saving your rating…</p>}
          <PrimaryButton type="button" disabled={!selectedRating || !hasSession || isPending} onClick={() => { setError(null); setUnlockedStage((current) => Math.max(current, 1)); setStep("experience"); window.setTimeout(() => navigateToStage(1), 70); }} className="mt-6 w-full">Next <span aria-hidden="true">→</span></PrimaryButton>
        </section>}

        {unlockedStage >= 1 && step !== "submitted" && step !== "failed" && <section id="review-stage-experience" className="scroll-mt-24 border-b border-amber-100 px-5 py-8 sm:px-10 sm:py-10">
          <h2 className="text-center text-xl font-extrabold tracking-tight text-[#10153f] sm:text-2xl">What did you like the most?</h2>
          <p className="mt-1 text-center text-sm text-slate-500">Choose one or more options that match your visit.</p>
          <p className="mt-1 text-center text-xs font-medium text-slate-400">{selectedCategories.length} of 10 selected</p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2">{experienceCategories.map((category, index) => {
            const active = selectedCategories.includes(category.key);
            return <button key={category.key} type="button" aria-pressed={active} disabled={isPending || (!active && selectedCategories.length >= 10)} onClick={() => toggleExperience(category.key)} className={`flex min-h-[60px] min-w-0 items-center gap-2 rounded-2xl border px-2.5 py-3 text-left text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-100 sm:min-h-[72px] sm:gap-3 sm:px-3.5 sm:text-sm ${active ? "border-amber-500 bg-amber-50 text-amber-900 shadow-[0_3px_12px_rgba(185,108,18,.10)]" : "border-amber-100 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/50"}`}>
              <span className={`grid size-7 shrink-0 place-items-center rounded-xl text-xs sm:size-9 sm:text-sm ${active ? "bg-amber-600 text-white" : ["bg-orange-50 text-orange-600", "bg-emerald-50 text-emerald-600", "bg-amber-50 text-amber-700", "bg-rose-50 text-rose-600"][index % 4]}`}>{active ? "✓" : "✦"}</span><span className="min-w-0 flex-1 leading-tight">{category.label}</span><span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-md border text-xs ${active ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300 text-transparent"}`}>✓</span>
            </button>;
          })}</div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={isPending} onClick={() => navigateToStage(0)} className="min-h-12 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-bold text-[#67401d]">← Back</button><PrimaryButton type="button" disabled={isPending || !selectedCategories.length} onClick={() => makeDraft()}>{isPending ? "Preparing…" : "Next →"}</PrimaryButton></div>
        </section>}

        {unlockedStage >= 2 && step !== "submitted" && step !== "failed" && <section id="review-stage-review" className="scroll-mt-24 border-b border-amber-100 px-5 py-8 sm:px-10 sm:py-10">
          <div className={`rounded-2xl border p-3.5 ${tone === "positive" ? "border-emerald-100 bg-emerald-50/70" : tone === "mixed" ? "border-amber-200 bg-amber-50/70" : "border-rose-200 bg-rose-50/70"}`}><p className={`text-sm font-bold ${tone === "positive" ? "text-emerald-900" : tone === "mixed" ? "text-amber-900" : "text-rose-900"}`}>{tone === "positive" ? "Your visit highlights" : tone === "mixed" ? "Your balanced feedback" : "Your honest feedback"}</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedLabels.map((label) => <span key={label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone === "positive" ? "bg-emerald-100 text-emerald-800" : tone === "mixed" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}><span aria-hidden="true">✓</span>{label}</span>)}</div></div>
          <h2 className="mt-5 text-xl font-extrabold tracking-tight text-[#10153f]">Write your review</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">Share your experience at {businessName}. Your feedback helps us improve.</p>
          <textarea aria-label="Your editable review draft" value={draft} maxLength={10000} rows={6} onChange={(e) => { setDraft(e.target.value); setCopied(false); }} className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 shadow-inner shadow-slate-50 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100" />
          <p className="mt-2 text-xs leading-5 text-slate-500">This suggestion reflects the rating and points you chose. Please make sure the final review matches your actual experience. Trustit never posts to Google for you.</p>
          {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{copied && <p role="status" className="mt-2 text-sm text-emerald-700">Review copied. Paste it on Google to submit.</p>}
          <button type="button" disabled={isPending} onClick={() => makeDraft(true)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50">✧ {isPending ? "Preparing…" : "Generate another suggestion (Optional)"}</button>
          <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={isPending || isOpeningGoogle} onClick={() => navigateToStage(1)} className="min-h-12 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-bold text-[#67401d]">← Back</button><PrimaryButton type="button" disabled={isPending || !draft.trim()} onClick={continueToDetails}>{isPending ? "Saving…" : "Next →"}</PrimaryButton></div>
          <button type="button" disabled={isPending || isOpeningGoogle || !draft.trim()} onClick={copyAndGoogle} className="mt-3 min-h-11 w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-800 disabled:opacity-50">{isOpeningGoogle ? "Opening Google Review…" : "Copy Draft & Review on Google"}</button>
        </section>}

        {unlockedStage >= 3 && step !== "submitted" && step !== "failed" && <form id="review-stage-details" onSubmit={submitReview} className="scroll-mt-24 px-5 py-8 sm:px-10 sm:py-10">
          <h2 className="text-xl font-extrabold tracking-tight text-[#10153f] sm:text-2xl">A few optional details</h2>
          <p className="mt-1 text-sm text-slate-500">Help us understand you better (this is optional)</p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your rating</p><p className="mt-1 text-lg font-bold text-amber-500" aria-label={`${selectedRating} out of 5 stars`}>{"★".repeat(selectedRating ?? 0)}{"☆".repeat(5 - (selectedRating ?? 0))} <span className="text-sm text-slate-700">{selectedRating}/5</span></p></div>
          <label htmlFor="trustit-customer-name" className="mt-5 block text-sm font-bold text-slate-800">Your Name <span className="text-rose-600">*</span></label>
          <input id="trustit-customer-name" maxLength={160} value={customerName} onChange={(e) => setCustomerName(e.target.value)} autoComplete="name" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" placeholder="Enter your name" />
          <p className="mt-2 text-xs leading-5 text-slate-500">A name is shown with your review. Mobile, family and occasion details stay private unless you opt in.</p>
          <label className="mt-5 flex min-h-12 items-center gap-3 rounded-xl bg-amber-50 px-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={shareDetails} onChange={(e) => { setShareDetails(e.target.checked); if (!e.target.checked) { setCustomerMobile(""); setBirthday(emptyOccasion()); setAnniversary(emptyOccasion()); setFamily([]); } }} />Want to share some personal details?</label>
          {shareDetails && <div className="mt-3 space-y-4 rounded-2xl border border-slate-200 p-3.5 sm:p-4">
            <div><label htmlFor="trustit-customer-mobile" className="block text-sm font-bold text-slate-800">Mobile Number <span className="text-rose-600">*</span></label><input id="trustit-customer-mobile" type="tel" maxLength={32} value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} autoComplete="tel" className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100" placeholder="Mobile number" /></div>
            <div className="rounded-xl border border-slate-100 px-3"><OccasionRow label="Birthday" value={birthday} onChange={setBirthday} /><OccasionRow label="Anniversary" value={anniversary} onChange={setAnniversary} /></div>
            <details className="rounded-xl border border-slate-100 p-3" open={family.length > 0}><summary className="cursor-pointer list-none text-sm font-bold text-amber-800">＋ Add family members <span className="ml-1 text-xs font-normal text-slate-500">(optional · up to 8)</span></summary>
              <div className="mt-3 space-y-3">{family.map((member, index) => <fieldset key={index} className="rounded-xl border border-slate-200 p-3"><legend className="px-1 text-sm font-semibold text-slate-700">Family member {index + 1}</legend>
                <div className="grid gap-2"><input maxLength={160} aria-label="Family member name" placeholder="Name *" value={member.name} onChange={(e) => updateFamily(index, (m) => ({ ...m, name: e.target.value }))} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" /><select aria-label="Family member relation" value={member.relation} onChange={(e) => updateFamily(index, (m) => ({ ...m, relation: e.target.value }))} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm"><option value="">Relation *</option>{relations.map((relation) => <option key={relation} value={relation}>{relation[0].toUpperCase() + relation.slice(1)}</option>)}</select><input type="tel" maxLength={32} aria-label="Family member mobile optional" placeholder="Mobile (optional)" value={member.mobile} onChange={(e) => updateFamily(index, (m) => ({ ...m, mobile: e.target.value }))} className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm" /></div>
                <div className="mt-2 rounded-xl border border-slate-100 px-2"><OccasionRow label="Birthday" value={member.birthday} onChange={(v) => updateFamily(index, (m) => ({ ...m, birthday: v }))} /><OccasionRow label="Anniversary" value={member.anniversary} onChange={(v) => updateFamily(index, (m) => ({ ...m, anniversary: v }))} /></div><button type="button" onClick={() => setFamily((current) => current.filter((_, i) => i !== index))} className="mt-2 min-h-10 text-sm font-semibold text-rose-700">Remove member</button>
              </fieldset>)}<button type="button" disabled={family.length >= 8} onClick={() => setFamily((current) => [...current, emptyFamilyMember()])} className="min-h-11 rounded-xl px-2 text-sm font-bold text-amber-800 disabled:opacity-50">＋ Add Family Member</button></div>
            </details>
          </div>}
          {formErrors.length > 0 && <ul className="mt-3 list-inside list-disc rounded-xl bg-rose-50 p-3 text-sm leading-6 text-rose-700" role="alert">{formErrors.map((item) => <li key={item}>{item}</li>)}</ul>}
          {error && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          {isPending ? <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center" role="status"><span className="mx-auto grid size-10 animate-pulse place-items-center rounded-full bg-amber-600 text-lg text-white">✓</span><p className="mt-3 font-bold text-amber-900">Submitting your review…</p><p className="mt-1 text-sm text-amber-800">Please wait while we share your feedback securely.</p><div className="mx-auto mt-4 h-2 max-w-xs overflow-hidden rounded-full bg-amber-100"><div className="h-full w-2/3 animate-pulse rounded-full bg-amber-600" /></div></div> : <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => navigateToStage(2)} className="min-h-12 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-bold text-[#67401d]">← Back</button><PrimaryButton type="submit">✓ Submit Review</PrimaryButton></div>}
        </form>}

        {step === "submitted" && <section id="review-stage-thank-you" className={`scroll-mt-24 rounded-b-[28px] px-5 py-9 text-center sm:rounded-b-[32px] sm:px-10 sm:py-12 ${tone === "negative" ? "bg-rose-50/60" : tone === "mixed" ? "bg-amber-50/60" : "bg-emerald-50/60"}`} role="status">
          <span className={`mx-auto grid size-[72px] place-items-center rounded-full text-4xl text-white shadow-lg ${tone === "negative" ? "bg-rose-500 shadow-rose-100" : tone === "mixed" ? "bg-amber-500 shadow-amber-100" : "bg-emerald-500 shadow-emerald-100"}`}>✓</span>
          <h2 className={`mt-5 text-2xl font-extrabold tracking-tight ${tone === "negative" ? "text-rose-900" : tone === "mixed" ? "text-amber-900" : "text-emerald-900"}`}>{tone === "negative" ? "Thanks for your honest feedback!" : "Thank you for sharing your review!"}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{tone === "negative" ? "Your feedback helps us understand what we can improve." : "Your feedback has been shared successfully and will help other customers."}</p>
          <div className={`mt-6 rounded-2xl border p-4 text-left ${tone === "negative" ? "border-rose-200 bg-white/80" : tone === "mixed" ? "border-amber-200 bg-white/80" : "border-emerald-200 bg-white/80"}`}><p className="text-sm font-bold text-slate-900">Your Review Summary</p><p className="mt-1 text-sm font-medium text-amber-600">{"★".repeat(selectedRating ?? 0)}{"☆".repeat(5 - (selectedRating ?? 0))} <span className="text-slate-700">{selectedRating}/5</span></p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{draft}</p><p className="mt-4 text-xs font-bold text-slate-600">Customer Highlighted Points</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedLabels.map((label) => <span key={label} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone === "negative" ? "bg-rose-100 text-rose-800" : tone === "mixed" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>✓ {label}</span>)}</div></div>
          <button type="button" onClick={openGoogleAfterSubmit} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1769e0] px-4 text-sm font-bold text-white shadow-md shadow-blue-100"><span className="grid size-7 place-items-center rounded-full bg-white text-lg font-black text-[#4285f4]">G</span>Review on Google</button>
          <button type="button" onClick={() => window.location.assign("/")} className="mt-5 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800">⌂ Back to Home</button>
        </section>}

        {step === "failed" && <section className="px-5 py-10 text-center sm:px-9 sm:py-12" role="alert"><span className="mx-auto grid size-16 place-items-center rounded-full bg-rose-100 text-3xl text-rose-600">!</span><h2 className="mt-5 text-2xl font-extrabold text-slate-900">We couldn’t submit your review</h2><p className="mt-2 text-sm leading-6 text-slate-600">Please check your connection and try again. Your details are still here.</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => { setError(null); setStep("review"); }} className="min-h-12 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-bold">← Back</button><PrimaryButton type="button" onClick={() => { setError(null); setStep("details"); }}>Try Again</PrimaryButton></div></section>}
      </section>
      <p className="mt-5 px-3 text-center text-xs leading-5 text-slate-500">Your feedback helps {businessName} understand how it can serve you better. Thank you for sharing honestly.</p>
      <p className="mt-3 text-center text-[10px] font-semibold tracking-wide text-slate-400">SECURE CUSTOMER FEEDBACK · TRUSTIT</p>
    </div>
  </main>;
}

