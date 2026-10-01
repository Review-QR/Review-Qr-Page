export type ReviewDraftInput = {
  businessName: string;
  rating: number;
  experienceLabels: string[];
  variation?: number;
};

export interface ReviewDraftProvider {
  generate(input: ReviewDraftInput): Promise<string>;
}

export async function requestReviewDraft(
  provider: ReviewDraftProvider,
  input: ReviewDraftInput,
): Promise<{ ok: true; draft: string } | { ok: false }> {
  try {
    return { ok: true, draft: await provider.generate(input) };
  } catch {
    return { ok: false };
  }
}

const DRAFT_OPENERS: Record<number, (businessName: string) => string> = {
  1: (name) => `My experience at ${name} was poor overall.`,
  2: (name) => `My visit to ${name} was disappointing.`,
  3: (name) => `My experience at ${name} was fair overall.`,
  4: (name) => `I had a very good experience at ${name}.`,
  5: (name) => `I had an excellent experience at ${name}.`,
};

const EXPERIENCE_TRANSITIONS: Record<number, string> = {
  1: "The things I want to mention are",
  2: "I especially want to mention",
  3: "Some points from my visit were",
  4: "What stood out to me was",
  5: "I especially noticed",
};

function joinLabels(labels: string[]) {
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export function buildReviewDraft(input: ReviewDraftInput): string {
  const businessName = input.businessName.trim();
  const labels = input.experienceLabels.map((label) => label.trim());
  if (
    !businessName ||
    !Number.isInteger(input.rating) ||
    input.rating < 1 ||
    input.rating > 5 ||
    labels.length < 1 ||
    labels.some((label) => !label)
  ) {
    throw new Error("Review draft input is invalid");
  }

  if ((input.variation ?? 1) > 1) {
    const alternateOpeners: Record<number, string> = {
      1: `I was unhappy with my experience at ${businessName}.`,
      2: `My experience with ${businessName} could have been better.`,
      3: `My experience at ${businessName} was average.`,
      4: `I enjoyed my visit to ${businessName}.`,
      5: `I had a wonderful experience at ${businessName}.`,
    };
    const alternateTransitions: Record<number, string> = {
      1: "In particular, I want to mention",
      2: "A few things I noticed were",
      3: "The parts that stood out were",
      4: "I appreciated",
      5: "My highlights were",
    };
    return `${alternateOpeners[input.rating]} ${alternateTransitions[input.rating]} ${joinLabels(labels)}.`;
  }
  return `${DRAFT_OPENERS[input.rating](businessName)} ${EXPERIENCE_TRANSITIONS[input.rating]} ${joinLabels(labels)}.`;
}

export const localReviewDraftProvider: ReviewDraftProvider = {
  async generate(input) {
    return buildReviewDraft(input);
  },
};
