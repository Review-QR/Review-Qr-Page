"use client";

export type CustomerLanguage = "en" | "hi";

export type VerticalTabId =
  | "food"
  | "kirana"
  | "dairy"
  | "medical"
  | "parcha"
  | "salon"
  | "car_wash";

export type BottomNavTab = "home" | "categories" | "orders" | "account";

export type OutOfStockRule = "call_me" | "replace_similar" | "refund_item";

export type PriceTierFilter = "all" | "budget" | "mid" | "premium";

export type StoreSortFilter = "recommended" | "fastest" | "rating";

export type SuperAppBusiness = {
  id: string;
  name: string;
  city: string;
  type: string;
  address: string | null;
  phone: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  is_verified?: boolean | null;
};

export type SuperAppCatalogItem = {
  id: string;
  business_id: string;
  name: string;
  category: string;
  price: number;
  item_type: "veg" | "non_veg" | "egg" | "service" | "product";
  is_available: boolean;
  image_url: string | null;
  description: string | null;
};

export interface DishCustomization {
  portion: "half" | "full";
  portionLabel: string;
  portionPrice: number;
  addons: Array<{ id: string; name: string; price: number }>;
  cookingNotes: string;
}

export interface CartLineItem {
  cartKey: string;
  item: SuperAppCatalogItem;
  quantity: number;
  customization?: DishCustomization;
  itemUnitPrice: number;
}

export const AVAILABLE_ADDONS = [
  { id: "butter", name: "Extra Butter / Desi Ghee", price: 25 },
  { id: "salad", name: "Fresh Salad & Mint Chutney", price: 15 },
  { id: "roti_pav", name: "Butter Roti / Extra Pav (2 pcs)", price: 20 },
  { id: "raita", name: "Boondi Raita Cup", price: 30 },
];

export const QUICK_COOKING_NOTES = [
  "Less Spicy",
  "Extra Gravy",
  "No Onion / Garlic (Jain)",
  "Extra Crispy / Well Done",
];

export type DetectedGpsLocation = {
  lat: number;
  lng: number;
  locationName?: string;
  mohalla?: string;
  landmark?: string;
  street?: string;
  city?: string;
  pincode?: string;
  formattedAddress?: string;
};

export type ActiveHyperlocalOrder = {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: { street: string; locality?: string; city?: string; latitude?: number; longitude?: number };
  order_type: string;
  status: string;
  total_amount: number;
  subtotal_amount: number;
  delivery_fee: number;
  platform_fee?: number;
  delivery_otp: string;
  payment_status?: string;
  payment_mode?: string;
  cashfree_payment_id?: string | null;
  merchant_prep_time_minutes?: number;
  cancellation_reason?: string | null;
  cancelled_by?: string | null;
  dispute_status?: string | null;
  admin_notes?: string | null;
  customer_notes?: string | null;
  created_at: string;
  businesses?: {
    name: string;
    city: string;
    address: string | null;
    phone?: string | null;
    location_latitude?: number | null;
    location_longitude?: number | null;
  };
  delivery_riders?: {
    id: string;
    full_name: string;
    phone: string;
    vehicle_number?: string;
    vehicle_type?: string;
    rating?: number;
    current_latitude?: number | null;
    current_longitude?: number | null;
  } | null;
  hyperlocal_order_items?: Array<{
    id?: string;
    item_name: string;
    quantity: number;
    unit_price: number;
    is_veg?: boolean;
    notes?: string | null;
  }>;
};

export type CustomerSavedAddress = {
  id: string;
  customerId?: string;
  label?: "Home" | "Work" | "Other" | string;
  tag?: "Home" | "Work" | "Other" | string;
  street: string;
  landmark?: string | null;
  city?: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
  houseNo?: string;
  mohalla?: string;
  road?: string;
  district?: string;
};

export type ActiveServiceToken = {
  id: string;
  business_id: string;
  service_type: string;
  token_number: number;
  customer_name: string;
  customer_phone: string;
  vehicle_or_notes: string | null;
  status: string;
  estimated_wait_minutes: number;
  chair_or_bay_number?: string;
  created_at: string;
  businesses?: { name: string; city: string; address: string | null; phone?: string | null };
};

export type ActiveParchaOrder = {
  order_id: string;
  handwritten_text: string | null;
  parcha_image_url: string | null;
  merchant_quote_amount: number | null;
  merchant_quote_items: Array<{ name: string; quantity: string; price: number }>;
  customer_approved: boolean;
  hyperlocal_orders?: {
    id: string;
    status: string;
    delivery_otp: string;
    total_amount: number;
    business_id: string;
    customer_notes?: string | null;
  };
};

export type CustomerNotificationItem = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  kind: "order" | "pin_security" | "parcha" | "deal";
  orderId?: string;
};

export type BahraichCategoryTile = {
  id: string;
  title: string;
  titleHi: string;
  vertical: VerticalTabId;
  searchTag: string;
  emoji: string;
  accent: string;
};

/**
 * 9 curated Bahraich-focused main categories (3x3 compact grid, zero Alcohol / EU items).
 */
export const BAHRAICH_12_CATEGORIES: BahraichCategoryTile[] = [
  { id: "food_meals", title: "Food & Thali", titleHi: "भोजन व थाली", vertical: "food", searchTag: "", emoji: "🍛", accent: "bg-blue-50 text-blue-900 border-blue-200" },
  { id: "sweets", title: "Sweets & Cakes", titleHi: "मिठाई व बेकरी", vertical: "food", searchTag: "sweet", emoji: "🍮", accent: "bg-amber-50 text-amber-900 border-amber-200" },
  { id: "kirana", title: "Kirana & Ration", titleHi: "किराना व राशन", vertical: "kirana", searchTag: "", emoji: "🛒", accent: "bg-indigo-50 text-indigo-900 border-indigo-200" },
  { id: "dairy", title: "Milk & Paneer", titleHi: "दूध, दही व पनीर", vertical: "dairy", searchTag: "", emoji: "🥛", accent: "bg-cyan-50 text-cyan-900 border-cyan-200" },
  { id: "medical_rx", title: "Pharmacy & Rx", titleHi: "मेडिकल व पर्चा", vertical: "medical", searchTag: "", emoji: "💊", accent: "bg-teal-50 text-teal-900 border-teal-200" },
  { id: "smart_parcha", title: "Smart Parcha", titleHi: "हाथ से पर्चा", vertical: "parcha", searchTag: "", emoji: "📝", accent: "bg-sky-50 text-sky-900 border-sky-200" },
  { id: "salon", title: "Salon Chair", titleHi: "सैलून टोकन", vertical: "salon", searchTag: "", emoji: "✂️", accent: "bg-slate-100 text-slate-900 border-slate-300" },
  { id: "car_wash", title: "Car & Bike Wash", titleHi: "कार व बाइक वॉश", vertical: "car_wash", searchTag: "", emoji: "🚗", accent: "bg-blue-50 text-blue-900 border-blue-200" },
  { id: "all_stores", title: "All Local Shops", titleHi: "सभी दुकानें", vertical: "food", searchTag: "", emoji: "🏪", accent: "bg-emerald-50 text-emerald-900 border-emerald-200" },
];

export const BAHRAICH_POPULAR_AREAS = [
  { name: "Civil Lines, Bahraich", mohalla: "Civil Lines", pincode: "271801", lat: 27.5744, lng: 81.5977 },
  { name: "Ghantaghar Chowk, Bahraich", mohalla: "Ghantaghar Chowk", pincode: "271801", lat: 27.5765, lng: 81.6012 },
  { name: "Station Road, Bahraich", mohalla: "Station Road", pincode: "271801", lat: 27.5718, lng: 81.6033 },
  { name: "Medical College Road, Bahraich", mohalla: "Medical College Road", pincode: "271801", lat: 27.5755, lng: 81.5988 },
  { name: "Hospital Chauraha, Bahraich", mohalla: "Hospital Chauraha", pincode: "271801", lat: 27.5732, lng: 81.5955 },
  { name: "Salarganj Road, Bahraich", mohalla: "Salarganj", pincode: "271801", lat: 27.5831, lng: 81.6075 },
];

export const SCHEDULE_TIME_SLOTS = [
  { id: "today_1", label: "Today • Next 45 – 60 mins", day: "Today" },
  { id: "today_2", label: "Today • 1:00 PM – 2:00 PM", day: "Today" },
  { id: "today_3", label: "Today • 5:00 PM – 6:30 PM", day: "Today" },
  { id: "today_4", label: "Today • 8:00 PM – 9:30 PM", day: "Today" },
  { id: "tmrw_1", label: "Tomorrow • 9:00 AM – 10:30 AM", day: "Tomorrow" },
  { id: "tmrw_2", label: "Tomorrow • 12:30 PM – 2:00 PM", day: "Tomorrow" },
];

export function t(lang: CustomerLanguage, en: string, hi: string): string {
  return lang === "hi" ? hi : en;
}

const SEARCH_SYNONYM_GROUPS: string[][] = [
  ["karwa tel", "karva tel", "kadwa tel", "sarson", "sarson tel", "mustard oil", "kachhi ghani"],
  ["kaju katli", "kaju barfi", "cashew fudge", "mithai", "sweets"],
  ["biryani", "handi", "dum biryani", "rice"],
  ["atta", "aata", "chakki", "flour", "wheat"],
  ["dawai", "medicine", "tablet", "paracetamol", "dolo", "rx", "pharmacy"],
  ["doodh", "milk", "lassi", "paneer", "curd", "dahi", "dairy"],
  ["cheeni", "chini", "sugar"],
  ["dal", "arhar", "toor", "lentil"],
];

/**
 * Matches catalog items across name, category, description, and common transliterated pantry queries
 * (e.g. "karwa tel" -> Mustard Oil, "kaju katli", "biryani").
 */
export function matchesCatalogQuery(item: SuperAppCatalogItem, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  const haystack = `${item.name} ${item.category} ${item.description || ""}`.toLowerCase();
  if (haystack.includes(q)) return true;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((tok) => haystack.includes(tok))) {
    return true;
  }

  return SEARCH_SYNONYM_GROUPS.some((group) => {
    const queryMatchesGroup = group.some(
      (term) => q.includes(term) || (tokens.length === 1 && term.includes(q) && q.length >= 3),
    );
    if (!queryMatchesGroup) return false;
    return group.some((term) => haystack.includes(term));
  });
}

/**
 * Masks the 4-digit handover OTP for notification previews per EDR-05 (e.g. "4821" -> "**21").
 */
export function maskHandoverPin(pin: string | null | undefined): string {
  const digits = String(pin || "").replace(/\D/g, "");
  if (digits.length < 2) return "****";
  return `**${digits.slice(-2)}`;
}

export function calcDistanceKm(
  aLat?: number | null,
  aLng?: number | null,
  bLat?: number | null,
  bLng?: number | null,
): number {
  const lat1 = aLat ?? 27.5744;
  const lng1 = aLng ?? 81.5977;
  const lat2 = bLat ?? 27.5748;
  const lng2 = bLng ?? 81.5992;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.max(0.3, Math.round(2 * 6371 * Math.asin(Math.sqrt(s)) * 10) / 10);
}

export function estimateStoreEtaMinutes(
  store: SuperAppBusiness,
  userCoords: { lat: number; lng: number } | null,
): number {
  const km = calcDistanceKm(userCoords?.lat, userCoords?.lng, store.location_latitude, store.location_longitude);
  const basePrep = (store.type || "").toLowerCase().includes("kirana") ? 14 : 18;
  return Math.min(45, Math.max(15, Math.round(basePrep + km * 4)));
}

export function getStoreRating(storeId: string): string {
  let hash = 0;
  for (let i = 0; i < storeId.length; i++) {
    hash = (hash * 31 + storeId.charCodeAt(i)) % 10;
  }
  const tenths = 5 + (hash % 5); // 4.5 to 4.9
  return `4.${tenths}`;
}

export function isStoreCurrentlyOpen(): { isOpen: boolean; label: string; hours: string } {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 23) {
    return { isOpen: true, label: "Open Now", hours: "7:00 AM – 11:00 PM" };
  }
  return { isOpen: true, label: "Late Night", hours: "Open 24h Essential" };
}

export function matchesVertical(storeType: string, tab: VerticalTabId): boolean {
  const type = (storeType || "").toLowerCase();
  if (tab === "food") {
    return (
      type.includes("restaurant") ||
      type.includes("sweet") ||
      type.includes("fast food") ||
      type.includes("cafe") ||
      type.includes("bakery") ||
      type.includes("cake") ||
      type.includes("food") ||
      type.includes("dhaba") ||
      type.includes("pizza") ||
      type.includes("biryani")
    );
  }
  if (tab === "dairy") {
    return (
      type.includes("dairy") ||
      type.includes("milk") ||
      type.includes("doodh") ||
      type.includes("paneer") ||
      type.includes("ghee") ||
      type.includes("sweet")
    );
  }
  if (tab === "kirana" || tab === "parcha") {
    return (
      type.includes("supermarket") ||
      type.includes("grocery") ||
      type.includes("kirana") ||
      type.includes("mart") ||
      type.includes("ration") ||
      type.includes("retail") ||
      type.includes("store")
    );
  }
  if (tab === "medical") {
    return (
      type.includes("medical") ||
      type.includes("medicine") ||
      type.includes("pharmacy") ||
      type.includes("chemist") ||
      type.includes("clinic") ||
      type.includes("health") ||
      type.includes("hospital")
    );
  }
  if (tab === "car_wash") {
    return (
      type.includes("car wash") ||
      type.includes("automobile") ||
      type.includes("bike") ||
      type.includes("garage") ||
      type.includes("detailing")
    );
  }
  if (tab === "salon") {
    return (
      type.includes("salon") ||
      type.includes("parlour") ||
      type.includes("barber") ||
      type.includes("beauty") ||
      type.includes("grooming")
    );
  }
  return true;
}

export function getRestaurantThumbnail(name: string = ""): string {
  const n = name.toLowerCase();
  if (n.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("cake") || n.includes("bakery")) {
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("sweet") || n.includes("mithai") || n.includes("lassi")) {
    return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("biryani") || n.includes("chicken") || n.includes("awadh")) {
    return "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("dosa") || n.includes("south")) {
    return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("kirana") || n.includes("mart") || n.includes("retail")) {
    return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("chemist") || n.includes("medical") || n.includes("pharma")) {
    return "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("salon") || n.includes("hair")) {
    return "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("wash") || n.includes("auto")) {
    return "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80";
  }
  if (n.includes("cafe") || n.includes("coffee") || n.includes("queen") || n.includes("tea")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80";
}

export const DEFAULT_BAHRAICH_BUSINESSES: SuperAppBusiness[] = [
  {
    id: "biz-awadh-biryani",
    name: "Awadh Biryani & Family Restaurant",
    city: "Bahraich",
    type: "Restaurant",
    address: "Civil Lines, Near Dist Hospital, Bahraich",
    phone: "9415091234",
    location_latitude: 27.5744,
    location_longitude: 81.5977,
  },
  {
    id: "biz-brijwasi-sweets",
    name: "Brijwasi Sweets & Bakers",
    city: "Bahraich",
    type: "Bakery",
    address: "Chowk Bazar, Bahraich",
    phone: "9415091235",
    location_latitude: 27.5765,
    location_longitude: 81.6012,
  },
  {
    id: "biz-gupta-kirana",
    name: "Gupta Kirana & Supermart",
    city: "Bahraich",
    type: "Retail",
    address: "Ghanta Ghar, Main Market, Bahraich",
    phone: "9415091236",
    location_latitude: 27.5732,
    location_longitude: 81.5955,
  },
  {
    id: "biz-star-chemist",
    name: "Star Chemist & Healthcare",
    city: "Bahraich",
    type: "Chemist",
    address: "Medical College Road, Bahraich",
    phone: "9415091237",
    location_latitude: 27.5755,
    location_longitude: 81.5988,
  },
  {
    id: "biz-classic-salon",
    name: "Classic Men's & Women's Salon",
    city: "Bahraich",
    type: "Salon",
    address: "Station Road, Bahraich",
    phone: "9415091238",
    location_latitude: 27.5718,
    location_longitude: 81.6033,
  },
  {
    id: "biz-express-carwash",
    name: "Express Car Wash & Detailing Spa",
    city: "Bahraich",
    type: "Car Wash",
    address: "Lucknow Road Bypass, Bahraich",
    phone: "9415091239",
    location_latitude: 27.5689,
    location_longitude: 81.6055,
  },
];

export const DEFAULT_BAHRAICH_ITEMS: SuperAppCatalogItem[] = [
  {
    id: "item-awadh-1",
    business_id: "biz-awadh-biryani",
    name: "Special Dum Handi Veg Biryani",
    category: "Biryani & Rice",
    price: 140,
    item_type: "veg",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80",
    description: "Fragrant basmati rice cooked with fresh farm vegetables and Awadhi aromatic spices.",
  },
  {
    id: "item-awadh-2",
    business_id: "biz-awadh-biryani",
    name: "Hyderabadi Chicken Dum Biryani",
    category: "Biryani & Rice",
    price: 220,
    item_type: "non_veg",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80",
    description: "Tender chicken marinated overnight in rich spices and steamed with long grain basmati rice.",
  },
  {
    id: "item-awadh-3",
    business_id: "biz-awadh-biryani",
    name: "Paneer Butter Masala (Desi Ghee)",
    category: "Main Course",
    price: 180,
    item_type: "veg",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80",
    description: "Cottage cheese cubes tossed in rich velvety tomato makhani gravy.",
  },
  {
    id: "item-brij-1",
    business_id: "biz-brijwasi-sweets",
    name: "Hot Gulab Jamun (Desi Ghee, 2 Pcs)",
    category: "Sweets & Mithai",
    price: 60,
    item_type: "veg",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=300&auto=format&fit=crop&q=80",
    description: "Melt-in-mouth hot gulab jamun soaked in saffron sugar syrup.",
  },
  {
    id: "item-brij-2",
    business_id: "biz-brijwasi-sweets",
    name: "Kaju Katli Special (250g Box)",
    category: "Sweets & Mithai",
    price: 260,
    item_type: "veg",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80",
    description: "Premium diamond-cut cashew fudge made with real silver vark.",
  },
  {
    id: "item-brij-3",
    business_id: "biz-brijwasi-sweets",
    name: "Special Malai Lassi Kulhad (300ml)",
    category: "Dairy & Beverages",
    price: 50,
    item_type: "veg",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80",
    description: "Chilled creamy curd lassi topped with thick rabdi and dry fruits in earthen kulhad.",
  },
  {
    id: "item-gupta-1",
    business_id: "biz-gupta-kirana",
    name: "Fortune Chakki Fresh Atta (5 kg)",
    category: "Flours & Grains",
    price: 215,
    item_type: "product",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80",
    description: "100% whole wheat chakki fresh flour for soft rotis.",
  },
  {
    id: "item-gupta-2",
    business_id: "biz-gupta-kirana",
    name: "Mustard Oil Pouch (1 Litre)",
    category: "Cooking Oils",
    price: 165,
    item_type: "product",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=80",
    description: "Cold pressed kachhi ghani mustard oil for authentic Indian cooking.",
  },
  {
    id: "item-chemist-1",
    business_id: "biz-star-chemist",
    name: "Dolo 650mg Paracetamol Strip (15 Tabs)",
    category: "Medicines & Relief",
    price: 32,
    item_type: "product",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80",
    description: "Fever and mild to moderate pain relief tablets.",
  },
  {
    id: "item-salon-1",
    business_id: "biz-classic-salon",
    name: "Haircut, Styling & Beard Grooming",
    category: "Grooming & Styling",
    price: 150,
    item_type: "service",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&auto=format&fit=crop&q=80",
    description: "Executive hair trim, hot towel head wash, beard contouring & splash cologne.",
  },
  {
    id: "item-wash-1",
    business_id: "biz-express-carwash",
    name: "Snow Foam Pressure Car Wash",
    category: "Auto Wash Packages",
    price: 350,
    item_type: "service",
    is_available: true,
    image_url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=300&auto=format&fit=crop&q=80",
    description: "Exterior high-pressure underbody rinse, active pH snow foam wash, tyre polish and interior vacuuming.",
  },
];
