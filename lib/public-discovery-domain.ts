import { BUSINESS_TYPES } from "./business-types.ts";

export type DiscoveryBusiness = {
  businessId: string; name: string; type: string; slug: string; address: string | null;
  locality: string | null; city: string | null; district: string | null; state: string | null;
  pincode: string | null; latitude: number | null; longitude: number | null;
  googleReviewUrl: string | null; reviewCount: number; ratingAverage: number | null;
  latestReviewAt: string | null; publicCitySlug: string;
};
export type RankedBusiness = DiscoveryBusiness & { adjustedRating: number; distanceKm: number | null; score: number };

export function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business";
}
export function uniqueBusinessSlug(name: string, existing: Iterable<string>) {
  const used = new Set(existing);
  const base = slugify(name);
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
export type PublicCategory = { name: string; slug: string; aliases: readonly string[]; businessTypes: readonly string[]; primaryBusinessTypes: readonly string[] };

/** Explicit indexable categories. Unlisted catalog types keep legacy routes but are noindex and omitted from sitemaps. */
export const PUBLIC_CATEGORIES: readonly PublicCategory[] = [
  { name: "Restaurants", slug: "restaurants", aliases: ["restaurant", "dining"], businessTypes: ["Restaurant", "Cafe/Restaurant", "Cafe", "Coffee Shop", "Fast Food", "Dhaba", "Food Truck", "Catering Service"], primaryBusinessTypes: ["Restaurant", "Cafe/Restaurant", "Fast Food", "Dhaba", "Food Truck", "Catering Service"] },
  { name: "Sweet Shops", slug: "sweet-shops", aliases: ["sweet-shop", "cake-shop", "cake-shops", "sweets"], businessTypes: ["Sweet Shop", "Cake Shop"], primaryBusinessTypes: ["Sweet Shop", "Cake Shop"] },
  { name: "Cafes", slug: "cafes", aliases: ["cafe", "coffee-shop", "coffee-shops"], businessTypes: ["Cafe", "Cafe/Restaurant", "Coffee Shop"], primaryBusinessTypes: ["Cafe", "Coffee Shop"] },
  { name: "Salons", slug: "salons", aliases: ["salon", "beauty-parlours", "barber-shops"], businessTypes: ["Salon", "Beauty Parlour", "Barber Shop"], primaryBusinessTypes: ["Salon", "Beauty Parlour", "Barber Shop"] },
  { name: "Hotels", slug: "hotels", aliases: ["hotel", "stays"], businessTypes: ["Hotel", "Hotel / Stay", "Resort", "Guest House"], primaryBusinessTypes: ["Hotel", "Hotel / Stay", "Resort", "Guest House"] },
  { name: "Bakeries", slug: "bakeries", aliases: ["bakery"], businessTypes: ["Bakery"], primaryBusinessTypes: ["Bakery"] },
  { name: "Clothing Stores", slug: "clothing-stores", aliases: ["clothing-store", "apparel-stores"], businessTypes: ["Clothing Store"], primaryBusinessTypes: ["Clothing Store"] },
  { name: "Grocery Stores", slug: "grocery-stores", aliases: ["grocery-store", "supermarkets"], businessTypes: ["Grocery Store", "Supermarket"], primaryBusinessTypes: ["Grocery Store", "Supermarket"] },
  { name: "Pharmacies", slug: "pharmacies", aliases: ["pharmacy", "medical-stores"], businessTypes: ["Pharmacy", "Medical Store"], primaryBusinessTypes: ["Pharmacy", "Medical Store"] },
  { name: "Electronics Stores", slug: "electronics-stores", aliases: ["electronics-store"], businessTypes: ["Electronics Store"], primaryBusinessTypes: ["Electronics Store"] },
  { name: "Mobile Shops", slug: "mobile-shops", aliases: ["mobile-shop", "mobile-and-accessories"], businessTypes: ["Mobile & Accessories"], primaryBusinessTypes: ["Mobile & Accessories"] },
  { name: "Furniture Stores", slug: "furniture-stores", aliases: ["furniture-store"], businessTypes: ["Furniture Store"], primaryBusinessTypes: ["Furniture Store"] },
  { name: "Jewelry Stores", slug: "jewelry-stores", aliases: ["jewelry-store", "jewellery-stores", "jewellery-store"], businessTypes: ["Jewelry Store"], primaryBusinessTypes: ["Jewelry Store"] },
  { name: "Automotive Services", slug: "auto-services", aliases: ["automobile", "automotive", "garages", "car-washes", "bike-services"], businessTypes: ["Automobile Garage", "Garage", "Car Wash", "Bike Service"], primaryBusinessTypes: ["Automobile Garage", "Garage", "Car Wash", "Bike Service"] },
  { name: "Gyms and Fitness", slug: "gyms", aliases: ["gym", "fitness-centres", "fitness-centers", "yoga-studios"], businessTypes: ["Gym & Fitness", "Yoga Studio"], primaryBusinessTypes: ["Gym & Fitness", "Yoga Studio"] },
  { name: "Coaching and Training Centres", slug: "coaching-centres", aliases: ["coaching", "coaching-training", "training-centres", "training-centers"], businessTypes: ["Coaching Centre", "Computer Institute"], primaryBusinessTypes: ["Coaching Centre", "Computer Institute"] },
  { name: "Schools", slug: "schools", aliases: ["school"], businessTypes: ["School"], primaryBusinessTypes: ["School"] },
  { name: "Clinics", slug: "clinics", aliases: ["clinic", "health-clinics"], businessTypes: ["Clinic", "Medical", "Diagnostic Centre", "Dental Clinic", "Optical Store"], primaryBusinessTypes: ["Clinic", "Medical", "Diagnostic Centre", "Dental Clinic", "Optical Store"] },
  { name: "Spas", slug: "spas", aliases: ["spa"], businessTypes: ["Spa"], primaryBusinessTypes: ["Spa"] },
  { name: "Libraries", slug: "libraries", aliases: ["library"], businessTypes: ["Library"], primaryBusinessTypes: ["Library"] },
  { name: "Book Stores", slug: "book-stores", aliases: ["book-store", "bookshops"], businessTypes: ["Book Store"], primaryBusinessTypes: ["Book Store"] },
  { name: "Stationery Stores", slug: "stationery-stores", aliases: ["stationery-store"], businessTypes: ["Stationery Store"], primaryBusinessTypes: ["Stationery Store"] },
  { name: "Footwear Stores", slug: "footwear-stores", aliases: ["footwear-store", "shoe-stores"], businessTypes: ["Footwear Store"], primaryBusinessTypes: ["Footwear Store"] },
  { name: "Hardware Stores", slug: "hardware-stores", aliases: ["hardware-store"], businessTypes: ["Hardware Store"], primaryBusinessTypes: ["Hardware Store"] },
  { name: "Travel Agencies", slug: "travel-agencies", aliases: ["travel-agency"], businessTypes: ["Travel Agency"], primaryBusinessTypes: ["Travel Agency"] },
  { name: "Laundry Services", slug: "laundry-services", aliases: ["laundry", "dry-cleaning", "dry-cleaners"], businessTypes: ["Laundry", "Dry Cleaning"], primaryBusinessTypes: ["Laundry", "Dry Cleaning"] },
  { name: "Pet Care", slug: "pet-care", aliases: ["pet-services"], businessTypes: ["Pet Care"], primaryBusinessTypes: ["Pet Care"] },
  { name: "Photography Studios", slug: "photography-studios", aliases: ["photography-studio"], businessTypes: ["Photography Studio"], primaryBusinessTypes: ["Photography Studio"] },
  { name: "Event Services", slug: "event-services", aliases: ["event-service", "events"], businessTypes: ["Event Services"], primaryBusinessTypes: ["Event Services"] },
  { name: "Repair Services", slug: "repair-services", aliases: ["repair-service"], businessTypes: ["Repair Services"], primaryBusinessTypes: ["Repair Services"] },
  { name: "Real Estate Services", slug: "real-estate", aliases: ["real-estate-services"], businessTypes: ["Real Estate"], primaryBusinessTypes: ["Real Estate"] },
  { name: "Financial Services", slug: "financial-services", aliases: ["insurance-services"], businessTypes: ["Financial Services", "Insurance"], primaryBusinessTypes: ["Financial Services", "Insurance"] },
  { name: "Professional Services", slug: "professional-services", aliases: ["professional-service"], businessTypes: ["Professional Services"], primaryBusinessTypes: ["Professional Services"] },
] as const;

const publicCategoryByAlias = new Map<string, PublicCategory>();
const publicCategoryByType = new Map<string, PublicCategory[]>();
const canonicalPublicSlugs = new Set<string>();
for (const category of PUBLIC_CATEGORIES) {
  if (canonicalPublicSlugs.has(category.slug)) throw new Error(`Duplicate public category slug: ${category.slug}`);
  canonicalPublicSlugs.add(category.slug);
  for (const alias of [category.slug, ...category.aliases]) {
    const normalized = slugify(alias);
    const previous = publicCategoryByAlias.get(normalized);
    if (previous && previous.slug !== category.slug) throw new Error(`Ambiguous public category alias: ${alias}`);
    publicCategoryByAlias.set(normalized, category);
  }
  for (const type of category.businessTypes) {
    if (!BUSINESS_TYPES.includes(type as (typeof BUSINESS_TYPES)[number])) throw new Error(`Public category type is absent from BUSINESS_TYPES: ${type}`);
    const categories = publicCategoryByType.get(type) ?? [];
    categories.push(category);
    publicCategoryByType.set(type, categories);
  }
}

export function getPublicCategory(slug: string) { return publicCategoryByAlias.get(slugify(slug)) ?? null; }
export function isIndexablePublicCategory(slug: string) { return getPublicCategory(slug) !== null; }
export function canonicalCategorySlug(slug: string) {
  const category = getPublicCategory(slug);
  if (category) return category.slug;
  const legacyType = BUSINESS_TYPES.find((type) => slugify(type) === slugify(slug) && type !== "Other");
  return legacyType ? slugify(legacyType) : null;
}
export function categoryNameForSlug(slug: string) {
  return getPublicCategory(slug)?.name ?? BUSINESS_TYPES.find((type) => slugify(type) === slugify(slug)) ?? "";
}
export function categorySlugForBusinessType(type: string) {
  const categories = publicCategoryByType.get(type);
  if (!categories) return null;
  return categories.find((category) => category.primaryBusinessTypes.includes(type))?.slug ?? categories[0].slug;
}
export function categorySlugsForBusinessType(type: string) {
  return publicCategoryByType.get(type)?.map((category) => category.slug) ?? [];
}
export function resolveCategory(slug: string): string[] {
  const category = getPublicCategory(slug);
  if (category) return [...category.businessTypes];
  const legacyType = BUSINESS_TYPES.find((type) => slugify(type) === slugify(slug) && type !== "Other");
  return legacyType ? [legacyType] : [];
}
/** Mirrors public.trustit_public_slug; route generation and RPC comparison must use identical ASCII normalization. */
export function slugifyCity(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function cityMatches(city: string | null, citySlug: string) {
	return !!city && slugifyCity(city) === slugifyCity(citySlug);
}
export function hasUsablePublicDiscoveryLocation(record: Pick<DiscoveryBusiness, "type" | "city" | "state" | "pincode" | "publicCitySlug">, citySlug: string) {
  return BUSINESS_TYPES.includes(record.type as (typeof BUSINESS_TYPES)[number])
    && Boolean(record.city?.trim())
    && cityMatches(record.city, citySlug)
    && record.publicCitySlug === citySlug
    && Boolean(record.state?.trim())
    && Boolean(record.pincode && /^\d{6}$/.test(record.pincode));
}
export function publicEligible(b: { status: string | null; merchantStatus: string | null; qrStatus: string | null; expiry: string | null; deletedAt: string | null }, today = new Date().toISOString().slice(0, 10)) {
  return !b.deletedAt && (b.status === "active" || b.status === "expiring soon") && b.merchantStatus === "active" && b.qrStatus === "active" && (!b.expiry || b.expiry >= today);
}
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = (deg: number) => deg * Math.PI / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function rankBusinesses(items: DiscoveryBusiness[], options: { sort?: string; q?: string; minRating?: number; lat?: number; lng?: number; now?: number } = {}): RankedBusiness[] {
  const now = options.now ?? Date.now();
  const query = options.q?.trim().toLocaleLowerCase() ?? "";
  const ranked = items.filter((b) => (!options.minRating || (b.ratingAverage ?? 0) >= options.minRating) && (!query || `${b.name} ${b.address ?? ""} ${b.locality ?? ""} ${b.city ?? ""}`.toLocaleLowerCase().includes(query))).map((b) => {
    const count = b.reviewCount;
    const adjustedRating = count ? ((b.ratingAverage ?? 0) * count + 4 * 5) / (count + 5) : 0;
    const confidence = count / (count + 5);
    const latestReviewTime = b.latestReviewAt ? Date.parse(b.latestReviewAt) : Number.NaN;
    const ageDays = Number.isFinite(latestReviewTime) ? Math.max(0, (now - latestReviewTime) / 86400000) : 3650;
    const recency = Math.pow(0.5, ageDays / 365);
    const complete = [b.name, b.address, b.locality, b.city, b.district, b.state, b.pincode].filter((x) => x !== null && x !== "").length / 7;
    const distanceKm = options.lat !== undefined && options.lng !== undefined && b.latitude !== null && b.longitude !== null ? haversineKm(options.lat, options.lng, b.latitude, b.longitude) : null;
    const name = b.name.toLocaleLowerCase();
    const queryRelevance = !query ? 0 : name === query ? 1 : name.startsWith(query) ? .8 : name.includes(query) ? .6 : .3;
    const proximity = distanceKm === null ? 0 : Math.exp(-distanceKm / 10);
    // Recommendation score uses Trustit Bayesian rating (62%), sample confidence (20%),
    // review recency (5%), public profile completeness (5%), optional supplied distance (3%),
    // and query-name relevance (5%). Plans, payments, admin preferences, and private data are excluded.
    const score = (adjustedRating / 5) * .62 + confidence * .2 + recency * .05 + complete * .05 + proximity * .03 + queryRelevance * .05;
    return { ...b, adjustedRating, distanceKm, score };
  });
  const sort = options.sort ?? "recommended";
  return ranked.sort((a, b) => {
    if (sort === "nearest") {
      if ((a.distanceKm !== null) !== (b.distanceKm !== null)) return a.distanceKm !== null ? -1 : 1;
      if (a.distanceKm !== null && b.distanceKm !== null && a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    }
    if (sort === "most-reviewed" && a.reviewCount !== b.reviewCount) return b.reviewCount - a.reviewCount;
    if (sort === "highest-rated" && a.adjustedRating !== b.adjustedRating) return b.adjustedRating - a.adjustedRating;
    if (sort === "recommended" && a.score !== b.score) return b.score - a.score;
    if ((a.reviewCount > 0) !== (b.reviewCount > 0)) return a.reviewCount > 0 ? -1 : 1;
    if (a.adjustedRating !== b.adjustedRating) return b.adjustedRating - a.adjustedRating;
    if (a.reviewCount !== b.reviewCount) return b.reviewCount - a.reviewCount;
    const latest = Date.parse(b.latestReviewAt ?? "") - Date.parse(a.latestReviewAt ?? "");
    if (Number.isFinite(latest) && latest) return latest;
    if (a.distanceKm !== null && b.distanceKm !== null && a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return a.businessId.localeCompare(b.businessId);
  });
}
export function paginate<T>(items: T[], page: number, pageSize = 12) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.max(1, Math.min(totalPages, Math.floor(page) || 1));
  return { items: items.slice((currentPage - 1) * pageSize, currentPage * pageSize), currentPage, totalPages, total: items.length };
}
