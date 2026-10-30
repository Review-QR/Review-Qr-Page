import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(supabaseUrl, supabaseKey);

async function curate() {
  console.log("=== 1. Ensuring Deliciated Cafe (Restaurant) ===");
  const { data: deliBiz, error: dErr } = await admin.from("businesses").upsert({
    id: "QR-77837092",
    name: "Deliciated Cafe",
    type: "Restaurant",
    city: "Bahraich",
    address: "Opp. KDC College, Mastan Complex, Bahraich",
    phone: "9118643415",
    location_latitude: 27.5588,
    location_longitude: 81.5834,
    status: "active",
    merchant_status: "active",
    plan: "premium",
    deleted_at: null,
  }).select().single();

  if (dErr) console.error("Error creating Deliciated Cafe:", dErr);
  else console.log("Deliciated Cafe active:", deliBiz.id);

  // Deliciated Cafe catalog items
  const deliItems = [
    { business_id: "QR-77837092", name: "Crispy Corn (Full)", category: "Fast Food", price: 10, item_type: "veg", is_available: true, description: "Crispy fried sweet corn tossed with lemon & spices." },
    { business_id: "QR-77837092", name: "Crispy Veg Burger with Fries", category: "Burgers", price: 90, item_type: "veg", is_available: true, description: "Crisp potato patty with lettuce, cheese slice, and seasoned fries." },
    { business_id: "QR-77837092", name: "Veg Grilled Sandwich", category: "Sandwiches", price: 60, item_type: "veg", is_available: true, description: "Golden toasted sandwich with bell peppers, sweet corn & mint chutney." },
    { business_id: "QR-77837092", name: "Cheese Farmhouse Pizza", category: "Pizzas", price: 160, item_type: "veg", is_available: true, description: "Loaded with mozzarella, capsicum, onion, tomato & corn." },
    { business_id: "QR-77837092", name: "Cold Coffee with Ice Cream", category: "Beverages", price: 70, item_type: "veg", is_available: true, description: "Rich blended thick coffee topped with creamy vanilla ice cream." },
    { business_id: "QR-77837092", name: "Peri Peri French Fries (Large)", category: "Sides", price: 50, item_type: "veg", is_available: true, description: "Hot crispy potato fingers dusted with fiery peri peri seasoning." },
  ];

  for (const item of deliItems) {
    const { data: existing } = await admin
      .from("business_catalog_items")
      .select("id")
      .eq("business_id", item.business_id)
      .eq("name", item.name)
      .maybeSingle();

    if (!existing) {
      await admin.from("business_catalog_items").insert(item);
    }
  }

  console.log("=== 2. Ensuring Dairy Milk & Products (1 vendor) ===");
  const { data: dairyBiz, error: dairyErr } = await admin.from("businesses").upsert({
    id: "bhr-dairy-01",
    name: "Shyam Dudh & Fresh Dairy",
    type: "Dairy",
    city: "Bahraich",
    address: "Chhawni Chauraha, Bahraich",
    phone: "9876543210",
    location_latitude: 27.5750,
    location_longitude: 81.5900,
    status: "active",
    merchant_status: "active",
    plan: "standard",
    deleted_at: null,
  }).select().single();

  if (dairyErr) console.error("Error creating Dairy vendor:", dairyErr);
  else console.log("Dairy vendor active:", dairyBiz.id);

  const dairyItems = [
    { business_id: "bhr-dairy-01", name: "Fresh Buffalo Milk (1 Litre)", category: "Milk", price: 66, item_type: "veg", is_available: true, description: "Pure farm fresh thick buffalo milk, tested for purity." },
    { business_id: "bhr-dairy-01", name: "Fresh Cow Milk (1 Litre)", category: "Milk", price: 58, item_type: "veg", is_available: true, description: "Nutritious light cow milk directly from dairy." },
    { business_id: "bhr-dairy-01", name: "Fresh Malai Paneer (500g)", category: "Dairy Products", price: 180, item_type: "veg", is_available: true, description: "Soft, spongy malai cottage cheese." },
    { business_id: "bhr-dairy-01", name: "Thick Sweet Dahi (500g)", category: "Dairy Products", price: 60, item_type: "veg", is_available: true, description: "Creamy set curd in earthen-safe container." },
    { business_id: "bhr-dairy-01", name: "Pure Desi Ghee (1 Kg)", category: "Ghee", price: 650, item_type: "veg", is_available: true, description: "Traditional aroma authentic bilona ghee." },
  ];

  for (const item of dairyItems) {
    const { data: existing } = await admin
      .from("business_catalog_items")
      .select("id")
      .eq("business_id", item.business_id)
      .eq("name", item.name)
      .maybeSingle();

    if (!existing) {
      await admin.from("business_catalog_items").insert(item);
    }
  }

  console.log("=== 3. Defining The EXACT 1-Vendor Per Category Keep List ===");
  const keepIds = new Set([
    "QR-77837092", // Restaurant / Food: Deliciated Cafe
    "bhr-dairy-01", // Milk & Products: Shyam Dudh & Fresh Dairy
    "bhr-groc-01",  // Grocery: Gupta Kirana & General Store
    "bhr-pharm-01", // Pharmacy / Medical: Sanjeevani Medicos & Chemists
    "bhr-auto-03",  // Car Wash: Speed Shine Car Wash & Detailing
    "bhr-salon-01", // Salon & Grooming: Looks & Style Hair Studio
    "bhr-clinic-03", // Clinic: Dr. Verma Child & Family Clinic
    "bhr-hotel-01",  // Hotel: Hotel Imperial & Banquet Hall
    "bhr-cloth-01",  // Clothing: Shringar Sarees & Bridal Emporium
    "bhr-hard-01",   // Hardware: Asian Paints Color Ideas & Hardware
    "bhr-elec-01",   // Mobile & Electronics: Balaji Mobile World & Accessories
    "bhr-auto-01",   // Automobile Garage: MRF Tyre Care & Wheel Alignment
  ]);

  console.log("Keeping IDs:", Array.from(keepIds));

  // Soft delete all active businesses NOT in keepIds
  const { data: allActive } = await admin
    .from("businesses")
    .select("id, name, type")
    .is("deleted_at", null);

  const toDelete = allActive.filter((b) => !keepIds.has(b.id));
  console.log(`Soft deleting ${toDelete.length} extra dummy businesses...`);

  const now = new Date().toISOString();
  for (const b of toDelete) {
    await admin.from("businesses").update({ deleted_at: now }).eq("id", b.id);
  }

  // Also verify keep businesses are not deleted
  for (const id of keepIds) {
    await admin.from("businesses").update({ deleted_at: null }).eq("id", id);
  }

  // Check final count
  const { data: remaining } = await admin
    .from("businesses")
    .select("id, name, type, city")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  console.log(`\nDONE! Exactly ${remaining.length} businesses now live in the system:`);
  for (const r of remaining) {
    console.log(`- [${r.id}] "${r.name}" (${r.type})`);
  }
}

curate();
