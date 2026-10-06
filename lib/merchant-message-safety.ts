const reviewTerm = /\b(?:google\s+)?review\b|\bratings?\b|\bstars?\b|\bpositive feedback\b/i;
const incentiveTerm = /\bdiscount\b|\boffers?\b|\brewards?\b|\bfree\b|\bgifts?\b|\bcoupons?\b|\bcashback\b|\b\d{1,3}\s*%\s*off\b/i;

export function isReviewIncentiveCopy(value: string): boolean {
  return reviewTerm.test(value) && incentiveTerm.test(value);
}
