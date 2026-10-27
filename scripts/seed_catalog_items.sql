-- Seed authentic catalog items for Bahraich businesses
BEGIN;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Special Kaju Katli', 'Kaju Sweets', 880, 'per kg',
  'veg', 'Made from premium Goan cashew nuts and silver vark.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Desi Ghee Gulab Jamun', 'Traditional Sweets', 25, 'per pc',
  'veg', 'Soft, melt-in-mouth jamuns dipped in rose-cardamom syrup.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Spongy Rasgulla', 'Bengali Sweets', 20, 'per pc',
  'veg', 'Fresh chenna dumplings cooked in light sugar syrup.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Malai Chamcham', 'Bengali Sweets', 35, 'per pc',
  'veg', 'Stuffed with fresh mawa, pista, and saffron.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Khasta Kachori with Aloo Sabzi', 'Snacks & Chaat', 30, 'per plate',
  'veg', 'Crispy kachori served with spicy Mathura-style aloo curry.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Special Pista Kulfi', 'Desserts', 50, 'per pc',
  'veg', 'Slow-cooked rabri kulfi loaded with roasted pistachios.', true, 6
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Motichoor Laddoo (Desi Ghee)', 'Laddoo & Peda', 440, 'per kg',
  'veg', 'Tiny gram flour pearls soaked in saffron sugar syrup.', true, 7
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-01', 'Paneer Jalebi (Hot & Crispy)', 'Traditional Sweets', 460, 'per kg',
  'veg', 'Made from fresh cottage cheese and pure desi ghee.', true, 8
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-02', 'Rasmalai (2 Pcs)', 'Bengali Sweets', 60, 'per portion',
  'veg', 'Velvety chenna patties soaked in thick saffron milk.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-02', 'Kaju Roll', 'Kaju Sweets', 920, 'per kg',
  'veg', 'Rich cashew rolls filled with gulkand and dry fruits.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-02', 'Besan Ke Laddoo', 'Laddoo & Peda', 380, 'per kg',
  'veg', 'Roasted besan with desi ghee and fragrant cardamom.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-02', 'Hot Samosa with Mint Chutney', 'Snacks & Chaat', 15, 'per pc',
  'veg', 'Crisp potato and pea filled pastry with sweet and tangy saunth.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-02', 'Milk Cake', 'Traditional Sweets', 520, 'per kg',
  'veg', 'Caramelized solid milk sweet with grainy texture.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-02', 'Gond Ke Laddoo (Winter Special)', 'Healthy & Dryfruit', 650, 'per kg',
  'veg', 'Edible gum, dry fruits, and pure cow ghee.', true, 6
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-03', 'Amritsari Chole Bhature', 'Punjab Special', 90, 'per plate',
  'veg', 'Spicy pindi chana with two fluffy bhaturas, pickle, and onion.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-03', 'Rabri Falooda', 'Desserts & Shakes', 70, 'per glass',
  'veg', 'Chilled thickened milk, falooda sev, rose syrup, and dry fruits.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-03', 'Malai Lassi (Chilled)', 'Beverages', 50, 'per kulhad',
  'veg', 'Sweet Punjabi lassi topped with thick malai layer.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-03', 'Dhokla (Sponge)', 'Snacks', 200, 'per kg',
  'veg', 'Steamed fermented gram flour with mustard seed tempering.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-03', 'Special Imarti', 'Traditional Sweets', 420, 'per kg',
  'veg', 'Deep fried urad dal batter soaked in aromatic syrup.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-03', 'Doda Barfi', 'Traditional Sweets', 560, 'per kg',
  'veg', 'Rich sprouted wheat and milk fudge with cracked nuts.', true, 6
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-04', 'Balushahi (Desi Ghee)', 'Traditional Sweets', 360, 'per kg',
  'veg', 'Flaky glazed sweet with soft center.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-04', 'Mathura Peda', 'Laddoo & Peda', 440, 'per kg',
  'veg', 'Roasted brown mawa peda dusted with sugar.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-04', 'Dahi Jalebi Combo', 'Breakfast Combos', 50, 'per plate',
  'veg', 'Crisp hot jalebi served with fresh thick curd.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-04', 'Kaju Anjeer Barfi', 'Dryfruit Sweets', 950, 'per kg',
  'veg', 'Sugar-free cashew and Turkish fig slices.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-05', 'Kaju Barfi Premium', 'Kaju Sweets', 860, 'per kg',
  'veg', 'Classic diamond cut cashew fudge.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-05', 'Moong Dal Halwa', 'Warm Desserts', 60, 'per 100g',
  'veg', 'Slow-roasted yellow lentils in pure cow ghee.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-05', 'Navratan Mix Namkeen', 'Namkeen & Farsan', 260, 'per kg',
  'veg', 'Spicy crisp mixture of lentils, peanuts, and sev.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-05', 'Rasgulla Tin Pack (1kg)', 'Packaged Sweets', 220, 'per tin',
  'veg', 'Long shelf-life vacuum sealed rasgullas.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-01', 'Paneer Butter Masala', 'North Indian Main Course', 190, 'per portion',
  'veg', 'Cottage cheese cubes in rich tomato-butter-cashew gravy.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-01', 'Dal Makhani (Slow Cooked)', 'North Indian Main Course', 160, 'per portion',
  'veg', 'Black lentils cooked overnight with cream and butter.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-01', 'Veg Hakka Noodles', 'Chinese', 120, 'per plate',
  'veg', 'Wok-tossed noodles with crisp seasonal vegetables.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-01', 'Butter Naan', 'Breads', 40, 'per pc',
  'veg', 'Clay oven baked leavened bread brushed with butter.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-01', 'Jeera Rice', 'Rice & Biryani', 110, 'per plate',
  'veg', 'Fragrant basmati rice tempered with cumin seeds.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-01', 'Special Veg Thali', 'Combos & Thalis', 220, 'per thali',
  'veg', 'Paneer sabzi, dal makhani, mix veg, raita, rice, 3 butter rotis, gulab jamun.', true, 6
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-02', 'Chicken Dum Biryani (Awadhi)', 'Biryani Special', 180, 'per full plate',
  'non_veg', 'Fragrant saffron basmati rice with tender marinated chicken pieces, served with raita and salan.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-02', 'Mutton Galawati Kebab (4 Pcs)', 'Starters & Kebabs', 220, 'per portion',
  'non_veg', 'Lucknowi melt-in-mouth minced mutton kebabs served with Mughlai paratha.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-02', 'Chicken Tikka Masala', 'Main Course', 260, 'per portion',
  'non_veg', 'Charcoal grilled chicken tikka in spiced tomato gravy.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-02', 'Rumali Roti', 'Breads', 15, 'per pc',
  'veg', 'Soft, paper-thin hand-tossed bread.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-02', 'Chicken Shawarma Roll', 'Fast Food', 90, 'per roll',
  'non_veg', 'Juicy shredded chicken wrapped in pita with garlic toum.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-03', 'Kadhai Paneer', 'North Indian', 210, 'per portion',
  'veg', 'Cottage cheese with capsicum, onion, and fresh ground spices.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-03', 'Chicken Butter Masala', 'Mughlai Non-Veg', 280, 'per portion',
  'non_veg', 'Boneless chicken simmered in creamy makhani gravy.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-03', 'Crispy Chilli Paneer', 'Chinese Starters', 170, 'per plate',
  'veg', 'Batter-fried paneer tossed in spicy soy-chilli glaze.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-03', 'Garlic Naan', 'Breads', 50, 'per pc',
  'veg', 'Tandoori naan topped with roasted garlic and coriander.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-03', 'Virgin Mojito', 'Mocktails', 90, 'per glass',
  'veg', 'Refreshing mint, lime, and crushed ice soda.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-04', 'Masala Dosa with Sambar', 'South Indian', 95, 'per plate',
  'veg', 'Golden crispy dosa with spiced potato filling, coconut chutney and drumstick sambar.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-04', 'Chole Bhature', 'North Indian', 85, 'per plate',
  'veg', 'Authentic Delhi style spicy chickpeas with two fluffy bhaturas.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-04', 'Paneer Tikka (Tandoori)', 'Starters', 180, 'per portion',
  'veg', 'Marinated cottage cheese cubes roasted in clay oven.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-04', 'Special Gujarati Thali', 'Thali', 210, 'per thali',
  'veg', 'Dal, kadhi, 2 seasonal sabzis, farsan, rotis, rice, and sweet.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-05', 'Cheese Grilled Sandwich', 'Sandwiches', 80, 'per pc',
  'veg', 'Triple decker sandwich stuffed with veggies and molten cheese.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-05', 'Crispy Veg Burger with Fries', 'Burgers', 90, 'combo',
  'veg', 'Crisp potato patty with lettuce, cheese slice, and seasoned fries.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-05', 'Kulhad Masala Chai', 'Hot Beverages', 20, 'per cup',
  'veg', 'Brewed with fresh ginger, cardamom, and whole milk.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-05', 'Cold Coffee with Ice Cream', 'Beverages', 85, 'per glass',
  'veg', 'Rich blended espresso shake topped with vanilla scoop.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-05', 'Farmhouse Pizza (8 Inch)', 'Pizzas', 160, 'per pizza',
  'veg', 'Topped with onion, capsicum, tomato, mushrooms, and mozzarella.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-01', 'Executive Haircut & Styling', 'Hair Care', 150, 'per service',
  'service', 'Precision haircut according to face cut with blow dry and setting.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-01', 'Beard Trim & Razor Shaper', 'Grooming', 80, 'per service',
  'service', 'Sharp beard outline, scissor trim, and cooling aftershave balm.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-01', 'O3+ D-Tan Facial & Cleanup', 'Skin Care', 450, 'per session',
  'service', 'Removes suntan, deep cleans pores, and restores skin glow.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-01', 'L''Oreal Keratin Hair Spa', 'Hair Treatment', 750, 'per session',
  'service', 'Intense moisture treatment for smooth and frizz-free hair.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-01', 'Head Massage with Almond Oil', 'Relaxation', 120, 'per 20 mins',
  'service', 'Stress relieving acupressure head massage.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-02', 'HD Bridal Makeup Package', 'Bridal Services', 4500, 'complete package',
  'service', 'Full HD bridal makeup, hair styling, saree draping, and jewellery setting.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-02', 'VLCC Gold Facial', 'Skin Care', 650, 'per session',
  'service', 'Deep revitalising 24K gold dust facial for radiant bridal glow.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-02', 'Full Arms & Legs Waxing (Rica)', 'Waxing', 400, 'per service',
  'service', 'Gentle Italian lipo-soluble wax suitable for sensitive skin.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-02', 'Hair Smoothing / Straightening', 'Hair Treatments', 2500, 'starting price',
  'service', 'Long-lasting silky straight hair with branded serum care.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-salon-02', 'Eyebrows & Upper Lip Threading', 'Basic Grooming', 40, 'per service',
  'service', 'Precision threading for neat, defined brows.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-clinic-01', 'Digital Dental X-Ray & Consultation', 'Diagnostics', 300, 'per consult',
  'service', 'Complete oral checkup using high resolution digital RVG X-ray.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-clinic-01', 'Ultrasonic Teeth Cleaning & Scaling', 'Preventive Care', 800, 'per session',
  'service', 'Painless tartar and plaque removal with tooth polishing.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-clinic-01', 'Single-Sitting Root Canal (RCT)', 'Treatments', 2200, 'per tooth',
  'service', 'Advanced painless rotary endodontic root canal treatment.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-clinic-01', 'Ceramic / Zirconia Dental Crown', 'Prosthetics', 3500, 'per crown',
  'service', 'Natural-looking metal-free ceramic crown with warranty.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-clinic-01', 'Laser Teeth Whitening', 'Cosmetic Dentistry', 4000, 'per session',
  'service', 'Instant 3-shade brighter smile with safe dental whitening gel.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01', 'Aashirvaad Shudh Chakki Atta (10 Kg)', 'Flour & Grains', 410, 'per bag',
  'product', '100% whole wheat atta with 0% maida.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01', 'Fortune Sunlite Refined Sunflower Oil (1 Litre)', 'Oils & Ghee', 135, 'per pouch',
  'product', 'Fortified with Vitamin A and D for healthy heart.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01', 'Tata Salt Vacuum Evaporated (1 Kg)', 'Spices & Salt', 28, 'per packet',
  'product', 'Desh ka namak with required iodine.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01', 'Madhur Pure & Hygienic Sugar (5 Kg)', 'Sugar & Sweeteners', 225, 'per bag',
  'product', 'Sulfur-free crystal white sugar.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01', 'Tata Sampann Unpolished Toor Dal (1 Kg)', 'Pulses & Dals', 175, 'per pack',
  'product', 'High protein, natural unpolished arhar dal.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02', 'Amul Pure Cow Ghee (1 Litre)', 'Dairy & Ghee', 620, 'per tin',
  'product', 'Rich aroma and golden texture from pure cow milk.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02', 'India Gate Basmati Rice Feast Rozzana (5 Kg)', 'Rice & Grains', 395, 'per bag',
  'product', 'Long slender grains ideal for everyday aromatic pulao.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02', 'Tata Tea Gold (500g)', 'Tea & Coffee', 285, 'per pack',
  'product', 'Blend of Assam CTC tea leaves with long gentle leaves.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02', 'Surf Excel Quick Wash Detergent Powder (2 Kg)', 'Cleaning & Household', 330, 'per pack',
  'product', 'Removes tough stains with minimum water usage.', true, 4
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02', 'Dettol Antiseptic Liquid (500ml)', 'Health & Hygiene', 195, 'per bottle',
  'product', 'Effective protection against 100 illness-causing germs.', true, 5
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hotel-01', 'Executive AC Deluxe Room', 'Room Stays', 1850, 'per night',
  'service', 'Air-conditioned double bed room with high speed Wi-Fi, LED TV, and breakfast.', true, 1
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hotel-01', 'Royal Suite with Living Room', 'Room Stays', 3200, 'per night',
  'service', 'Spacious luxury suite with king bed, sofa set, mini bar, and 24/7 room service.', true, 2
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hotel-01', 'AC Banquet Hall Booking (200 Guests)', 'Event Banquets', 25000, 'per event',
  'service', 'Central air-conditioned banquet hall with stage, lighting, and seating arrangement.', true, 3
);
INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hotel-01', 'Conference Room Booking (Full Day)', 'Corporate Events', 8000, 'per day',
  'service', 'Equipped with HD projector, sound system, and corporate buffet space.', true, 4
);
COMMIT;
