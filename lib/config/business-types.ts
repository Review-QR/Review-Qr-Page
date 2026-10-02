export type BusinessIcon = { key: string; label: string };

export type BusinessType = {
  id: string;
  slug: string;
  name: string;
  group: string;
  aliases: string[];
  primaryIcons: [BusinessIcon, BusinessIcon, BusinessIcon];
};

// The authoritative business taxonomy used by registration and QR artwork.
export const businessTypes: BusinessType[] = [
  {
    id: "restaurant", slug: "restaurant", name: "Restaurant", group: "Food & Restaurant",
    aliases: ["Cafe/Restaurant", "Restaurant", "dining", "eatery", "food restaurant"],
    primaryIcons: [{"key": "restaurant-building", "label": "Restaurant Building"}, {"key": "chef", "label": "Chef"}, {"key": "food-plate", "label": "Food Plate"}],
  },
  {
    id: "cafe", slug: "cafe", name: "Café", group: "Food & Restaurant",
    aliases: ["Cafe", "cafe", "coffee house"],
    primaryIcons: [{"key": "coffee-cup", "label": "Coffee Cup"}, {"key": "barista", "label": "Barista"}, {"key": "cafe-chair", "label": "Café Chair"}],
  },
  {
    id: "coffee-shop", slug: "coffee-shop", name: "Coffee Shop", group: "Food & Restaurant",
    aliases: ["Coffee Shop", "coffee house", "coffeehouse"],
    primaryIcons: [{"key": "coffee-cup", "label": "Coffee Cup"}, {"key": "coffee-beans", "label": "Coffee Beans"}, {"key": "coffee-machine", "label": "Coffee Machine"}],
  },
  {
    id: "fast-food", slug: "fast-food", name: "Fast Food", group: "Food & Restaurant",
    aliases: ["Fast Food"],
    primaryIcons: [{"key": "burger", "label": "Burger"}, {"key": "fries", "label": "Fries"}, {"key": "soft-drink", "label": "Soft Drink"}],
  },
  {
    id: "pizza-shop", slug: "pizza-shop", name: "Pizza Shop", group: "Food & Restaurant",
    aliases: ["Pizza Shop"],
    primaryIcons: [{"key": "pizza", "label": "Pizza"}, {"key": "pizza-oven", "label": "Pizza Oven"}, {"key": "pizza-box", "label": "Pizza Box"}],
  },
  {
    id: "bakery", slug: "bakery", name: "Bakery", group: "Food & Restaurant",
    aliases: ["Bakery"],
    primaryIcons: [{"key": "bread", "label": "Bread"}, {"key": "baker", "label": "Baker"}, {"key": "oven", "label": "Oven"}],
  },
  {
    id: "cake-shop", slug: "cake-shop", name: "Cake Shop", group: "Food & Restaurant",
    aliases: ["Cake Shop"],
    primaryIcons: [{"key": "cake", "label": "Cake"}, {"key": "cupcake", "label": "Cupcake"}, {"key": "pastry", "label": "Pastry"}],
  },
  {
    id: "sweet-shop", slug: "sweet-shop", name: "Sweet Shop", group: "Food & Restaurant",
    aliases: ["Sweet Shop"],
    primaryIcons: [{"key": "sweets", "label": "Sweets"}, {"key": "mithai-box", "label": "Mithai Box"}, {"key": "dessert", "label": "Dessert"}],
  },
  {
    id: "ice-cream-parlour", slug: "ice-cream-parlour", name: "Ice Cream Parlour", group: "Food & Restaurant",
    aliases: ["Ice Cream Parlour"],
    primaryIcons: [{"key": "ice-cream-cone", "label": "Ice Cream Cone"}, {"key": "sundae", "label": "Sundae"}, {"key": "ice-cream-cup", "label": "Ice Cream Cup"}],
  },
  {
    id: "juice-center", slug: "juice-center", name: "Juice Center", group: "Food & Restaurant",
    aliases: ["Juice Center"],
    primaryIcons: [{"key": "juice-glass", "label": "Juice Glass"}, {"key": "fruit", "label": "Fruit"}, {"key": "blender", "label": "Blender"}],
  },
  {
    id: "tea-shop", slug: "tea-shop", name: "Tea Shop", group: "Food & Restaurant",
    aliases: ["Tea Shop"],
    primaryIcons: [{"key": "tea-cup", "label": "Tea Cup"}, {"key": "tea-pot", "label": "Tea Pot"}, {"key": "chai", "label": "Chai"}],
  },
  {
    id: "dhaba", slug: "dhaba", name: "Dhaba", group: "Food & Restaurant",
    aliases: ["Dhaba"],
    primaryIcons: [{"key": "dhaba-building", "label": "Dhaba Building"}, {"key": "food-plate", "label": "Food Plate"}, {"key": "roti", "label": "Roti"}],
  },
  {
    id: "cloud-kitchen", slug: "cloud-kitchen", name: "Cloud Kitchen", group: "Food & Restaurant",
    aliases: ["Cloud Kitchen"],
    primaryIcons: [{"key": "chef", "label": "Chef"}, {"key": "food-box", "label": "Food Box"}, {"key": "delivery", "label": "Delivery"}],
  },
  {
    id: "food-truck", slug: "food-truck", name: "Food Truck", group: "Food & Restaurant",
    aliases: ["Food Truck"],
    primaryIcons: [{"key": "food-truck", "label": "Food Truck"}, {"key": "burger", "label": "Burger"}, {"key": "chef", "label": "Chef"}],
  },
  {
    id: "catering-service", slug: "catering-service", name: "Catering Service", group: "Food & Restaurant",
    aliases: ["Catering Service"],
    primaryIcons: [{"key": "chef", "label": "Chef"}, {"key": "catering-tray", "label": "Catering Tray"}, {"key": "food-pot", "label": "Food Pot"}],
  },
  {
    id: "tiffin-service", slug: "tiffin-service", name: "Tiffin Service", group: "Food & Restaurant",
    aliases: ["Tiffin Service"],
    primaryIcons: [{"key": "tiffin-box", "label": "Tiffin Box"}, {"key": "meal", "label": "Meal"}, {"key": "delivery", "label": "Delivery"}],
  },
  {
    id: "street-food", slug: "street-food", name: "Street Food", group: "Food & Restaurant",
    aliases: ["Street Food"],
    primaryIcons: [{"key": "food-cart", "label": "Food Cart"}, {"key": "street-food", "label": "Street Food"}, {"key": "skewer", "label": "Skewer"}],
  },
  {
    id: "namkeen-shop", slug: "namkeen-shop", name: "Namkeen Shop", group: "Food & Restaurant",
    aliases: ["Namkeen Shop"],
    primaryIcons: [{"key": "namkeen", "label": "Namkeen"}, {"key": "snack-packet", "label": "Snack Packet"}, {"key": "weighing-scale", "label": "Weighing Scale"}],
  },
  {
    id: "meat-shop", slug: "meat-shop", name: "Meat Shop", group: "Food & Restaurant",
    aliases: ["Meat Shop"],
    primaryIcons: [{"key": "meat", "label": "Meat"}, {"key": "butcher-knife", "label": "Butcher Knife"}, {"key": "meat-counter", "label": "Meat Counter"}],
  },
  {
    id: "chicken-shop", slug: "chicken-shop", name: "Chicken Shop", group: "Food & Restaurant",
    aliases: ["Chicken Shop"],
    primaryIcons: [{"key": "chicken", "label": "Chicken"}, {"key": "butcher-knife", "label": "Butcher Knife"}, {"key": "weighing-scale", "label": "Weighing Scale"}],
  },
  {
    id: "fish-shop", slug: "fish-shop", name: "Fish Shop", group: "Food & Restaurant",
    aliases: ["Fish Shop"],
    primaryIcons: [{"key": "fish", "label": "Fish"}, {"key": "ice", "label": "Ice"}, {"key": "weighing-scale", "label": "Weighing Scale"}],
  },
  {
    id: "dairy-shop", slug: "dairy-shop", name: "Dairy Shop", group: "Food & Restaurant",
    aliases: ["Dairy Shop"],
    primaryIcons: [{"key": "milk", "label": "Milk"}, {"key": "cow", "label": "Cow"}, {"key": "dairy-products", "label": "Dairy Products"}],
  },
  {
    id: "organic-food-store", slug: "organic-food-store", name: "Organic Food Store", group: "Food & Restaurant",
    aliases: ["Organic Food Store"],
    primaryIcons: [{"key": "organic-leaf", "label": "Organic Leaf"}, {"key": "vegetables", "label": "Vegetables"}, {"key": "grain", "label": "Grain"}],
  },
  {
    id: "grocery-store", slug: "grocery-store", name: "Grocery Store", group: "Retail & Shopping",
    aliases: ["Grocery Store", "grocer", "groceries"],
    primaryIcons: [{"key": "shopping-cart", "label": "Shopping Cart"}, {"key": "grocery-bag", "label": "Grocery Bag"}, {"key": "store", "label": "Store"}],
  },
  {
    id: "kirana-store", slug: "kirana-store", name: "Kirana Store", group: "Retail & Shopping",
    aliases: ["Kirana Store", "corner shop", "kirana"],
    primaryIcons: [{"key": "grocery-bag", "label": "Grocery Bag"}, {"key": "weighing-scale", "label": "Weighing Scale"}, {"key": "store", "label": "Store"}],
  },
  {
    id: "supermarket", slug: "supermarket", name: "Supermarket", group: "Retail & Shopping",
    aliases: ["Supermarket"],
    primaryIcons: [{"key": "shopping-cart", "label": "Shopping Cart"}, {"key": "shopping-bag", "label": "Shopping Bag"}, {"key": "store", "label": "Store"}],
  },
  {
    id: "general-store", slug: "general-store", name: "General Store", group: "Retail & Shopping",
    aliases: ["General Store", "Shop", "convenience store", "general shop"],
    primaryIcons: [{"key": "store", "label": "Store"}, {"key": "shopping-bag", "label": "Shopping Bag"}, {"key": "products", "label": "Products"}],
  },
  {
    id: "clothing-store", slug: "clothing-store", name: "Clothing Store", group: "Retail & Shopping",
    aliases: ["Clothing Store"],
    primaryIcons: [{"key": "t-shirt", "label": "T-Shirt"}, {"key": "dress", "label": "Dress"}, {"key": "shopping-bag", "label": "Shopping Bag"}],
  },
  {
    id: "garment-shop", slug: "garment-shop", name: "Garment Shop", group: "Retail & Shopping",
    aliases: ["Garment Shop"],
    primaryIcons: [{"key": "t-shirt", "label": "T-Shirt"}, {"key": "jeans", "label": "Jeans"}, {"key": "fabric", "label": "Fabric"}],
  },
  {
    id: "men-s-clothing", slug: "men-s-clothing", name: "Men's Clothing", group: "Retail & Shopping",
    aliases: ["Men's Clothing"],
    primaryIcons: [{"key": "shirt", "label": "Shirt"}, {"key": "jeans", "label": "Jeans"}, {"key": "formal-shoe", "label": "Formal Shoe"}],
  },
  {
    id: "women-s-clothing", slug: "women-s-clothing", name: "Women's Clothing", group: "Retail & Shopping",
    aliases: ["Women's Clothing"],
    primaryIcons: [{"key": "dress", "label": "Dress"}, {"key": "saree", "label": "Saree"}, {"key": "handbag", "label": "Handbag"}],
  },
  {
    id: "kids-clothing", slug: "kids-clothing", name: "Kids Clothing", group: "Retail & Shopping",
    aliases: ["Kids Clothing"],
    primaryIcons: [{"key": "kids-t-shirt", "label": "Kids T-Shirt"}, {"key": "kids-pants", "label": "Kids Pants"}, {"key": "shoes", "label": "Shoes"}],
  },
  {
    id: "boutique", slug: "boutique", name: "Boutique", group: "Retail & Shopping",
    aliases: ["Boutique"],
    primaryIcons: [{"key": "dress", "label": "Dress"}, {"key": "sewing", "label": "Sewing"}, {"key": "handbag", "label": "Handbag"}],
  },
  {
    id: "saree-shop", slug: "saree-shop", name: "Saree Shop", group: "Retail & Shopping",
    aliases: ["Saree Shop"],
    primaryIcons: [{"key": "saree", "label": "Saree"}, {"key": "fabric", "label": "Fabric"}, {"key": "jewellery", "label": "Jewellery"}],
  },
  {
    id: "footwear-shop", slug: "footwear-shop", name: "Footwear Shop", group: "Retail & Shopping",
    aliases: ["Footwear Shop"],
    primaryIcons: [{"key": "shoe", "label": "Shoe"}, {"key": "sandal", "label": "Sandal"}, {"key": "boot", "label": "Boot"}],
  },
  {
    id: "jewellery-shop", slug: "jewellery-shop", name: "Jewellery Shop", group: "Retail & Shopping",
    aliases: ["Jewellery Shop"],
    primaryIcons: [{"key": "ring", "label": "Ring"}, {"key": "diamond", "label": "Diamond"}, {"key": "necklace", "label": "Necklace"}],
  },
  {
    id: "gold-shop", slug: "gold-shop", name: "Gold Shop", group: "Retail & Shopping",
    aliases: ["Gold Shop"],
    primaryIcons: [{"key": "gold-ring", "label": "Gold Ring"}, {"key": "gold-necklace", "label": "Gold Necklace"}, {"key": "gold-coin", "label": "Gold Coin"}],
  },
  {
    id: "watch-store", slug: "watch-store", name: "Watch Store", group: "Retail & Shopping",
    aliases: ["Watch Store"],
    primaryIcons: [{"key": "wrist-watch", "label": "Wrist Watch"}, {"key": "smartwatch", "label": "Smartwatch"}, {"key": "watch-box", "label": "Watch Box"}],
  },
  {
    id: "cosmetics-store", slug: "cosmetics-store", name: "Cosmetics Store", group: "Retail & Shopping",
    aliases: ["Cosmetics Store"],
    primaryIcons: [{"key": "lipstick", "label": "Lipstick"}, {"key": "cream", "label": "Cream"}, {"key": "makeup", "label": "Makeup"}],
  },
  {
    id: "perfume-shop", slug: "perfume-shop", name: "Perfume Shop", group: "Retail & Shopping",
    aliases: ["Perfume Shop"],
    primaryIcons: [{"key": "perfume-bottle", "label": "Perfume Bottle"}, {"key": "fragrance", "label": "Fragrance"}, {"key": "gift-box", "label": "Gift Box"}],
  },
  {
    id: "optical-store", slug: "optical-store", name: "Optical Store", group: "Retail & Shopping",
    aliases: ["Optical Store"],
    primaryIcons: [{"key": "eyeglasses", "label": "Eyeglasses"}, {"key": "sunglasses", "label": "Sunglasses"}, {"key": "lens", "label": "Lens"}],
  },
  {
    id: "gift-shop", slug: "gift-shop", name: "Gift Shop", group: "Retail & Shopping",
    aliases: ["Gift Shop"],
    primaryIcons: [{"key": "gift-box", "label": "Gift Box"}, {"key": "ribbon", "label": "Ribbon"}, {"key": "teddy", "label": "Teddy"}],
  },
  {
    id: "toy-store", slug: "toy-store", name: "Toy Store", group: "Retail & Shopping",
    aliases: ["Toy Store"],
    primaryIcons: [{"key": "teddy-bear", "label": "Teddy Bear"}, {"key": "toy-car", "label": "Toy Car"}, {"key": "puzzle", "label": "Puzzle"}],
  },
  {
    id: "book-store", slug: "book-store", name: "Book Store", group: "Retail & Shopping",
    aliases: ["Book Store", "Library"],
    primaryIcons: [{"key": "books", "label": "Books"}, {"key": "open-book", "label": "Open Book"}, {"key": "shopping-bag", "label": "Shopping Bag"}],
  },
  {
    id: "stationery-shop", slug: "stationery-shop", name: "Stationery Shop", group: "Retail & Shopping",
    aliases: ["Stationery Shop"],
    primaryIcons: [{"key": "pen", "label": "Pen"}, {"key": "notebook", "label": "Notebook"}, {"key": "pencil", "label": "Pencil"}],
  },
  {
    id: "flower-shop", slug: "flower-shop", name: "Flower Shop", group: "Retail & Shopping",
    aliases: ["Flower Shop"],
    primaryIcons: [{"key": "bouquet", "label": "Bouquet"}, {"key": "rose", "label": "Rose"}, {"key": "flower-pot", "label": "Flower Pot"}],
  },
  {
    id: "pet-shop", slug: "pet-shop", name: "Pet Shop", group: "Retail & Shopping",
    aliases: ["Pet Shop"],
    primaryIcons: [{"key": "dog", "label": "Dog"}, {"key": "cat", "label": "Cat"}, {"key": "paw", "label": "Paw"}],
  },
  {
    id: "salon", slug: "salon", name: "Salon", group: "Beauty & Fitness",
    aliases: ["Salon", "hair salon", "hairdresser"],
    primaryIcons: [{"key": "scissors", "label": "Scissors"}, {"key": "hair-dryer", "label": "Hair Dryer"}, {"key": "mirror", "label": "Mirror"}],
  },
  {
    id: "barber-shop", slug: "barber-shop", name: "Barber Shop", group: "Beauty & Fitness",
    aliases: ["Barber Shop"],
    primaryIcons: [{"key": "barber-pole", "label": "Barber Pole"}, {"key": "razor", "label": "Razor"}, {"key": "beard", "label": "Beard"}],
  },
  {
    id: "beauty-parlour", slug: "beauty-parlour", name: "Beauty Parlour", group: "Beauty & Fitness",
    aliases: ["Beauty Parlour", "beauty parlor", "beauty salon"],
    primaryIcons: [{"key": "makeup", "label": "Makeup"}, {"key": "mirror", "label": "Mirror"}, {"key": "nail-polish", "label": "Nail Polish"}],
  },
  {
    id: "spa", slug: "spa", name: "Spa", group: "Beauty & Fitness",
    aliases: ["Spa"],
    primaryIcons: [{"key": "massage", "label": "Massage"}, {"key": "spa", "label": "Spa"}, {"key": "candle", "label": "Candle"}],
  },
  {
    id: "makeup-artist", slug: "makeup-artist", name: "Makeup Artist", group: "Beauty & Fitness",
    aliases: ["Makeup Artist"],
    primaryIcons: [{"key": "makeup-palette", "label": "Makeup Palette"}, {"key": "brush", "label": "Brush"}, {"key": "mirror", "label": "Mirror"}],
  },
  {
    id: "tattoo-studio", slug: "tattoo-studio", name: "Tattoo Studio", group: "Beauty & Fitness",
    aliases: ["Tattoo Studio"],
    primaryIcons: [{"key": "tattoo-machine", "label": "Tattoo Machine"}, {"key": "tattoo-design", "label": "Tattoo Design"}, {"key": "ink", "label": "Ink"}],
  },
  {
    id: "gym", slug: "gym", name: "Gym", group: "Beauty & Fitness",
    aliases: ["Gym"],
    primaryIcons: [{"key": "dumbbell", "label": "Dumbbell"}, {"key": "barbell", "label": "Barbell"}, {"key": "treadmill", "label": "Treadmill"}],
  },
  {
    id: "fitness-centre", slug: "fitness-centre", name: "Fitness Centre", group: "Beauty & Fitness",
    aliases: ["Fitness Centre"],
    primaryIcons: [{"key": "dumbbell", "label": "Dumbbell"}, {"key": "running", "label": "Running"}, {"key": "heart", "label": "Heart"}],
  },
  {
    id: "yoga-centre", slug: "yoga-centre", name: "Yoga Centre", group: "Beauty & Fitness",
    aliases: ["Yoga Centre"],
    primaryIcons: [{"key": "yoga-pose", "label": "Yoga Pose"}, {"key": "meditation", "label": "Meditation"}, {"key": "yoga-mat", "label": "Yoga Mat"}],
  },
  {
    id: "dance-academy", slug: "dance-academy", name: "Dance Academy", group: "Beauty & Fitness / Education",
    aliases: ["Dance Academy"],
    primaryIcons: [{"key": "dancer", "label": "Dancer"}, {"key": "dance-shoes", "label": "Dance Shoes"}, {"key": "music", "label": "Music"}],
  },
  {
    id: "sports-academy", slug: "sports-academy", name: "Sports Academy", group: "Beauty & Fitness",
    aliases: ["Sports Academy"],
    primaryIcons: [{"key": "trophy", "label": "Trophy"}, {"key": "sports-ball", "label": "Sports Ball"}, {"key": "running", "label": "Running"}],
  },
  {
    id: "personal-trainer", slug: "personal-trainer", name: "Personal Trainer", group: "Beauty & Fitness",
    aliases: ["Personal Trainer"],
    primaryIcons: [{"key": "trainer", "label": "Trainer"}, {"key": "dumbbell", "label": "Dumbbell"}, {"key": "workout-plan", "label": "Workout Plan"}],
  },
  {
    id: "hospital", slug: "hospital", name: "Hospital", group: "Healthcare",
    aliases: ["Hospital"],
    primaryIcons: [{"key": "hospital", "label": "Hospital"}, {"key": "doctor", "label": "Doctor"}, {"key": "ambulance", "label": "Ambulance"}],
  },
  {
    id: "clinic", slug: "clinic", name: "Clinic", group: "Healthcare",
    aliases: ["Clinic"],
    primaryIcons: [{"key": "clinic", "label": "Clinic"}, {"key": "doctor", "label": "Doctor"}, {"key": "stethoscope", "label": "Stethoscope"}],
  },
  {
    id: "dental-clinic", slug: "dental-clinic", name: "Dental Clinic", group: "Healthcare",
    aliases: ["Dental Clinic"],
    primaryIcons: [{"key": "tooth", "label": "Tooth"}, {"key": "dentist", "label": "Dentist"}, {"key": "dental-chair", "label": "Dental Chair"}],
  },
  {
    id: "pharmacy", slug: "pharmacy", name: "Pharmacy", group: "Healthcare",
    aliases: ["Pharmacy"],
    primaryIcons: [{"key": "medicine", "label": "Medicine"}, {"key": "pharmacy", "label": "Pharmacy"}, {"key": "syrup", "label": "Syrup"}],
  },
  {
    id: "pathology-lab", slug: "pathology-lab", name: "Pathology Lab", group: "Healthcare",
    aliases: ["Pathology Lab"],
    primaryIcons: [{"key": "test-tube", "label": "Test Tube"}, {"key": "microscope", "label": "Microscope"}, {"key": "blood", "label": "Blood"}],
  },
  {
    id: "diagnostic-centre", slug: "diagnostic-centre", name: "Diagnostic Centre", group: "Healthcare",
    aliases: ["Diagnostic Centre"],
    primaryIcons: [{"key": "scan", "label": "Scan"}, {"key": "x-ray", "label": "X-Ray"}, {"key": "medical-test", "label": "Medical Test"}],
  },
  {
    id: "eye-clinic", slug: "eye-clinic", name: "Eye Clinic", group: "Healthcare",
    aliases: ["Eye Clinic"],
    primaryIcons: [{"key": "eye", "label": "Eye"}, {"key": "eyeglasses", "label": "Eyeglasses"}, {"key": "eye-test", "label": "Eye Test"}],
  },
  {
    id: "physiotherapy-centre", slug: "physiotherapy-centre", name: "Physiotherapy Centre", group: "Healthcare",
    aliases: ["Physiotherapy Centre"],
    primaryIcons: [{"key": "therapist", "label": "Therapist"}, {"key": "exercise", "label": "Exercise"}, {"key": "therapy-bed", "label": "Therapy Bed"}],
  },
  {
    id: "veterinary-clinic", slug: "veterinary-clinic", name: "Veterinary Clinic", group: "Healthcare",
    aliases: ["Veterinary Clinic"],
    primaryIcons: [{"key": "dog", "label": "Dog"}, {"key": "vet", "label": "Vet"}, {"key": "paw", "label": "Paw"}],
  },
  {
    id: "medical-equipment-store", slug: "medical-equipment-store", name: "Medical Equipment Store", group: "Healthcare",
    aliases: ["Medical Equipment Store"],
    primaryIcons: [{"key": "stethoscope", "label": "Stethoscope"}, {"key": "wheelchair", "label": "Wheelchair"}, {"key": "medical-equipment", "label": "Medical Equipment"}],
  },
  {
    id: "mobile-shop", slug: "mobile-shop", name: "Mobile Shop", group: "Electronics & Technology",
    aliases: ["Mobile Shop"],
    primaryIcons: [{"key": "smartphone", "label": "Smartphone"}, {"key": "charger", "label": "Charger"}, {"key": "phone-box", "label": "Phone Box"}],
  },
  {
    id: "mobile-repair", slug: "mobile-repair", name: "Mobile Repair", group: "Electronics & Technology",
    aliases: ["Mobile Repair"],
    primaryIcons: [{"key": "smartphone", "label": "Smartphone"}, {"key": "screwdriver", "label": "Screwdriver"}, {"key": "battery", "label": "Battery"}],
  },
  {
    id: "computer-shop", slug: "computer-shop", name: "Computer Shop", group: "Electronics & Technology",
    aliases: ["Computer Shop"],
    primaryIcons: [{"key": "laptop", "label": "Laptop"}, {"key": "desktop", "label": "Desktop"}, {"key": "keyboard", "label": "Keyboard"}],
  },
  {
    id: "computer-repair", slug: "computer-repair", name: "Computer Repair", group: "Electronics & Technology",
    aliases: ["Computer Repair"],
    primaryIcons: [{"key": "laptop", "label": "Laptop"}, {"key": "repair-tool", "label": "Repair Tool"}, {"key": "monitor", "label": "Monitor"}],
  },
  {
    id: "electronics-store", slug: "electronics-store", name: "Electronics Store", group: "Electronics & Technology",
    aliases: ["Electronics Store"],
    primaryIcons: [{"key": "tv", "label": "TV"}, {"key": "smartphone", "label": "Smartphone"}, {"key": "speaker", "label": "Speaker"}],
  },
  {
    id: "television-store", slug: "television-store", name: "Television Store", group: "Electronics & Technology",
    aliases: ["Television Store"],
    primaryIcons: [{"key": "tv", "label": "TV"}, {"key": "remote", "label": "Remote"}, {"key": "speaker", "label": "Speaker"}],
  },
  {
    id: "camera-store", slug: "camera-store", name: "Camera Store", group: "Electronics & Technology",
    aliases: ["Camera Store"],
    primaryIcons: [{"key": "camera", "label": "Camera"}, {"key": "camera-lens", "label": "Camera Lens"}, {"key": "camera-bag", "label": "Camera Bag"}],
  },
  {
    id: "computer-institute", slug: "computer-institute", name: "Computer Institute", group: "Electronics & Technology",
    aliases: ["Computer Institute"],
    primaryIcons: [{"key": "computer", "label": "Computer"}, {"key": "teacher", "label": "Teacher"}, {"key": "course", "label": "Course"}],
  },
  {
    id: "cyber-caf", slug: "cyber-caf", name: "Cyber Café", group: "Electronics & Technology",
    aliases: ["Cyber Cafe"],
    primaryIcons: [{"key": "computer", "label": "Computer"}, {"key": "internet", "label": "Internet"}, {"key": "printer", "label": "Printer"}],
  },
  {
    id: "software-company", slug: "software-company", name: "Software Company", group: "Electronics & Technology",
    aliases: ["Software Company"],
    primaryIcons: [{"key": "code", "label": "Code"}, {"key": "computer", "label": "Computer"}, {"key": "cloud", "label": "Cloud"}],
  },
  {
    id: "it-company", slug: "it-company", name: "IT Company", group: "Electronics & Technology",
    aliases: ["IT Company"],
    primaryIcons: [{"key": "computer", "label": "Computer"}, {"key": "network", "label": "Network"}, {"key": "cloud", "label": "Cloud"}],
  },
  {
    id: "car-showroom", slug: "car-showroom", name: "Car Showroom", group: "Automobile",
    aliases: ["Car Showroom"],
    primaryIcons: [{"key": "car", "label": "Car"}, {"key": "car-key", "label": "Car Key"}, {"key": "showroom", "label": "Showroom"}],
  },
  {
    id: "bike-showroom", slug: "bike-showroom", name: "Bike Showroom", group: "Automobile",
    aliases: ["Bike Showroom"],
    primaryIcons: [{"key": "motorcycle", "label": "Motorcycle"}, {"key": "helmet", "label": "Helmet"}, {"key": "key", "label": "Key"}],
  },
  {
    id: "car-garage", slug: "car-garage", name: "Car Garage", group: "Automobile",
    aliases: ["Car Garage"],
    primaryIcons: [{"key": "car", "label": "Car"}, {"key": "mechanic", "label": "Mechanic"}, {"key": "spanner", "label": "Spanner"}],
  },
  {
    id: "bike-repair", slug: "bike-repair", name: "Bike Repair", group: "Automobile",
    aliases: ["Bike Repair"],
    primaryIcons: [{"key": "motorcycle", "label": "Motorcycle"}, {"key": "spanner", "label": "Spanner"}, {"key": "tyre", "label": "Tyre"}],
  },
  {
    id: "car-wash", slug: "car-wash", name: "Car Wash", group: "Automobile",
    aliases: ["Car Wash"],
    primaryIcons: [{"key": "car", "label": "Car"}, {"key": "water", "label": "Water"}, {"key": "cleaning", "label": "Cleaning"}],
  },
  {
    id: "tyre-shop", slug: "tyre-shop", name: "Tyre Shop", group: "Automobile",
    aliases: ["Tyre Shop"],
    primaryIcons: [{"key": "tyre", "label": "Tyre"}, {"key": "air-pump", "label": "Air Pump"}, {"key": "wheel", "label": "Wheel"}],
  },
  {
    id: "auto-parts", slug: "auto-parts", name: "Auto Parts", group: "Automobile",
    aliases: ["Auto Parts"],
    primaryIcons: [{"key": "gear", "label": "Gear"}, {"key": "tyre", "label": "Tyre"}, {"key": "car-part", "label": "Car Part"}],
  },
  {
    id: "petrol-pump", slug: "petrol-pump", name: "Petrol Pump", group: "Automobile",
    aliases: ["Petrol Pump"],
    primaryIcons: [{"key": "fuel-pump", "label": "Fuel Pump"}, {"key": "car", "label": "Car"}, {"key": "fuel", "label": "Fuel"}],
  },
  {
    id: "ev-charging", slug: "ev-charging", name: "EV Charging", group: "Automobile",
    aliases: ["EV Charging"],
    primaryIcons: [{"key": "ev-car", "label": "EV Car"}, {"key": "charger", "label": "Charger"}, {"key": "battery", "label": "Battery"}],
  },
  {
    id: "driving-school", slug: "driving-school", name: "Driving School", group: "Automobile",
    aliases: ["Driving School"],
    primaryIcons: [{"key": "car", "label": "Car"}, {"key": "instructor", "label": "Instructor"}, {"key": "driving-license", "label": "Driving License"}],
  },
  {
    id: "real-estate", slug: "real-estate", name: "Real Estate", group: "Home & Construction",
    aliases: ["Real Estate"],
    primaryIcons: [{"key": "house", "label": "House"}, {"key": "building", "label": "Building"}, {"key": "key", "label": "Key"}],
  },
  {
    id: "property-dealer", slug: "property-dealer", name: "Property Dealer", group: "Home & Construction",
    aliases: ["Property Dealer"],
    primaryIcons: [{"key": "house", "label": "House"}, {"key": "key", "label": "Key"}, {"key": "agreement", "label": "Agreement"}],
  },
  {
    id: "construction-company", slug: "construction-company", name: "Construction Company", group: "Home & Construction",
    aliases: ["Construction Company"],
    primaryIcons: [{"key": "crane", "label": "Crane"}, {"key": "brick", "label": "Brick"}, {"key": "worker", "label": "Worker"}],
  },
  {
    id: "architect", slug: "architect", name: "Architect", group: "Home & Construction",
    aliases: ["Architect"],
    primaryIcons: [{"key": "blueprint", "label": "Blueprint"}, {"key": "ruler", "label": "Ruler"}, {"key": "building", "label": "Building"}],
  },
  {
    id: "interior-designer", slug: "interior-designer", name: "Interior Designer", group: "Home & Construction",
    aliases: ["Interior Designer"],
    primaryIcons: [{"key": "sofa", "label": "Sofa"}, {"key": "lamp", "label": "Lamp"}, {"key": "interior-design", "label": "Interior Design"}],
  },
  {
    id: "furniture-store", slug: "furniture-store", name: "Furniture Store", group: "Home & Construction",
    aliases: ["Furniture Store"],
    primaryIcons: [{"key": "sofa", "label": "Sofa"}, {"key": "chair", "label": "Chair"}, {"key": "bed", "label": "Bed"}],
  },
  {
    id: "hardware-store", slug: "hardware-store", name: "Hardware Store", group: "Home & Construction",
    aliases: ["Hardware Store"],
    primaryIcons: [{"key": "hammer", "label": "Hammer"}, {"key": "screwdriver", "label": "Screwdriver"}, {"key": "bolt", "label": "Bolt"}],
  },
  {
    id: "paint-store", slug: "paint-store", name: "Paint Store", group: "Home & Construction",
    aliases: ["Paint Store"],
    primaryIcons: [{"key": "paint-bucket", "label": "Paint Bucket"}, {"key": "brush", "label": "Brush"}, {"key": "paint-roller", "label": "Paint Roller"}],
  },
  {
    id: "electrical-store", slug: "electrical-store", name: "Electrical Store", group: "Home & Construction",
    aliases: ["Electrical Store"],
    primaryIcons: [{"key": "bulb", "label": "Bulb"}, {"key": "plug", "label": "Plug"}, {"key": "electrical-tool", "label": "Electrical Tool"}],
  },
  {
    id: "plumbing-store", slug: "plumbing-store", name: "Plumbing Store", group: "Home & Construction",
    aliases: ["Plumbing Store"],
    primaryIcons: [{"key": "pipe", "label": "Pipe"}, {"key": "tap", "label": "Tap"}, {"key": "wrench", "label": "Wrench"}],
  },
  {
    id: "carpenter", slug: "carpenter", name: "Carpenter", group: "Home & Construction",
    aliases: ["Carpenter"],
    primaryIcons: [{"key": "saw", "label": "Saw"}, {"key": "hammer", "label": "Hammer"}, {"key": "wood", "label": "Wood"}],
  },
  {
    id: "electrician", slug: "electrician", name: "Electrician", group: "Home & Construction",
    aliases: ["Electrician"],
    primaryIcons: [{"key": "electricity", "label": "Electricity"}, {"key": "bulb", "label": "Bulb"}, {"key": "tool-box", "label": "Tool Box"}],
  },
  {
    id: "plumber", slug: "plumber", name: "Plumber", group: "Home & Construction",
    aliases: ["Plumber"],
    primaryIcons: [{"key": "wrench", "label": "Wrench"}, {"key": "tap", "label": "Tap"}, {"key": "pipe", "label": "Pipe"}],
  },
  {
    id: "ac-repair", slug: "ac-repair", name: "AC Repair", group: "Home & Construction",
    aliases: ["AC Repair"],
    primaryIcons: [{"key": "ac", "label": "AC"}, {"key": "repair-tool", "label": "Repair Tool"}, {"key": "fan", "label": "Fan"}],
  },
  {
    id: "ro-service", slug: "ro-service", name: "RO Service", group: "Home & Construction",
    aliases: ["RO Service"],
    primaryIcons: [{"key": "water-filter", "label": "Water Filter"}, {"key": "ro-machine", "label": "RO Machine"}, {"key": "repair", "label": "Repair"}],
  },
  {
    id: "hotel", slug: "hotel", name: "Hotel", group: "Travel & Hospitality",
    aliases: ["Hotel", "hospitality", "lodging", "stay"],
    primaryIcons: [{"key": "hotel", "label": "Hotel"}, {"key": "bed", "label": "Bed"}, {"key": "room-key", "label": "Room Key"}],
  },
  {
    id: "resort", slug: "resort", name: "Resort", group: "Travel & Hospitality",
    aliases: ["Resort"],
    primaryIcons: [{"key": "resort", "label": "Resort"}, {"key": "swimming-pool", "label": "Swimming Pool"}, {"key": "palm-tree", "label": "Palm Tree"}],
  },
  {
    id: "guest-house", slug: "guest-house", name: "Guest House", group: "Travel & Hospitality",
    aliases: ["Guest House"],
    primaryIcons: [{"key": "guest-house", "label": "Guest House"}, {"key": "bed", "label": "Bed"}, {"key": "key", "label": "Key"}],
  },
  {
    id: "hostel", slug: "hostel", name: "Hostel", group: "Travel & Hospitality",
    aliases: ["Hostel"],
    primaryIcons: [{"key": "hostel", "label": "Hostel"}, {"key": "bed", "label": "Bed"}, {"key": "backpack", "label": "Backpack"}],
  },
  {
    id: "homestay", slug: "homestay", name: "Homestay", group: "Travel & Hospitality",
    aliases: ["Homestay"],
    primaryIcons: [{"key": "house", "label": "House"}, {"key": "bed", "label": "Bed"}, {"key": "luggage", "label": "Luggage"}],
  },
  {
    id: "travel-agency", slug: "travel-agency", name: "Travel Agency", group: "Travel & Hospitality",
    aliases: ["Travel Agency"],
    primaryIcons: [{"key": "airplane", "label": "Airplane"}, {"key": "map", "label": "Map"}, {"key": "ticket", "label": "Ticket"}],
  },
  {
    id: "tour-operator", slug: "tour-operator", name: "Tour Operator", group: "Travel & Hospitality",
    aliases: ["Tour Operator"],
    primaryIcons: [{"key": "map", "label": "Map"}, {"key": "tour-bus", "label": "Tour Bus"}, {"key": "camera", "label": "Camera"}],
  },
  {
    id: "car-rental", slug: "car-rental", name: "Car Rental", group: "Travel & Hospitality",
    aliases: ["Car Rental"],
    primaryIcons: [{"key": "car", "label": "Car"}, {"key": "key", "label": "Key"}, {"key": "rental-document", "label": "Rental Document"}],
  },
  {
    id: "taxi-service", slug: "taxi-service", name: "Taxi Service", group: "Travel & Hospitality",
    aliases: ["Taxi Service"],
    primaryIcons: [{"key": "taxi", "label": "Taxi"}, {"key": "location", "label": "Location"}, {"key": "driver", "label": "Driver"}],
  },
  {
    id: "bus-service", slug: "bus-service", name: "Bus Service", group: "Travel & Hospitality",
    aliases: ["Bus Service"],
    primaryIcons: [{"key": "bus", "label": "Bus"}, {"key": "ticket", "label": "Ticket"}, {"key": "driver", "label": "Driver"}],
  },
  {
    id: "courier-service", slug: "courier-service", name: "Courier Service", group: "Logistics & Services",
    aliases: ["Courier Service"],
    primaryIcons: [{"key": "parcel", "label": "Parcel"}, {"key": "delivery-truck", "label": "Delivery Truck"}, {"key": "tracking", "label": "Tracking"}],
  },
  {
    id: "logistics", slug: "logistics", name: "Logistics", group: "Logistics & Services",
    aliases: ["Logistics"],
    primaryIcons: [{"key": "truck", "label": "Truck"}, {"key": "cargo", "label": "Cargo"}, {"key": "warehouse", "label": "Warehouse"}],
  },
  {
    id: "packers-movers", slug: "packers-movers", name: "Packers & Movers", group: "Logistics & Services",
    aliases: ["Packers & Movers"],
    primaryIcons: [{"key": "box", "label": "Box"}, {"key": "moving-truck", "label": "Moving Truck"}, {"key": "house", "label": "House"}],
  },
  {
    id: "laundry", slug: "laundry", name: "Laundry", group: "Logistics & Services",
    aliases: ["Laundry"],
    primaryIcons: [{"key": "washing-machine", "label": "Washing Machine"}, {"key": "clothes", "label": "Clothes"}, {"key": "laundry-basket", "label": "Laundry Basket"}],
  },
  {
    id: "dry-cleaner", slug: "dry-cleaner", name: "Dry Cleaner", group: "Logistics & Services",
    aliases: ["Dry Cleaner"],
    primaryIcons: [{"key": "coat", "label": "Coat"}, {"key": "dry-cleaning", "label": "Dry Cleaning"}, {"key": "hanger", "label": "Hanger"}],
  },
  {
    id: "cleaning-service", slug: "cleaning-service", name: "Cleaning Service", group: "Logistics & Services",
    aliases: ["Cleaning Service"],
    primaryIcons: [{"key": "broom", "label": "Broom"}, {"key": "cleaning-spray", "label": "Cleaning Spray"}, {"key": "bucket", "label": "Bucket"}],
  },
  {
    id: "pest-control", slug: "pest-control", name: "Pest Control", group: "Logistics & Services",
    aliases: ["Pest Control"],
    primaryIcons: [{"key": "pest", "label": "Pest"}, {"key": "spray", "label": "Spray"}, {"key": "shield", "label": "Shield"}],
  },
  {
    id: "security-service", slug: "security-service", name: "Security Service", group: "Logistics & Services",
    aliases: ["Security Service"],
    primaryIcons: [{"key": "security-guard", "label": "Security Guard"}, {"key": "shield", "label": "Shield"}, {"key": "cctv", "label": "CCTV"}],
  },
  {
    id: "photography", slug: "photography", name: "Photography", group: "Logistics & Services",
    aliases: ["Photography"],
    primaryIcons: [{"key": "camera", "label": "Camera"}, {"key": "lens", "label": "Lens"}, {"key": "photographer", "label": "Photographer"}],
  },
  {
    id: "videography", slug: "videography", name: "Videography", group: "Logistics & Services",
    aliases: ["Videography"],
    primaryIcons: [{"key": "video-camera", "label": "Video Camera"}, {"key": "microphone", "label": "Microphone"}, {"key": "video", "label": "Video"}],
  },
  {
    id: "school", slug: "school", name: "School", group: "Education",
    aliases: ["School"],
    primaryIcons: [{"key": "school", "label": "School"}, {"key": "teacher", "label": "Teacher"}, {"key": "school-bag", "label": "School Bag"}],
  },
  {
    id: "college", slug: "college", name: "College", group: "Education",
    aliases: ["College"],
    primaryIcons: [{"key": "college", "label": "College"}, {"key": "graduation-cap", "label": "Graduation Cap"}, {"key": "books", "label": "Books"}],
  },
  {
    id: "coaching-centre", slug: "coaching-centre", name: "Coaching Centre", group: "Education",
    aliases: ["Coaching Centre"],
    primaryIcons: [{"key": "teacher", "label": "Teacher"}, {"key": "books", "label": "Books"}, {"key": "exam", "label": "Exam"}],
  },
  {
    id: "tuition-centre", slug: "tuition-centre", name: "Tuition Centre", group: "Education",
    aliases: ["Tuition Centre"],
    primaryIcons: [{"key": "teacher", "label": "Teacher"}, {"key": "book", "label": "Book"}, {"key": "pencil", "label": "Pencil"}],
  },
  {
    id: "competitive-exam-coaching", slug: "competitive-exam-coaching", name: "Competitive Exam Coaching", group: "Education",
    aliases: ["Competitive Exam Coaching"],
    primaryIcons: [{"key": "exam", "label": "Exam"}, {"key": "books", "label": "Books"}, {"key": "target", "label": "Target"}],
  },
  {
    id: "music-academy", slug: "music-academy", name: "Music Academy", group: "Education",
    aliases: ["Music Academy"],
    primaryIcons: [{"key": "guitar", "label": "Guitar"}, {"key": "piano", "label": "Piano"}, {"key": "microphone", "label": "Microphone"}],
  },
  {
    id: "art-academy", slug: "art-academy", name: "Art Academy", group: "Education",
    aliases: ["Art Academy"],
    primaryIcons: [{"key": "paint-palette", "label": "Paint Palette"}, {"key": "brush", "label": "Brush"}, {"key": "painting", "label": "Painting"}],
  },
  {
    id: "consultancy", slug: "consultancy", name: "Consultancy", group: "Professional Services",
    aliases: ["Consultancy"],
    primaryIcons: [{"key": "briefcase", "label": "Briefcase"}, {"key": "meeting", "label": "Meeting"}, {"key": "business-chart", "label": "Business Chart"}],
  },
  {
    id: "ca-accounting", slug: "ca-accounting", name: "CA / Accounting", group: "Professional Services",
    aliases: ["CA / Accounting", "accounting", "ca", "chartered accountant"],
    primaryIcons: [{"key": "calculator", "label": "Calculator"}, {"key": "chart", "label": "Chart"}, {"key": "tax-document", "label": "Tax Document"}],
  },
  {
    id: "lawyer", slug: "lawyer", name: "Lawyer", group: "Professional Services",
    aliases: ["Lawyer"],
    primaryIcons: [{"key": "justice-scale", "label": "Justice Scale"}, {"key": "lawyer", "label": "Lawyer"}, {"key": "law-book", "label": "Law Book"}],
  },
  {
    id: "insurance-agency", slug: "insurance-agency", name: "Insurance Agency", group: "Professional Services",
    aliases: ["Insurance Agency"],
    primaryIcons: [{"key": "shield", "label": "Shield"}, {"key": "insurance-document", "label": "Insurance Document"}, {"key": "money", "label": "Money"}],
  },
  {
    id: "finance-company", slug: "finance-company", name: "Finance Company", group: "Professional Services",
    aliases: ["Finance Company"],
    primaryIcons: [{"key": "money", "label": "Money"}, {"key": "bank", "label": "Bank"}, {"key": "finance-chart", "label": "Finance Chart"}],
  },
  {
    id: "digital-marketing", slug: "digital-marketing", name: "Digital Marketing", group: "Professional Services",
    aliases: ["Digital Marketing"],
    primaryIcons: [{"key": "social-media", "label": "Social Media"}, {"key": "analytics", "label": "Analytics"}, {"key": "advertising", "label": "Advertising"}],
  },
  {
    id: "advertising-agency", slug: "advertising-agency", name: "Advertising Agency", group: "Professional Services",
    aliases: ["Advertising Agency"],
    primaryIcons: [{"key": "megaphone", "label": "Megaphone"}, {"key": "advertisement", "label": "Advertisement"}, {"key": "design", "label": "Design"}],
  },
  {
    id: "web-development", slug: "web-development", name: "Web Development", group: "Professional Services",
    aliases: ["Web Development"],
    primaryIcons: [{"key": "code", "label": "Code"}, {"key": "website", "label": "Website"}, {"key": "browser", "label": "Browser"}],
  },
  {
    id: "printing-press", slug: "printing-press", name: "Printing Press", group: "Professional Services",
    aliases: ["Printing Press"],
    primaryIcons: [{"key": "printer", "label": "Printer"}, {"key": "paper", "label": "Paper"}, {"key": "ink", "label": "Ink"}],
  },
  {
    id: "xerox-photocopy", slug: "xerox-photocopy", name: "Xerox / Photocopy", group: "Professional Services",
    aliases: ["Xerox / Photocopy"],
    primaryIcons: [{"key": "copier", "label": "Copier"}, {"key": "document", "label": "Document"}, {"key": "paper", "label": "Paper"}],
  },
  {
    id: "agriculture-store", slug: "agriculture-store", name: "Agriculture Store", group: "Agriculture",
    aliases: ["Agriculture Store"],
    primaryIcons: [{"key": "seed", "label": "Seed"}, {"key": "fertilizer", "label": "Fertilizer"}, {"key": "farm-tool", "label": "Farm Tool"}],
  },
  {
    id: "seed-store", slug: "seed-store", name: "Seed Store", group: "Agriculture",
    aliases: ["Seed Store"],
    primaryIcons: [{"key": "seeds", "label": "Seeds"}, {"key": "seed-packet", "label": "Seed Packet"}, {"key": "farmer", "label": "Farmer"}],
  },
  {
    id: "fertilizer-shop", slug: "fertilizer-shop", name: "Fertilizer Shop", group: "Agriculture",
    aliases: ["Fertilizer Shop"],
    primaryIcons: [{"key": "fertilizer-bag", "label": "Fertilizer Bag"}, {"key": "plant", "label": "Plant"}, {"key": "farmer", "label": "Farmer"}],
  },
  {
    id: "tractor-dealer", slug: "tractor-dealer", name: "Tractor Dealer", group: "Agriculture",
    aliases: ["Tractor Dealer"],
    primaryIcons: [{"key": "tractor", "label": "Tractor"}, {"key": "tyre", "label": "Tyre"}, {"key": "key", "label": "Key"}],
  },
  {
    id: "farm-equipment", slug: "farm-equipment", name: "Farm Equipment", group: "Agriculture",
    aliases: ["Farm Equipment"],
    primaryIcons: [{"key": "tractor", "label": "Tractor"}, {"key": "farm-tool", "label": "Farm Tool"}, {"key": "crop", "label": "Crop"}],
  },
  {
    id: "dairy-farm", slug: "dairy-farm", name: "Dairy Farm", group: "Agriculture",
    aliases: ["Dairy Farm"],
    primaryIcons: [{"key": "cow", "label": "Cow"}, {"key": "milk", "label": "Milk"}, {"key": "dairy-can", "label": "Dairy Can"}],
  },
  {
    id: "poultry-farm", slug: "poultry-farm", name: "Poultry Farm", group: "Agriculture",
    aliases: ["Poultry Farm"],
    primaryIcons: [{"key": "chicken", "label": "Chicken"}, {"key": "egg", "label": "Egg"}, {"key": "poultry-house", "label": "Poultry House"}],
  },
  {
    id: "nursery", slug: "nursery", name: "Nursery", group: "Agriculture",
    aliases: ["Nursery"],
    primaryIcons: [{"key": "plant", "label": "Plant"}, {"key": "pot", "label": "Pot"}, {"key": "water", "label": "Water"}],
  },
  {
    id: "garden-centre", slug: "garden-centre", name: "Garden Centre", group: "Agriculture",
    aliases: ["Garden Centre"],
    primaryIcons: [{"key": "plant", "label": "Plant"}, {"key": "flower", "label": "Flower"}, {"key": "gardener", "label": "Gardener"}],
  },
  {
    id: "event-management", slug: "event-management", name: "Event Management", group: "Events & Entertainment",
    aliases: ["Event Management"],
    primaryIcons: [{"key": "event", "label": "Event"}, {"key": "stage", "label": "Stage"}, {"key": "decoration", "label": "Decoration"}],
  },
  {
    id: "wedding-planner", slug: "wedding-planner", name: "Wedding Planner", group: "Events & Entertainment",
    aliases: ["Wedding Planner"],
    primaryIcons: [{"key": "wedding-ring", "label": "Wedding Ring"}, {"key": "flowers", "label": "Flowers"}, {"key": "wedding", "label": "Wedding"}],
  },
  {
    id: "banquet-hall", slug: "banquet-hall", name: "Banquet Hall", group: "Events & Entertainment",
    aliases: ["Banquet Hall"],
    primaryIcons: [{"key": "hall", "label": "Hall"}, {"key": "dining", "label": "Dining"}, {"key": "stage", "label": "Stage"}],
  },
  {
    id: "marriage-hall", slug: "marriage-hall", name: "Marriage Hall", group: "Events & Entertainment",
    aliases: ["Marriage Hall"],
    primaryIcons: [{"key": "wedding", "label": "Wedding"}, {"key": "ring", "label": "Ring"}, {"key": "decoration", "label": "Decoration"}],
  },
  {
    id: "dj-service", slug: "dj-service", name: "DJ Service", group: "Events & Entertainment",
    aliases: ["DJ Service"],
    primaryIcons: [{"key": "dj-mixer", "label": "DJ Mixer"}, {"key": "headphones", "label": "Headphones"}, {"key": "speaker", "label": "Speaker"}],
  },
  {
    id: "recording-studio", slug: "recording-studio", name: "Recording Studio", group: "Events & Entertainment",
    aliases: ["Recording Studio"],
    primaryIcons: [{"key": "microphone", "label": "Microphone"}, {"key": "headphones", "label": "Headphones"}, {"key": "audio-mixer", "label": "Audio Mixer"}],
  },
  {
    id: "cinema", slug: "cinema", name: "Cinema", group: "Events & Entertainment",
    aliases: ["Cinema"],
    primaryIcons: [{"key": "movie-screen", "label": "Movie Screen"}, {"key": "film", "label": "Film"}, {"key": "popcorn", "label": "Popcorn"}],
  },
  {
    id: "gaming-zone", slug: "gaming-zone", name: "Gaming Zone", group: "Events & Entertainment",
    aliases: ["Gaming Zone"],
    primaryIcons: [{"key": "game-controller", "label": "Game Controller"}, {"key": "gaming-pc", "label": "Gaming PC"}, {"key": "headset", "label": "Headset"}],
  }
];

export function findBusinessType(value: string | null | undefined): BusinessType | undefined {
  const normalized = normalizeBusinessSearch(value ?? "");
  if (!normalized) return undefined;
  return businessTypes.find((type) => type.id === normalized || type.slug === normalized || normalizeBusinessSearch(type.name) === normalized || type.aliases.some((alias) => normalizeBusinessSearch(alias) === normalized));
}

const iconGlyphRules: Array<[RegExp, string]> = [
  [/coffee|tea|chai|barista/, "☕"], [/plate|meal|dining|food pot/, "🍽️"], [/chef|baker|cook|butcher/, "🧑‍🍳"],
  [/burger/, "🍔"], [/pizza/, "🍕"], [/bread/, "🥖"], [/cake|pastry|cupcake|dessert|sweets|mithai/, "🧁"],
  [/ice cream|sundae/, "🍦"], [/juice|fruit|vegetable|grain|organic/, "🍎"], [/meat|chicken|poultry/, "🍗"],
  [/fish/, "🐟"], [/milk|dairy|cow/, "🥛"], [/hotel|resort|guest house|hostel/, "🏨"], [/building|store|shop|market|supermarket/, "🏬"], [/bed|room|homestay/, "🛏️"],
  [/key|lock/, "🔑"], [/truck|delivery|courier|bus|logistics|moving/, "🚚"], [/car|motorcycle|bike|tyre|auto|garage|fuel|taxi|tractor/, "🚗"],
  [/shirt|clothing|dress|saree|garment|shoe|footwear|fabric|jeans/, "👕"], [/jewel|ring|gold|diamond|necklace/, "💍"],
  [/camera|photograph|video|cinema|movie|film/, "📷"], [/flower|rose|bouquet|garden|plant|nursery/, "🌷"], [/cat|dog|pet|paw|vet/, "🐾"],
  [/salon|hair|scissor|barber|makeup|beauty|spa|mirror|tattoo|nail/, "✂️"], [/dumbbell|gym|fitness|sport|yoga|dance|trainer|workout|running/, "💪"],
  [/medical|doctor|clinic|hospital|pharmacy|medicine|tooth|eye|therap|test tube|microscope|blood|stethoscope|vet/, "🩺"],
  [/phone|mobile|smartphone|charger|battery/, "📱"], [/computer|laptop|keyboard|desktop|internet|software|code|network|monitor/, "💻"],
  [/tool|hammer|spanner|wrench|repair|electric|plumb|pipe|saw|paint|brick|crane/, "🛠️"], [/house|key|real estate|property/, "🏠"],
  [/book|school|education|pencil|pen|exam|teacher|college|academy/, "📚"], [/music|guitar|piano|microphone|audio|dj|headphone|speaker/, "🎵"],
  [/money|bank|finance|account|tax|business|consult|briefcase|law|insurance|calculator/, "💼"], [/event|wedding|stage|hall|decoration/, "🎉"],
  [/gift|toy|teddy|puzzle|game|controller|gaming/, "🎁"], [/parcel|box|cargo|warehouse|package/, "📦"], [/shield|security|guard|cctv/, "🛡️"],
  [/seed|farm|fertilizer|crop|farmer|water/, "🌱"], [/calculator|chart|analytics|advert|marketing/, "📊"], [/clock|watch|time/, "⌚"],
  [/fries/, "🍟"], [/soft drink|soda/, "🥤"], [/oven/, "♨️"], [/blender/, "🥤"], [/roti/, "🫓"], [/street food|skewer/, "🍢"],
  [/namkeen|snack/, "🥨"], [/weighing scale|scale/, "⚖️"], [/ice/, "🧊"], [/grocery bag|shopping bag/, "🛍️"], [/product/, "📦"],
  [/handbag|purse/, "👜"], [/pants|jeans/, "👖"], [/sewing|thread|fabric/, "🧵"], [/sandal|boot/, "👞"], [/lipstick/, "💄"],
  [/cream|perfume|fragrance/, "🧴"], [/sunglasses|lens|eyeglasses|optical/, "🕶️"], [/ribbon/, "🎀"], [/razor|beard/, "🪒"],
  [/massage|candle/, "🕯️"], [/brush|paint palette|painting/, "🖌️"], [/ink|pen/, "🖋️"], [/barbell/, "🏋️"], [/treadmill|running/, "🏃"],
  [/heart/, "❤️"], [/meditation/, "🧘"], [/trophy/, "🏆"], [/ambulance/, "🚑"], [/tooth|dentist|dental/, "🦷"], [/syrup/, "🧴"],
  [/scan|x ray|medical test/, "🩻"], [/exercise|therapy/, "🤸"], [/screwdriver|spanner|wrench/, "🔧"], [/tv|television/, "📺"],
  [/remote/, "🕹️"], [/course|exam/, "📖"], [/printer|copier/, "🖨️"], [/cloud/, "☁️"], [/helmet/, "⛑️"], [/mechanic|instructor|teacher/, "🧑‍🏫"],
  [/cleaning|broom/, "🧹"], [/air pump|tyre|wheel/, "🛞"], [/gear|bolt/, "⚙️"], [/agreement|document|license|tracking|paper/, "📄"],
  [/worker|security guard/, "👷"], [/blueprint|ruler/, "📐"], [/sofa|interior design|furniture/, "🛋️"], [/lamp|bulb/, "💡"],
  [/plug/, "🔌"], [/tap|plumbing/, "🚰"], [/wood|carpenter/, "🪵"], [/\bac\b|fan|ro machine|water filter/, "💧"],
  [/swimming pool|pool/, "🏊"], [/palm tree/, "🌴"], [/backpack/, "🎒"], [/luggage/, "🧳"], [/airplane|aircraft/, "✈️"],
  [/map|location/, "🗺️"], [/ticket|rental document/, "🎟️"], [/driver|taxi/, "🚕"], [/washing machine|laundry basket/, "🧺"],
  [/clothes|coat|hanger|dry cleaning/, "👔"], [/cleaning spray|bucket|spray/, "🧴"], [/pest/, "🪳"], [/graduation cap|college/, "🎓"],
  [/target/, "🎯"], [/meeting/, "🤝"], [/justice scale/, "⚖️"], [/social media/, "📱"], [/design/, "🎨"], [/website|browser/, "🌐"],
  [/egg/, "🥚"], [/pot/, "🍲"], [/popcorn/, "🍿"], [/headset|headphone/, "🎧"],
];

export function getBusinessIconGlyph(key: string) {
  const normalized = key.replaceAll("-", " ");
  return iconGlyphRules.find(([pattern]) => pattern.test(normalized))?.[1] ?? "✦";
}

export function getReviewTaxonomyType(value: string | null | undefined) {
  const normalized = normalizeBusinessSearch(value ?? "");
  if (["shop", "cafe restaurant", "salon", "library", "medical", "garage", "manufacturer"].includes(normalized)) return normalized === "cafe restaurant" ? "Cafe/Restaurant" : normalized[0].toUpperCase() + normalized.slice(1);
  if (normalized === "clinic") return "Medical";
  const group = findBusinessType(value)?.group ?? "";
  if (group.includes("Food & Restaurant")) return "Restaurant";
  if (group.includes("Retail & Shopping") || group.includes("Electronics & Technology") || group.includes("Home & Construction") || group.includes("Travel & Hospitality")) return "Shop";
  if (group.includes("Beauty & Fitness")) return "Salon";
  if (group.includes("Healthcare")) return "Medical";
  if (group.includes("Automobile")) return "Garage";
  if (group.includes("Education")) return "Library";
  if (group.includes("Logistics & Services") || group.includes("Professional Services") || group.includes("Agriculture") || group.includes("Events & Entertainment")) return "Manufacturer";
  return "Shop";
}

export function searchBusinessTypes(query: string): BusinessType[] {
  const normalized = normalizeBusinessSearch(query);
  if (!normalized) return businessTypes;
  return businessTypes
    .map((type, index) => {
      const terms = [type.name, ...type.aliases].map(normalizeBusinessSearch);
      const rank = terms.reduce((best, term) => Math.min(best,
        term === normalized ? 0 : term.startsWith(normalized) ? 1 : term.split(" ").some((word) => word.startsWith(normalized)) ? 2 : term.includes(normalized) ? 3 : Infinity), Infinity);
      return { type, index, rank };
    })
    .filter(({ rank }) => Number.isFinite(rank))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ type }) => type);
}

function normalizeBusinessSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
