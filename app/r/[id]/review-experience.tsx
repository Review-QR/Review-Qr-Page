"use client";

import { useRef, useState, useTransition } from "react";
import type {
  CreateReviewSessionAction,
  ReviewExperienceCategory,
  SaveReviewExperiencesAction,
} from "./review-session-types";

type ReviewExperienceProps = {
  businessName: string;
  experienceCategories: ReviewExperienceCategory[];
  createReviewSession: CreateReviewSessionAction;
  saveExperiences: SaveReviewExperiencesAction;
};

export default function ReviewExperience({
  businessName,
  experienceCategories,
  createReviewSession,
  saveExperiences,
}: ReviewExperienceProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"rating" | "experiences" | "complete">(
    "rating",
  );
  const requestInProgress = useRef(false);

  function selectRating(rating: number) {
    if (requestInProgress.current || sessionId || selectedRating !== null) return;
    requestInProgress.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const result = await createReviewSession(rating);
        if (!result.ok) {
          setError(result.message);
          return;
        }

        setSelectedRating(result.rating);
        setSessionId(result.sessionId);
      } catch {
        setError("We couldn't save your rating right now. Please try again.");
      } finally {
        requestInProgress.current = false;
      }
    });
  }

  function toggleExperience(categoryKey: string) {
    if (isPending) return;
    setError(null);
    setSelectedCategories((current) => {
      if (current.includes(categoryKey)) {
        return current.filter((key) => key !== categoryKey);
      }
      if (current.length >= 10) return current;
      return [...current, categoryKey];
    });
  }

  function saveSelectedExperiences() {
    if (
      requestInProgress.current ||
      !sessionId ||
      selectedCategories.length < 1 ||
      selectedCategories.length > 10
    ) {
      return;
    }
    requestInProgress.current = true;
    setError(null);

    startTransition(async () => {
      try {
        const result = await saveExperiences(selectedCategories);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        setSelectedCategories(result.categoryKeys);
        setStep("complete");
      } catch {
        setError(
          "We couldn't save your experience details right now. Please try again.",
        );
      } finally {
        requestInProgress.current = false;
      }
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/60 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col items-center justify-center">
        <div className="mb-6 flex items-center gap-2.5" aria-label="Trustit">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-sm font-extrabold tracking-tight text-white shadow-sm shadow-indigo-200">
            T
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Trustit
          </span>
        </div>

        <section className="w-full rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_-40px_rgba(30,41,59,0.3)] sm:p-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Your feedback matters
            </p>
            <h1 className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {businessName}
            </h1>
            <p className="mt-4 text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
              How was your experience?
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Share your experience with {businessName}.
            </p>
          </div>

          {step === "rating" ? (
            <div className="mt-9 rounded-2xl bg-slate-50 px-4 py-6 text-center sm:px-6 sm:py-8">
              <h2 className="text-sm font-semibold text-slate-700">
                Rate your experience
              </h2>
              <div
                role="group"
                aria-label="Choose a rating from 1 to 5 stars"
                className="mt-4 flex items-center justify-center gap-1 sm:gap-3"
              >
                {[1, 2, 3, 4, 5].map((rating) => {
                  const isSelected = selectedRating === rating;
                  const isHighlighted =
                    selectedRating !== null && rating <= selectedRating;

                  return (
                    <button
                      key={rating}
                      type="button"
                      aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                      aria-pressed={isSelected}
                      disabled={isPending || selectedRating !== null}
                      onClick={() => selectRating(rating)}
                      className={`grid size-12 place-items-center rounded-xl text-4xl leading-none transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-default sm:size-14 sm:text-5xl ${
                        isHighlighted
                          ? "text-amber-400"
                          : "text-slate-300 hover:bg-white hover:text-amber-300"
                      }`}
                    >
                      <span aria-hidden="true">★</span>
                    </button>
                  );
                })}
              </div>

              <div aria-live="polite" className="mt-5 min-h-6 text-sm">
                {isPending ? (
                  <p className="font-medium text-indigo-700">Saving your rating…</p>
                ) : selectedRating !== null ? (
                  <p className="font-semibold text-slate-800">
                    Thanks! You selected {selectedRating}{" "}
                    {selectedRating === 1 ? "star" : "stars"}.
                    <span className="mt-1 block text-xs font-normal text-slate-500">
                      Your rating is saved for this session and can’t be changed.
                    </span>
                  </p>
                ) : (
                  <p className="text-slate-500">Tap a star to select your rating.</p>
                )}
              </div>

              {error ? (
                <p role="alert" className="mt-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}

              {sessionId ? (
                <button
                  type="button"
                  onClick={() => setStep("experiences")}
                  className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:w-auto sm:min-w-48"
                >
                  Continue
                </button>
              ) : null}
            </div>
          ) : step === "experiences" ? (
            <div className="mt-9 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-8 text-center sm:px-8">
              <h2 className="text-xl font-bold text-slate-900">
                What stood out in your experience?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Select all that genuinely reflect your visit.
              </p>
              <p className="mt-3 text-xs leading-5 text-slate-600">
                Only choose things that match your actual experience. These selections will help shape your review draft later.
              </p>
              <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
                {experienceCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.key);
                  return (
                    <button
                      key={category.key}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={isPending}
                      onClick={() => toggleExperience(category.key)}
                      className={`min-h-14 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-default ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{category.label}</span>
                        <span aria-hidden="true">{isSelected ? "✓" : "＋"}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-slate-600">
                You can select more than one. Choose up to 10.
              </p>
              {error ? (
                <p role="alert" className="mt-4 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                disabled={isPending || selectedCategories.length === 0}
                onClick={saveSelectedExperiences}
                className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:min-w-48"
              >
                {isPending ? "Saving your selections…" : "Continue"}
              </button>
            </div>
          ) : (
            <div className="mt-9 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-8 text-center sm:px-8">
              <div
                aria-hidden="true"
                className="mx-auto grid size-12 place-items-center rounded-full bg-white text-xl text-emerald-700 shadow-sm"
              >
                ✓
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Experience details saved
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These will be used to help shape your review draft.
              </p>
            </div>
          )}
        </section>

        <p className="mt-5 max-w-sm text-center text-xs leading-5 text-slate-500">
          Your feedback helps {businessName} understand how it can serve you better. No personal details are requested in this step.
        </p>
      </div>
    </main>
  );
}
