export const TRUSTIT_RELATIONS = [
  "mother", "father", "husband", "wife", "brother", "sister", "son", "daughter",
] as const;

const DAYS_BY_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function validDaysForMonth(monthIndex: number) {
  const count = DAYS_BY_MONTH[monthIndex];
  return count ? Array.from({ length: count }, (_, index) => index + 1) : [];
}

export function isValidMonthDay(monthIndex: number, day: number) {
  return Number.isInteger(day) && validDaysForMonth(monthIndex).includes(day);
}

export function isValidOptionalMobile(value: string) {
  return value === "" || /^[+0-9(). -]{7,32}$/.test(value);
}

export function validateTrustitReviewInput(input: {
  customerName: string;
  customerMobile: string;
  shareDetails: boolean;
  familyMembers: Array<{ name: string; relation: string; mobile: string }>;
  occasions: Array<{ owner: string; familyIndex?: number; occasion: string; month: number; day: number }>;
}) {
  const errors: string[] = [];
  if (input.customerName.length > 160) errors.push("Your name must be 160 characters or fewer.");
  if (input.shareDetails && !isValidOptionalMobile(input.customerMobile)) errors.push("Enter a valid mobile number to share personal details.");
  if (!input.shareDetails && (input.customerMobile || input.familyMembers.length || input.occasions.length)) errors.push("Turn on personal details to include contact or occasion information.");
  if (input.familyMembers.length > 8) errors.push("You can add up to 8 family members.");
  input.familyMembers.forEach((member, index) => {
    if (!member.name.trim() || member.name.length > 160) errors.push(`Enter a name for family member ${index + 1}.`);
    if (!(TRUSTIT_RELATIONS as readonly string[]).includes(member.relation)) errors.push(`Choose a relation for family member ${index + 1}.`);
    if (!isValidOptionalMobile(member.mobile)) errors.push(`Enter a valid mobile number for family member ${index + 1}.`);
  });
  const keys = new Set<string>();
  input.occasions.forEach((occasion) => {
    const familyIndex = occasion.owner === "family" ? occasion.familyIndex : -1;
    if (occasion.owner !== "customer" && occasion.owner !== "family") errors.push("Choose a valid occasion owner.");
    if (occasion.occasion !== "birthday" && occasion.occasion !== "anniversary") errors.push("Choose a valid occasion.");
    if (!Number.isInteger(occasion.month) || occasion.month < 1 || occasion.month > 12 || !isValidMonthDay(occasion.month - 1, occasion.day)) errors.push("Choose a valid month and date.");
    if (occasion.owner === "family" && (!Number.isInteger(familyIndex) || familyIndex! < 0 || familyIndex! >= input.familyMembers.length)) errors.push("Choose a valid family member for each occasion.");
    if (occasion.owner === "customer" && occasion.familyIndex !== undefined) errors.push("Customer occasions cannot reference a family member.");
    const key = `${occasion.owner}:${familyIndex}:${occasion.occasion}`;
    if (keys.has(key)) errors.push("Each person can have only one date per occasion type.");
    keys.add(key);
  });
  return [...new Set(errors)];
}
