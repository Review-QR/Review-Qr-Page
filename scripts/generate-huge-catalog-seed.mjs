import fs from "node:fs";

const businesses = JSON.parse(fs.readFileSync("scripts/new_businesses.json", "utf8"));

let sql = `-- Migration / Seed: Huge Bahraich Local Commerce Dataset
-- Adds 38 new verified businesses across 8 major categories and 200+ authentic catalog items
BEGIN;

`;

// 1. Insert Businesses
for (const b of businesses) {
  const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-bahraich";
  sql += `
INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  '${b.id}',
  '${b.name.replace(/'/g, "''")}',
  '${b.owner.replace(/'/g, "''")}',
  '${b.phone}',
  '${b.type}',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  '${b.address.replace(/'/g, "''")}',
  '${b.locality.replace(/'/g, "''")}',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  ${b.latitude},
  ${b.longitude},
  now(),
  now(),
  'admin_reviewed',
  'active',
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE - INTERVAL '60 days',
  now() - INTERVAL '60 days',
  'template_1'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  address = EXCLUDED.address,
  locality = EXCLUDED.locality,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  pincode = EXCLUDED.pincode,
  discovery_location_verified_at = now(),
  merchant_status = 'active';

INSERT INTO public.business_public_slugs (business_id, slug)
VALUES ('${b.id}', '${slug}')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;
`;
}

// 2. Define Catalog Items by Business Type
const ITEMS_BY_TYPE = {
  "Grocery Store": [
    { name: "Surf Excel Quick Wash Detergent Powder", category: "Detergent & Cleaning", price: 140, unit: "1kg", item_type: "product", desc: "Top detergent powder for bright and stain-free clothes" },
    { name: "Ariel Matic Top Load Detergent Powder", category: "Detergent & Cleaning", price: 195, unit: "1kg", item_type: "product", desc: "Tough stain removal in 1 wash for washing machines" },
    { name: "Tide Plus Double Power Detergent", category: "Detergent & Cleaning", price: 110, unit: "1kg", item_type: "product", desc: "Extra power lemon and mint freshness for everyday wash" },
    { name: "Ghadi Detergent Powder", category: "Detergent & Cleaning", price: 65, unit: "1kg", item_type: "product", desc: "Pehle istemaal karein phir vishwas karein - budget detergent" },
    { name: "Rin Advanced Detergent Bar", category: "Detergent & Cleaning", price: 25, unit: "250g", item_type: "product", desc: "Detergent cake for sparkling bright white clothes" },
    { name: "Surf Excel Easy Wash Detergent", category: "Detergent & Cleaning", price: 75, unit: "500g", item_type: "product", desc: "Quick lather wash detergent powder" },
    { name: "Fortune Kachi Ghani Mustard Oil", category: "Oils & Ghee", price: 145, unit: "1L", item_type: "product", desc: "100% pure cold-pressed sarson tel" },
    { name: "Amul Pure Desi Ghee", category: "Oils & Ghee", price: 620, unit: "1L", item_type: "product", desc: "Pure cow and buffalo milk desi ghee" },
    { name: "Aashirvaad Shudh Chakki Atta", category: "Flours & Grains", price: 410, unit: "10kg", item_type: "product", desc: "100% whole wheat chakki ground atta" },
    { name: "India Gate Basmati Rice Feast Rozzana", category: "Rice & Pulses", price: 480, unit: "5kg", item_type: "product", desc: "Aromatic long grain basmati rice" },
    { name: "Tata Tea Gold", category: "Tea & Beverages", price: 280, unit: "500g", item_type: "product", desc: "Rich taste with gently rolled long leaves" },
    { name: "Maggi 2-Minute Masala Noodles", category: "Snacks", price: 56, unit: "Pack of 4", item_type: "product", desc: "Favorite instant masala noodles" },
    { name: "Dettol Original Bathing Soap", category: "Personal Care", price: 160, unit: "Pack of 4", item_type: "product", desc: "Antibacterial germ protection soap" },
    { name: "Vim Dishwash Gel Lemon", category: "Detergent & Cleaning", price: 105, unit: "500ml", item_type: "product", desc: "Cuts tough grease easily with real lemon juice" },
  ],
  "Supermarket": [
    { name: "Surf Excel Matic Front Load Liquid", category: "Detergent & Cleaning", price: 230, unit: "1L", item_type: "product", desc: "Smart liquid detergent for automatic washing machines" },
    { name: "Ariel Complete Detergent Powder", category: "Detergent & Cleaning", price: 190, unit: "1kg", item_type: "product", desc: "Bright white wash and color protection" },
    { name: "Tide Plus Extra Power Detergent", category: "Detergent & Cleaning", price: 215, unit: "2kg", item_type: "product", desc: "Double power stain removal" },
    { name: "Surf Excel Bar", category: "Detergent & Cleaning", price: 35, unit: "200g", item_type: "product", desc: "Power stain removal detergent soap" },
    { name: "Fortune Sunlite Refined Sunflower Oil", category: "Oils & Ghee", price: 135, unit: "1L", item_type: "product", desc: "Light and healthy cooking oil" },
    { name: "Amul Butter Pasteurised", category: "Dairy", price: 58, unit: "100g", item_type: "product", desc: "Utterly butterly delicious Amul butter" },
    { name: "Aashirvaad Select Sharbati Atta", category: "Flours & Grains", price: 290, unit: "5kg", item_type: "product", desc: "Made from 100% MP Sharbati wheat" },
    { name: "Tata Salt Vacuum Evaporated", category: "Spices & Seasoning", price: 28, unit: "1kg", item_type: "product", desc: "Desh ka namak with iodine" },
    { name: "Harpic Power Plus Disinfectant", category: "Detergent & Cleaning", price: 180, unit: "1L", item_type: "product", desc: "10x better stain removal toilet cleaner" },
    { name: "Colin Glass and Surface Cleaner", category: "Detergent & Cleaning", price: 110, unit: "500ml", item_type: "product", desc: "Shine boost cleaner for glass, mirrors and cars" },
  ],
  "Pharmacy": [
    { name: "Dolo 650 Paracetamol Tablets", category: "Fever & Pain", price: 30, unit: "Strip of 15", item_type: "product", desc: "Relief from fever, headache and body pain" },
    { name: "Volini Pain Relief Spray", category: "Pain Relief", price: 160, unit: "55g", item_type: "product", desc: "Instant relief from joint, back and neck pain" },
    { name: "Crocin Advance Fast Relief", category: "Fever & Pain", price: 25, unit: "Strip of 15", item_type: "product", desc: "Fast absorbing paracetamol tablet" },
    { name: "D-Cold Total Cold & Cough", category: "Cold & Cough", price: 55, unit: "Strip of 10", item_type: "product", desc: "Fast relief from blocked nose, headache and cold" },
    { name: "Electral ORS Powder", category: "Energy & Hydration", price: 22, unit: "21.8g Sachet", item_type: "product", desc: "WHO recommended formula for dehydration" },
    { name: "Hansaplast Waterproof Bandage", category: "First Aid", price: 35, unit: "Pack of 10", item_type: "product", desc: "Antiseptic medicated adhesive wound plaster" },
    { name: "Dettol Antiseptic Liquid", category: "First Aid", price: 140, unit: "250ml", item_type: "product", desc: "First aid disinfectant and sanitizer" },
  ],
  "Medical Store": [
    { name: "Paracetamol 500mg Tablets", category: "General Medicine", price: 18, unit: "Strip of 10", item_type: "product", desc: "Affordable generic fever and pain tablet" },
    { name: "Moov Pain Relief Ointment", category: "Pain Relief", price: 135, unit: "50g", item_type: "product", desc: "100% ayurvedic back pain relief cream" },
    { name: "Cetrizine Anti-Allergy Tablets", category: "Allergy", price: 20, unit: "Strip of 10", item_type: "product", desc: "Relief from runny nose, sneezing and itching" },
    { name: "Omeprazole 20mg Capsules", category: "Gastric & Acidity", price: 45, unit: "Strip of 15", item_type: "product", desc: "Relief from acidity, heartburn and gas" },
    { name: "Cotton Crepe Bandage", category: "First Aid", price: 85, unit: "1 Roll", item_type: "product", desc: "Support for muscle sprains and strains" },
  ],
  "Mobile & Accessories": [
    { name: "Boat BassHeads 100 Wired Earphones", category: "Audio", price: 399, unit: "piece", item_type: "product", desc: "Super extra bass in-ear earphones with mic" },
    { name: "Realme 65W SuperDart Fast Charger with Cable", category: "Chargers", price: 899, unit: "piece", item_type: "product", desc: "Ultra-fast Type-C charging adapter" },
    { name: "Ambrane 10000mAh Power Bank 20W Fast Charge", category: "Accessories", price: 999, unit: "piece", item_type: "product", desc: "Dual USB output with Type-C input" },
    { name: "9H Gorilla Tempered Glass Screen Guard", category: "Screen Guards", price: 99, unit: "piece", item_type: "product", desc: "Scratch-resistant edge-to-edge screen protector" },
    { name: "Boat Stone 190 Portable Bluetooth Speaker", category: "Audio", price: 999, unit: "piece", item_type: "product", desc: "5W wireless speaker with deep bass" },
    { name: "Fast Type-C Braided Data Cable", category: "Cables", price: 149, unit: "piece", item_type: "product", desc: "Unbreakable 1 meter fast charging cable" },
  ],
  "Electronics Store": [
    { name: "Bajaj 1000W Dry Iron Press", category: "Home Appliances", price: 749, unit: "piece", item_type: "product", desc: "Non-stick coating with 2 year warranty" },
    { name: "Syska 9W LED Bulb (Cool White)", category: "Lighting", price: 85, unit: "piece", item_type: "product", desc: "Energy saving long-life LED lamp" },
    { name: "Havells 4-Way Extension Board with Surge Protector", category: "Electricals", price: 420, unit: "piece", item_type: "product", desc: "Heavy duty copper wire with safety shutter" },
    { name: "Crompton 1200mm High Speed Ceiling Fan", category: "Fans", price: 1650, unit: "piece", item_type: "product", desc: "Rust-free aluminum blades high air delivery" },
    { name: "Philips Beard Trimmer BT1232", category: "Personal Care", price: 899, unit: "piece", item_type: "product", desc: "USB charging stainless steel blades trimmer" },
  ],
  "Automobile Garage": [
    { name: "MRF ZVTS 165/80 R14 Car Tyre", category: "Tyres", price: 3850, unit: "piece", item_type: "product", desc: "Long tread life all-season radial tyre" },
    { name: "Computerized 3D Wheel Alignment & Balancing", category: "Services", price: 350, unit: "car", item_type: "service", desc: "Precision sensor steering alignment check" },
    { name: "Tubeless Tyre Puncture Repair", category: "Tyres", price: 70, unit: "puncture", item_type: "service", desc: "Fast cold patch tubeless puncture repair" },
    { name: "Complete Car Engine Oil Flush & Change", category: "Servicing", price: 1450, unit: "service", item_type: "service", desc: "Synthetic engine oil replacement with filter" },
  ],
  "Bike Service": [
    { name: "Castrol Activ 4T 20W-40 Motorcycle Engine Oil", category: "Lubricants", price: 380, unit: "1L", item_type: "product", desc: "Actibond molecules continuous protection engine oil" },
    { name: "Motul 3000 4T Plus 10W-30 Bike Oil", category: "Lubricants", price: 410, unit: "1L", item_type: "product", desc: "High performance bike engine lubricant" },
    { name: "Full Two Wheeler General Service", category: "Services", price: 300, unit: "bike", item_type: "service", desc: "Carburetor tuning, brake adjustment, spark plug cleaning" },
    { name: "Chain Lube & Sprocket Cleaning", category: "Services", price: 100, unit: "bike", item_type: "service", desc: "High-pressure clean with spray lubrication" },
  ],
  "Car Wash": [
    { name: "Full Foam Car Wash & Vacuuming", category: "Washing", price: 350, unit: "car", item_type: "service", desc: "High pressure snow foam wash with interior vacuum" },
    { name: "Teflon Body Coating & Polish", category: "Detailing", price: 1200, unit: "car", item_type: "service", desc: "High gloss scratch-resistant paint protection" },
    { name: "Bike Foam Wash & Chain Cleaning", category: "Two Wheeler", price: 100, unit: "bike", item_type: "service", desc: "Snow foam wash with polish finish" },
  ],
  "Garage": [
    { name: "Car Denting & Painting Panel Work", category: "Body Repair", price: 1800, unit: "panel", item_type: "service", desc: "Original paint match spray booth finish" },
    { name: "Brake Pad Replacement & Disc Turning", category: "Repairs", price: 650, unit: "car", item_type: "service", desc: "Brake safety check and pad change" },
    { name: "Car AC Gas Refilling & Cooling Check", category: "AC Service", price: 1200, unit: "car", item_type: "service", desc: "R134a refrigerant gas with leak test" },
  ],
  "Hardware Store": [
    { name: "Asian Paints Royale Luxury Emulsion White", category: "Paints", price: 540, unit: "1L", item_type: "product", desc: "Teflon surface protector luxury interior wall paint" },
    { name: "Asian Paints Apex Weatherproof Exterior Emulsion", category: "Paints", price: 1450, unit: "4L", item_type: "product", desc: "All-weather anti-fungal exterior wall paint" },
    { name: "UltraTech Super Cement", category: "Cement", price: 380, unit: "50kg Bag", item_type: "product", desc: "Engineered for high compressive strength building" },
    { name: "Dr. Fixit Pidifin 2K Waterproofing Coating", category: "Waterproofing", price: 290, unit: "1kg", item_type: "product", desc: "Elastomeric waterproof membrane for roofs & bathrooms" },
    { name: "Finolex 1.5 sq mm Flame Retardant Copper Wire", category: "Electricals", price: 1850, unit: "90m Coil", item_type: "product", desc: "Pure electrolytic grade copper safety wire" },
    { name: "Astral CPVC Pro 1 Inch Water Pipe", category: "Plumbing", price: 320, unit: "3 Meter", item_type: "product", desc: "Lead-free hot & cold water plumbing pipe" },
    { name: "Jaquar Stainless Steel Sink Bib Cock Tap", category: "Sanitary", price: 780, unit: "piece", item_type: "product", desc: "Chrome plated brass body long-life tap" },
  ],
  "Clothing Store": [
    { name: "Banarasi Katan Silk Bridal Saree", category: "Women Ethnic", price: 2850, unit: "piece", item_type: "product", desc: "Pure zari weave wedding collection saree" },
    { name: "Men's Kurta Pajama Set with Jacket", category: "Men Ethnic", price: 1499, unit: "set", item_type: "product", desc: "Festival celebration silk blend kurta set" },
    { name: "Men's Slim Fit Stretchable Denim Jeans", category: "Men Casual", price: 899, unit: "piece", item_type: "product", desc: "Durable comfortable daily wear denim" },
    { name: "Women's Embroidered Cotton Kurti", category: "Women Casual", price: 650, unit: "piece", item_type: "product", desc: "Pure cotton Lucknowi Chikankari style kurti" },
    { name: "Kids Festival Party Wear Dress Set", category: "Kids Wear", price: 799, unit: "set", item_type: "product", desc: "Comfortable stylish party dress for boys & girls" },
  ],
  "Restaurant": [
    { name: "Special Chicken Dum Biryani", category: "Main Course", price: 220, unit: "Full Handi", item_type: "non_veg", desc: "Awadhi dum cooked aromatic long grain biryani" },
    { name: "Galawati Kebab with Paratha", category: "Starters", price: 180, unit: "4 pcs", item_type: "non_veg", desc: "Mouth melting royal Lucknowi spices kebab" },
    { name: "Paneer Butter Masala", category: "Main Course", price: 190, unit: "Full", item_type: "veg", desc: "Rich tomato cashew gravy with fresh cottage cheese" },
    { name: "Dal Makhani Special", category: "Main Course", price: 160, unit: "Full", item_type: "veg", desc: "Overnight slow cooked creamy black lentils" },
    { name: "Butter Naan", category: "Breads", price: 40, unit: "pc", item_type: "veg", desc: "Crispy tandoori naan brushed with pure butter" },
  ],
  "Cafe": [
    { name: "Special Kulhad Masala Chai", category: "Beverages", price: 20, unit: "Kulhad", item_type: "veg", desc: "Fresh cardamom and ginger brewed clay pot tea" },
    { name: "Cold Coffee with Vanilla Ice Cream", category: "Beverages", price: 80, unit: "Glass", item_type: "veg", desc: "Thick creamy chilled coffee shake" },
    { name: "Crispy Cheese Paneer Burger", category: "Fast Food", price: 70, unit: "pc", item_type: "veg", desc: "Loaded with melting cheese and spiced paneer patty" },
    { name: "Veg Cheese Grilled Sandwich", category: "Fast Food", price: 90, unit: "pc", item_type: "veg", desc: "Triple layered butter grilled sandwich" },
  ],
  "Fast Food": [
    { name: "Farmhouse Cheese Pizza (Medium)", category: "Pizza", price: 240, unit: "pc", item_type: "veg", desc: "Loaded with capsicum, onion, tomato and mozzarella" },
    { name: "Crispy Veg Fried Momos", category: "Momos", price: 70, unit: "8 pcs", item_type: "veg", desc: "Served with fiery red garlic chutney and mayonnaise" },
    { name: "Chicken Steamed Momos", category: "Momos", price: 90, unit: "8 pcs", item_type: "non_veg", desc: "Juicy minced chicken momos with hot soup" },
    { name: "Chicken Kathi Roll", category: "Rolls", price: 110, unit: "pc", item_type: "non_veg", desc: "Egg wrapped paratha with smoky roasted chicken" },
  ],
  "Sweet Shop": [
    { name: "Special Kaju Katli (Pure Desi Ghee)", category: "Sweets", price: 880, unit: "1kg", item_type: "veg", desc: "Diamond cut silver vark topped authentic cashew fudge" },
    { name: "Desi Ghee Gulab Jamun", category: "Sweets", price: 25, unit: "pc", item_type: "veg", desc: "Warm soft khoya dumplings in saffron sugar syrup" },
    { name: "Kesaria Rasmalai", category: "Sweets", price: 45, unit: "pc", item_type: "veg", desc: "Spongy cottage cheese patties steeped in thick saffron milk" },
    { name: "Hot Khasta Samosa with Chutney", category: "Snacks", price: 15, unit: "pc", item_type: "veg", desc: "Crispy fried pastry stuffed with spiced potato and peas" },
    { name: "Desi Ghee Motichoor Ladoo", category: "Sweets", price: 420, unit: "1kg", item_type: "veg", desc: "Tiny besan pearls soaked in pure ghee syrup" },
  ],
  "Cake Shop": [
    { name: "Dutch Chocolate Truffle Cake", category: "Cakes", price: 450, unit: "500g", item_type: "egg", desc: "Rich dark chocolate ganache layered birthday cake" },
    { name: "Fresh Pineapple Cream Cake (100% Eggless)", category: "Cakes", price: 380, unit: "500g", item_type: "veg", desc: "Vanilla sponge with juicy pineapple chunks" },
    { name: "Red Velvet Cream Cheese Pastry", category: "Pastries", price: 75, unit: "pc", item_type: "veg", desc: "Soft red velvet sponge with rich cream cheese" },
    { name: "Chocolate Lava Cake", category: "Desserts", price: 60, unit: "pc", item_type: "egg", desc: "Hot molten chocolate filling inside warm cake" },
  ],
};

// Also add grocery detergent items to the existing 5 grocery stores:
const EXISTING_GROCERY_IDS = ["bhr-groc-01", "bhr-groc-02", "bhr-groc-03", "bhr-groc-04", "bhr-groc-05"];
const allGroceryBusinesses = [
  ...EXISTING_GROCERY_IDS.map(id => ({ id, type: id.includes("02") || id.includes("05") ? "Supermarket" : "Grocery Store" })),
  ...businesses,
];

let catalogCount = 0;
for (const b of allGroceryBusinesses) {
  const items = ITEMS_BY_TYPE[b.type] || ITEMS_BY_TYPE["Grocery Store"];
  if (!items) continue;

  items.forEach((item, idx) => {
    catalogCount++;
    sql += `
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  '${b.id}',
  '${item.name.replace(/'/g, "''")}',
  '${item.category.replace(/'/g, "''")}',
  ${item.price},
  ${item.unit ? `'${item.unit.replace(/'/g, "''")}'` : "NULL"},
  '${item.item_type}',
  ${item.desc ? `'${item.desc.replace(/'/g, "''")}'` : "NULL"},
  true,
  ${idx + 1}
) ON CONFLICT DO NOTHING;
`;
  });
}

sql += `
COMMIT;
`;

fs.writeFileSync("scripts/seed_huge_dataset.sql", sql);
console.log(`Generated SQL for ${businesses.length} businesses and ${catalogCount} catalog items!`);
