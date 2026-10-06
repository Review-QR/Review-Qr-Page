export type ReviewDraftInput = {
  businessName: string;
  rating: number;
  experienceLabels: string[];
  variation?: number;
  customerInput?: string;
  businessType?: string;
};

export type ReviewWritingSignals = { language: "English" | "Hindi" | "Hinglish" | "Roman Hindi"; style: "casual" | "normal" | "formal" | "short" | "detailed"; script: "Latin" | "Devanagari" | "mixed" };

export function detectReviewWritingSignals(value: string): ReviewWritingSignals {
  const input = value.trim();
  const devanagari = /[\u0900-\u097f]/.test(input);
  const hindiWords = /\b(tha|thi|hai|acha|accha|mast|bahut|thoda|seva|khana|acha|bhai|karna|wala)\b/i.test(input);
  const englishWords = /\b(the|and|was|were|good|service|food|staff|price|visit|overall|but)\b/i.test(input);
  const language = devanagari ? (englishWords ? "Hinglish" : "Hindi") : hindiWords ? (englishWords ? "Hinglish" : "Roman Hindi") : "English";
  const wordCount = input.split(/\s+/).filter(Boolean).length;
  const style = /\b(bhai|yaar|mast|:)\b/i.test(input) ? "casual" : wordCount <= 7 ? "short" : /\b(esteemed|therefore|nevertheless|experience was|would recommend)\b/i.test(input) ? "formal" : wordCount >= 24 ? "detailed" : "normal";
  return { language, style, script: devanagari && /[A-Za-z]/.test(input) ? "mixed" : devanagari ? "Devanagari" : "Latin" };
}

const piiPattern = /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|(?:\+?\d[\d(). -]{7,}\d)/g;
export function removeCustomerPii(value: string) { return value.replace(piiPattern, "").replace(/\s{2,}/g, " ").trim().slice(0, 600); }

function naturalInputDraft(input: ReviewDraftInput): string {
  const raw = (input.customerInput ?? "").trim();
  if (!raw) return "";
  const cleaned = raw.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ").slice(0, 600);
  detectReviewWritingSignals(cleaned);
  // Preserve customer vocabulary and language. The rating governs whether any
  // framing is added; the customer's facts are never replaced with claims.
  const punctuated = cleaned.replace(/\s+(?=(?:but|par|lekin|though|service bhi|staff bhi|and)\b)/gi, ", ");
  const sentence = punctuated.charAt(0).toLocaleUpperCase() + punctuated.slice(1).replace(/[.!?\s]*$/, ".");
  return sentence;
}

export function validateReviewDraftQuality(input: ReviewDraftInput, draft: string): boolean {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5 || !draft.trim() || draft.length > 10000) return false;
  const customerText = (input.customerInput ?? "").trim();
  const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  if (!customerText) {
    const generated = draft.toLocaleLowerCase();
    const toneIsConsistent = input.rating <= 2
      ? /could have been better|disappointed|did not go as well/.test(generated)
      : input.rating === 3 ? /mixed experience|mixed thoughts|okay overall|somewhere in the middle/.test(generated)
        : /good experience|enjoyed my visit|went well/.test(generated);
    return toneIsConsistent && input.experienceLabels.every((label) => normalize(draft).join(" ").includes(normalize(label).join(" ")));
  }
  const expected = normalize(customerText);
  const actual = normalize(draft);
  return expected.length > 0 && expected.every((word, index) => actual[index] === word);
}

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

type Tone = "positive" | "mixed" | "negative";

const copy: Record<string, Record<Tone, string[]>> = {
  quality: {
    positive: ["The quality stood out to me", "I was happy with the quality", "Quality-wise, I had a good experience", "I really liked the quality"],
    mixed: ["The quality was one part of my experience", "I have mixed thoughts about the quality", "Quality was one of the things that shaped my rating", "There is some room to improve the quality"],
    negative: ["The quality could be better", "I was not fully satisfied with the quality", "The quality was a let-down for me", "I expected better quality"],
  },
  variety: {
    positive: ["I liked having a good range of options", "The variety was a plus for me", "There was plenty of choice", "I appreciated the range available"],
    mixed: ["The choice was okay, with room for more variety", "I had mixed feelings about the range", "Variety was one part of my overall impression", "The options could be a little broader"],
    negative: ["I would have liked more options", "The range felt limited to me", "There was not as much choice as I expected", "More variety would improve the experience"],
  },
  service: {
    positive: ["The service felt attentive", "I was pleased with the service", "The service made a positive impression", "I appreciated the way the service was handled"],
    mixed: ["The service was okay, though it could be smoother", "I have mixed feedback about the service", "Service was one part of my overall impression", "There is room to make the service more consistent"],
    negative: ["The service could be improved", "I was disappointed by the service", "The service did not meet my expectations", "I had a difficult time with the service"],
  },
  staff: {
    positive: ["The staff came across as friendly", "I appreciated the staff's manner", "The staff made a good impression", "I liked the way the staff treated me"],
    mixed: ["I have mixed feedback about the staff interaction", "The staff interaction was okay, with room to improve", "Staff behavior was part of my overall impression", "The interaction could feel more welcoming"],
    negative: ["The staff interaction could be better", "I was not comfortable with the staff's manner", "The staff behavior left me disappointed", "I expected a more considerate interaction"],
  },
  cleanliness: {
    positive: ["The cleanliness was reassuring", "I was pleased with the cleanliness", "The clean surroundings added to my experience", "Cleanliness stood out in a good way"],
    mixed: ["Cleanliness was okay, though it could be better", "I have mixed thoughts about the cleanliness", "Cleanliness was one factor in my rating", "There is room to improve the cleanliness"],
    negative: ["The cleanliness needs attention", "I was not satisfied with the cleanliness", "Cleanliness could be improved", "The surroundings did not feel clean enough"],
  },
  value: {
    positive: ["I felt the overall value was fair", "The value for money worked for me", "I was happy with the value", "The value felt reasonable to me"],
    mixed: ["I have mixed feelings about the value", "The value could be better", "Value for money was part of my overall rating", "I was not sure the value matched my expectations"],
    negative: ["I did not feel I got good value", "The value for money could improve", "The cost did not feel worthwhile to me", "I was disappointed by the overall value"],
  },
  ambience: {
    positive: ["The atmosphere felt welcoming", "I enjoyed the overall ambience", "The setting added to my visit", "I liked the feel of the place"],
    mixed: ["The atmosphere was okay, with room to improve", "I have mixed thoughts about the ambience", "The setting was part of my overall impression", "The ambience could be more comfortable"],
    negative: ["The atmosphere could be more inviting", "I was not comfortable with the setting", "The ambience did not work for me", "The setting could use some attention"],
  },
  waiting: {
    positive: ["The wait felt manageable", "I was comfortable with the waiting time", "The wait did not detract from my experience", "The timing worked well for me"],
    mixed: ["The wait could have been shorter", "Waiting time was one part I would improve", "I have mixed feedback about the wait", "The wait was okay, but could be smoother"],
    negative: ["The waiting time was frustrating", "I had to wait longer than I would have liked", "The wait needs improvement", "The waiting time affected my experience"],
  },
  packaging: {
    positive: ["The packaging was thoughtfully done", "I liked the packaging", "The packaging suited my needs", "I was happy with how things were packaged"],
    mixed: ["The packaging was okay, with room to improve", "I have mixed thoughts about the packaging", "The packaging was part of my overall impression", "Some improvements to the packaging would help"],
    negative: ["The packaging could be improved", "I was not satisfied with the packaging", "The packaging fell short for me", "I expected better packaging"],
  },
  consultation: {
    positive: ["The consultation left me feeling heard", "I was satisfied with the consultation", "The consultation was helpful for me", "I appreciated the consultation"],
    mixed: ["The consultation was okay, with room to improve", "I have mixed feedback about the consultation", "The consultation was part of my overall impression", "The consultation could have been clearer"],
    negative: ["The consultation could be improved", "I was not satisfied with the consultation", "The consultation did not meet my expectations", "I left disappointed with the consultation"],
  },
  taste: {
    positive: ["I enjoyed the taste", "The taste was to my liking", "I was happy with the taste", "The taste made a good impression"],
    mixed: ["The taste was okay, though it could be better", "I have mixed thoughts about the taste", "Taste was one part of my overall impression", "The taste did not fully match my preference"],
    negative: ["The taste was not to my liking", "I was disappointed by the taste", "The taste could be improved", "The taste fell short of my expectations"],
  },
  availability: {
    positive: ["Availability worked well for me", "I found what I needed", "The availability was helpful", "I was pleased with what was available"],
    mixed: ["Availability was okay, with room to improve", "I have mixed thoughts about availability", "Availability was part of my overall rating", "Some options could be easier to find"],
    negative: ["Availability could be improved", "I could not find what I needed", "The availability was disappointing", "More availability would make a difference"],
  },
  environment: {
    positive: ["The environment felt comfortable", "I liked the environment", "The setting worked well for me", "The environment added to my experience"],
    mixed: ["The environment was okay, with room to improve", "I have mixed thoughts about the environment", "The setting was part of my overall impression", "The environment could feel more comfortable"],
    negative: ["The environment could be improved", "I was not comfortable in the environment", "The setting was disappointing", "The environment did not work well for me"],
  },
  delivery: {
    positive: ["I was satisfied with the delivery", "The delivery went well for me", "I appreciated the delivery", "The delivery met my expectations"],
    mixed: ["I have mixed feedback about the delivery", "The delivery was okay, with room to improve", "Delivery was one part of my overall impression", "The delivery could have been smoother"],
    negative: ["The delivery could be improved", "I was disappointed with the delivery", "The delivery did not meet my expectations", "I was not satisfied with the delivery"],
  },
  communication: {
    positive: ["Communication was clear", "I appreciated the communication", "The communication worked well for me", "I was happy with the communication"],
    mixed: ["Communication was okay, with room to improve", "I have mixed thoughts about communication", "Communication was part of my overall rating", "A little more clarity would help"],
    negative: ["Communication could be clearer", "I was disappointed by the communication", "The communication needs improvement", "I did not feel well informed"],
  },
  generic: {
    positive: ["That was a positive part of my experience", "I appreciated that aspect", "That worked well for me", "I was pleased with that part"],
    mixed: ["That was one part of my overall impression", "I have mixed thoughts about that aspect", "There is some room to improve there", "That helped shape my overall rating"],
    negative: ["That could be improved", "I was disappointed by that aspect", "That did not meet my expectations", "I was not satisfied with that part"],
  },
};

function topicFor(label: string) {
  const value = label.toLowerCase();
  if (/quality|repair|product|hair|styling/.test(value)) return "quality";
  if (/variety|collection|range|choice/.test(value)) return "variety";
  if (/staff|behavior|interaction/.test(value)) return "staff";
  if (/service/.test(value)) return "service";
  if (/clean/.test(value)) return "cleanliness";
  if (/value|price|cost|money/.test(value)) return "value";
  if (/ambience|ambiance|atmosphere|shop|reading environment/.test(value)) return "ambience";
  if (/wait|time|availability/.test(value)) return /availab/.test(value) ? "availability" : "waiting";
  if (/packag/.test(value)) return "packaging";
  if (/consult|doctor/.test(value)) return "consultation";
  if (/taste|food/.test(value)) return "taste";
  if (/environment/.test(value)) return "environment";
  if (/delivery/.test(value)) return "delivery";
  if (/communication/.test(value)) return "communication";
  return "generic";
}

function toneFor(rating: number): Tone {
  return rating <= 2 ? "negative" : rating === 3 ? "mixed" : "positive";
}

function choose<T>(items: T[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

export function buildReviewDraft(input: ReviewDraftInput): string {
  const businessName = input.businessName.trim();
  const labels = input.experienceLabels.map((label) => label.trim()).filter(Boolean);
  if (!businessName || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5 || labels.length < 1 || labels.length !== input.experienceLabels.length) {
    throw new Error("Review draft input is invalid");
  }

  const tone = toneFor(input.rating);
  const grounded = naturalInputDraft(input);
  if (grounded) {
    if (!validateReviewDraftQuality(input, grounded)) throw new Error("Review draft quality validation failed");
    return grounded;
  }
  const seed = Math.max(1, Math.floor(input.variation ?? 1));
  const clauses = labels.map((label) => `I considered ${label.toLowerCase()} as part of my experience`);
  if (clauses.length > 1) {
    const rotateBy = seed % clauses.length;
    clauses.push(...clauses.splice(0, rotateBy));
  }

  const openings = {
    positive: [`I had a good experience at ${businessName}.`, `I enjoyed my visit to ${businessName}.`, `My visit to ${businessName} went well.`],
    mixed: [`My experience at ${businessName} was okay overall.`, `I had a mixed experience at ${businessName}.`, `My visit to ${businessName} was somewhere in the middle.`],
    negative: [`My experience at ${businessName} could have been better.`, `I was disappointed with my visit to ${businessName}.`, `My visit to ${businessName} did not go as well as I hoped.`],
  };
  const endings = {
    positive: ["That reflects my positive overall rating.", "This matches how I felt about the visit overall.", "That is why I gave a positive overall rating."],
    mixed: ["That reflects my mixed overall rating.", "This is how I felt about the visit overall.", "My overall rating reflects a mixed experience."],
    negative: ["That reflects my negative overall rating.", "This is why my overall rating was low.", "My overall rating reflects this experience."],
  };
  const body = clauses.map((clause, index) => `${index === 0 || seed % 3 === 0 ? "" : "Also, "}${clause}`).join(". ");
  const opening = `${choose(openings[tone], seed)} I rated it ${input.rating} out of 5.`;
  const ending = labels.length > 1 ? ` ${choose(endings[tone], seed * 5)}` : "";
  const draft = `${opening} ${body.replace(/\.$/, "")}.${ending}`;
  if (!validateReviewDraftQuality(input, draft)) throw new Error("Review draft quality validation failed");
  return draft;
}

export const localReviewDraftProvider: ReviewDraftProvider = {
  async generate(input) {
    return buildReviewDraft(input);
  },
};
