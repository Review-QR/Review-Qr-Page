export type CreateReviewSessionResult =
  | { ok: true; sessionId: string; rating: number }
  | { ok: false; message: string };

export type CreateReviewSessionAction = (
  rating: number,
) => Promise<CreateReviewSessionResult>;
