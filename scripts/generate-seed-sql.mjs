import fs from "node:fs";
import crypto from "node:crypto";

const BAHRAICH_BUSINESSES = [
  // Sweet Shops (5)
  {
    id: "bhr-sweet-01",
    name: "Deepak Sweets & Bakers",
    owner: "Deepak Kumar",
    type: "Sweet Shop",
    slug: "deepak-sweets-bakers",
    locality: "Peepal Chauraha",
    address: "Near Peepal Chauraha, Civil Lines, Bahraich",
    latitude: 27.5765,
    longitude: 81.5982,
    phone: "+919415034512",
    review_link: "https://maps.app.goo.gl/deepaksweets",
    targetRating: 4.8,
    reviewCount: 42,
  },
  {
    id: "bhr-sweet-02",
    name: "Chhappan Bhog Mithai",
    owner: "Suresh Gupta",
    type: "Sweet Shop",
    slug: "chhappan-bhog-mithai",
    locality: "Ghanta Ghar",
    address: "Ghanta Ghar Chowk, Main Market, Bahraich",
    latitude: 27.5742,
    longitude: 81.5961,
    phone: "+919838012345",
    review_link: "https://maps.app.goo.gl/chhappanbhog",
    targetRating: 4.7,
    reviewCount: 38,
  },
  {
    id: "bhr-sweet-03",
    name: "Shere Punjab Sweets",
    owner: "Harpreet Singh",
    type: "Sweet Shop",
    slug: "shere-punjab-sweets",
    locality: "Station Road",
    address: "Station Road, Opposite Railway Colony, Bahraich",
    latitude: 27.5718,
    longitude: 81.6025,
    phone: "+919450098765",
    review_link: "https://maps.app.goo.gl/sherepunjabsweets",
    targetRating: 4.9,
    reviewCount: 51,
  },
  {
    id: "bhr-sweet-04",
    name: "Ramji Lal Mithai Bhandar",
    owner: "Ramji Lal",
    type: "Sweet Shop",
    slug: "ramji-lal-mithai-bhandar",
    locality: "Chhavni Chauraha",
    address: "Chhavni Chauraha, Nanpara Road, Bahraich",
    latitude: 27.5810,
    longitude: 81.5920,
    phone: "+919839456789",
    review_link: "https://maps.app.goo.gl/ramjilalsweets",
    targetRating: 4.6,
    reviewCount: 29,
  },
  {
    id: "bhr-sweet-05",
    name: "Brijwasi Sweets & Namkeen",
    owner: "Radhey Shyam",
    type: "Sweet Shop",
    slug: "brijwasi-sweets-namkeen",
    locality: "Dargah Road",
    address: "Dargah Sharif Road, Mohalla Salarganj, Bahraich",
    latitude: 27.5685,
    longitude: 81.5890,
    phone: "+919125345678",
    review_link: "https://maps.app.goo.gl/brijwasisweets",
    targetRating: 4.7,
    reviewCount: 34,
  },

  // Restaurants (5)
  {
    id: "bhr-rest-01",
    name: "Zaika Family Restaurant",
    owner: "Mohd. Shakeel",
    type: "Restaurant",
    slug: "zaika-family-restaurant",
    locality: "KDC Chauraha",
    address: "KDC Chauraha, Kisan Degree College Road, Bahraich",
    latitude: 27.5778,
    longitude: 81.6010,
    phone: "+919918234567",
    review_link: "https://maps.app.goo.gl/zaikarestaurant",
    targetRating: 4.7,
    reviewCount: 47,
  },
  {
    id: "bhr-rest-02",
    name: "Al-Bake Dum Biryani & Restaurant",
    owner: "Mohd. Irfan",
    type: "Restaurant",
    slug: "al-bake-dum-biryani-restaurant",
    locality: "Chhavni Market",
    address: "Near Old Chhavni Police Chowki, Bahraich",
    latitude: 27.5795,
    longitude: 81.5935,
    phone: "+919838765432",
    review_link: "https://maps.app.goo.gl/albakebiryani",
    targetRating: 4.8,
    reviewCount: 55,
  },
  {
    id: "bhr-rest-03",
    name: "Royal Dine Multi-Cuisine Restaurant",
    owner: "Anil Srivastava",
    type: "Restaurant",
    slug: "royal-dine-multi-cuisine-restaurant",
    locality: "Civil Lines",
    address: "Civil Lines, Opposite Stadium Ground, Bahraich",
    latitude: 27.5755,
    longitude: 81.5975,
    phone: "+919415876543",
    review_link: "https://maps.app.goo.gl/royaldine",
    targetRating: 4.6,
    reviewCount: 39,
  },
  {
    id: "bhr-rest-04",
    name: "Madhuram Pure Veg Restaurant",
    owner: "Vinod Agarwal",
    type: "Restaurant",
    slug: "madhuram-pure-veg-restaurant",
    locality: "Ghanta Ghar",
    address: "Ghanta Ghar, Near Sarafa Bazaar, Bahraich",
    latitude: 27.5738,
    longitude: 81.5958,
    phone: "+919451234890",
    review_link: "https://maps.app.goo.gl/madhuramrestaurant",
    targetRating: 4.9,
    reviewCount: 44,
  },
  {
    id: "bhr-rest-05",
    name: "New Milan Cafe & Fast Food",
    owner: "Ashish Verma",
    type: "Fast Food",
    slug: "new-milan-cafe-fast-food",
    locality: "Hospital Road",
    address: "Hospital Road, Near District Hospital Gate, Bahraich",
    latitude: 27.5722,
    longitude: 81.5940,
    phone: "+919935123456",
    review_link: "https://maps.app.goo.gl/newmilancafe",
    targetRating: 4.6,
    reviewCount: 32,
  },

  // Salons (5)
  {
    id: "bhr-salon-01",
    name: "Looks & Style Hair Studio",
    owner: "Sameer Siddiqui",
    type: "Salon",
    slug: "looks-style-hair-studio",
    locality: "Civil Lines",
    address: "Civil Lines, Near SBI Main Branch, Bahraich",
    latitude: 27.5760,
    longitude: 81.5978,
    phone: "+919415443322",
    review_link: "https://maps.app.goo.gl/looksandstyle",
    targetRating: 4.7,
    reviewCount: 35,
  },
  {
    id: "bhr-salon-02",
    name: "Roopam Herbal Beauty Parlour",
    owner: "Sunita Maurya",
    type: "Beauty Parlour",
    slug: "roopam-herbal-beauty-parlour",
    locality: "KDC Road",
    address: "Opposite KDC College, Nanpara Road, Bahraich",
    latitude: 27.5785,
    longitude: 81.6015,
    phone: "+919792112233",
    review_link: "https://maps.app.goo.gl/roopambeauty",
    targetRating: 4.9,
    reviewCount: 41,
  },
  {
    id: "bhr-salon-03",
    name: "Glamour Touch Makeup Studio",
    owner: "Pooja Mishra",
    type: "Beauty Parlour",
    slug: "glamour-touch-makeup-studio",
    locality: "Peepal Chauraha",
    address: "Peepal Chauraha, Civil Lines, Bahraich",
    latitude: 27.5768,
    longitude: 81.5985,
    phone: "+919936554433",
    review_link: "https://maps.app.goo.gl/glamourtouch",
    targetRating: 4.8,
    reviewCount: 28,
  },
  {
    id: "bhr-salon-04",
    name: "Star Men's Salon & Grooming",
    owner: "Arun Sharma",
    type: "Barber Shop",
    slug: "star-mens-salon-grooming",
    locality: "Station Road",
    address: "Station Road, Near Railway Colony, Bahraich",
    latitude: 27.5710,
    longitude: 81.6030,
    phone: "+919140667788",
    review_link: "https://maps.app.goo.gl/starmenssalon",
    targetRating: 4.6,
    reviewCount: 22,
  },
  {
    id: "bhr-salon-05",
    name: "Habib Unisex Hair Salon",
    owner: "Mohd. Habib",
    type: "Salon",
    slug: "habib-unisex-hair-salon",
    locality: "Ghanta Ghar",
    address: "Ghanta Ghar Market, Sarafa Road, Bahraich",
    latitude: 27.5745,
    longitude: 81.5965,
    phone: "+919839112233",
    review_link: "https://maps.app.goo.gl/habibsalon",
    targetRating: 4.8,
    reviewCount: 36,
  },

  // Clinics (5)
  {
    id: "bhr-clinic-01",
    name: "Aastha Dental Care & Implant Centre",
    owner: "Dr. Alok Srivastava",
    type: "Dental Clinic",
    slug: "aastha-dental-care-implant-centre",
    locality: "Civil Lines",
    address: "Civil Lines, Near Indira Stadium, Bahraich",
    latitude: 27.5752,
    longitude: 81.5972,
    phone: "+919415778899",
    review_link: "https://maps.app.goo.gl/aasthadental",
    targetRating: 4.9,
    reviewCount: 46,
  },
  {
    id: "bhr-clinic-02",
    name: "Sanjeevani Poly Clinic & Pathology",
    owner: "Dr. R. K. Tiwari",
    type: "Clinic",
    slug: "sanjeevani-poly-clinic-pathology",
    locality: "Hospital Road",
    address: "Hospital Road, Opposite Red Cross Society, Bahraich",
    latitude: 27.5728,
    longitude: 81.5945,
    phone: "+919838223344",
    review_link: "https://maps.app.goo.gl/sanjeevaniclinic",
    targetRating: 4.8,
    reviewCount: 52,
  },
  {
    id: "bhr-clinic-03",
    name: "Dr. Verma Child & Family Clinic",
    owner: "Dr. Pradeep Verma",
    type: "Clinic",
    slug: "dr-verma-child-family-clinic",
    locality: "KDC Chauraha",
    address: "Near KDC Chauraha, Nanpara Bypass, Bahraich",
    latitude: 27.5780,
    longitude: 81.6008,
    phone: "+919450334455",
    review_link: "https://maps.app.goo.gl/drvermaclinic",
    targetRating: 4.7,
    reviewCount: 37,
  },
  {
    id: "bhr-clinic-04",
    name: "City Eye Hospital & Laser Centre",
    owner: "Dr. Neeraj Jain",
    type: "Clinic",
    slug: "city-eye-hospital-laser-centre",
    locality: "Digambar Jain Road",
    address: "Digambar Jain Mandir Road, Ghanta Ghar, Bahraich",
    latitude: 27.5735,
    longitude: 81.5962,
    phone: "+919918556677",
    review_link: "https://maps.app.goo.gl/cityeyehospital",
    targetRating: 4.8,
    reviewCount: 31,
  },
  {
    id: "bhr-clinic-05",
    name: "Care & Cure Physiotherapy & Diagnostic",
    owner: "Dr. Amit Shukla",
    type: "Diagnostic Centre",
    slug: "care-cure-physiotherapy-diagnostic",
    locality: "Dargah Road",
    address: "Dargah Bypass Road, Bahraich",
    latitude: 27.5690,
    longitude: 81.5895,
    phone: "+919721889900",
    review_link: "https://maps.app.goo.gl/careandcure",
    targetRating: 4.7,
    reviewCount: 25,
  },

  // Hotels (4)
  {
    id: "bhr-hotel-01",
    name: "Hotel Imperial & Banquet Hall",
    owner: "Ravi Jaiswal",
    type: "Hotel",
    slug: "hotel-imperial-banquet-hall",
    locality: "Civil Lines",
    address: "Civil Lines, Near Head Post Office, Bahraich",
    latitude: 27.5758,
    longitude: 81.5970,
    phone: "+919415123987",
    review_link: "https://maps.app.goo.gl/hotelimperial",
    targetRating: 4.8,
    reviewCount: 49,
  },
  {
    id: "bhr-hotel-02",
    name: "Awadh Residency & Guest House",
    owner: "Mohd. Rizwan",
    type: "Hotel",
    slug: "awadh-residency-guest-house",
    locality: "Station Road",
    address: "Near Railway Station, Station Road, Bahraich",
    latitude: 27.5715,
    longitude: 81.6022,
    phone: "+919839998877",
    review_link: "https://maps.app.goo.gl/awadhresidency",
    targetRating: 4.6,
    reviewCount: 33,
  },
  {
    id: "bhr-hotel-03",
    name: "Hotel Grand Sheetal",
    owner: "Sheetal Prasad",
    type: "Hotel",
    slug: "hotel-grand-sheetal",
    locality: "Peepal Chauraha",
    address: "Peepal Chauraha, Civil Lines, Bahraich",
    latitude: 27.5767,
    longitude: 81.5980,
    phone: "+919450445566",
    review_link: "https://maps.app.goo.gl/hotelgrandsheetal",
    targetRating: 4.7,
    reviewCount: 40,
  },
  {
    id: "bhr-hotel-04",
    name: "Shree Ram Palace & Hotel",
    owner: "Ram Chandra",
    type: "Hotel",
    slug: "shree-ram-palace-hotel",
    locality: "Chhavni Chauraha",
    address: "Chhavni Market, Lucknow Highway, Bahraich",
    latitude: 27.5805,
    longitude: 81.5925,
    phone: "+919935778899",
    review_link: "https://maps.app.goo.gl/shreerampalace",
    targetRating: 4.6,
    reviewCount: 28,
  },

  // Grocery Stores (5)
  {
    id: "bhr-groc-01",
    name: "Gupta Kirana & General Store",
    owner: "Manoj Gupta",
    type: "Grocery Store",
    slug: "gupta-kirana-general-store",
    locality: "Ghanta Ghar",
    address: "Ghanta Ghar Chowk, Main Bazaar, Bahraich",
    latitude: 27.5740,
    longitude: 81.5960,
    phone: "+919415667788",
    review_link: "https://maps.app.goo.gl/guptakirana",
    targetRating: 4.8,
    reviewCount: 36,
  },
  {
    id: "bhr-groc-02",
    name: "Apna Super Bazaar",
    owner: "Vikas Agrawal",
    type: "Supermarket",
    slug: "apna-super-bazaar",
    locality: "Civil Lines",
    address: "Civil Lines, Near Income Tax Office, Bahraich",
    latitude: 27.5762,
    longitude: 81.5976,
    phone: "+919838554433",
    review_link: "https://maps.app.goo.gl/apnasuperbazaar",
    targetRating: 4.9,
    reviewCount: 54,
  },
  {
    id: "bhr-groc-03",
    name: "Bansal Daily Needs & Mart",
    owner: "Ramesh Bansal",
    type: "Grocery Store",
    slug: "bansal-daily-needs-mart",
    locality: "KDC Chauraha",
    address: "KDC Chauraha, College Road, Bahraich",
    latitude: 27.5775,
    longitude: 81.6005,
    phone: "+919451889900",
    review_link: "https://maps.app.goo.gl/bansaldailyneeds",
    targetRating: 4.7,
    reviewCount: 31,
  },
  {
    id: "bhr-groc-04",
    name: "Shri Krishna Departmental Store",
    owner: "Gopal Krishna",
    type: "Grocery Store",
    slug: "shri-krishna-departmental-store",
    locality: "Peepal Chauraha",
    address: "Peepal Chauraha, Civil Lines, Bahraich",
    latitude: 27.5766,
    longitude: 81.5983,
    phone: "+919918443322",
    review_link: "https://maps.app.goo.gl/shrikrishnastore",
    targetRating: 4.7,
    reviewCount: 27,
  },
  {
    id: "bhr-groc-05",
    name: "Kisan Mandi Fresh Mart",
    owner: "Sanjay Kumar",
    type: "Supermarket",
    slug: "kisan-mandi-fresh-mart",
    locality: "Station Road",
    address: "Station Road, Near Galla Mandi Gate, Bahraich",
    latitude: 27.5712,
    longitude: 81.6028,
    phone: "+919792667788",
    review_link: "https://maps.app.goo.gl/kisanmandifresh",
    targetRating: 4.8,
    reviewCount: 39,
  },
];

const CUSTOMER_NAMES = [
  "Rohit Sharma", "Pooja Srivastava", "Mohd. Tariq", "Amit Verma", "Sunita Devi",
  "Rajesh Tiwari", "Vikas Singh", "Neha Gupta", "Deepak Kashyap", "Ankit Jaiswal",
  "Preeti Pandey", "Saurabh Mishra", "Kavita Shukla", "Imran Khan", "Alok Kumar",
  "Shalini Saxena", "Ravi Shankar", "Pankaj Maurya", "Divya Agrawal", "Manoj Yadav",
  "Anurag Dixit", "Priyanka Pathak", "Sandeep Rawat", "Meena Rastogi", "Gaurav Tripathi"
];

const POSITIVE_COMMENTS = [
  "Bahut achhi service aur shandar quality! Bahraich me sabse best.",
  "Excellent experience. Very polite staff and hygienic environment.",
  "Kafi purana aur bharosemand shop hai. Hamara family yahi se shopping karta hai.",
  "Top quality products and reasonable rates. Highly recommended in Bahraich!",
  "Great customer support and quick service. Five stars!",
  "Best in the locality. Very satisfied with the experience.",
  "Superb quality! Definitely visiting again."
];

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- Seed 29 Authentic Bahraich Local Businesses across 6 Categories
BEGIN;

`;

for (const b of BAHRAICH_BUSINESSES) {
  sql += `-- Business: ${b.name} (${b.type})
INSERT INTO public.businesses (
  id, name, owner, phone, type, status, merchant_status, qr_status, plan,
  address, locality, city, district, state, pincode,
  location_latitude, location_longitude, location_captured_at,
  discovery_location_verified_at, discovery_location_verification_source,
  review_link, scans, deleted_at, qr_type, registration_date
) VALUES (
  ${escapeSql(b.id)}, ${escapeSql(b.name)}, ${escapeSql(b.owner)}, ${escapeSql(b.phone)}, ${escapeSql(b.type)},
  'active', 'active', 'active', 'premium',
  ${escapeSql(b.address)}, ${escapeSql(b.locality)}, 'Bahraich', 'Bahraich', 'Uttar Pradesh', '271801',
  ${b.latitude}, ${b.longitude}, NOW(),
  NOW(), 'admin_reviewed',
  ${escapeSql(b.review_link)}, ${b.reviewCount * 2 + 10}, NULL, 'review', CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  owner = EXCLUDED.owner,
  phone = EXCLUDED.phone,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  merchant_status = EXCLUDED.merchant_status,
  qr_status = EXCLUDED.qr_status,
  address = EXCLUDED.address,
  locality = EXCLUDED.locality,
  city = EXCLUDED.city,
  district = EXCLUDED.district,
  state = EXCLUDED.state,
  pincode = EXCLUDED.pincode,
  location_latitude = EXCLUDED.location_latitude,
  location_longitude = EXCLUDED.location_longitude,
  discovery_location_verified_at = EXCLUDED.discovery_location_verified_at,
  discovery_location_verification_source = EXCLUDED.discovery_location_verification_source,
  review_link = EXCLUDED.review_link;

INSERT INTO public.business_public_slugs (business_id, slug)
VALUES (${escapeSql(b.id)}, ${escapeSql(b.slug)})
ON CONFLICT (business_id) DO UPDATE SET slug = EXCLUDED.slug;

`;

  // Reviews & Sessions
  const needed = b.reviewCount;
  const n5 = Math.min(needed, Math.max(0, Math.round(needed * (b.targetRating - 4.0))));
  const n4 = needed - n5;
  const ratings = [...Array(n5).fill(5), ...Array(n4).fill(4)].sort(() => Math.random() - 0.5);

  for (let i = 0; i < ratings.length; i++) {
    const rating = ratings[i];
    const sessionId = crypto.randomUUID();
    const reviewId = crypto.randomUUID();
    const customerName = CUSTOMER_NAMES[(i + b.id.charCodeAt(b.id.length - 1)) % CUSTOMER_NAMES.length];
    const comment = POSITIVE_COMMENTS[i % POSITIVE_COMMENTS.length];
    const daysAgo = Math.round((ratings.length - i) * 2.5);

    sql += `INSERT INTO public.review_sessions (
  id, business_id, selected_rating, current_review_text,
  review_status, google_status, trustit_status, current_generation_number,
  created_at, updated_at, expires_at
) VALUES (
  ${escapeSql(sessionId)}, ${escapeSql(b.id)}, ${rating}, ${escapeSql(comment)},
  'submitted', 'completed', 'submitted', 1,
  NOW() - INTERVAL '${daysAgo} days', NOW() - INTERVAL '${daysAgo} days', NOW() + INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.trustit_reviews (
  id, review_session_id, business_id, rating, review_text, customer_name, submitted_at, status
) VALUES (
  ${escapeSql(reviewId)}, ${escapeSql(sessionId)}, ${escapeSql(b.id)}, ${rating}, ${escapeSql(comment)},
  ${escapeSql(customerName)}, NOW() - INTERVAL '${daysAgo} days', 'submitted'
) ON CONFLICT (id) DO NOTHING;

`;
  }
}

sql += `COMMIT;
`;

fs.writeFileSync("scripts/seed_bahraich.sql", sql);
console.log("Generated scripts/seed_bahraich.sql successfully. Size:", (sql.length / 1024).toFixed(1), "KB");
