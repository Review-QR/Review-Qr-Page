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
