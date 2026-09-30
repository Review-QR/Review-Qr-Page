"use client";

import { useRef, useState, useTransition } from "react";
import type { CreateReviewSessionAction } from "./review-session-types";

type ReviewExperienceProps = {
  businessName: string;
  createReviewSession: CreateReviewSessionAction;
};

export default function ReviewExperience({
  businessName,
  createReviewSession,
}: ReviewExperienceProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNextStep, setShowNextStep] = useState(false);
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

          {!showNextStep ? (
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
                    Thanks! You selected {selectedRating} {selectedRating === 1 ? "star" : "stars"}.
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
                  onClick={() => setShowNextStep(true)}
                  className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:w-auto sm:min-w-48"
                >
                  Continue
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-9 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-5 py-8 text-center sm:px-8">
              <div
                aria-hidden="true"
                className="mx-auto grid size-12 place-items-center rounded-full bg-white text-xl text-indigo-700 shadow-sm"
              >
                ✓
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Your rating is saved
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You selected {selectedRating} {selectedRating === 1 ? "star" : "stars"}. The next part of your review experience will be available soon.
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
