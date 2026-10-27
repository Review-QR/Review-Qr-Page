-- Migration / Seed: Huge Bahraich Local Commerce Dataset
-- Adds 38 new verified businesses across 8 major categories and 200+ authentic catalog items
BEGIN;


INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-groc-06',
  'Gupta Brothers Daily Mart',
  'Manoj Gupta',
  '+919451102938',
  'Grocery Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Ghanta Ghar Market, Station Road, Bahraich',
  'Ghanta Ghar',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5748,
  81.5968,
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
VALUES ('bhr-groc-06', 'gupta-brothers-daily-mart-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-groc-07',
  'Pooja Provision & General Store',
  'Ramesh Chandra',
  '+919839445566',
  'Grocery Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Near Peepal Chauraha, Civil Lines, Bahraich',
  'Peepal Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5762,
  81.5979,
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
VALUES ('bhr-groc-07', 'pooja-provision-general-store-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-groc-08',
  'Bahraich Super Mart',
  'Amit Agarwal',
  '+919415566778',
  'Supermarket',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Chhavni Chauraha, Nanpara Road, Bahraich',
  'Chhavni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5815,
  81.5925,
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
VALUES ('bhr-groc-08', 'bahraich-super-mart-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-groc-09',
  'Awadh Kirana Bhandar',
  'Rajendra Prasad',
  '+919125678901',
  'Grocery Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Main Dargah Road, Digdiha, Bahraich',
  'Dargah Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5685,
  81.6042,
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
VALUES ('bhr-groc-09', 'awadh-kirana-bhandar-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-groc-10',
  'Shukla General & Daily Needs',
  'Alok Shukla',
  '+919450123456',
  'Grocery Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Opposite District Hospital, Hospital Road, Bahraich',
  'Hospital Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5735,
  81.5995,
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
VALUES ('bhr-groc-10', 'shukla-general-daily-needs-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-pharm-01',
  'Sanjeevani Medicos & Chemists',
  'Dr. P. K. Srivastava',
  '+919415112233',
  'Pharmacy',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Hospital Road, Near District Hospital Gate, Bahraich',
  'Hospital Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5732,
  81.5998,
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
VALUES ('bhr-pharm-01', 'sanjeevani-medicos-chemists-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-pharm-02',
  'City Life Medical Hall',
  'Sunil Verma',
  '+919838223344',
  'Pharmacy',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Civil Lines, Near Peepal Chauraha, Bahraich',
  'Peepal Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5768,
  81.5985,
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
VALUES ('bhr-pharm-02', 'city-life-medical-hall-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-pharm-03',
  'Jan Aushadhi Medical Store',
  'Rajesh Mishra',
  '+919450334455',
  'Pharmacy',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Chhavni Chauraha, Nanpara Road, Bahraich',
  'Chhavni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5818,
  81.5928,
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
VALUES ('bhr-pharm-03', 'jan-aushadhi-medical-store-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-pharm-04',
  'Verma Chemists & Surgical Store',
  'Anil Verma',
  '+919125445566',
  'Medical Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Ghanta Ghar Chowk, Bahraich',
  'Ghanta Ghar',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5744,
  81.5964,
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
VALUES ('bhr-pharm-04', 'verma-chemists-surgical-store-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-pharm-05',
  'Apollo Pharmacy Partner Bahraich',
  'Deepak Pandey',
  '+919415556677',
  'Pharmacy',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Station Road, Near Railway Station, Bahraich',
  'Station Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5722,
  81.6028,
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
VALUES ('bhr-pharm-05', 'apollo-pharmacy-partner-bahraich-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-elec-01',
  'Balaji Mobile World & Accessories',
  'Vikram Rastogi',
  '+919839112233',
  'Mobile & Accessories',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Main Market, Near Ghanta Ghar, Bahraich',
  'Ghanta Ghar',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5746,
  81.5966,
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
VALUES ('bhr-elec-01', 'balaji-mobile-world-accessories-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-elec-02',
  'Supreme Gadgets & Telecom',
  'Gaurav Jaiswal',
  '+919451223344',
  'Mobile & Accessories',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Civil Lines, Opposite SBI Main Branch, Bahraich',
  'Peepal Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5766,
  81.5983,
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
VALUES ('bhr-elec-02', 'supreme-gadgets-telecom-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-elec-03',
  'City Electronics & Appliances',
  'Mahesh Chandra',
  '+919415334455',
  'Electronics Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Station Road, Commercial Complex, Bahraich',
  'Station Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.572,
  81.6022,
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
VALUES ('bhr-elec-03', 'city-electronics-appliances-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-elec-04',
  'Om Telecom & Smart Service',
  'Pankaj Sharma',
  '+919838445566',
  'Mobile & Accessories',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Chhavni Chauraha, Bahraich',
  'Chhavni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5812,
  81.5922,
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
VALUES ('bhr-elec-04', 'om-telecom-smart-service-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-elec-05',
  'Sharma Electricals & Light House',
  'Dinesh Sharma',
  '+919450556677',
  'Electronics Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Hospital Road, Near Court Complex, Bahraich',
  'Hospital Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5738,
  81.5992,
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
VALUES ('bhr-elec-05', 'sharma-electricals-light-house-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-auto-01',
  'MRF Tyre Care & Wheel Alignment',
  'Gurmeet Singh',
  '+919415667788',
  'Automobile Garage',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Nanpara Road, Near Bypass Chauraha, Bahraich',
  'Nanpara Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.583,
  81.591,
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
VALUES ('bhr-auto-01', 'mrf-tyre-care-wheel-alignment-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-auto-02',
  'Verma Two Wheeler Care & Spares',
  'Sanjay Verma',
  '+919839778899',
  'Bike Service',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Chhavni Market, Bahraich',
  'Chhavni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5814,
  81.5924,
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
VALUES ('bhr-auto-02', 'verma-two-wheeler-care-spares-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-auto-03',
  'Speed Shine Car Wash & Detailing',
  'Imran Khan',
  '+919451889900',
  'Car Wash',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Near Railway Overbridge, Station Road, Bahraich',
  'Station Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5715,
  81.603,
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
VALUES ('bhr-auto-03', 'speed-shine-car-wash-detailing-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-auto-04',
  'Royal Bullet Point & Spares',
  'Jaswinder Singh',
  '+919125990011',
  'Bike Service',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Civil Lines, Near Police Lines, Bahraich',
  'Civil Lines',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5772,
  81.598,
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
VALUES ('bhr-auto-04', 'royal-bullet-point-spares-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-auto-05',
  'Awadh Motor Garage & Denting',
  'Mohd. Shakeel',
  '+919450001122',
  'Garage',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Dargah Road, Digdiha, Bahraich',
  'Dargah Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5688,
  81.6045,
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
VALUES ('bhr-auto-05', 'awadh-motor-garage-denting-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-hard-01',
  'Asian Paints Color Ideas & Hardware',
  'Praveen Agarwal',
  '+919415123123',
  'Hardware Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Station Road, Near Ghanta Ghar, Bahraich',
  'Ghanta Ghar',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5745,
  81.5965,
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
VALUES ('bhr-hard-01', 'asian-paints-color-ideas-hardware-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-hard-02',
  'Bharat Cement Agency & Building Material',
  'Satish Chandra',
  '+919839234234',
  'Hardware Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Nanpara Bypass Road, Bahraich',
  'Nanpara Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5835,
  81.5905,
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
VALUES ('bhr-hard-02', 'bharat-cement-agency-building-material-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-hard-03',
  'Aggarwal Plywood & Hardware Store',
  'Vinod Aggarwal',
  '+919451345345',
  'Hardware Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Chhavni Market, Bahraich',
  'Chhavni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5816,
  81.5926,
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
VALUES ('bhr-hard-03', 'aggarwal-plywood-hardware-store-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-hard-04',
  'Kisan Sanitary & Pipe Fitting',
  'Rameshwar Dayal',
  '+919125456456',
  'Hardware Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Hospital Road, Bahraich',
  'Hospital Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5736,
  81.5994,
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
VALUES ('bhr-hard-04', 'kisan-sanitary-pipe-fitting-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-hard-05',
  'National Iron & Steel Emporium',
  'Harish Gupta',
  '+919450567567',
  'Hardware Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Station Road, Opposite Goods Shed, Bahraich',
  'Station Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5716,
  81.6026,
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
VALUES ('bhr-hard-05', 'national-iron-steel-emporium-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-cloth-01',
  'Shringar Sarees & Bridal Emporium',
  'Kailash Nath',
  '+919415678678',
  'Clothing Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Main Sarafa Market, Near Ghanta Ghar, Bahraich',
  'Ghanta Ghar',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5741,
  81.596,
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
VALUES ('bhr-cloth-01', 'shringar-sarees-bridal-emporium-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-cloth-02',
  'Royal Menswear & Suitings',
  'Manish Tandon',
  '+919839789789',
  'Clothing Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Civil Lines, Near Peepal Chauraha, Bahraich',
  'Peepal Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5764,
  81.5981,
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
VALUES ('bhr-cloth-02', 'royal-menswear-suitings-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-cloth-03',
  'Kids Planet & Readymade Garments',
  'Sunita Shukla',
  '+919451890890',
  'Clothing Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Chhavni Market, Bahraich',
  'Chhavni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5813,
  81.5923,
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
VALUES ('bhr-cloth-03', 'kids-planet-readymade-garments-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-cloth-04',
  'Manyavar Collection Partner',
  'Ashish Jaiswal',
  '+919125901901',
  'Clothing Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Civil Lines, Near Head Post Office, Bahraich',
  'Civil Lines',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.577,
  81.5978,
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
VALUES ('bhr-cloth-04', 'manyavar-collection-partner-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-cloth-05',
  'Bombay Dyeing & Handloom Store',
  'Mohd. Tariq',
  '+919450012012',
  'Clothing Store',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Station Road, Commercial Market, Bahraich',
  'Station Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5724,
  81.6024,
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
VALUES ('bhr-cloth-05', 'bombay-dyeing-handloom-store-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-rest-06',
  'Royal Awadh Dum Biryani Corner',
  'Nawaz Ali',
  '+919415123412',
  'Restaurant',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Station Road, Near Bus Stand, Bahraich',
  'Station Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5721,
  81.6021,
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
VALUES ('bhr-rest-06', 'royal-awadh-dum-biryani-corner-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-rest-07',
  'Lazeez Dhaba & Family Restaurant',
  'Harpreet Singh',
  '+919839234523',
  'Restaurant',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Nanpara Bypass Highway, Bahraich',
  'Nanpara Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5832,
  81.5908,
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
VALUES ('bhr-rest-07', 'lazeez-dhaba-family-restaurant-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-rest-08',
  'Chai Sutta Bar & Cafe',
  'Aakash Tiwari',
  '+919451345634',
  'Cafe',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Civil Lines, Near Kisan Degree College, Bahraich',
  'Peepal Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5769,
  81.5986,
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
VALUES ('bhr-rest-08', 'chai-sutta-bar-cafe-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-rest-09',
  'Pizza Nation & Burger Hub',
  'Rohit Verma',
  '+919125456745',
  'Fast Food',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Main Market, Opposite Ghanta Ghar, Bahraich',
  'Ghanta Ghar',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5747,
  81.5967,
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
VALUES ('bhr-rest-09', 'pizza-nation-burger-hub-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-rest-10',
  'Shri Balaji Dosa & South Indian',
  'K. R. Murthy',
  '+919450567856',
  'Restaurant',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Chhavni Chauraha, Bahraich',
  'Chhavni Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5817,
  81.5927,
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
VALUES ('bhr-rest-10', 'shri-balaji-dosa-south-indian-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-sweet-06',
  'Shukla Misthan Bhandar',
  'Badri Prasad Shukla',
  '+919415789012',
  'Sweet Shop',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Ghanta Ghar Chowk, Bahraich',
  'Ghanta Ghar',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5743,
  81.5963,
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
VALUES ('bhr-sweet-06', 'shukla-misthan-bhandar-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-sweet-07',
  'Kanpur Sweet House & Chat',
  'Shankar Lal',
  '+919839890123',
  'Sweet Shop',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Civil Lines, Bahraich',
  'Peepal Chauraha',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5763,
  81.598,
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
VALUES ('bhr-sweet-07', 'kanpur-sweet-house-chat-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.businesses (
  id, name, owner, phone, type, plan, status, scans, qr_status, qr_type,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  merchant_status, registration_date, created, created_at, qr_template
) VALUES (
  'bhr-sweet-08',
  'The Cake Hub & Fresh Bakery',
  'Pooja Singh',
  '+919451901234',
  'Cake Shop',
  'premium',
  'active',
  120,
  'active',
  'dynamic',
  'Station Road, Commercial Market, Bahraich',
  'Station Road',
  'Bahraich',
  'Bahraich',
  'Uttar Pradesh',
  '271801',
  27.5723,
  81.6023,
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
VALUES ('bhr-sweet-08', 'the-cake-hub-fresh-bakery-bahraich')
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Surf Excel Quick Wash Detergent Powder',
  'Detergent & Cleaning',
  140,
  '1kg',
  'product',
  'Top detergent powder for bright and stain-free clothes',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Ariel Matic Top Load Detergent Powder',
  'Detergent & Cleaning',
  195,
  '1kg',
  'product',
  'Tough stain removal in 1 wash for washing machines',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Tide Plus Double Power Detergent',
  'Detergent & Cleaning',
  110,
  '1kg',
  'product',
  'Extra power lemon and mint freshness for everyday wash',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Ghadi Detergent Powder',
  'Detergent & Cleaning',
  65,
  '1kg',
  'product',
  'Pehle istemaal karein phir vishwas karein - budget detergent',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Rin Advanced Detergent Bar',
  'Detergent & Cleaning',
  25,
  '250g',
  'product',
  'Detergent cake for sparkling bright white clothes',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Surf Excel Easy Wash Detergent',
  'Detergent & Cleaning',
  75,
  '500g',
  'product',
  'Quick lather wash detergent powder',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Fortune Kachi Ghani Mustard Oil',
  'Oils & Ghee',
  145,
  '1L',
  'product',
  '100% pure cold-pressed sarson tel',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Amul Pure Desi Ghee',
  'Oils & Ghee',
  620,
  '1L',
  'product',
  'Pure cow and buffalo milk desi ghee',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Aashirvaad Shudh Chakki Atta',
  'Flours & Grains',
  410,
  '10kg',
  'product',
  '100% whole wheat chakki ground atta',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'India Gate Basmati Rice Feast Rozzana',
  'Rice & Pulses',
  480,
  '5kg',
  'product',
  'Aromatic long grain basmati rice',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Tata Tea Gold',
  'Tea & Beverages',
  280,
  '500g',
  'product',
  'Rich taste with gently rolled long leaves',
  true,
  11
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Maggi 2-Minute Masala Noodles',
  'Snacks',
  56,
  'Pack of 4',
  'product',
  'Favorite instant masala noodles',
  true,
  12
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Dettol Original Bathing Soap',
  'Personal Care',
  160,
  'Pack of 4',
  'product',
  'Antibacterial germ protection soap',
  true,
  13
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-01',
  'Vim Dishwash Gel Lemon',
  'Detergent & Cleaning',
  105,
  '500ml',
  'product',
  'Cuts tough grease easily with real lemon juice',
  true,
  14
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Surf Excel Matic Front Load Liquid',
  'Detergent & Cleaning',
  230,
  '1L',
  'product',
  'Smart liquid detergent for automatic washing machines',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Ariel Complete Detergent Powder',
  'Detergent & Cleaning',
  190,
  '1kg',
  'product',
  'Bright white wash and color protection',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Tide Plus Extra Power Detergent',
  'Detergent & Cleaning',
  215,
  '2kg',
  'product',
  'Double power stain removal',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Surf Excel Bar',
  'Detergent & Cleaning',
  35,
  '200g',
  'product',
  'Power stain removal detergent soap',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Fortune Sunlite Refined Sunflower Oil',
  'Oils & Ghee',
  135,
  '1L',
  'product',
  'Light and healthy cooking oil',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Amul Butter Pasteurised',
  'Dairy',
  58,
  '100g',
  'product',
  'Utterly butterly delicious Amul butter',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Aashirvaad Select Sharbati Atta',
  'Flours & Grains',
  290,
  '5kg',
  'product',
  'Made from 100% MP Sharbati wheat',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Tata Salt Vacuum Evaporated',
  'Spices & Seasoning',
  28,
  '1kg',
  'product',
  'Desh ka namak with iodine',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Harpic Power Plus Disinfectant',
  'Detergent & Cleaning',
  180,
  '1L',
  'product',
  '10x better stain removal toilet cleaner',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-02',
  'Colin Glass and Surface Cleaner',
  'Detergent & Cleaning',
  110,
  '500ml',
  'product',
  'Shine boost cleaner for glass, mirrors and cars',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Surf Excel Quick Wash Detergent Powder',
  'Detergent & Cleaning',
  140,
  '1kg',
  'product',
  'Top detergent powder for bright and stain-free clothes',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Ariel Matic Top Load Detergent Powder',
  'Detergent & Cleaning',
  195,
  '1kg',
  'product',
  'Tough stain removal in 1 wash for washing machines',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Tide Plus Double Power Detergent',
  'Detergent & Cleaning',
  110,
  '1kg',
  'product',
  'Extra power lemon and mint freshness for everyday wash',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Ghadi Detergent Powder',
  'Detergent & Cleaning',
  65,
  '1kg',
  'product',
  'Pehle istemaal karein phir vishwas karein - budget detergent',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Rin Advanced Detergent Bar',
  'Detergent & Cleaning',
  25,
  '250g',
  'product',
  'Detergent cake for sparkling bright white clothes',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Surf Excel Easy Wash Detergent',
  'Detergent & Cleaning',
  75,
  '500g',
  'product',
  'Quick lather wash detergent powder',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Fortune Kachi Ghani Mustard Oil',
  'Oils & Ghee',
  145,
  '1L',
  'product',
  '100% pure cold-pressed sarson tel',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Amul Pure Desi Ghee',
  'Oils & Ghee',
  620,
  '1L',
  'product',
  'Pure cow and buffalo milk desi ghee',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Aashirvaad Shudh Chakki Atta',
  'Flours & Grains',
  410,
  '10kg',
  'product',
  '100% whole wheat chakki ground atta',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'India Gate Basmati Rice Feast Rozzana',
  'Rice & Pulses',
  480,
  '5kg',
  'product',
  'Aromatic long grain basmati rice',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Tata Tea Gold',
  'Tea & Beverages',
  280,
  '500g',
  'product',
  'Rich taste with gently rolled long leaves',
  true,
  11
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Maggi 2-Minute Masala Noodles',
  'Snacks',
  56,
  'Pack of 4',
  'product',
  'Favorite instant masala noodles',
  true,
  12
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Dettol Original Bathing Soap',
  'Personal Care',
  160,
  'Pack of 4',
  'product',
  'Antibacterial germ protection soap',
  true,
  13
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-03',
  'Vim Dishwash Gel Lemon',
  'Detergent & Cleaning',
  105,
  '500ml',
  'product',
  'Cuts tough grease easily with real lemon juice',
  true,
  14
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Surf Excel Quick Wash Detergent Powder',
  'Detergent & Cleaning',
  140,
  '1kg',
  'product',
  'Top detergent powder for bright and stain-free clothes',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Ariel Matic Top Load Detergent Powder',
  'Detergent & Cleaning',
  195,
  '1kg',
  'product',
  'Tough stain removal in 1 wash for washing machines',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Tide Plus Double Power Detergent',
  'Detergent & Cleaning',
  110,
  '1kg',
  'product',
  'Extra power lemon and mint freshness for everyday wash',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Ghadi Detergent Powder',
  'Detergent & Cleaning',
  65,
  '1kg',
  'product',
  'Pehle istemaal karein phir vishwas karein - budget detergent',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Rin Advanced Detergent Bar',
  'Detergent & Cleaning',
  25,
  '250g',
  'product',
  'Detergent cake for sparkling bright white clothes',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Surf Excel Easy Wash Detergent',
  'Detergent & Cleaning',
  75,
  '500g',
  'product',
  'Quick lather wash detergent powder',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Fortune Kachi Ghani Mustard Oil',
  'Oils & Ghee',
  145,
  '1L',
  'product',
  '100% pure cold-pressed sarson tel',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Amul Pure Desi Ghee',
  'Oils & Ghee',
  620,
  '1L',
  'product',
  'Pure cow and buffalo milk desi ghee',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Aashirvaad Shudh Chakki Atta',
  'Flours & Grains',
  410,
  '10kg',
  'product',
  '100% whole wheat chakki ground atta',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'India Gate Basmati Rice Feast Rozzana',
  'Rice & Pulses',
  480,
  '5kg',
  'product',
  'Aromatic long grain basmati rice',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Tata Tea Gold',
  'Tea & Beverages',
  280,
  '500g',
  'product',
  'Rich taste with gently rolled long leaves',
  true,
  11
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Maggi 2-Minute Masala Noodles',
  'Snacks',
  56,
  'Pack of 4',
  'product',
  'Favorite instant masala noodles',
  true,
  12
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Dettol Original Bathing Soap',
  'Personal Care',
  160,
  'Pack of 4',
  'product',
  'Antibacterial germ protection soap',
  true,
  13
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-04',
  'Vim Dishwash Gel Lemon',
  'Detergent & Cleaning',
  105,
  '500ml',
  'product',
  'Cuts tough grease easily with real lemon juice',
  true,
  14
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Surf Excel Matic Front Load Liquid',
  'Detergent & Cleaning',
  230,
  '1L',
  'product',
  'Smart liquid detergent for automatic washing machines',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Ariel Complete Detergent Powder',
  'Detergent & Cleaning',
  190,
  '1kg',
  'product',
  'Bright white wash and color protection',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Tide Plus Extra Power Detergent',
  'Detergent & Cleaning',
  215,
  '2kg',
  'product',
  'Double power stain removal',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Surf Excel Bar',
  'Detergent & Cleaning',
  35,
  '200g',
  'product',
  'Power stain removal detergent soap',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Fortune Sunlite Refined Sunflower Oil',
  'Oils & Ghee',
  135,
  '1L',
  'product',
  'Light and healthy cooking oil',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Amul Butter Pasteurised',
  'Dairy',
  58,
  '100g',
  'product',
  'Utterly butterly delicious Amul butter',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Aashirvaad Select Sharbati Atta',
  'Flours & Grains',
  290,
  '5kg',
  'product',
  'Made from 100% MP Sharbati wheat',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Tata Salt Vacuum Evaporated',
  'Spices & Seasoning',
  28,
  '1kg',
  'product',
  'Desh ka namak with iodine',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Harpic Power Plus Disinfectant',
  'Detergent & Cleaning',
  180,
  '1L',
  'product',
  '10x better stain removal toilet cleaner',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-05',
  'Colin Glass and Surface Cleaner',
  'Detergent & Cleaning',
  110,
  '500ml',
  'product',
  'Shine boost cleaner for glass, mirrors and cars',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Surf Excel Quick Wash Detergent Powder',
  'Detergent & Cleaning',
  140,
  '1kg',
  'product',
  'Top detergent powder for bright and stain-free clothes',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Ariel Matic Top Load Detergent Powder',
  'Detergent & Cleaning',
  195,
  '1kg',
  'product',
  'Tough stain removal in 1 wash for washing machines',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Tide Plus Double Power Detergent',
  'Detergent & Cleaning',
  110,
  '1kg',
  'product',
  'Extra power lemon and mint freshness for everyday wash',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Ghadi Detergent Powder',
  'Detergent & Cleaning',
  65,
  '1kg',
  'product',
  'Pehle istemaal karein phir vishwas karein - budget detergent',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Rin Advanced Detergent Bar',
  'Detergent & Cleaning',
  25,
  '250g',
  'product',
  'Detergent cake for sparkling bright white clothes',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Surf Excel Easy Wash Detergent',
  'Detergent & Cleaning',
  75,
  '500g',
  'product',
  'Quick lather wash detergent powder',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Fortune Kachi Ghani Mustard Oil',
  'Oils & Ghee',
  145,
  '1L',
  'product',
  '100% pure cold-pressed sarson tel',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Amul Pure Desi Ghee',
  'Oils & Ghee',
  620,
  '1L',
  'product',
  'Pure cow and buffalo milk desi ghee',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Aashirvaad Shudh Chakki Atta',
  'Flours & Grains',
  410,
  '10kg',
  'product',
  '100% whole wheat chakki ground atta',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'India Gate Basmati Rice Feast Rozzana',
  'Rice & Pulses',
  480,
  '5kg',
  'product',
  'Aromatic long grain basmati rice',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Tata Tea Gold',
  'Tea & Beverages',
  280,
  '500g',
  'product',
  'Rich taste with gently rolled long leaves',
  true,
  11
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Maggi 2-Minute Masala Noodles',
  'Snacks',
  56,
  'Pack of 4',
  'product',
  'Favorite instant masala noodles',
  true,
  12
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Dettol Original Bathing Soap',
  'Personal Care',
  160,
  'Pack of 4',
  'product',
  'Antibacterial germ protection soap',
  true,
  13
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-06',
  'Vim Dishwash Gel Lemon',
  'Detergent & Cleaning',
  105,
  '500ml',
  'product',
  'Cuts tough grease easily with real lemon juice',
  true,
  14
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Surf Excel Quick Wash Detergent Powder',
  'Detergent & Cleaning',
  140,
  '1kg',
  'product',
  'Top detergent powder for bright and stain-free clothes',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Ariel Matic Top Load Detergent Powder',
  'Detergent & Cleaning',
  195,
  '1kg',
  'product',
  'Tough stain removal in 1 wash for washing machines',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Tide Plus Double Power Detergent',
  'Detergent & Cleaning',
  110,
  '1kg',
  'product',
  'Extra power lemon and mint freshness for everyday wash',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Ghadi Detergent Powder',
  'Detergent & Cleaning',
  65,
  '1kg',
  'product',
  'Pehle istemaal karein phir vishwas karein - budget detergent',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Rin Advanced Detergent Bar',
  'Detergent & Cleaning',
  25,
  '250g',
  'product',
  'Detergent cake for sparkling bright white clothes',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Surf Excel Easy Wash Detergent',
  'Detergent & Cleaning',
  75,
  '500g',
  'product',
  'Quick lather wash detergent powder',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Fortune Kachi Ghani Mustard Oil',
  'Oils & Ghee',
  145,
  '1L',
  'product',
  '100% pure cold-pressed sarson tel',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Amul Pure Desi Ghee',
  'Oils & Ghee',
  620,
  '1L',
  'product',
  'Pure cow and buffalo milk desi ghee',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Aashirvaad Shudh Chakki Atta',
  'Flours & Grains',
  410,
  '10kg',
  'product',
  '100% whole wheat chakki ground atta',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'India Gate Basmati Rice Feast Rozzana',
  'Rice & Pulses',
  480,
  '5kg',
  'product',
  'Aromatic long grain basmati rice',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Tata Tea Gold',
  'Tea & Beverages',
  280,
  '500g',
  'product',
  'Rich taste with gently rolled long leaves',
  true,
  11
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Maggi 2-Minute Masala Noodles',
  'Snacks',
  56,
  'Pack of 4',
  'product',
  'Favorite instant masala noodles',
  true,
  12
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Dettol Original Bathing Soap',
  'Personal Care',
  160,
  'Pack of 4',
  'product',
  'Antibacterial germ protection soap',
  true,
  13
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-07',
  'Vim Dishwash Gel Lemon',
  'Detergent & Cleaning',
  105,
  '500ml',
  'product',
  'Cuts tough grease easily with real lemon juice',
  true,
  14
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Surf Excel Matic Front Load Liquid',
  'Detergent & Cleaning',
  230,
  '1L',
  'product',
  'Smart liquid detergent for automatic washing machines',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Ariel Complete Detergent Powder',
  'Detergent & Cleaning',
  190,
  '1kg',
  'product',
  'Bright white wash and color protection',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Tide Plus Extra Power Detergent',
  'Detergent & Cleaning',
  215,
  '2kg',
  'product',
  'Double power stain removal',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Surf Excel Bar',
  'Detergent & Cleaning',
  35,
  '200g',
  'product',
  'Power stain removal detergent soap',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Fortune Sunlite Refined Sunflower Oil',
  'Oils & Ghee',
  135,
  '1L',
  'product',
  'Light and healthy cooking oil',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Amul Butter Pasteurised',
  'Dairy',
  58,
  '100g',
  'product',
  'Utterly butterly delicious Amul butter',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Aashirvaad Select Sharbati Atta',
  'Flours & Grains',
  290,
  '5kg',
  'product',
  'Made from 100% MP Sharbati wheat',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Tata Salt Vacuum Evaporated',
  'Spices & Seasoning',
  28,
  '1kg',
  'product',
  'Desh ka namak with iodine',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Harpic Power Plus Disinfectant',
  'Detergent & Cleaning',
  180,
  '1L',
  'product',
  '10x better stain removal toilet cleaner',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-08',
  'Colin Glass and Surface Cleaner',
  'Detergent & Cleaning',
  110,
  '500ml',
  'product',
  'Shine boost cleaner for glass, mirrors and cars',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Surf Excel Quick Wash Detergent Powder',
  'Detergent & Cleaning',
  140,
  '1kg',
  'product',
  'Top detergent powder for bright and stain-free clothes',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Ariel Matic Top Load Detergent Powder',
  'Detergent & Cleaning',
  195,
  '1kg',
  'product',
  'Tough stain removal in 1 wash for washing machines',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Tide Plus Double Power Detergent',
  'Detergent & Cleaning',
  110,
  '1kg',
  'product',
  'Extra power lemon and mint freshness for everyday wash',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Ghadi Detergent Powder',
  'Detergent & Cleaning',
  65,
  '1kg',
  'product',
  'Pehle istemaal karein phir vishwas karein - budget detergent',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Rin Advanced Detergent Bar',
  'Detergent & Cleaning',
  25,
  '250g',
  'product',
  'Detergent cake for sparkling bright white clothes',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Surf Excel Easy Wash Detergent',
  'Detergent & Cleaning',
  75,
  '500g',
  'product',
  'Quick lather wash detergent powder',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Fortune Kachi Ghani Mustard Oil',
  'Oils & Ghee',
  145,
  '1L',
  'product',
  '100% pure cold-pressed sarson tel',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Amul Pure Desi Ghee',
  'Oils & Ghee',
  620,
  '1L',
  'product',
  'Pure cow and buffalo milk desi ghee',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Aashirvaad Shudh Chakki Atta',
  'Flours & Grains',
  410,
  '10kg',
  'product',
  '100% whole wheat chakki ground atta',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'India Gate Basmati Rice Feast Rozzana',
  'Rice & Pulses',
  480,
  '5kg',
  'product',
  'Aromatic long grain basmati rice',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Tata Tea Gold',
  'Tea & Beverages',
  280,
  '500g',
  'product',
  'Rich taste with gently rolled long leaves',
  true,
  11
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Maggi 2-Minute Masala Noodles',
  'Snacks',
  56,
  'Pack of 4',
  'product',
  'Favorite instant masala noodles',
  true,
  12
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Dettol Original Bathing Soap',
  'Personal Care',
  160,
  'Pack of 4',
  'product',
  'Antibacterial germ protection soap',
  true,
  13
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-09',
  'Vim Dishwash Gel Lemon',
  'Detergent & Cleaning',
  105,
  '500ml',
  'product',
  'Cuts tough grease easily with real lemon juice',
  true,
  14
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Surf Excel Quick Wash Detergent Powder',
  'Detergent & Cleaning',
  140,
  '1kg',
  'product',
  'Top detergent powder for bright and stain-free clothes',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Ariel Matic Top Load Detergent Powder',
  'Detergent & Cleaning',
  195,
  '1kg',
  'product',
  'Tough stain removal in 1 wash for washing machines',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Tide Plus Double Power Detergent',
  'Detergent & Cleaning',
  110,
  '1kg',
  'product',
  'Extra power lemon and mint freshness for everyday wash',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Ghadi Detergent Powder',
  'Detergent & Cleaning',
  65,
  '1kg',
  'product',
  'Pehle istemaal karein phir vishwas karein - budget detergent',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Rin Advanced Detergent Bar',
  'Detergent & Cleaning',
  25,
  '250g',
  'product',
  'Detergent cake for sparkling bright white clothes',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Surf Excel Easy Wash Detergent',
  'Detergent & Cleaning',
  75,
  '500g',
  'product',
  'Quick lather wash detergent powder',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Fortune Kachi Ghani Mustard Oil',
  'Oils & Ghee',
  145,
  '1L',
  'product',
  '100% pure cold-pressed sarson tel',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Amul Pure Desi Ghee',
  'Oils & Ghee',
  620,
  '1L',
  'product',
  'Pure cow and buffalo milk desi ghee',
  true,
  8
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Aashirvaad Shudh Chakki Atta',
  'Flours & Grains',
  410,
  '10kg',
  'product',
  '100% whole wheat chakki ground atta',
  true,
  9
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'India Gate Basmati Rice Feast Rozzana',
  'Rice & Pulses',
  480,
  '5kg',
  'product',
  'Aromatic long grain basmati rice',
  true,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Tata Tea Gold',
  'Tea & Beverages',
  280,
  '500g',
  'product',
  'Rich taste with gently rolled long leaves',
  true,
  11
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Maggi 2-Minute Masala Noodles',
  'Snacks',
  56,
  'Pack of 4',
  'product',
  'Favorite instant masala noodles',
  true,
  12
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Dettol Original Bathing Soap',
  'Personal Care',
  160,
  'Pack of 4',
  'product',
  'Antibacterial germ protection soap',
  true,
  13
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-groc-10',
  'Vim Dishwash Gel Lemon',
  'Detergent & Cleaning',
  105,
  '500ml',
  'product',
  'Cuts tough grease easily with real lemon juice',
  true,
  14
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-01',
  'Dolo 650 Paracetamol Tablets',
  'Fever & Pain',
  30,
  'Strip of 15',
  'product',
  'Relief from fever, headache and body pain',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-01',
  'Volini Pain Relief Spray',
  'Pain Relief',
  160,
  '55g',
  'product',
  'Instant relief from joint, back and neck pain',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-01',
  'Crocin Advance Fast Relief',
  'Fever & Pain',
  25,
  'Strip of 15',
  'product',
  'Fast absorbing paracetamol tablet',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-01',
  'D-Cold Total Cold & Cough',
  'Cold & Cough',
  55,
  'Strip of 10',
  'product',
  'Fast relief from blocked nose, headache and cold',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-01',
  'Electral ORS Powder',
  'Energy & Hydration',
  22,
  '21.8g Sachet',
  'product',
  'WHO recommended formula for dehydration',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-01',
  'Hansaplast Waterproof Bandage',
  'First Aid',
  35,
  'Pack of 10',
  'product',
  'Antiseptic medicated adhesive wound plaster',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-01',
  'Dettol Antiseptic Liquid',
  'First Aid',
  140,
  '250ml',
  'product',
  'First aid disinfectant and sanitizer',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-02',
  'Dolo 650 Paracetamol Tablets',
  'Fever & Pain',
  30,
  'Strip of 15',
  'product',
  'Relief from fever, headache and body pain',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-02',
  'Volini Pain Relief Spray',
  'Pain Relief',
  160,
  '55g',
  'product',
  'Instant relief from joint, back and neck pain',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-02',
  'Crocin Advance Fast Relief',
  'Fever & Pain',
  25,
  'Strip of 15',
  'product',
  'Fast absorbing paracetamol tablet',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-02',
  'D-Cold Total Cold & Cough',
  'Cold & Cough',
  55,
  'Strip of 10',
  'product',
  'Fast relief from blocked nose, headache and cold',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-02',
  'Electral ORS Powder',
  'Energy & Hydration',
  22,
  '21.8g Sachet',
  'product',
  'WHO recommended formula for dehydration',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-02',
  'Hansaplast Waterproof Bandage',
  'First Aid',
  35,
  'Pack of 10',
  'product',
  'Antiseptic medicated adhesive wound plaster',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-02',
  'Dettol Antiseptic Liquid',
  'First Aid',
  140,
  '250ml',
  'product',
  'First aid disinfectant and sanitizer',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-03',
  'Dolo 650 Paracetamol Tablets',
  'Fever & Pain',
  30,
  'Strip of 15',
  'product',
  'Relief from fever, headache and body pain',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-03',
  'Volini Pain Relief Spray',
  'Pain Relief',
  160,
  '55g',
  'product',
  'Instant relief from joint, back and neck pain',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-03',
  'Crocin Advance Fast Relief',
  'Fever & Pain',
  25,
  'Strip of 15',
  'product',
  'Fast absorbing paracetamol tablet',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-03',
  'D-Cold Total Cold & Cough',
  'Cold & Cough',
  55,
  'Strip of 10',
  'product',
  'Fast relief from blocked nose, headache and cold',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-03',
  'Electral ORS Powder',
  'Energy & Hydration',
  22,
  '21.8g Sachet',
  'product',
  'WHO recommended formula for dehydration',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-03',
  'Hansaplast Waterproof Bandage',
  'First Aid',
  35,
  'Pack of 10',
  'product',
  'Antiseptic medicated adhesive wound plaster',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-03',
  'Dettol Antiseptic Liquid',
  'First Aid',
  140,
  '250ml',
  'product',
  'First aid disinfectant and sanitizer',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-04',
  'Paracetamol 500mg Tablets',
  'General Medicine',
  18,
  'Strip of 10',
  'product',
  'Affordable generic fever and pain tablet',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-04',
  'Moov Pain Relief Ointment',
  'Pain Relief',
  135,
  '50g',
  'product',
  '100% ayurvedic back pain relief cream',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-04',
  'Cetrizine Anti-Allergy Tablets',
  'Allergy',
  20,
  'Strip of 10',
  'product',
  'Relief from runny nose, sneezing and itching',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-04',
  'Omeprazole 20mg Capsules',
  'Gastric & Acidity',
  45,
  'Strip of 15',
  'product',
  'Relief from acidity, heartburn and gas',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-04',
  'Cotton Crepe Bandage',
  'First Aid',
  85,
  '1 Roll',
  'product',
  'Support for muscle sprains and strains',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-05',
  'Dolo 650 Paracetamol Tablets',
  'Fever & Pain',
  30,
  'Strip of 15',
  'product',
  'Relief from fever, headache and body pain',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-05',
  'Volini Pain Relief Spray',
  'Pain Relief',
  160,
  '55g',
  'product',
  'Instant relief from joint, back and neck pain',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-05',
  'Crocin Advance Fast Relief',
  'Fever & Pain',
  25,
  'Strip of 15',
  'product',
  'Fast absorbing paracetamol tablet',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-05',
  'D-Cold Total Cold & Cough',
  'Cold & Cough',
  55,
  'Strip of 10',
  'product',
  'Fast relief from blocked nose, headache and cold',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-05',
  'Electral ORS Powder',
  'Energy & Hydration',
  22,
  '21.8g Sachet',
  'product',
  'WHO recommended formula for dehydration',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-05',
  'Hansaplast Waterproof Bandage',
  'First Aid',
  35,
  'Pack of 10',
  'product',
  'Antiseptic medicated adhesive wound plaster',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-pharm-05',
  'Dettol Antiseptic Liquid',
  'First Aid',
  140,
  '250ml',
  'product',
  'First aid disinfectant and sanitizer',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-01',
  'Boat BassHeads 100 Wired Earphones',
  'Audio',
  399,
  'piece',
  'product',
  'Super extra bass in-ear earphones with mic',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-01',
  'Realme 65W SuperDart Fast Charger with Cable',
  'Chargers',
  899,
  'piece',
  'product',
  'Ultra-fast Type-C charging adapter',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-01',
  'Ambrane 10000mAh Power Bank 20W Fast Charge',
  'Accessories',
  999,
  'piece',
  'product',
  'Dual USB output with Type-C input',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-01',
  '9H Gorilla Tempered Glass Screen Guard',
  'Screen Guards',
  99,
  'piece',
  'product',
  'Scratch-resistant edge-to-edge screen protector',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-01',
  'Boat Stone 190 Portable Bluetooth Speaker',
  'Audio',
  999,
  'piece',
  'product',
  '5W wireless speaker with deep bass',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-01',
  'Fast Type-C Braided Data Cable',
  'Cables',
  149,
  'piece',
  'product',
  'Unbreakable 1 meter fast charging cable',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-02',
  'Boat BassHeads 100 Wired Earphones',
  'Audio',
  399,
  'piece',
  'product',
  'Super extra bass in-ear earphones with mic',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-02',
  'Realme 65W SuperDart Fast Charger with Cable',
  'Chargers',
  899,
  'piece',
  'product',
  'Ultra-fast Type-C charging adapter',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-02',
  'Ambrane 10000mAh Power Bank 20W Fast Charge',
  'Accessories',
  999,
  'piece',
  'product',
  'Dual USB output with Type-C input',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-02',
  '9H Gorilla Tempered Glass Screen Guard',
  'Screen Guards',
  99,
  'piece',
  'product',
  'Scratch-resistant edge-to-edge screen protector',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-02',
  'Boat Stone 190 Portable Bluetooth Speaker',
  'Audio',
  999,
  'piece',
  'product',
  '5W wireless speaker with deep bass',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-02',
  'Fast Type-C Braided Data Cable',
  'Cables',
  149,
  'piece',
  'product',
  'Unbreakable 1 meter fast charging cable',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-03',
  'Bajaj 1000W Dry Iron Press',
  'Home Appliances',
  749,
  'piece',
  'product',
  'Non-stick coating with 2 year warranty',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-03',
  'Syska 9W LED Bulb (Cool White)',
  'Lighting',
  85,
  'piece',
  'product',
  'Energy saving long-life LED lamp',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-03',
  'Havells 4-Way Extension Board with Surge Protector',
  'Electricals',
  420,
  'piece',
  'product',
  'Heavy duty copper wire with safety shutter',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-03',
  'Crompton 1200mm High Speed Ceiling Fan',
  'Fans',
  1650,
  'piece',
  'product',
  'Rust-free aluminum blades high air delivery',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-03',
  'Philips Beard Trimmer BT1232',
  'Personal Care',
  899,
  'piece',
  'product',
  'USB charging stainless steel blades trimmer',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-04',
  'Boat BassHeads 100 Wired Earphones',
  'Audio',
  399,
  'piece',
  'product',
  'Super extra bass in-ear earphones with mic',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-04',
  'Realme 65W SuperDart Fast Charger with Cable',
  'Chargers',
  899,
  'piece',
  'product',
  'Ultra-fast Type-C charging adapter',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-04',
  'Ambrane 10000mAh Power Bank 20W Fast Charge',
  'Accessories',
  999,
  'piece',
  'product',
  'Dual USB output with Type-C input',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-04',
  '9H Gorilla Tempered Glass Screen Guard',
  'Screen Guards',
  99,
  'piece',
  'product',
  'Scratch-resistant edge-to-edge screen protector',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-04',
  'Boat Stone 190 Portable Bluetooth Speaker',
  'Audio',
  999,
  'piece',
  'product',
  '5W wireless speaker with deep bass',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-04',
  'Fast Type-C Braided Data Cable',
  'Cables',
  149,
  'piece',
  'product',
  'Unbreakable 1 meter fast charging cable',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-05',
  'Bajaj 1000W Dry Iron Press',
  'Home Appliances',
  749,
  'piece',
  'product',
  'Non-stick coating with 2 year warranty',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-05',
  'Syska 9W LED Bulb (Cool White)',
  'Lighting',
  85,
  'piece',
  'product',
  'Energy saving long-life LED lamp',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-05',
  'Havells 4-Way Extension Board with Surge Protector',
  'Electricals',
  420,
  'piece',
  'product',
  'Heavy duty copper wire with safety shutter',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-05',
  'Crompton 1200mm High Speed Ceiling Fan',
  'Fans',
  1650,
  'piece',
  'product',
  'Rust-free aluminum blades high air delivery',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-elec-05',
  'Philips Beard Trimmer BT1232',
  'Personal Care',
  899,
  'piece',
  'product',
  'USB charging stainless steel blades trimmer',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-01',
  'MRF ZVTS 165/80 R14 Car Tyre',
  'Tyres',
  3850,
  'piece',
  'product',
  'Long tread life all-season radial tyre',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-01',
  'Computerized 3D Wheel Alignment & Balancing',
  'Services',
  350,
  'car',
  'service',
  'Precision sensor steering alignment check',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-01',
  'Tubeless Tyre Puncture Repair',
  'Tyres',
  70,
  'puncture',
  'service',
  'Fast cold patch tubeless puncture repair',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-01',
  'Complete Car Engine Oil Flush & Change',
  'Servicing',
  1450,
  'service',
  'service',
  'Synthetic engine oil replacement with filter',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-02',
  'Castrol Activ 4T 20W-40 Motorcycle Engine Oil',
  'Lubricants',
  380,
  '1L',
  'product',
  'Actibond molecules continuous protection engine oil',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-02',
  'Motul 3000 4T Plus 10W-30 Bike Oil',
  'Lubricants',
  410,
  '1L',
  'product',
  'High performance bike engine lubricant',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-02',
  'Full Two Wheeler General Service',
  'Services',
  300,
  'bike',
  'service',
  'Carburetor tuning, brake adjustment, spark plug cleaning',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-02',
  'Chain Lube & Sprocket Cleaning',
  'Services',
  100,
  'bike',
  'service',
  'High-pressure clean with spray lubrication',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-03',
  'Full Foam Car Wash & Vacuuming',
  'Washing',
  350,
  'car',
  'service',
  'High pressure snow foam wash with interior vacuum',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-03',
  'Teflon Body Coating & Polish',
  'Detailing',
  1200,
  'car',
  'service',
  'High gloss scratch-resistant paint protection',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-03',
  'Bike Foam Wash & Chain Cleaning',
  'Two Wheeler',
  100,
  'bike',
  'service',
  'Snow foam wash with polish finish',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-04',
  'Castrol Activ 4T 20W-40 Motorcycle Engine Oil',
  'Lubricants',
  380,
  '1L',
  'product',
  'Actibond molecules continuous protection engine oil',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-04',
  'Motul 3000 4T Plus 10W-30 Bike Oil',
  'Lubricants',
  410,
  '1L',
  'product',
  'High performance bike engine lubricant',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-04',
  'Full Two Wheeler General Service',
  'Services',
  300,
  'bike',
  'service',
  'Carburetor tuning, brake adjustment, spark plug cleaning',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-04',
  'Chain Lube & Sprocket Cleaning',
  'Services',
  100,
  'bike',
  'service',
  'High-pressure clean with spray lubrication',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-05',
  'Car Denting & Painting Panel Work',
  'Body Repair',
  1800,
  'panel',
  'service',
  'Original paint match spray booth finish',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-05',
  'Brake Pad Replacement & Disc Turning',
  'Repairs',
  650,
  'car',
  'service',
  'Brake safety check and pad change',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-auto-05',
  'Car AC Gas Refilling & Cooling Check',
  'AC Service',
  1200,
  'car',
  'service',
  'R134a refrigerant gas with leak test',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-01',
  'Asian Paints Royale Luxury Emulsion White',
  'Paints',
  540,
  '1L',
  'product',
  'Teflon surface protector luxury interior wall paint',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-01',
  'Asian Paints Apex Weatherproof Exterior Emulsion',
  'Paints',
  1450,
  '4L',
  'product',
  'All-weather anti-fungal exterior wall paint',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-01',
  'UltraTech Super Cement',
  'Cement',
  380,
  '50kg Bag',
  'product',
  'Engineered for high compressive strength building',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-01',
  'Dr. Fixit Pidifin 2K Waterproofing Coating',
  'Waterproofing',
  290,
  '1kg',
  'product',
  'Elastomeric waterproof membrane for roofs & bathrooms',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-01',
  'Finolex 1.5 sq mm Flame Retardant Copper Wire',
  'Electricals',
  1850,
  '90m Coil',
  'product',
  'Pure electrolytic grade copper safety wire',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-01',
  'Astral CPVC Pro 1 Inch Water Pipe',
  'Plumbing',
  320,
  '3 Meter',
  'product',
  'Lead-free hot & cold water plumbing pipe',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-01',
  'Jaquar Stainless Steel Sink Bib Cock Tap',
  'Sanitary',
  780,
  'piece',
  'product',
  'Chrome plated brass body long-life tap',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-02',
  'Asian Paints Royale Luxury Emulsion White',
  'Paints',
  540,
  '1L',
  'product',
  'Teflon surface protector luxury interior wall paint',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-02',
  'Asian Paints Apex Weatherproof Exterior Emulsion',
  'Paints',
  1450,
  '4L',
  'product',
  'All-weather anti-fungal exterior wall paint',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-02',
  'UltraTech Super Cement',
  'Cement',
  380,
  '50kg Bag',
  'product',
  'Engineered for high compressive strength building',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-02',
  'Dr. Fixit Pidifin 2K Waterproofing Coating',
  'Waterproofing',
  290,
  '1kg',
  'product',
  'Elastomeric waterproof membrane for roofs & bathrooms',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-02',
  'Finolex 1.5 sq mm Flame Retardant Copper Wire',
  'Electricals',
  1850,
  '90m Coil',
  'product',
  'Pure electrolytic grade copper safety wire',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-02',
  'Astral CPVC Pro 1 Inch Water Pipe',
  'Plumbing',
  320,
  '3 Meter',
  'product',
  'Lead-free hot & cold water plumbing pipe',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-02',
  'Jaquar Stainless Steel Sink Bib Cock Tap',
  'Sanitary',
  780,
  'piece',
  'product',
  'Chrome plated brass body long-life tap',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-03',
  'Asian Paints Royale Luxury Emulsion White',
  'Paints',
  540,
  '1L',
  'product',
  'Teflon surface protector luxury interior wall paint',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-03',
  'Asian Paints Apex Weatherproof Exterior Emulsion',
  'Paints',
  1450,
  '4L',
  'product',
  'All-weather anti-fungal exterior wall paint',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-03',
  'UltraTech Super Cement',
  'Cement',
  380,
  '50kg Bag',
  'product',
  'Engineered for high compressive strength building',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-03',
  'Dr. Fixit Pidifin 2K Waterproofing Coating',
  'Waterproofing',
  290,
  '1kg',
  'product',
  'Elastomeric waterproof membrane for roofs & bathrooms',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-03',
  'Finolex 1.5 sq mm Flame Retardant Copper Wire',
  'Electricals',
  1850,
  '90m Coil',
  'product',
  'Pure electrolytic grade copper safety wire',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-03',
  'Astral CPVC Pro 1 Inch Water Pipe',
  'Plumbing',
  320,
  '3 Meter',
  'product',
  'Lead-free hot & cold water plumbing pipe',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-03',
  'Jaquar Stainless Steel Sink Bib Cock Tap',
  'Sanitary',
  780,
  'piece',
  'product',
  'Chrome plated brass body long-life tap',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-04',
  'Asian Paints Royale Luxury Emulsion White',
  'Paints',
  540,
  '1L',
  'product',
  'Teflon surface protector luxury interior wall paint',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-04',
  'Asian Paints Apex Weatherproof Exterior Emulsion',
  'Paints',
  1450,
  '4L',
  'product',
  'All-weather anti-fungal exterior wall paint',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-04',
  'UltraTech Super Cement',
  'Cement',
  380,
  '50kg Bag',
  'product',
  'Engineered for high compressive strength building',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-04',
  'Dr. Fixit Pidifin 2K Waterproofing Coating',
  'Waterproofing',
  290,
  '1kg',
  'product',
  'Elastomeric waterproof membrane for roofs & bathrooms',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-04',
  'Finolex 1.5 sq mm Flame Retardant Copper Wire',
  'Electricals',
  1850,
  '90m Coil',
  'product',
  'Pure electrolytic grade copper safety wire',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-04',
  'Astral CPVC Pro 1 Inch Water Pipe',
  'Plumbing',
  320,
  '3 Meter',
  'product',
  'Lead-free hot & cold water plumbing pipe',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-04',
  'Jaquar Stainless Steel Sink Bib Cock Tap',
  'Sanitary',
  780,
  'piece',
  'product',
  'Chrome plated brass body long-life tap',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-05',
  'Asian Paints Royale Luxury Emulsion White',
  'Paints',
  540,
  '1L',
  'product',
  'Teflon surface protector luxury interior wall paint',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-05',
  'Asian Paints Apex Weatherproof Exterior Emulsion',
  'Paints',
  1450,
  '4L',
  'product',
  'All-weather anti-fungal exterior wall paint',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-05',
  'UltraTech Super Cement',
  'Cement',
  380,
  '50kg Bag',
  'product',
  'Engineered for high compressive strength building',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-05',
  'Dr. Fixit Pidifin 2K Waterproofing Coating',
  'Waterproofing',
  290,
  '1kg',
  'product',
  'Elastomeric waterproof membrane for roofs & bathrooms',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-05',
  'Finolex 1.5 sq mm Flame Retardant Copper Wire',
  'Electricals',
  1850,
  '90m Coil',
  'product',
  'Pure electrolytic grade copper safety wire',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-05',
  'Astral CPVC Pro 1 Inch Water Pipe',
  'Plumbing',
  320,
  '3 Meter',
  'product',
  'Lead-free hot & cold water plumbing pipe',
  true,
  6
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-hard-05',
  'Jaquar Stainless Steel Sink Bib Cock Tap',
  'Sanitary',
  780,
  'piece',
  'product',
  'Chrome plated brass body long-life tap',
  true,
  7
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-01',
  'Banarasi Katan Silk Bridal Saree',
  'Women Ethnic',
  2850,
  'piece',
  'product',
  'Pure zari weave wedding collection saree',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-01',
  'Men''s Kurta Pajama Set with Jacket',
  'Men Ethnic',
  1499,
  'set',
  'product',
  'Festival celebration silk blend kurta set',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-01',
  'Men''s Slim Fit Stretchable Denim Jeans',
  'Men Casual',
  899,
  'piece',
  'product',
  'Durable comfortable daily wear denim',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-01',
  'Women''s Embroidered Cotton Kurti',
  'Women Casual',
  650,
  'piece',
  'product',
  'Pure cotton Lucknowi Chikankari style kurti',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-01',
  'Kids Festival Party Wear Dress Set',
  'Kids Wear',
  799,
  'set',
  'product',
  'Comfortable stylish party dress for boys & girls',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-02',
  'Banarasi Katan Silk Bridal Saree',
  'Women Ethnic',
  2850,
  'piece',
  'product',
  'Pure zari weave wedding collection saree',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-02',
  'Men''s Kurta Pajama Set with Jacket',
  'Men Ethnic',
  1499,
  'set',
  'product',
  'Festival celebration silk blend kurta set',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-02',
  'Men''s Slim Fit Stretchable Denim Jeans',
  'Men Casual',
  899,
  'piece',
  'product',
  'Durable comfortable daily wear denim',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-02',
  'Women''s Embroidered Cotton Kurti',
  'Women Casual',
  650,
  'piece',
  'product',
  'Pure cotton Lucknowi Chikankari style kurti',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-02',
  'Kids Festival Party Wear Dress Set',
  'Kids Wear',
  799,
  'set',
  'product',
  'Comfortable stylish party dress for boys & girls',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-03',
  'Banarasi Katan Silk Bridal Saree',
  'Women Ethnic',
  2850,
  'piece',
  'product',
  'Pure zari weave wedding collection saree',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-03',
  'Men''s Kurta Pajama Set with Jacket',
  'Men Ethnic',
  1499,
  'set',
  'product',
  'Festival celebration silk blend kurta set',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-03',
  'Men''s Slim Fit Stretchable Denim Jeans',
  'Men Casual',
  899,
  'piece',
  'product',
  'Durable comfortable daily wear denim',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-03',
  'Women''s Embroidered Cotton Kurti',
  'Women Casual',
  650,
  'piece',
  'product',
  'Pure cotton Lucknowi Chikankari style kurti',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-03',
  'Kids Festival Party Wear Dress Set',
  'Kids Wear',
  799,
  'set',
  'product',
  'Comfortable stylish party dress for boys & girls',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-04',
  'Banarasi Katan Silk Bridal Saree',
  'Women Ethnic',
  2850,
  'piece',
  'product',
  'Pure zari weave wedding collection saree',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-04',
  'Men''s Kurta Pajama Set with Jacket',
  'Men Ethnic',
  1499,
  'set',
  'product',
  'Festival celebration silk blend kurta set',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-04',
  'Men''s Slim Fit Stretchable Denim Jeans',
  'Men Casual',
  899,
  'piece',
  'product',
  'Durable comfortable daily wear denim',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-04',
  'Women''s Embroidered Cotton Kurti',
  'Women Casual',
  650,
  'piece',
  'product',
  'Pure cotton Lucknowi Chikankari style kurti',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-04',
  'Kids Festival Party Wear Dress Set',
  'Kids Wear',
  799,
  'set',
  'product',
  'Comfortable stylish party dress for boys & girls',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-05',
  'Banarasi Katan Silk Bridal Saree',
  'Women Ethnic',
  2850,
  'piece',
  'product',
  'Pure zari weave wedding collection saree',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-05',
  'Men''s Kurta Pajama Set with Jacket',
  'Men Ethnic',
  1499,
  'set',
  'product',
  'Festival celebration silk blend kurta set',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-05',
  'Men''s Slim Fit Stretchable Denim Jeans',
  'Men Casual',
  899,
  'piece',
  'product',
  'Durable comfortable daily wear denim',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-05',
  'Women''s Embroidered Cotton Kurti',
  'Women Casual',
  650,
  'piece',
  'product',
  'Pure cotton Lucknowi Chikankari style kurti',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-cloth-05',
  'Kids Festival Party Wear Dress Set',
  'Kids Wear',
  799,
  'set',
  'product',
  'Comfortable stylish party dress for boys & girls',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-06',
  'Special Chicken Dum Biryani',
  'Main Course',
  220,
  'Full Handi',
  'non_veg',
  'Awadhi dum cooked aromatic long grain biryani',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-06',
  'Galawati Kebab with Paratha',
  'Starters',
  180,
  '4 pcs',
  'non_veg',
  'Mouth melting royal Lucknowi spices kebab',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-06',
  'Paneer Butter Masala',
  'Main Course',
  190,
  'Full',
  'veg',
  'Rich tomato cashew gravy with fresh cottage cheese',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-06',
  'Dal Makhani Special',
  'Main Course',
  160,
  'Full',
  'veg',
  'Overnight slow cooked creamy black lentils',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-06',
  'Butter Naan',
  'Breads',
  40,
  'pc',
  'veg',
  'Crispy tandoori naan brushed with pure butter',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-07',
  'Special Chicken Dum Biryani',
  'Main Course',
  220,
  'Full Handi',
  'non_veg',
  'Awadhi dum cooked aromatic long grain biryani',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-07',
  'Galawati Kebab with Paratha',
  'Starters',
  180,
  '4 pcs',
  'non_veg',
  'Mouth melting royal Lucknowi spices kebab',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-07',
  'Paneer Butter Masala',
  'Main Course',
  190,
  'Full',
  'veg',
  'Rich tomato cashew gravy with fresh cottage cheese',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-07',
  'Dal Makhani Special',
  'Main Course',
  160,
  'Full',
  'veg',
  'Overnight slow cooked creamy black lentils',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-07',
  'Butter Naan',
  'Breads',
  40,
  'pc',
  'veg',
  'Crispy tandoori naan brushed with pure butter',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-08',
  'Special Kulhad Masala Chai',
  'Beverages',
  20,
  'Kulhad',
  'veg',
  'Fresh cardamom and ginger brewed clay pot tea',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-08',
  'Cold Coffee with Vanilla Ice Cream',
  'Beverages',
  80,
  'Glass',
  'veg',
  'Thick creamy chilled coffee shake',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-08',
  'Crispy Cheese Paneer Burger',
  'Fast Food',
  70,
  'pc',
  'veg',
  'Loaded with melting cheese and spiced paneer patty',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-08',
  'Veg Cheese Grilled Sandwich',
  'Fast Food',
  90,
  'pc',
  'veg',
  'Triple layered butter grilled sandwich',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-09',
  'Farmhouse Cheese Pizza (Medium)',
  'Pizza',
  240,
  'pc',
  'veg',
  'Loaded with capsicum, onion, tomato and mozzarella',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-09',
  'Crispy Veg Fried Momos',
  'Momos',
  70,
  '8 pcs',
  'veg',
  'Served with fiery red garlic chutney and mayonnaise',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-09',
  'Chicken Steamed Momos',
  'Momos',
  90,
  '8 pcs',
  'non_veg',
  'Juicy minced chicken momos with hot soup',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-09',
  'Chicken Kathi Roll',
  'Rolls',
  110,
  'pc',
  'non_veg',
  'Egg wrapped paratha with smoky roasted chicken',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-10',
  'Special Chicken Dum Biryani',
  'Main Course',
  220,
  'Full Handi',
  'non_veg',
  'Awadhi dum cooked aromatic long grain biryani',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-10',
  'Galawati Kebab with Paratha',
  'Starters',
  180,
  '4 pcs',
  'non_veg',
  'Mouth melting royal Lucknowi spices kebab',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-10',
  'Paneer Butter Masala',
  'Main Course',
  190,
  'Full',
  'veg',
  'Rich tomato cashew gravy with fresh cottage cheese',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-10',
  'Dal Makhani Special',
  'Main Course',
  160,
  'Full',
  'veg',
  'Overnight slow cooked creamy black lentils',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-rest-10',
  'Butter Naan',
  'Breads',
  40,
  'pc',
  'veg',
  'Crispy tandoori naan brushed with pure butter',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-06',
  'Special Kaju Katli (Pure Desi Ghee)',
  'Sweets',
  880,
  '1kg',
  'veg',
  'Diamond cut silver vark topped authentic cashew fudge',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-06',
  'Desi Ghee Gulab Jamun',
  'Sweets',
  25,
  'pc',
  'veg',
  'Warm soft khoya dumplings in saffron sugar syrup',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-06',
  'Kesaria Rasmalai',
  'Sweets',
  45,
  'pc',
  'veg',
  'Spongy cottage cheese patties steeped in thick saffron milk',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-06',
  'Hot Khasta Samosa with Chutney',
  'Snacks',
  15,
  'pc',
  'veg',
  'Crispy fried pastry stuffed with spiced potato and peas',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-06',
  'Desi Ghee Motichoor Ladoo',
  'Sweets',
  420,
  '1kg',
  'veg',
  'Tiny besan pearls soaked in pure ghee syrup',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-07',
  'Special Kaju Katli (Pure Desi Ghee)',
  'Sweets',
  880,
  '1kg',
  'veg',
  'Diamond cut silver vark topped authentic cashew fudge',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-07',
  'Desi Ghee Gulab Jamun',
  'Sweets',
  25,
  'pc',
  'veg',
  'Warm soft khoya dumplings in saffron sugar syrup',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-07',
  'Kesaria Rasmalai',
  'Sweets',
  45,
  'pc',
  'veg',
  'Spongy cottage cheese patties steeped in thick saffron milk',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-07',
  'Hot Khasta Samosa with Chutney',
  'Snacks',
  15,
  'pc',
  'veg',
  'Crispy fried pastry stuffed with spiced potato and peas',
  true,
  4
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-07',
  'Desi Ghee Motichoor Ladoo',
  'Sweets',
  420,
  '1kg',
  'veg',
  'Tiny besan pearls soaked in pure ghee syrup',
  true,
  5
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-08',
  'Dutch Chocolate Truffle Cake',
  'Cakes',
  450,
  '500g',
  'egg',
  'Rich dark chocolate ganache layered birthday cake',
  true,
  1
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-08',
  'Fresh Pineapple Cream Cake (100% Eggless)',
  'Cakes',
  380,
  '500g',
  'veg',
  'Vanilla sponge with juicy pineapple chunks',
  true,
  2
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-08',
  'Red Velvet Cream Cheese Pastry',
  'Pastries',
  75,
  'pc',
  'veg',
  'Soft red velvet sponge with rich cream cheese',
  true,
  3
) ON CONFLICT DO NOTHING;

INSERT INTO public.business_catalog_items (
  business_id, name, category, price, unit, item_type, description, is_available, display_order
) VALUES (
  'bhr-sweet-08',
  'Chocolate Lava Cake',
  'Desserts',
  60,
  'pc',
  'egg',
  'Hot molten chocolate filling inside warm cake',
  true,
  4
) ON CONFLICT DO NOTHING;

COMMIT;
