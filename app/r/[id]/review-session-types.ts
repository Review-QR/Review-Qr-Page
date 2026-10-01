export type CreateReviewSessionResult =
  | { ok: true; sessionId: string; rating: number }
  | { ok: false; message: string };

export type CreateReviewSessionAction = (
  rating: number,
) => Promise<CreateReviewSessionResult>;

export type ReviewExperienceCategory = {
  key: string;
  label: string;
};

export type SaveReviewExperiencesResult =
  | { ok: true; categoryKeys: string[] }
  | { ok: false; message: string };

export type SaveReviewExperiencesAction = (
  categoryKeys: string[],
) => Promise<SaveReviewExperiencesResult>;

export type GenerateReviewDraftResult =
  | { ok: true; draft: string }
  | { ok: false; message: string };

export type GenerateReviewDraftAction = () => Promise<GenerateReviewDraftResult>;

export type RestoredReviewSession = {
  rating: number;
  selectedExperiences: ReviewExperienceCategory[];
  draft: string | null;
  submitted: boolean;
} | null;

export type SaveReviewDraftAction = (
  editedText: string,
) => Promise<{ ok: true } | { ok: false; message: string }>;

export type GoogleReviewHandoffResult =
  | { ok: true; reviewUrl: string }
  | { ok: false; message: string };

export type GoogleReviewHandoffAction = (
  editedText: string,
) => Promise<GoogleReviewHandoffResult>;

export type TrustitReviewSubmission = {
  reviewText: string;
  customerName: string;
  customerMobile: string;
  shareDetails: boolean;
  occasions: Array<{
    owner: "customer" | "family";
    familyIndex?: number;
    occasion: "birthday" | "anniversary";
    month: number;
    day: number;
  }>;
  familyMembers: Array<{ name: string; relation: string; mobile: string }>;
};

export type SubmitTrustitReviewResult =
  | { ok: true }
  | { ok: false; message: string };

export type SubmitTrustitReviewAction = (
  submission: TrustitReviewSubmission,
) => Promise<SubmitTrustitReviewResult>;
