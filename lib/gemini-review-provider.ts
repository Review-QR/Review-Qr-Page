import type { ReviewDraftInput } from "./review-draft-provider";
import { validateReviewDraftQuality } from "./review-draft-provider";

export async function generateGeminiReviewDraft(
  input: ReviewDraftInput,
  apiKey: string,
): Promise<string | null> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(trimmedKey)}`;

  const prompt = [
    `You are writing an authentic, human-sounding customer review for Google Maps.`,
    `Business Name: "${input.businessName}"`,
    input.businessType ? `Category: ${input.businessType}` : null,
    `Star Rating: ${input.rating} out of 5 stars`,
    input.experienceLabels.length > 0 ? `Selected Experience Highlights: ${input.experienceLabels.join(", ")}` : null,
    input.customerInput ? `Customer's Own Comment: "${input.customerInput}"` : null,
    ``,
    `STRICT RULES:`,
    `1. If a Customer's Own Comment is provided, you MUST begin the review with their exact wording/phrasing so their personal voice is front and center.`,
    `2. Naturally integrate the selected experience highlights and rating into 1-2 smooth, human-sounding follow-up sentences.`,
    `3. Sound like a real, authentic customer in India (conversational, natural, warm if 4-5 stars, balanced if 3 stars, polite feedback if 1-2 stars).`,
    `4. Keep it concise (2 to 3 sentences maximum, under 60 words).`,
    `5. Do NOT use fake marketing buzzwords (e.g. "gastronomic paradise", "culinary journey", "exceptional dining experience").`,
    `6. Do NOT wrap output in quotation marks or add greetings/preambles. Return ONLY the review text.`,
  ].filter(Boolean).join("\n");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const draft = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      ?.replace(/^["']|["']$/g, "")
      ?.trim();

    if (!draft) return null;

    if (validateReviewDraftQuality(input, draft)) {
      return draft;
    }

    // If customerInput was provided, ensure the draft starts with their words if Gemini rephrased
    if (input.customerInput && input.customerInput.trim()) {
      const cleanCustomer = input.customerInput.trim();
      const sentence = /[.!?]$/.test(cleanCustomer) ? cleanCustomer : `${cleanCustomer}.`;
      const combined = `${sentence} ${draft}`.replace(/\s{2,}/g, " ").trim();
      if (validateReviewDraftQuality(input, combined)) {
        return combined;
      }
    }

    return null;
  } catch {
    return null;
  }
}
