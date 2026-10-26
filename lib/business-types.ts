import { BUSINESS_TYPES, type BusinessType } from "./config/business-catalog.ts";

export { BUSINESS_TYPES, type BusinessType };

export type ReviewExperienceGroup =
  | "Restaurant" | "Shop" | "Medical" | "Salon" | "Garage" | "Library"
  | "Hotel" | "Laundry" | "Fitness" | "Travel" | "Professional Services" | "Other";

const normalized = (value: string) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");

const aliases: Record<string, string> = {
  lib: "Library", library: "Library", libraries: "Library",
  rest: "Restaurant", restaurant: "Restaurant", restaurants: "Restaurant",
  sal: "Salon", salon: "Salon", saloon: "Salon", "beauty salon": "Salon",
  cafe: "Cafe", coffee: "Cafe", hotel: "Hotel", hotels: "Hotel",
  garage: "Garage", auto: "Automobile Garage", medical: "Medical",
  manufacturer: "Manufacturing Company",
  clinic: "Clinic", shop: "Shop", retail: "Retail",
};

const catalogByNormalizedType = new Map<string, BusinessType>(
  BUSINESS_TYPES.map((type) => [normalized(type), type]),
);

/** Converts supported aliases and legacy spellings to a stored catalog value. */
export function normalizeBusinessType(value: unknown): BusinessType | null {
  if (typeof value !== "string") return null;
  const key = normalized(value);
  const alias = aliases[key];
  return (alias ? catalogByNormalizedType.get(normalized(alias)) : undefined)
    ?? catalogByNormalizedType.get(key)
    ?? null;
}

/** Search results always contain canonical catalog values and never duplicates. */
export function searchBusinessTypes(query: string): BusinessType[] {
  const needle = normalized(query);
  if (!needle) return [...BUSINESS_TYPES];
  const alias = aliases[needle];
  const aliasTarget = alias ? catalogByNormalizedType.get(normalized(alias)) : undefined;
  return BUSINESS_TYPES.filter((type) => {
    const name = normalized(type);
    return name.includes(needle) || aliasTarget === type;
  }).sort((a, b) => {
    const aName = normalized(a);
    const bName = normalized(b);
    const aRank = aName === needle ? 0 : aName.startsWith(needle) ? 1 : aliasTarget === a ? 2 : 3;
    const bRank = bName === needle ? 0 : bName.startsWith(needle) ? 1 : aliasTarget === b ? 2 : 3;
    return aRank - bRank || a.localeCompare(b);
  });
}

/** Maps canonical and legacy values to the database-backed experience taxonomy. */
export function reviewExperienceGroup(value: unknown): ReviewExperienceGroup | null {
  const type = normalizeBusinessType(value);
  if (!type) return null;
  const key = normalized(type);

  if (/restaurant|cafe|coffee|fast food|bakery|cake|sweet|food truck|dhaba|catering|tea shop|tea point|tapri|tiffin|cloud kitchen|food court|pizza|biryani|juice|ice cream/.test(key)) return "Restaurant";
  if (/pharmacy|clinic|medical|diagnostic|dental|optical|hospital|veterinary/.test(key)) return "Medical";
  if (/salon|beauty|spa|barber/.test(key)) return "Salon";
  if (/automobile|garage|car wash|bike service|car dealer|bike dealer|car service|tyre|auto parts|petrol pump|ev charging/.test(key)) return "Garage";
  if (/library|school|coaching|computer institute|study centre|study room|reading room|academy|classes|music school/.test(key)) return "Library";
  if (/hotel|stay|resort|guest house/.test(key)) return "Hotel";
  if (/laundry|dry clean/.test(key)) return "Laundry";
  if (/gym|fitness|yoga|sports academy|dance academy/.test(key)) return "Fitness";
  if (/travel agency|courier service/.test(key)) return "Travel";
  if (/professional|real estate|financial|insurance|pet care|photography|photo studio|event|repair|bank|atm|ca office|lawyer|digital marketing|it services|tailor/.test(key)) return "Professional Services";
  if (/shop|retail|grocery|supermarket|clothing|footwear|electronics|mobile|hardware|book store|stationery|furniture|jewelry|jewellery|mall|general store|namkeen|computer store|cyber cafe|saree|electrical|sanitary|building material|florist|sports store/.test(key)) return "Shop";
  return "Other";
}
