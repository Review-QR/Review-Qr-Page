-- 1. Ensure Deliciated Cafe exists and is active
INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  merchant_status, location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verified_by, discovery_location_verification_source,
  deleted_at
)
VALUES (
  'QR-77837092',
  'Deliciated Cafe',
  'Lucky Shukla',
  '9118643415',
  'Restaurant',
  'Premium',
  'active',
  0,
  'active',
  'review',
  'Opp. KDC College, Mastan Complex, Bahraich',
  'Mastan Complex',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  'active',
  27.5588,
  81.5834,
  NOW(),
  NOW(),
  NULL,
  'admin_reviewed',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  merchant_status = 'active',
  deleted_at = NULL;

-- 2. Ensure Shyam Dudh & Fresh Dairy exists for Milk & Products
INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  merchant_status, location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verified_by, discovery_location_verification_source,
  deleted_at
)
VALUES (
  'bhr-dairy-01',
  'Shyam Dudh & Fresh Dairy',
  'Shyam Yadav',
  '9876543210',
  'Dairy',
  'Standard',
  'active',
  0,
  'active',
  'review',
  'Chhawni Chauraha, Bahraich',
  'Chhawni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  'active',
  27.5750,
  81.5900,
  NOW(),
  NOW(),
  NULL,
  'admin_reviewed',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  merchant_status = 'active',
  deleted_at = NULL;

-- 3. Insert catalog items for Deliciated Cafe if not present
INSERT INTO public.business_catalog_items (business_id, name, category, price, item_type, is_available, description)
VALUES
  ('QR-77837092', 'Crispy Corn (Full)', 'Fast Food', 10, 'veg', true, 'Crispy fried sweet corn tossed with lemon & spices.'),
  ('QR-77837092', 'Crispy Veg Burger with Fries', 'Burgers', 90, 'veg', true, 'Crisp potato patty with lettuce, cheese slice, and seasoned fries.'),
  ('QR-77837092', 'Veg Grilled Sandwich', 'Sandwiches', 60, 'veg', true, 'Golden toasted sandwich with bell peppers, sweet corn & mint chutney.'),
  ('QR-77837092', 'Cheese Farmhouse Pizza', 'Pizzas', 160, 'veg', true, 'Loaded with mozzarella, capsicum, onion, tomato & corn.'),
  ('QR-77837092', 'Cold Coffee with Ice Cream', 'Beverages', 70, 'veg', true, 'Rich blended thick coffee topped with creamy vanilla ice cream.'),
  ('QR-77837092', 'Peri Peri French Fries (Large)', 'Sides', 50, 'veg', true, 'Hot crispy potato fingers dusted with fiery peri peri seasoning.')
ON CONFLICT DO NOTHING;

-- 4. Insert catalog items for Shyam Dudh & Fresh Dairy if not present
INSERT INTO public.business_catalog_items (business_id, name, category, price, item_type, is_available, description)
VALUES
  ('bhr-dairy-01', 'Fresh Buffalo Milk (1 Litre)', 'Milk', 66, 'veg', true, 'Pure farm fresh thick buffalo milk, tested for purity.'),
  ('bhr-dairy-01', 'Fresh Cow Milk (1 Litre)', 'Milk', 58, 'veg', true, 'Nutritious light cow milk directly from dairy.'),
  ('bhr-dairy-01', 'Fresh Malai Paneer (500g)', 'Dairy Products', 180, 'veg', true, 'Soft, spongy malai cottage cheese.'),
  ('bhr-dairy-01', 'Thick Sweet Dahi (500g)', 'Dairy Products', 60, 'veg', true, 'Creamy set curd in earthen-safe container.'),
  ('bhr-dairy-01', 'Pure Desi Ghee (1 Kg)', 'Ghee', 650, 'veg', true, 'Traditional aroma authentic bilona ghee.')
ON CONFLICT DO NOTHING;

-- 5. Curate exactly 1 vendor per category and soft-delete all other dummy data
-- Keep list:
-- Food / Restaurant: 'QR-77837092' (Deliciated Cafe)
-- Milk & Products: 'bhr-dairy-01' (Shyam Dudh & Fresh Dairy)
-- Grocery: 'bhr-groc-01' (Gupta Kirana & General Store)
-- Pharmacy / Medical: 'bhr-pharm-01' (Sanjeevani Medicos & Chemists)
-- Car Wash: 'bhr-auto-03' (Speed Shine Car Wash & Detailing)
-- Salon: 'bhr-salon-01' (Looks & Style Hair Studio)
-- Clinic: 'bhr-clinic-03' (Dr. Verma Child & Family Clinic)
-- Hotel: 'bhr-hotel-01' (Hotel Imperial & Banquet Hall)
-- Clothing: 'bhr-cloth-01' (Shringar Sarees & Bridal Emporium)
-- Hardware: 'bhr-hard-01' (Asian Paints Color Ideas & Hardware)
-- Mobile / Electronics: 'bhr-elec-01' (Balaji Mobile World & Accessories)

UPDATE public.businesses
SET deleted_at = NOW()
WHERE id NOT IN (
  'QR-77837092',
  'bhr-dairy-01',
  'bhr-groc-01',
  'bhr-pharm-01',
  'bhr-auto-03',
  'bhr-salon-01',
  'bhr-clinic-03',
  'bhr-hotel-01',
  'bhr-cloth-01',
  'bhr-hard-01',
  'bhr-elec-01'
);

-- Ensure all kept businesses have deleted_at = NULL and merchant_status = 'active'
UPDATE public.businesses
SET deleted_at = NULL, merchant_status = 'active'
WHERE id IN (
  'QR-77837092',
  'bhr-dairy-01',
  'bhr-groc-01',
  'bhr-pharm-01',
  'bhr-auto-03',
  'bhr-salon-01',
  'bhr-clinic-03',
  'bhr-hotel-01',
  'bhr-cloth-01',
  'bhr-hard-01',
  'bhr-elec-01'
);
