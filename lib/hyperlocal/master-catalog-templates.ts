/**
 * Category-Smart Pre-Seeded Master Catalog Templates
 * Reduces merchant onboarding time from 2 days to 2 minutes.
 * Items start with price: 0 (or null) and is_available: false (Draft state).
 * As soon as merchant types a rate (> 0) and switches ON, it goes live to customers!
 */

export type MasterCatalogTemplateItem = {
  name: string;
  category: string;
  itemType: "veg" | "non_veg" | "egg" | "service" | "product";
  unit: string;
  defaultPrice?: number;
  description: string;
};

export const KIRANA_MASTER_ITEMS: MasterCatalogTemplateItem[] = [
  // Detergents & Home Care
  { name: "Surf Excel Easy Wash Detergent Powder (1 Kg)", category: "Detergent & Home Care", itemType: "product", unit: "1 Kg", description: "Removes tough stains easily." },
  { name: "Rin Advanced Detergent Bar (250g)", category: "Detergent & Home Care", itemType: "product", unit: "250g", description: "Bright and white clothes bar." },
  { name: "Ghari Detergent Powder (1 Kg)", category: "Detergent & Home Care", itemType: "product", unit: "1 Kg", description: "Pehle istemaal karein phir vishwas karein." },
  { name: "Dettol Original Bathing Soap (75g)", category: "Personal Care", itemType: "product", unit: "75g", description: "Germ protection bathing soap." },
  { name: "Lux Velvet Glow Soap (100g)", category: "Personal Care", itemType: "product", unit: "100g", description: "Rose and almond oil fragrant soap." },

  // Oral Care
  { name: "Colgate Strong Teeth Toothpaste (100g)", category: "Oral Care", itemType: "product", unit: "100g", description: "Calcium boost cavity protection." },
  { name: "Dabur Red Ayurvedic Toothpaste / Manjan (100g)", category: "Oral Care", itemType: "product", unit: "100g", description: "Traditional clove and herbal protection." },
  { name: "Oral-B Classic Toothbrush", category: "Oral Care", itemType: "product", unit: "1 Pc", description: "Soft bristle deep cleaning brush." },

  // Dry Fruits & Nuts
  { name: "Kaju / Whole Cashews (250g)", category: "Dry Fruits & Nuts", itemType: "product", unit: "250g", description: "Premium crunchy whole cashews." },
  { name: "Badam / California Almonds (250g)", category: "Dry Fruits & Nuts", itemType: "product", unit: "250g", description: "Crisp and nutritious almonds." },
  { name: "Kishmish / Sweet Raisins (250g)", category: "Dry Fruits & Nuts", itemType: "product", unit: "250g", description: "Golden juicy dried raisins." },
  { name: "Phool Makhana / Fox Nuts (100g)", category: "Dry Fruits & Nuts", itemType: "product", unit: "100g", description: "Light and healthy roasted fox nuts." },

  // Kitchen Staples, Grains & Oils
  { name: "Aashirvaad Shudh Chakki Atta (10 Kg)", category: "Flour & Grains", itemType: "product", unit: "10 Kg", description: "100% whole wheat chakki ground flour." },
  { name: "Fortune Kachi Ghani Mustard Oil (1 Litre)", category: "Edible Oils & Ghee", itemType: "product", unit: "1 Litre", description: "Pure pungent mustard oil for cooking." },
  { name: "Fortune Sunlite Refined Sunflower Oil (1 Litre)", category: "Edible Oils & Ghee", itemType: "product", unit: "1 Litre", description: "Light and healthy refined cooking oil." },
  { name: "Arhar / Toor Dal (1 Kg)", category: "Pulses & Dal", itemType: "product", unit: "1 Kg", description: "Unpolished, high-protein toor dal." },
  { name: "Moong Dal Dhuli (1 Kg)", category: "Pulses & Dal", itemType: "product", unit: "1 Kg", description: "Quick-cooking healthy yellow moong dal." },
  { name: "Basmati Rice Rozana (1 Kg)", category: "Rice & Grains", itemType: "product", unit: "1 Kg", description: "Long-grain aromatic everyday rice." },
  { name: "Tata Salt / Namak (1 Kg)", category: "Spices & Seasoning", itemType: "product", unit: "1 Kg", description: "Iodized vacuum evaporated salt." },
  { name: "Refined Pure Sugar / Cheeni (1 Kg)", category: "Sugar & Sweeteners", itemType: "product", unit: "1 Kg", description: "Clean sparkling crystal sugar." },

  // Instant Snacks & Beverages
  { name: "Maggi 2-Minute Noodles (4-Pack)", category: "Snacks & Instant Food", itemType: "product", unit: "Pack of 4", description: "India's favorite masala noodles." },
  { name: "Parle-G Glucose Biscuits (Pack of 2)", category: "Snacks & Instant Food", itemType: "product", unit: "2 Packs", description: "Classic tea-time energy biscuits." },
  { name: "Britannia Good Day Cashew Cookies", category: "Snacks & Instant Food", itemType: "product", unit: "1 Pack", description: "Rich butter cashew butter cookies." },
  { name: "Brooke Bond Red Label Tea (250g)", category: "Tea & Coffee", itemType: "product", unit: "250g", description: "Rich taste and color chai patti." },
];

export const DAIRY_MASTER_ITEMS: MasterCatalogTemplateItem[] = [
  { name: "Fresh Buffalo Milk (1 Litre)", category: "Fresh Milk", itemType: "veg", unit: "1 Litre", description: "Pure farm fresh thick buffalo milk, tested for purity." },
  { name: "Fresh Cow Milk (1 Litre)", category: "Fresh Milk", itemType: "veg", unit: "1 Litre", description: "Nutritious light A2 cow milk directly from local dairy." },
  { name: "Fresh Malai Paneer (250g)", category: "Dairy Products", itemType: "veg", unit: "250g", description: "Soft, spongy malai cottage cheese." },
  { name: "Fresh Malai Paneer (500g)", category: "Dairy Products", itemType: "veg", unit: "500g", description: "Half-kilo soft malai paneer." },
  { name: "Safal Frozen Green Peas (500g)", category: "Frozen & Ready", itemType: "veg", unit: "500g", description: "Sweet, garden-fresh frozen green peas." },
  { name: "Safal Frozen Green Peas (1 Kg)", category: "Frozen & Ready", itemType: "veg", unit: "1 Kg", description: "Full kilo sweet green peas." },
  { name: "Fresh Table Butter (100g)", category: "Butter & Spreads", itemType: "veg", unit: "100g", description: "Creamy salted table butter." },
  { name: "Thick Sweet Dahi / Curd (500g)", category: "Dairy Products", itemType: "veg", unit: "500g", description: "Creamy set curd in hygienic earthen container." },
  { name: "Pure Desi Danedar Ghee (1 Kg)", category: "Ghee & Fats", itemType: "veg", unit: "1 Kg", description: "Traditional aroma authentic bilona ghee." },
  { name: "Rich Fresh Cream (200g)", category: "Dairy Products", itemType: "veg", unit: "200g", description: "Thick malai cream for culinary dishes." },
  { name: "Vanilla / Chocolate Ice Cream Cup (100ml)", category: "Ice Creams & Sweets", itemType: "veg", unit: "1 Cup", description: "Chilled delightful ice cream dessert." },
];

export const SALON_MASTER_ITEMS: MasterCatalogTemplateItem[] = [
  { name: "Classic Haircut & Styling", category: "Hair Services", itemType: "service", unit: "Per Session", description: "Consultation, scissor work, styling & finishing." },
  { name: "Beard Trim & Razor Line Shaping", category: "Beard & Shave", itemType: "service", unit: "Per Session", description: "Precision trimmer shaping with aftershave lotion." },
  { name: "Classic Shave & Hot Towel Therapy", category: "Beard & Shave", itemType: "service", unit: "Per Session", description: "Smooth glide blade shave with soothing warm towel." },
  { name: "Head Oil Massage (15 Mins)", category: "Massage & Relaxation", itemType: "service", unit: "15 Mins", description: "Relaxing herbal oil head, neck, and shoulder massage." },
  { name: "De-Tan Facial Clean-Up", category: "Skin & Facials", itemType: "service", unit: "Per Session", description: "Instant glow face scrub, tan removal & steam pack." },
  { name: "Hair Spa & Scalp Conditioning", category: "Hair Services", itemType: "service", unit: "Per Session", description: "Deep conditioning cream massage with hair steam." },
  { name: "Herbal Hair Color / Mehndi Application", category: "Color & Highlights", itemType: "service", unit: "Per Session", description: "Natural ammonia-free black/brown hair coloring." },
];

export const CAR_WASH_MASTER_ITEMS: MasterCatalogTemplateItem[] = [
  { name: "Express High-Pressure Foam Wash (Car)", category: "Car Wash", itemType: "service", unit: "Per Car", description: "High-pressure snow foam wash, underbody rinse & microfiber wipe." },
  { name: "Two-Wheeler / Bike Pressure Wash & Dry", category: "Bike Wash", itemType: "service", unit: "Per Bike", description: "Degreaser chain spray, engine jet wash, foam wash & air-dry." },
  { name: "Interior Deep Vacuuming & Dashboard Polish", category: "Interior Care", itemType: "service", unit: "Per Car", description: "High-suction seat vacuum, floor mat scrub & UV dashboard gloss." },
  { name: "Full Auto Detailing & Underbody Anti-Rust Wash", category: "Detailing Packages", itemType: "service", unit: "Per Car", description: "Comprehensive foam, interior vacuum, tire gloss, and underbody jet." },
  { name: "Teflon Coating / Paint Wax Polish", category: "Paint Protection", itemType: "service", unit: "Per Car", description: "Hand-buffed mirror finish protective wax glaze." },
];

export function getMasterCatalogForCategory(businessType: string): MasterCatalogTemplateItem[] {
  const norm = String(businessType || "").toLowerCase();

  if (/(kirana|grocery|supermarket|mart|ration|provision)/.test(norm)) {
    return KIRANA_MASTER_ITEMS;
  }
  if (/(dairy|milk|paneer|dudh)/.test(norm)) {
    return DAIRY_MASTER_ITEMS;
  }
  if (/(salon|barber|parlour|grooming|hair|spa)/.test(norm)) {
    return SALON_MASTER_ITEMS;
  }
  if (/(car|wash|automobile|auto|garage|detailing|bike)/.test(norm)) {
    return CAR_WASH_MASTER_ITEMS;
  }
  // Restaurants/cafes handle custom menus
  return [];
}
