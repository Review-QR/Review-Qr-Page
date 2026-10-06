import { BUSINESS_TYPES, type BusinessType } from "../business-types.ts";
import { qrTemplateIds, type QrTemplateId } from "../../app/merchant/dashboard/qr/templates.ts";

export const QR_DESIGN_PROMPT_VERSION = "qr-design-v1";

export type QrArtworkKind = "food" | "hotel" | "laundry" | "retail" | "salon" | "universal";

type ThemeDefinition = {
  id: string;
  label: string;
  keywords: readonly string[];
  palette: readonly [string, string, string];
  artKind: QrArtworkKind;
  posterLabel: string;
  posterMessage: string;
  scenes: readonly [string, string, string, string, string];
};

const themes = [
  {
    id: "bakery-sweets", label: "Sweets & Bakery", keywords: ["sweet", "mithai", "sweets", "bakery", "cake", "dessert"],
    palette: ["#7d2946", "#ed9b4c", "#f7d987"], artKind: "food", posterLabel: "Sweet Shop · Sweets & Treats", posterMessage: "Loved our sweets? Tell us about your experience.",
    scenes: ["an elegant assortment of Indian mithai in a premium display", "festive sweets arranged with warm marigold-inspired color and soft light", "a refined mithai gifting box with delicate sweets and ribbon-like shapes", "a welcoming sweets counter with beautifully presented treats", "a celebratory dessert table with premium Indian sweets and warm sparkle"]
  },
  {
    id: "fast-food", label: "Fast Food", keywords: ["fast food", "burger", "pizza", "qsr", "quick service", "food truck", "sandwich"],
    palette: ["#b43b21", "#f29b38", "#f6d56c"], artKind: "food", posterLabel: "Fast Food · Quick Bites", posterMessage: "How was your meal? Share your honest feedback.",
    scenes: ["a freshly stacked burger and crisp fries in a lively premium food composition", "a golden pizza slice with fresh toppings and warm oven glow", "a neatly wrapped toasted sandwich with colorful fresh ingredients", "a welcoming quick-service counter with appetizing food presentation", "a cheerful fast-food meal spread with fries, burger, and a cold drink"]
  },
  {
    id: "cafe", label: "Cafe & Coffee", keywords: ["cafe", "cafeteria", "coffee shop"],
    palette: ["#573a2c", "#c98756", "#f0d7b0"], artKind: "food", posterLabel: "Cafe · Coffee & Conversation", posterMessage: "Loved your visit? Tell us how we did.",
    scenes: ["a carefully poured cappuccino beside a small pastry in soft morning light", "a cozy cafe table with coffee, a croissant, and gentle window light", "a premium coffee bean and brewing ritual composition", "a welcoming cafe counter with cups and fresh baked treats", "an inviting evening cafe scene with warm lights and a shared coffee table"]
  },
  {
    id: "restaurant", label: "Restaurant & Dining", keywords: ["restaurant", "food", "dining", "dhaba", "catering", "bistro"],
    palette: ["#75401f", "#d78d43", "#f4dfbd"], artKind: "food", posterLabel: "Restaurant · Dining", posterMessage: "Loved your meal? Tell us how we did.",
    scenes: ["a beautifully plated signature meal on an elegant table", "fresh ingredients and a chef-prepared dish in warm restaurant lighting", "a shared family-style meal with appetizing dishes and refined tableware", "a welcoming restaurant table setting with a plated specialty", "a celebratory dining table with tasteful food presentation and soft candlelight"]
  },
  {
    id: "hospitality", label: "Hotel & Stay", keywords: ["hotel", "stay", "resort", "guest house", "homestay", "lodge", "hospitality"],
    palette: ["#234c59", "#579b9a", "#dfc58f"], artKind: "hotel", posterLabel: "Hotel · Stay · Hospitality", posterMessage: "Thank you for staying with us. How was your visit?",
    scenes: ["a calm premium guest room with crisp linens and soft natural light", "a welcoming hotel lobby with elegant seating and warm hospitality", "a serene resort balcony opening to a relaxing landscape", "a thoughtfully prepared guest room with tasteful bedside details", "a relaxing hotel lounge with ambient evening light and comfortable seating"]
  },
  {
    id: "beauty", label: "Salon & Beauty", keywords: ["salon", "beauty parlour", "beauty parlor", "spa", "barber", "hair"],
    palette: ["#77445f", "#d38a9d", "#f4d6d3"], artKind: "salon", posterLabel: "Salon · Beauty · Care", posterMessage: "Loved your new look? We’d love your honest feedback.",
    scenes: ["a polished salon styling station with mirror and softly arranged tools", "a serene self-care spa scene with folded towels and botanical accents", "a premium beauty product arrangement in gentle rose lighting", "a contemporary barber chair and grooming tools in a tidy studio", "a calming salon interior with comfortable seating and soft ambient light"]
  },
  {
    id: "retail", label: "Retail & Shopping", keywords: ["retail", "shop", "store", "clothing", "footwear", "electronics", "mobile", "accessories", "hardware", "book store", "stationery"],
    palette: ["#284f52", "#5b9c8b", "#e4c47d"], artKind: "retail", posterLabel: "Retail · Shop Local", posterMessage: "Thanks for shopping with us. Tell us about your experience.",
    scenes: ["a curated collection of useful products displayed in a modern boutique", "a premium clothing rail with thoughtfully styled garments", "a product discovery table with accessories arranged in warm natural light", "a welcoming storefront display with a few elegant products", "a lifestyle shopping scene with carefully curated items and soft highlights"]
  },
  {
    id: "grocery", label: "Grocery & Market", keywords: ["grocery", "supermarket", "market"],
    palette: ["#416540", "#86a84c", "#f0ca72"], artKind: "retail", posterLabel: "Grocery · Fresh Finds", posterMessage: "Thanks for shopping with us. Share your experience.",
    scenes: ["fresh seasonal produce arranged in a bright neighborhood market display", "colorful fruits and vegetables with a clean market-counter presentation", "a tidy grocery basket with fresh produce and pantry staples", "a welcoming local grocery aisle with carefully arranged goods", "a fresh market table with produce, herbs, and warm morning light"]
  },
  {
    id: "healthcare", label: "Medical & Healthcare", keywords: ["clinic", "medical", "diagnostic", "dental", "optical", "doctor", "healthcare", "health"],
    palette: ["#24616b", "#58aaa6", "#d9f0e9"], artKind: "universal", posterLabel: "Healthcare · Patient Care", posterMessage: "Thank you for visiting. Tell us about your experience.",
    scenes: ["a calm modern clinic reception with clean surfaces and daylight", "a reassuring healthcare consultation room with comfortable seating", "a bright dental care space with carefully arranged clinical tools", "a peaceful optical care studio with neatly displayed frames", "a welcoming patient-care environment with gentle green accents"]
  },
  {
    id: "pharmacy", label: "Pharmacy", keywords: ["pharmacy", "medical store"],
    palette: ["#27636a", "#6aada0", "#d9eebc"], artKind: "retail", posterLabel: "Pharmacy · Everyday Care", posterMessage: "Thank you for choosing us. Share your experience.",
    scenes: ["a clean pharmacy counter with neatly arranged wellness essentials", "organized medicine shelves in a bright trusted neighborhood pharmacy", "a pharmacist consultation counter with calm, reassuring colors", "a tidy health and wellness display with clear uncluttered surfaces", "a welcoming pharmacy interior with fresh green accents and soft light"]
  },
  {
    id: "fitness", label: "Fitness & Wellness", keywords: ["gym", "fitness", "yoga"],
    palette: ["#315846", "#78a878", "#d7cc88"], artKind: "universal", posterLabel: "Fitness · Wellness", posterMessage: "How was your session? Share your honest feedback.",
    scenes: ["a sunlit yoga studio with neatly arranged mats and calm greenery", "a modern fitness studio with clean equipment and energetic warm light", "a peaceful wellness space with mats, plants, and open floor area", "a focused training corner with weights arranged neatly", "a restorative wellness room with soft natural light and a tranquil atmosphere"]
  },
  {
    id: "laundry", label: "Laundry & Care", keywords: ["laundry", "dry cleaning", "cleaning", "wash"],
    palette: ["#3d7185", "#77bfd0", "#e1f2f3"], artKind: "laundry", posterLabel: "Laundry · Fresh Care", posterMessage: "Fresh clothes, fresh feedback. Share your experience.",
    scenes: ["freshly folded laundry arranged in a bright clean setting", "a modern washing machine and soft flowing fabric in cool blue light", "carefully pressed garments on hangers in a tidy service studio", "a clean laundry counter with folded linens and gentle daylight", "fresh white linens with a crisp airy feeling and soft blue accents"]
  },
  {
    id: "automotive", label: "Automotive Services", keywords: ["automobile", "garage", "car wash", "bike service", "auto service"],
    palette: ["#344a5f", "#5c91ad", "#e2b968"], artKind: "universal", posterLabel: "Automotive · Service & Care", posterMessage: "Thanks for visiting. Tell us about your experience.",
    scenes: ["a spotless vehicle service bay with tools arranged neatly", "a freshly cleaned car in a bright professional wash setting", "a motorcycle service station with carefully placed tools", "a modern automotive workshop with clean organized equipment", "a customer-ready service counter beside a polished vehicle detail"]
  },
  {
    id: "library", label: "Library & Books", keywords: ["library", "book store", "stationery"],
    palette: ["#574338", "#ad8052", "#f0dfb9"], artKind: "retail", posterLabel: "Books · Learning & Discovery", posterMessage: "Found something you loved? Share your experience.",
    scenes: ["a welcoming library reading table with stacked books and warm light", "a refined bookshop shelf with colorful book spines and a quiet reading nook", "an open book beside reading glasses on a calm wooden desk", "a tidy stationery display with notebooks and pens in a bright shop", "a cozy library corner with comfortable seating and curated books"]
  },
  {
    id: "education", label: "Education & Learning", keywords: ["school", "coaching", "computer institute", "education", "training"],
    palette: ["#29486a", "#4d88b7", "#f0cd76"], artKind: "universal", posterLabel: "Learning · Education", posterMessage: "Thank you for being with us. Share your experience.",
    scenes: ["a bright classroom with desks arranged neatly and sunlight through windows", "a focused study desk with books and a laptop in soft blue light", "a modern learning space with a whiteboard and organized materials", "a welcoming training room with clean rows of comfortable seats", "a quiet study area with books, notes, and warm afternoon light"]
  },
  {
    id: "travel", label: "Travel & Tours", keywords: ["travel agency", "travel", "tour", "holiday"],
    palette: ["#28646d", "#5db3b0", "#f0c477"], artKind: "hotel", posterLabel: "Travel · Explore More", posterMessage: "Thanks for planning with us. Tell us how we did.",
    scenes: ["a calm coastal destination with a small suitcase and travel essentials", "a scenic mountain getaway with a welcoming lodge in soft morning light", "a curated travel-planning desk with map shapes and a passport-like journal", "a relaxing resort poolside scene with gentle blue and sandy tones", "a memorable journey atmosphere with a train-window landscape and warm light"]
  },
  {
    id: "professional-services", label: "Professional Services", keywords: ["professional", "real estate", "financial", "insurance", "repair services"],
    palette: ["#3d4d61", "#73879b", "#d9c48e"], artKind: "universal", posterLabel: "Professional Service", posterMessage: "Thank you for choosing us. Share your feedback.",
    scenes: ["a bright professional reception area with simple modern furnishings", "a thoughtful consultation across a clean desk in natural daylight", "a contemporary property interior with welcoming light and neutral styling", "an organized service workspace with tasteful professional details", "a calm client meeting space with comfortable chairs and warm accents"]
  },
  {
    id: "pet-care", label: "Pet Care", keywords: ["pet care", "pet", "veterinary", "vet"],
    palette: ["#6b6041", "#b79c5e", "#e7d9aa"], artKind: "universal", posterLabel: "Pet Care · Happy Visits", posterMessage: "Thank you for caring with us. Share your experience.",
    scenes: ["a cheerful pet-care reception with a water bowl and soft natural light", "a playful dog toy and grooming brush arranged in a tidy studio", "a calm veterinary consultation space with welcoming colors", "a cozy pet grooming station with towels and gentle warm light", "a happy pet resting beside a neat collection of care essentials"]
  },
  {
    id: "photography", label: "Photography", keywords: ["photography", "photo studio", "photographer"],
    palette: ["#394654", "#8a7890", "#e3c48a"], artKind: "universal", posterLabel: "Photography · Moments Captured", posterMessage: "Thanks for making memories with us. Share your feedback.",
    scenes: ["a professional camera and lens on a softly lit studio table", "a bright portrait studio with a clean backdrop and gentle light", "a camera capturing a scenic landscape at golden hour", "a tasteful photo album and prints arranged on a warm surface", "a creative photography studio with softboxes and elegant neutral tones"]
  },
  {
    id: "events", label: "Events & Celebrations", keywords: ["event services", "event", "celebration", "party"],
    palette: ["#713b61", "#d987a3", "#f4d184"], artKind: "universal", posterLabel: "Events · Moments Together", posterMessage: "Thanks for celebrating with us. Share your experience.",
    scenes: ["an elegant event table with tasteful flowers and warm candlelight", "a festive celebration venue with soft lights and refined decor", "a beautifully arranged event centerpiece with subtle gold accents", "a welcoming gathering space with floral details and gentle light", "a joyful celebration atmosphere with tasteful confetti-like shapes and warm color"]
  },
  {
    id: "universal", label: "Universal", keywords: [],
    palette: ["#3e5266", "#7796a4", "#e4cc93"], artKind: "universal", posterLabel: "Customer Experience", posterMessage: "Thank you for visiting us. We’d love your feedback.",
    scenes: ["a welcoming local business interior with warm natural materials", "a thoughtful customer moment in a bright and calm setting", "a refined arrangement of everyday objects with gentle ambient light", "a clean welcoming counter with subtle botanical details", "a calm premium atmosphere with soft light and a few elegant accents"]
  }
] as const satisfies readonly ThemeDefinition[];

export type BusinessThemeId = (typeof themes)[number]["id"];
export type BusinessTheme = (typeof themes)[number];

export const businessThemes = themes;
export const supportedBusinessTypes: readonly BusinessType[] = BUSINESS_TYPES;

export function normalizeBusinessType(value: string | null | undefined): string {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

export function resolveBusinessTheme(value: string | null | undefined): BusinessTheme {
  const normalized = normalizeBusinessType(value);
  const themeIdMatch = themes.find((theme) => normalizeBusinessType(theme.id) === normalized);
  if (themeIdMatch) return themeIdMatch;
  const words = ` ${normalized} `;
  const match = themes
    .flatMap((theme) => theme.keywords
      .filter((keyword) => words.includes(` ${normalizeBusinessType(keyword)} `))
      .map((keyword) => ({ theme, specificity: normalizeBusinessType(keyword).length })))
    .sort((a, b) => b.specificity - a.specificity)[0];
  return match?.theme ?? themes.find((theme) => theme.id === "universal")!;
}

const experienceNames: Record<QrTemplateId, string> = {
  template_1: "Classic portrait experience",
  template_2: "Elegant portrait experience",
  template_3: "Fresh portrait experience",
  template_4: "Local landscape experience",
  template_5: "Modern landscape experience",
};

const compositionSafety = "Premium, polished illustration suitable for a Trustit QR poster background. Keep a calm clean scan-safe region across the lower-right third, with low visual detail and strong quiet space. Do not draw a QR code or any machine-readable pattern. No logos, watermarks, business names, lettering, fake signage, UI screenshots, or clutter. Keep the subject away from the reserved scan-safe region.";

export type QrVisualPrompt = {
  themeId: BusinessThemeId;
  templateId: QrTemplateId;
  experience: string;
  promptVersion: string;
  prompt: string;
};

export function getThemeVisualPrompts(value: string | null | undefined): QrVisualPrompt[] {
  const theme = resolveBusinessTheme(value);
  return qrTemplateIds.map((templateId, index) => ({
    themeId: theme.id,
    templateId,
    experience: experienceNames[templateId],
    promptVersion: QR_DESIGN_PROMPT_VERSION,
    prompt: `${theme.label} visual direction: ${theme.scenes[index]}. Variation ${index + 1} of five: ${experienceNames[templateId]}. Use a distinct composition while staying within this theme's palette (${theme.palette.join(", ")}). ${compositionSafety}`,
  }));
}
