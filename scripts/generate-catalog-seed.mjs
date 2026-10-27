import fs from "node:fs";

const CATALOG_ITEMS = [
  // bhr-sweet-01: Deepak Sweets & Bakers
  {
    business_id: "bhr-sweet-01",
    items: [
      { name: "Special Kaju Katli", category: "Kaju Sweets", price: 880, unit: "per kg", item_type: "veg", description: "Made from premium Goan cashew nuts and silver vark." },
      { name: "Desi Ghee Gulab Jamun", category: "Traditional Sweets", price: 25, unit: "per pc", item_type: "veg", description: "Soft, melt-in-mouth jamuns dipped in rose-cardamom syrup." },
      { name: "Spongy Rasgulla", category: "Bengali Sweets", price: 20, unit: "per pc", item_type: "veg", description: "Fresh chenna dumplings cooked in light sugar syrup." },
      { name: "Malai Chamcham", category: "Bengali Sweets", price: 35, unit: "per pc", item_type: "veg", description: "Stuffed with fresh mawa, pista, and saffron." },
      { name: "Khasta Kachori with Aloo Sabzi", category: "Snacks & Chaat", price: 30, unit: "per plate", item_type: "veg", description: "Crispy kachori served with spicy Mathura-style aloo curry." },
      { name: "Special Pista Kulfi", category: "Desserts", price: 50, unit: "per pc", item_type: "veg", description: "Slow-cooked rabri kulfi loaded with roasted pistachios." },
      { name: "Motichoor Laddoo (Desi Ghee)", category: "Laddoo & Peda", price: 440, unit: "per kg", item_type: "veg", description: "Tiny gram flour pearls soaked in saffron sugar syrup." },
      { name: "Paneer Jalebi (Hot & Crispy)", category: "Traditional Sweets", price: 460, unit: "per kg", item_type: "veg", description: "Made from fresh cottage cheese and pure desi ghee." },
    ],
  },

  // bhr-sweet-02: Chhappan Bhog Mithai
  {
    business_id: "bhr-sweet-02",
    items: [
      { name: "Rasmalai (2 Pcs)", category: "Bengali Sweets", price: 60, unit: "per portion", item_type: "veg", description: "Velvety chenna patties soaked in thick saffron milk." },
      { name: "Kaju Roll", category: "Kaju Sweets", price: 920, unit: "per kg", item_type: "veg", description: "Rich cashew rolls filled with gulkand and dry fruits." },
      { name: "Besan Ke Laddoo", category: "Laddoo & Peda", price: 380, unit: "per kg", item_type: "veg", description: "Roasted besan with desi ghee and fragrant cardamom." },
      { name: "Hot Samosa with Mint Chutney", category: "Snacks & Chaat", price: 15, unit: "per pc", item_type: "veg", description: "Crisp potato and pea filled pastry with sweet and tangy saunth." },
      { name: "Milk Cake", category: "Traditional Sweets", price: 520, unit: "per kg", item_type: "veg", description: "Caramelized solid milk sweet with grainy texture." },
      { name: "Gond Ke Laddoo (Winter Special)", category: "Healthy & Dryfruit", price: 650, unit: "per kg", item_type: "veg", description: "Edible gum, dry fruits, and pure cow ghee." },
    ],
  },

  // bhr-sweet-03: Shere Punjab Sweets
  {
    business_id: "bhr-sweet-03",
    items: [
      { name: "Amritsari Chole Bhature", category: "Punjab Special", price: 90, unit: "per plate", item_type: "veg", description: "Spicy pindi chana with two fluffy bhaturas, pickle, and onion." },
      { name: "Rabri Falooda", category: "Desserts & Shakes", price: 70, unit: "per glass", item_type: "veg", description: "Chilled thickened milk, falooda sev, rose syrup, and dry fruits." },
      { name: "Malai Lassi (Chilled)", category: "Beverages", price: 50, unit: "per kulhad", item_type: "veg", description: "Sweet Punjabi lassi topped with thick malai layer." },
      { name: "Dhokla (Sponge)", category: "Snacks", price: 200, unit: "per kg", item_type: "veg", description: "Steamed fermented gram flour with mustard seed tempering." },
      { name: "Special Imarti", category: "Traditional Sweets", price: 420, unit: "per kg", item_type: "veg", description: "Deep fried urad dal batter soaked in aromatic syrup." },
      { name: "Doda Barfi", category: "Traditional Sweets", price: 560, unit: "per kg", item_type: "veg", description: "Rich sprouted wheat and milk fudge with cracked nuts." },
    ],
  },

  // bhr-sweet-04: Ramji Lal Mithai Bhandar
  {
    business_id: "bhr-sweet-04",
    items: [
      { name: "Balushahi (Desi Ghee)", category: "Traditional Sweets", price: 360, unit: "per kg", item_type: "veg", description: "Flaky glazed sweet with soft center." },
      { name: "Mathura Peda", category: "Laddoo & Peda", price: 440, unit: "per kg", item_type: "veg", description: "Roasted brown mawa peda dusted with sugar." },
      { name: "Dahi Jalebi Combo", category: "Breakfast Combos", price: 50, unit: "per plate", item_type: "veg", description: "Crisp hot jalebi served with fresh thick curd." },
      { name: "Kaju Anjeer Barfi", category: "Dryfruit Sweets", price: 950, unit: "per kg", item_type: "veg", description: "Sugar-free cashew and Turkish fig slices." },
    ],
  },

  // bhr-sweet-05: Brijwasi Sweets & Namkeen
  {
    business_id: "bhr-sweet-05",
    items: [
      { name: "Kaju Barfi Premium", category: "Kaju Sweets", price: 860, unit: "per kg", item_type: "veg", description: "Classic diamond cut cashew fudge." },
      { name: "Moong Dal Halwa", category: "Warm Desserts", price: 60, unit: "per 100g", item_type: "veg", description: "Slow-roasted yellow lentils in pure cow ghee." },
      { name: "Navratan Mix Namkeen", category: "Namkeen & Farsan", price: 260, unit: "per kg", item_type: "veg", description: "Spicy crisp mixture of lentils, peanuts, and sev." },
      { name: "Rasgulla Tin Pack (1kg)", category: "Packaged Sweets", price: 220, unit: "per tin", item_type: "veg", description: "Long shelf-life vacuum sealed rasgullas." },
    ],
  },

  // bhr-rest-01: Zaika Family Restaurant
  {
    business_id: "bhr-rest-01",
    items: [
      { name: "Paneer Butter Masala", category: "North Indian Main Course", price: 190, unit: "per portion", item_type: "veg", description: "Cottage cheese cubes in rich tomato-butter-cashew gravy." },
      { name: "Dal Makhani (Slow Cooked)", category: "North Indian Main Course", price: 160, unit: "per portion", item_type: "veg", description: "Black lentils cooked overnight with cream and butter." },
      { name: "Veg Hakka Noodles", category: "Chinese", price: 120, unit: "per plate", item_type: "veg", description: "Wok-tossed noodles with crisp seasonal vegetables." },
      { name: "Butter Naan", category: "Breads", price: 40, unit: "per pc", item_type: "veg", description: "Clay oven baked leavened bread brushed with butter." },
      { name: "Jeera Rice", category: "Rice & Biryani", price: 110, unit: "per plate", item_type: "veg", description: "Fragrant basmati rice tempered with cumin seeds." },
      { name: "Special Veg Thali", category: "Combos & Thalis", price: 220, unit: "per thali", item_type: "veg", description: "Paneer sabzi, dal makhani, mix veg, raita, rice, 3 butter rotis, gulab jamun." },
    ],
  },

  // bhr-rest-02: Al-Bake Dum Biryani & Restaurant
  {
    business_id: "bhr-rest-02",
    items: [
      { name: "Chicken Dum Biryani (Awadhi)", category: "Biryani Special", price: 180, unit: "per full plate", item_type: "non_veg", description: "Fragrant saffron basmati rice with tender marinated chicken pieces, served with raita and salan." },
      { name: "Mutton Galawati Kebab (4 Pcs)", category: "Starters & Kebabs", price: 220, unit: "per portion", item_type: "non_veg", description: "Lucknowi melt-in-mouth minced mutton kebabs served with Mughlai paratha." },
      { name: "Chicken Tikka Masala", category: "Main Course", price: 260, unit: "per portion", item_type: "non_veg", description: "Charcoal grilled chicken tikka in spiced tomato gravy." },
      { name: "Rumali Roti", category: "Breads", price: 15, unit: "per pc", item_type: "veg", description: "Soft, paper-thin hand-tossed bread." },
      { name: "Chicken Shawarma Roll", category: "Fast Food", price: 90, unit: "per roll", item_type: "non_veg", description: "Juicy shredded chicken wrapped in pita with garlic toum." },
    ],
  },

  // bhr-rest-03: Royal Dine Multi-Cuisine Restaurant
  {
    business_id: "bhr-rest-03",
    items: [
      { name: "Kadhai Paneer", category: "North Indian", price: 210, unit: "per portion", item_type: "veg", description: "Cottage cheese with capsicum, onion, and fresh ground spices." },
      { name: "Chicken Butter Masala", category: "Mughlai Non-Veg", price: 280, unit: "per portion", item_type: "non_veg", description: "Boneless chicken simmered in creamy makhani gravy." },
      { name: "Crispy Chilli Paneer", category: "Chinese Starters", price: 170, unit: "per plate", item_type: "veg", description: "Batter-fried paneer tossed in spicy soy-chilli glaze." },
      { name: "Garlic Naan", category: "Breads", price: 50, unit: "per pc", item_type: "veg", description: "Tandoori naan topped with roasted garlic and coriander." },
      { name: "Virgin Mojito", category: "Mocktails", price: 90, unit: "per glass", item_type: "veg", description: "Refreshing mint, lime, and crushed ice soda." },
    ],
  },

  // bhr-rest-04: Madhuram Pure Veg Restaurant
  {
    business_id: "bhr-rest-04",
    items: [
      { name: "Masala Dosa with Sambar", category: "South Indian", price: 95, unit: "per plate", item_type: "veg", description: "Golden crispy dosa with spiced potato filling, coconut chutney and drumstick sambar." },
      { name: "Chole Bhature", category: "North Indian", price: 85, unit: "per plate", item_type: "veg", description: "Authentic Delhi style spicy chickpeas with two fluffy bhaturas." },
      { name: "Paneer Tikka (Tandoori)", category: "Starters", price: 180, unit: "per portion", item_type: "veg", description: "Marinated cottage cheese cubes roasted in clay oven." },
      { name: "Special Gujarati Thali", category: "Thali", price: 210, unit: "per thali", item_type: "veg", description: "Dal, kadhi, 2 seasonal sabzis, farsan, rotis, rice, and sweet." },
    ],
  },

  // bhr-rest-05: New Milan Cafe & Fast Food
  {
    business_id: "bhr-rest-05",
    items: [
      { name: "Cheese Grilled Sandwich", category: "Sandwiches", price: 80, unit: "per pc", item_type: "veg", description: "Triple decker sandwich stuffed with veggies and molten cheese." },
      { name: "Crispy Veg Burger with Fries", category: "Burgers", price: 90, unit: "combo", item_type: "veg", description: "Crisp potato patty with lettuce, cheese slice, and seasoned fries." },
      { name: "Kulhad Masala Chai", category: "Hot Beverages", price: 20, unit: "per cup", item_type: "veg", description: "Brewed with fresh ginger, cardamom, and whole milk." },
      { name: "Cold Coffee with Ice Cream", category: "Beverages", price: 85, unit: "per glass", item_type: "veg", description: "Rich blended espresso shake topped with vanilla scoop." },
      { name: "Farmhouse Pizza (8 Inch)", category: "Pizzas", price: 160, unit: "per pizza", item_type: "veg", description: "Topped with onion, capsicum, tomato, mushrooms, and mozzarella." },
    ],
  },

  // bhr-salon-01: Looks & Style Hair Studio
  {
    business_id: "bhr-salon-01",
    items: [
      { name: "Executive Haircut & Styling", category: "Hair Care", price: 150, unit: "per service", item_type: "service", description: "Precision haircut according to face cut with blow dry and setting." },
      { name: "Beard Trim & Razor Shaper", category: "Grooming", price: 80, unit: "per service", item_type: "service", description: "Sharp beard outline, scissor trim, and cooling aftershave balm." },
      { name: "O3+ D-Tan Facial & Cleanup", category: "Skin Care", price: 450, unit: "per session", item_type: "service", description: "Removes suntan, deep cleans pores, and restores skin glow." },
      { name: "L'Oreal Keratin Hair Spa", category: "Hair Treatment", price: 750, unit: "per session", item_type: "service", description: "Intense moisture treatment for smooth and frizz-free hair." },
      { name: "Head Massage with Almond Oil", category: "Relaxation", price: 120, unit: "per 20 mins", item_type: "service", description: "Stress relieving acupressure head massage." },
    ],
  },

  // bhr-salon-02: Roopam Herbal Beauty Parlour
  {
    business_id: "bhr-salon-02",
    items: [
      { name: "HD Bridal Makeup Package", category: "Bridal Services", price: 4500, unit: "complete package", item_type: "service", description: "Full HD bridal makeup, hair styling, saree draping, and jewellery setting." },
      { name: "VLCC Gold Facial", category: "Skin Care", price: 650, unit: "per session", item_type: "service", description: "Deep revitalising 24K gold dust facial for radiant bridal glow." },
      { name: "Full Arms & Legs Waxing (Rica)", category: "Waxing", price: 400, unit: "per service", item_type: "service", description: "Gentle Italian lipo-soluble wax suitable for sensitive skin." },
      { name: "Hair Smoothing / Straightening", category: "Hair Treatments", price: 2500, unit: "starting price", item_type: "service", description: "Long-lasting silky straight hair with branded serum care." },
      { name: "Eyebrows & Upper Lip Threading", category: "Basic Grooming", price: 40, unit: "per service", item_type: "service", description: "Precision threading for neat, defined brows." },
    ],
  },

  // bhr-clinic-01: Aastha Dental Care & Implant Centre
  {
    business_id: "bhr-clinic-01",
    items: [
      { name: "Digital Dental X-Ray & Consultation", category: "Diagnostics", price: 300, unit: "per consult", item_type: "service", description: "Complete oral checkup using high resolution digital RVG X-ray." },
      { name: "Ultrasonic Teeth Cleaning & Scaling", category: "Preventive Care", price: 800, unit: "per session", item_type: "service", description: "Painless tartar and plaque removal with tooth polishing." },
      { name: "Single-Sitting Root Canal (RCT)", category: "Treatments", price: 2200, unit: "per tooth", item_type: "service", description: "Advanced painless rotary endodontic root canal treatment." },
      { name: "Ceramic / Zirconia Dental Crown", category: "Prosthetics", price: 3500, unit: "per crown", item_type: "service", description: "Natural-looking metal-free ceramic crown with warranty." },
      { name: "Laser Teeth Whitening", category: "Cosmetic Dentistry", price: 4000, unit: "per session", item_type: "service", description: "Instant 3-shade brighter smile with safe dental whitening gel." },
    ],
  },

  // bhr-groc-01: Gupta Kirana & General Store
  {
    business_id: "bhr-groc-01",
    items: [
      { name: "Aashirvaad Shudh Chakki Atta (10 Kg)", category: "Flour & Grains", price: 410, unit: "per bag", item_type: "product", description: "100% whole wheat atta with 0% maida." },
      { name: "Fortune Sunlite Refined Sunflower Oil (1 Litre)", category: "Oils & Ghee", price: 135, unit: "per pouch", item_type: "product", description: "Fortified with Vitamin A and D for healthy heart." },
      { name: "Tata Salt Vacuum Evaporated (1 Kg)", category: "Spices & Salt", price: 28, unit: "per packet", item_type: "product", description: "Desh ka namak with required iodine." },
      { name: "Madhur Pure & Hygienic Sugar (5 Kg)", category: "Sugar & Sweeteners", price: 225, unit: "per bag", item_type: "product", description: "Sulfur-free crystal white sugar." },
      { name: "Tata Sampann Unpolished Toor Dal (1 Kg)", category: "Pulses & Dals", price: 175, unit: "per pack", item_type: "product", description: "High protein, natural unpolished arhar dal." },
    ],
  },

  // bhr-groc-02: Apna Super Bazaar
  {
    business_id: "bhr-groc-02",
    items: [
      { name: "Amul Pure Cow Ghee (1 Litre)", category: "Dairy & Ghee", price: 620, unit: "per tin", item_type: "product", description: "Rich aroma and golden texture from pure cow milk." },
      { name: "India Gate Basmati Rice Feast Rozzana (5 Kg)", category: "Rice & Grains", price: 395, unit: "per bag", item_type: "product", description: "Long slender grains ideal for everyday aromatic pulao." },
      { name: "Tata Tea Gold (500g)", category: "Tea & Coffee", price: 285, unit: "per pack", item_type: "product", description: "Blend of Assam CTC tea leaves with long gentle leaves." },
      { name: "Surf Excel Quick Wash Detergent Powder (2 Kg)", category: "Cleaning & Household", price: 330, unit: "per pack", item_type: "product", description: "Removes tough stains with minimum water usage." },
      { name: "Dettol Antiseptic Liquid (500ml)", category: "Health & Hygiene", price: 195, unit: "per bottle", item_type: "product", description: "Effective protection against 100 illness-causing germs." },
    ],
  },

  // bhr-hotel-01: Hotel Imperial & Banquet Hall
  {
    business_id: "bhr-hotel-01",
    items: [
      { name: "Executive AC Deluxe Room", category: "Room Stays", price: 1850, unit: "per night", item_type: "service", description: "Air-conditioned double bed room with high speed Wi-Fi, LED TV, and breakfast." },
      { name: "Royal Suite with Living Room", category: "Room Stays", price: 3200, unit: "per night", item_type: "service", description: "Spacious luxury suite with king bed, sofa set, mini bar, and 24/7 room service." },
      { name: "AC Banquet Hall Booking (200 Guests)", category: "Event Banquets", price: 25000, unit: "per event", item_type: "service", description: "Central air-conditioned banquet hall with stage, lighting, and seating arrangement." },
      { name: "Conference Room Booking (Full Day)", category: "Corporate Events", price: 8000, unit: "per day", item_type: "service", description: "Equipped with HD projector, sound system, and corporate buffet space." },
    ],
  },
];

let sql = `-- Seed authentic catalog items for Bahraich businesses
BEGIN;

`;

for (const group of CATALOG_ITEMS) {
  let order = 1;
  for (const item of group.items) {
    const esc = (val) => (val === null || val === undefined ? "NULL" : "'" + String(val).replace(/'/g, "''") + "'");
    sql += `INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  ${esc(group.business_id)}, ${esc(item.name)}, ${esc(item.category)}, ${item.price}, ${esc(item.unit)},
  ${esc(item.item_type)}, ${esc(item.description)}, true, ${order}
);
`;
    order++;
  }
}

sql += `COMMIT;
`;

fs.writeFileSync("scripts/seed_catalog_items.sql", sql);
console.log("Generated scripts/seed_catalog_items.sql successfully. Size:", (sql.length / 1024).toFixed(1), "KB");
