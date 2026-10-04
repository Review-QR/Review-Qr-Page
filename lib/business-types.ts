export const BUSINESS_TYPES = [
  "Restaurant", "Shop", "Cafe", "Cafe/Restaurant", "Coffee Shop", "Fast Food",
  "Bakery", "Cake Shop", "Sweet Shop", "Food Truck", "Dhaba", "Catering Service",
  "Grocery Store", "Supermarket", "Retail Shop", "Retail", "Clothing Store",
  "Footwear Store", "Electronics Store", "Mobile & Accessories", "Hardware Store",
  "Pharmacy", "Clinic", "Medical", "Medical Store", "Diagnostic Centre",
  "Dental Clinic", "Optical Store", "Salon", "Beauty Parlour", "Spa", "Barber Shop",
  "Gym & Fitness", "Yoga Studio", "Hotel", "Hotel / Stay", "Resort", "Guest House",
  "Travel Agency", "Laundry", "Dry Cleaning", "Automobile Garage", "Garage",
  "Car Wash", "Bike Service", "Library", "Book Store", "Stationery Store", "School",
  "Coaching Centre", "Computer Institute", "Professional Services", "Real Estate",
  "Financial Services", "Insurance", "Pet Care", "Photography Studio", "Event Services",
  "Repair Services", "Manufacturer", "Other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

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

const aliases: Record<string, BusinessType> = {
  lib: "Library", library: "Library", libraries: "Library",
  rest: "Restaurant", restaurant: "Restaurant", restaurants: "Restaurant",
  sal: "Salon", salon: "Salon", saloon: "Salon", "beauty salon": "Salon",
  cafe: "Cafe", coffee: "Cafe", hotel: "Hotel", hotels: "Hotel",
  garage: "Garage", auto: "Automobile Garage", medical: "Medical",
  clinic: "Clinic", shop: "Shop", retail: "Retail",
};

const catalogByNormalizedType = new Map<string, BusinessType>(
  BUSINESS_TYPES.map((type) => [normalized(type), type]),
);

/** Converts supported aliases and legacy spellings to a stored catalog value. */
export function normalizeBusinessType(value: unknown): BusinessType | null {
  if (typeof value !== "string") return null;
  const key = normalized(value);
  return aliases[key] ?? catalogByNormalizedType.get(key) ?? null;
}

/** Search results always contain canonical catalog values and never duplicates. */
export function searchBusinessTypes(query: string): BusinessType[] {
  const needle = normalized(query);
  if (!needle) return [...BUSINESS_TYPES];
  const aliasTarget = aliases[needle];
  const matches = BUSINESS_TYPES.filter((type) => {
    const name = normalized(type);
    return name.includes(needle) || (aliasTarget === type);
  });
  return [...new Set(matches)].sort((a, b) => {
    const aName = normalized(a);
    const bName = normalized(b);
    const aRank = aName === needle ? 0 : aName.startsWith(needle) ? 1 : aliases[needle] === a ? 2 : 3;
    const bRank = bName === needle ? 0 : bName.startsWith(needle) ? 1 : aliases[needle] === b ? 2 : 3;
    return aRank - bRank || a.localeCompare(b);
  });
}

/** Maps canonical and legacy values to the database-backed experience taxonomy. */
export function reviewExperienceGroup(value: unknown): ReviewExperienceGroup | null {
  const type = normalizeBusinessType(value);
  if (!type) return null;
  const key = normalized(type);

  if (/restaurant|cafe|coffee|fast food|bakery|cake|sweet|food truck|dhaba|catering/.test(key)) return "Restaurant";
  if (/pharmacy|clinic|medical|diagnostic|dental|optical/.test(key)) return "Medical";
  if (/salon|beauty|spa|barber/.test(key)) return "Salon";
  if (/automobile|garage|car wash|bike service/.test(key)) return "Garage";
  if (/library|school|coaching|computer institute/.test(key)) return "Library";
  if (/hotel|stay|resort|guest house/.test(key)) return "Hotel";
  if (/laundry|dry cleaning/.test(key)) return "Laundry";
  if (/gym|fitness|yoga/.test(key)) return "Fitness";
  if (/travel agency/.test(key)) return "Travel";
  if (/professional|real estate|financial|insurance|pet care|photography|event services|repair services/.test(key)) return "Professional Services";
  if (/shop|retail|grocery|supermarket|clothing|footwear|electronics|mobile|hardware|book store|stationery/.test(key)) return "Shop";
  return "Other";
}
