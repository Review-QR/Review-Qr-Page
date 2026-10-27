import { BUSINESS_TYPES } from "./business-types.ts";

export type CatalogItem = {
  id: string;
  businessId: string;
  name: string;
  category: string;
  price: number;
  unit: string | null;
  itemType: "veg" | "non_veg" | "egg" | "service" | "product";
  imageUrl: string | null;
  description: string | null;
  isAvailable: boolean;
};

export type DiscoveryBusiness = {
  businessId: string; name: string; type: string; slug: string; address: string | null;
  locality: string | null; city: string | null; district: string | null; state: string | null;
  pincode: string | null; latitude: number | null; longitude: number | null;
  googleReviewUrl: string | null; reviewCount: number; ratingAverage: number | null;
  latestReviewAt: string | null; publicCitySlug: string;
  phone?: string | null;
  catalogItems?: CatalogItem[];
};
export type RankedBusiness = DiscoveryBusiness & {
  adjustedRating: number;
  distanceKm: number | null;
  score: number;
  matchedItems?: CatalogItem[];
};

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
const SEARCH_SYNONYMS: Record<string, string[]> = {
  ditergent: ["detergent", "surf", "washing powder", "ariel", "tide", "ghadi", "rin", "cleaner", "nirma"],
  detergent: ["detergent", "surf", "washing powder", "ariel", "tide", "ghadi", "rin", "nirma"],
  deturgent: ["detergent", "surf", "washing powder", "ariel", "tide", "ghadi", "rin", "nirma"],
  nirma: ["detergent", "surf", "washing powder", "ariel", "tide", "ghadi", "rin", "cleaner", "soap"],
  surf: ["detergent", "surf excel", "washing powder", "tide", "ariel", "nirma"],
  sarf: ["detergent", "surf excel", "washing powder", "tide", "ariel", "nirma"],
  soap: ["soap", "dettol", "lux", "lifebuoy", "bathing"],
  gulab: ["gulab jamun", "sweet", "sweets", "mithai"],
  saloon: ["salon", "haircut", "barber", "beauty parlour"],
  sal: ["salon", "saloon", "haircut", "barber"],
  rest: ["restaurant", "dining", "biryani", "food"],
  restaurent: ["restaurant", "dining", "biryani", "food"],
  dant: ["dental", "teeth", "tooth", "dentist"],
  dantist: ["dental", "teeth", "tooth", "dentist"],
  dentist: ["dental", "teeth", "tooth", "dentist"],
  hercut: ["haircut", "hair cut", "barber", "salon"],
  haircutting: ["haircut", "hair cut", "barber", "salon"],
  briyani: ["biryani", "chicken biryani", "dum biryani"],
  mithai: ["sweet", "sweets", "kaju katli", "ladoo", "rasgulla"],
  simint: ["cement", "ultratech", "building"],
  ciment: ["cement", "ultratech", "building"],
  dawa: ["pharmacy", "medical", "paracetamol", "medicine", "tablet"],
  medicine: ["pharmacy", "medical", "paracetamol", "dolo", "crocin"],
  tyre: ["mrf", "tyre", "puncture", "wheel"],
  tire: ["mrf", "tyre", "puncture", "wheel"],
};

export function resolveCategoryForQuery(query: string): string {
  const q = (query || "").trim().toLowerCase();
  if (!q) return "grocery-stores";

  // Sweets & Bakeries
  if (/(gulab|jamun|rasgulla|kaju|katli|mithai|sweet|ladoo|laddoo|peda|barfi|halwa|jalebi|samosa|kachori|namkeen|baker|cake)/i.test(q)) {
    return "sweet-shops";
  }
  // Restaurants & Dining
  if (/(rest|restaurent|restaurant|biryani|briyani|khana|dinner|lunch|thali|paneer|chicken|mutton|kebab|burger|pizza|noodle|chowmein|roll|dosa|fast food|cafe|dhaba)/i.test(q)) {
    return "restaurants";
  }
  // Salons & Grooming
  if (/(sal\b|salon|saloon|barber|hair|haircut|hercut|shave|shaving|beard|facial|spa|parlour|parlor|keratin|makeup|bridal)/i.test(q)) {
    return "salons";
  }
  // Clinics & Doctors
  if (/(dant|dantist|dentist|dental|teeth|tooth|clinic|doctor|hospital|eye|dr\b|pathology|xray|physio|child specialist)/i.test(q)) {
    return "clinics";
  }
  // Pharmacies & Medicines
  if (/(dawa|medicine|medical|chemist|pharmacy|paracetamol|dolo|crocin|tablet|syrup|capsule|cough|bandage|digene)/i.test(q)) {
    return "pharmacies";
  }
  // Mobile & Tech
  if (/(mobile|phone|charger|screen|glass|cover|earbuds|headphone|neckband|power bank|repair|tech)/i.test(q)) {
    return "mobile-shops";
  }
  // Automotive & Garage
  if (/(auto|car|bike|garage|tyre|tire|mrf|apollo|puncture|wheel|engine oil|mobil|castrol|servicing|wash)/i.test(q)) {
    return "auto-services";
  }
  // Hardware & Paints
  if (/(hardware|paint|cement|simint|ciment|ultratech|asian paint|pipe|saria|iron|steel|fitting|lock)/i.test(q)) {
    return "hardware-stores";
  }
  // Clothing & Fashion
  if (/(cloth|clothes|fashion|wear|shirt|pant|jeans|saree|sari|kurti|suit|kurta|lehenga|kids)/i.test(q)) {
    return "clothing-stores";
  }
  // Hotels & Stays
  if (/(hotel|stay|room|lodge|guest house|resort|banquet|suite)/i.test(q)) {
    return "hotels";
  }
  // Grocery & Supermarket (detergent, nirma, surf, atta, oil, ghee, dal, spices, soap, etc.)
  if (/(ditergent|deturgent|detergent|nirma|surf|sarf|washing powder|soap|sabun|atta|rice|oil|ghee|dal|spices|tea|chai|kirana|supermarket|mart|ration)/i.test(q)) {
    return "grocery-stores";
  }

  return "grocery-stores";
}

export type SearchSuggestion = {
  id: string;
  type: "category" | "product" | "shop";
  title: string;
  subtitle: string;
  icon: string;
  url: string;
  badge?: string;
};

const POPULAR_SEARCH_INDEX = [
  // Categories & Services
  { keywords: ["sal", "salon", "saloon", "parlour", "hair", "haircut", "barber", "grooming"], title: "Salons & Beauty Parlours", subtitle: "Haircut, Beard Grooming & Styling", icon: "✂️", type: "category" as const, categorySlug: "salons", q: "" },
  { keywords: ["haircut", "hercut", "hair", "cut", "shave", "sal"], title: "Haircut & Beard Grooming", subtitle: "Top Men's & Unisex Grooming in Bahraich", icon: "💇", type: "product" as const, categorySlug: "salons", q: "haircut" },
  { keywords: ["facial", "d-tan", "spa", "keratin"], title: "Facial, D-Tan & Hair Spa", subtitle: "Skin & Hair Treatment", icon: "✨", type: "product" as const, categorySlug: "salons", q: "facial" },

  // Grocery & FMCG & Detergent & Nirma
  { keywords: ["dite", "ditergent", "deturgent", "detergent", "surf", "sarf", "nirma", "washing powder", "soap"], title: "Detergent & Washing Powder", subtitle: "Nirma, Surf Excel, Ariel, Tide & Ghadi", icon: "🧼", type: "product" as const, categorySlug: "grocery-stores", q: "detergent", badge: "From ₹25" },
  { keywords: ["nirma", "washing", "ditergent"], title: "Nirma Washing Powder", subtitle: "Popular Detergent Bar & Powder", icon: "🧼", type: "product" as const, categorySlug: "grocery-stores", q: "nirma", badge: "From ₹35" },
  { keywords: ["surf", "surf excel"], title: "Surf Excel Detergent", subtitle: "Quick Wash & Easy Wash Powder", icon: "🧼", type: "product" as const, categorySlug: "grocery-stores", q: "surf excel", badge: "From ₹75" },
  { keywords: ["kirana", "grocery", "mart", "supermarket", "ration"], title: "Grocery & Kirana Stores", subtitle: "Daily Essentials, Atta, Ghee & Spices", icon: "🛒", type: "category" as const, categorySlug: "grocery-stores", q: "" },
  { keywords: ["atta", "aashirvaad", "flour"], title: "Atta & Wheat Flour", subtitle: "Aashirvaad, Fortune & Chakki Fresh", icon: "🌾", type: "product" as const, categorySlug: "grocery-stores", q: "atta", badge: "From ₹42/kg" },
  { keywords: ["oil", "ghee", "mustard oil", "fortune", "amul"], title: "Cooking Oil & Pure Ghee", subtitle: "Fortune, Amul & Patanjali", icon: "🫒", type: "product" as const, categorySlug: "grocery-stores", q: "ghee", badge: "From ₹135" },

  // Sweets & Mithai
  { keywords: ["gula", "gulab jamun", "jamun", "kala jamun"], title: "Gulab Jamun & Sweets", subtitle: "Hot Gulab Jamun & Desi Ghee Mithai", icon: "🍮", type: "product" as const, categorySlug: "sweet-shops", q: "gulab jamun", badge: "From ₹320/kg" },
  { keywords: ["kaju", "kaju katli", "mithai", "barfi"], title: "Kaju Katli Special", subtitle: "Pure Kaju Katli in Bahraich", icon: "💎", type: "product" as const, categorySlug: "sweet-shops", q: "kaju", badge: "From ₹950/kg" },
  { keywords: ["rasgulla", "rasmalai", "bengali sweet"], title: "Rasgulla & Rasmalai", subtitle: "Fresh Chhena & Bengali Sweets", icon: "🥛", type: "product" as const, categorySlug: "sweet-shops", q: "rasgulla", badge: "From ₹280/kg" },
  { keywords: ["sweet", "sweets", "mithai", "mithayi"], title: "Sweet Shops & Bakeries", subtitle: "Laddoo, Peda, Samosa & Mithai", icon: "🍰", type: "category" as const, categorySlug: "sweet-shops", q: "" },
  { keywords: ["samosa", "kachori", "snacks"], title: "Samosa & Khasta Kachori", subtitle: "Crispy Evening Snacks", icon: "🥟", type: "product" as const, categorySlug: "sweet-shops", q: "samosa", badge: "₹10/pc" },

  // Restaurants & Food
  { keywords: ["rest", "restaurent", "restaurant", "dining", "dhaba", "food", "khana"], title: "Restaurants & Family Dining", subtitle: "Thali, North Indian, Chinese & Fast Food", icon: "🍽️", type: "category" as const, categorySlug: "restaurants", q: "" },
  { keywords: ["biry", "biryani", "briyani", "chicken biryani", "dum biryani"], title: "Awadhi Dum Biryani", subtitle: "Special Chicken & Mutton Biryani", icon: "🍗", type: "product" as const, categorySlug: "restaurants", q: "biryani", badge: "From ₹160" },
  { keywords: ["paneer", "dal makhani", "veg food"], title: "Paneer & Veg Special Thali", subtitle: "Shahi Paneer, Dal Makhani & Roti", icon: "🧀", type: "product" as const, categorySlug: "restaurants", q: "paneer", badge: "From ₹180" },
  { keywords: ["burger", "pizza", "roll", "fast food", "chowmein"], title: "Fast Food, Rolls & Chinese", subtitle: "Burgers, Chowmein & Kathi Rolls", icon: "🍔", type: "product" as const, categorySlug: "restaurants", q: "burger", badge: "From ₹60" },

  // Clinics & Doctors
  { keywords: ["dant", "dantist", "dentist", "dental", "teeth", "tooth"], title: "Dentist & Dental Clinics", subtitle: "Teeth Cleaning, Root Canal & Braces", icon: "🦷", type: "category" as const, categorySlug: "clinics", q: "dental" },
  { keywords: ["clinic", "doctor", "hospital", "physician", "care"], title: "Doctors & Health Clinics", subtitle: "General Physicians, Dental & Eye Care", icon: "🩺", type: "category" as const, categorySlug: "clinics", q: "" },
  { keywords: ["eye", "optical", "chashma", "optician"], title: "Eye Care & Opticals", subtitle: "Vision Testing & Spectacles", icon: "👁️", type: "product" as const, categorySlug: "clinics", q: "eye" },

  // Pharmacies & Medicines
  { keywords: ["dawa", "medicine", "medical", "chemist", "pharmacy", "paracetamol", "dolo"], title: "Pharmacies & Medical Stores", subtitle: "All Allopathic Medicines & Health Supplies", icon: "💊", type: "category" as const, categorySlug: "pharmacies", q: "" },
  { keywords: ["paracetamol", "dolo", "crocin", "fever", "pain"], title: "Paracetamol / Dolo Tablets", subtitle: "Fever & Pain Relief Medicines", icon: "💊", type: "product" as const, categorySlug: "pharmacies", q: "paracetamol", badge: "From ₹30" },

  // Mobiles & Electronics
  { keywords: ["mobile", "phone", "smartphone", "screen", "glass", "charger", "cover"], title: "Mobile & Tech Accessories", subtitle: "Screen Glass, Fast Chargers & Back Covers", icon: "📱", type: "category" as const, categorySlug: "mobile-shops", q: "" },

  // Auto Services & Garages
  { keywords: ["auto", "bike", "car", "garage", "tyre", "puncture", "service", "mobil"], title: "Auto & Bike Care Garages", subtitle: "MRF Tyres, Castrol Mobil & Bike Servicing", icon: "🚗", type: "category" as const, categorySlug: "auto-services", q: "" },
  { keywords: ["tyre", "tire", "mrf", "apollo"], title: "MRF & Bike Tyres", subtitle: "Tubeless Tyres & Wheel Balancing", icon: "🛞", type: "product" as const, categorySlug: "auto-services", q: "tyre", badge: "From ₹1,450" },

  // Hardware & Paints
  { keywords: ["hardware", "paint", "cement", "simint", "ultratech", "asian"], title: "Hardware & Paint Stores", subtitle: "UltraTech Cement, Asian Paints & TMT Steel", icon: "🔨", type: "category" as const, categorySlug: "hardware-stores", q: "" },
  { keywords: ["cement", "simint", "ultratech"], title: "UltraTech Cement", subtitle: "Premium Grade Building Cement", icon: "🧱", type: "product" as const, categorySlug: "hardware-stores", q: "cement", badge: "From ₹390/bag" },
  { keywords: ["paint", "asian paint", "primer"], title: "Asian Paints & Primer", subtitle: "Wall Paints, Distemper & Brushes", icon: "🎨", type: "product" as const, categorySlug: "hardware-stores", q: "paint" },

  // Clothing & Fashion
  { keywords: ["cloth", "clothes", "fashion", "saree", "shirt", "jeans"], title: "Clothing & Fashion Stores", subtitle: "Banarasi Sarees, Cotton Shirts & Denim", icon: "🛍️", type: "category" as const, categorySlug: "clothing-stores", q: "" },

  // Hotels & Stays
  { keywords: ["hotel", "stay", "room", "lodge", "banquet"], title: "Hotels & Stays", subtitle: "AC Deluxe Rooms, Banquets & Stays", icon: "🏨", type: "category" as const, categorySlug: "hotels", q: "" },

  // Popular Verified Shops in Bahraich
  { keywords: ["deepak", "deepak sweet", "deepak sweets"], title: "Deepak Sweet House", subtitle: "Station Road, Bahraich · ★ 4.9", icon: "🍰", type: "shop" as const, categorySlug: "sweet-shops", q: "Deepak Sweet House", badge: "Verified Shop" },
  { keywords: ["madhuram", "madhuram sweets"], title: "Madhuram Sweets & Bakery", subtitle: "Chowk Bazar, Bahraich · ★ 4.8", icon: "🍰", type: "shop" as const, categorySlug: "sweet-shops", q: "Madhuram Sweets", badge: "Verified Shop" },
  { keywords: ["gupta", "gupta kirana"], title: "Gupta Kirana & General Store", subtitle: "Chowk Bazar, Bahraich · ★ 4.8", icon: "🛒", type: "shop" as const, categorySlug: "grocery-stores", q: "Gupta Kirana", badge: "Verified Shop" },
  { keywords: ["shivam", "shivam supermarket"], title: "Shivam Supermarket", subtitle: "Hospital Road, Bahraich · ★ 4.7", icon: "🛒", type: "shop" as const, categorySlug: "grocery-stores", q: "Shivam Supermarket", badge: "Verified Shop" },
  { keywords: ["awadh", "awadh biryani"], title: "Awadh Biryani Corner", subtitle: "Peepal Chauraha, Bahraich · ★ 4.8", icon: "🍽️", type: "shop" as const, categorySlug: "restaurants", q: "Awadh Biryani", badge: "Verified Shop" },
  { keywords: ["royal", "royal darbar"], title: "Royal Darbar Restaurant", subtitle: "KDC Chauraha, Bahraich · ★ 4.7", icon: "🍽️", type: "shop" as const, categorySlug: "restaurants", q: "Royal Darbar", badge: "Verified Shop" },
  { keywords: ["looks", "looks salon"], title: "Looks Unisex Salon", subtitle: "Civil Lines, Bahraich · ★ 4.9", icon: "✂️", type: "shop" as const, categorySlug: "salons", q: "Looks Unisex Salon", badge: "Verified Shop" },
  { keywords: ["jawed", "jawed habib"], title: "Jawed Habib Hair & Beauty", subtitle: "Station Road, Bahraich · ★ 4.8", icon: "✂️", type: "shop" as const, categorySlug: "salons", q: "Jawed Habib", badge: "Verified Shop" },
  { keywords: ["agarwal", "dr agarwal", "dental clinic"], title: "Dr. Agarwal Dental Clinic", subtitle: "Hospital Road, Bahraich · ★ 4.9", icon: "🩺", type: "shop" as const, categorySlug: "clinics", q: "Dr. Agarwal Dental", badge: "Verified Clinic" },
  { keywords: ["verma", "verma medical"], title: "Verma Medical Hall", subtitle: "Chhawni Road, Bahraich · ★ 4.8", icon: "💊", type: "shop" as const, categorySlug: "pharmacies", q: "Verma Medical", badge: "Verified Medical" },
  { keywords: ["singhal", "singhal hardware"], title: "Singhal Hardware & Paints", subtitle: "Galla Mandi, Bahraich · ★ 4.8", icon: "🔨", type: "shop" as const, categorySlug: "hardware-stores", q: "Singhal Hardware", badge: "Verified Hardware" },
  { keywords: ["super", "super bike"], title: "Super Bike Service & Garage", subtitle: "Nanpara Road, Bahraich · ★ 4.7", icon: "🚗", type: "shop" as const, categorySlug: "auto-services", q: "Super Bike Service", badge: "Verified Garage" },
];

export function getSearchSuggestions(query: string, citySlug = "bahraich"): SearchSuggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const matched = POPULAR_SEARCH_INDEX.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.startsWith(q) || k.includes(q) || q.startsWith(k))
    );
  });

  return matched.slice(0, 6).map((item, idx) => {
    const url = item.q
      ? `/${citySlug}/${item.categorySlug}?q=${encodeURIComponent(item.q)}`
      : `/${citySlug}/${item.categorySlug}`;
    return {
      id: `${item.type}-${idx}-${item.title}`,
      type: item.type,
      title: item.title,
      subtitle: item.subtitle,
      icon: item.icon,
      url,
      badge: item.badge,
    };
  });
}

export function rankBusinesses(items: DiscoveryBusiness[], options: { sort?: string; q?: string; minRating?: number; lat?: number; lng?: number; now?: number } = {}): RankedBusiness[] {
  const now = options.now ?? Date.now();
  const query = options.q?.trim().toLocaleLowerCase() ?? "";
  const tokens = query.split(/\s+/).map((t) => t.trim().toLowerCase()).filter((t) => t.length >= 2);
  const stems = tokens.map((t) => t.replace(/(ting|ing|s|es)$/, "")).filter((s) => s.length >= 3);
  const synonyms = tokens.flatMap((t) => SEARCH_SYNONYMS[t] ?? (SEARCH_SYNONYMS[query] ?? []));
  const allTokens = [...new Set([...tokens, ...stems, ...synonyms])];

  const ranked = items.filter((b) => {
    if (options.minRating && (b.ratingAverage ?? 0) < options.minRating) return false;
    if (!query) return true;
    const baseText = `${b.name} ${b.type} ${b.address ?? ""} ${b.locality ?? ""} ${b.city ?? ""}`.toLocaleLowerCase();
    const baseMatch = baseText.includes(query) || (allTokens.length > 0 && allTokens.some((t) => baseText.includes(t)));
    const catalogMatch = b.catalogItems?.some((item) => {
      const itemText = `${item.name} ${item.category} ${item.description ?? ""}`.toLocaleLowerCase();
      return itemText.includes(query) || (allTokens.length > 0 && allTokens.some((t) => itemText.includes(t)));
    });
    return baseMatch || Boolean(catalogMatch);
  }).map((b) => {
    const count = b.reviewCount;
    const adjustedRating = count ? ((b.ratingAverage ?? 0) * count + 4 * 5) / (count + 5) : 0;
    const confidence = count / (count + 5);
    const latestReviewTime = b.latestReviewAt ? Date.parse(b.latestReviewAt) : Number.NaN;
    const ageDays = Number.isFinite(latestReviewTime) ? Math.max(0, (now - latestReviewTime) / 86400000) : 3650;
    const recency = Math.pow(0.5, ageDays / 365);
    const complete = [b.name, b.address, b.locality, b.city, b.district, b.state, b.pincode].filter((x) => x !== null && x !== "").length / 7;
    const distanceKm = options.lat !== undefined && options.lng !== undefined && b.latitude !== null && b.longitude !== null ? haversineKm(options.lat, options.lng, b.latitude, b.longitude) : null;
    const name = b.name.toLocaleLowerCase();
    let queryRelevance = !query ? 0 : name === query ? 1 : name.startsWith(query) ? .8 : name.includes(query) ? .6 : .3;

    // Filter matched items for multi-store product discovery
    const matchedItems = query && b.catalogItems?.length
      ? b.catalogItems.filter((item) => {
          const itemText = `${item.name} ${item.category} ${item.description ?? ""}`.toLocaleLowerCase();
          return itemText.includes(query) || (allTokens.length > 0 && allTokens.some((t) => itemText.includes(t)));
        })
      : [];

    if (query && b.catalogItems?.length) {
      const exactItem = b.catalogItems.some((item) => item.name.toLocaleLowerCase() === query);
      const partialItem = matchedItems.length > 0;
      if (exactItem) queryRelevance = Math.max(queryRelevance, 0.9);
      else if (partialItem) queryRelevance = Math.max(queryRelevance, 0.7);
    }
    const proximity = distanceKm === null ? 0 : Math.exp(-distanceKm / 10);
    // Recommendation score uses Trustit Bayesian rating (62%), sample confidence (20%),
    // review recency (5%), public profile completeness (5%), optional supplied distance (3%),
    // and query-name relevance (5%). Plans, payments, admin preferences, and private data are excluded.
    const score = (adjustedRating / 5) * .62 + confidence * .2 + recency * .05 + complete * .05 + proximity * .03 + queryRelevance * .05;
    return { ...b, adjustedRating, distanceKm, score, matchedItems };
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
