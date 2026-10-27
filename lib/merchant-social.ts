export interface MerchantSocialIntegration {
  id?: string;
  businessId: string;
  provider: "postiz" | "meta" | "buffer" | "custom";
  postizApiUrl?: string | null;
  postizApiKey?: string | null;
  facebookPageName?: string | null;
  instagramUsername?: string | null;
  autoPublishEnabled: boolean;
  defaultScheduleTime?: string | null;
}

export interface CreativePosterConfig {
  style: "foodie_craving" | "festive_gold" | "discount_dhamaka" | "minimal_luxe";
  dishName: string;
  price?: string;
  unit?: string;
  businessName: string;
  rating?: number;
  reviewCount?: number;
  city?: string;
  phone?: string;
  badgeText?: string;
  imageSrc: string; // Data URL or Image URL
}

export interface SocialCaptionConfig {
  dishName: string;
  price?: string;
  businessName: string;
  city?: string;
  phone?: string;
  category?: string;
  tone: "foodie" | "festive" | "offer" | "short";
  customNotes?: string;
}

export function generateSocialCaption(config: SocialCaptionConfig): {
  headline: string;
  body: string;
  hashtags: string[];
  fullCaption: string;
} {
  const city = config.city?.trim() || "Bahraich";
  const dish = config.dishName.trim();
  const priceText = config.price ? `₹${config.price}` : "";
  const shop = config.businessName.trim();
  const phone = config.phone?.trim();

  let headline = "";
  let body = "";

  switch (config.tone) {
    case "foodie":
      headline = `Craving something delicious in ${city}? 🤤✨`;
      body = `Try our special ${dish}${priceText ? ` for just ${priceText}` : ""} freshly prepared with authentic taste at ${shop}!\n\nEvery bite is made to perfection. Visit us today or order directly!`;
      break;
    case "festive":
      headline = `Mithas aur Khushiyon ka Season! 🪔🎉`;
      body = `Celebrate with our traditional ${dish} at ${shop}, ${city}! Freshly made with pure ingredients to make your celebrations memorable.`;
      break;
    case "offer":
      headline = `Special Deal Alert! 🔥 ${priceText ? `Only ${priceText}` : "Limited Time"}`;
      body = `Don't miss our crowd-favourite ${dish} today at ${shop}! Available hot and fresh while stock lasts.`;
      break;
    case "short":
    default:
      headline = `Freshly made ${dish} at ${shop}! ⭐`;
      body = `Made fresh everyday with genuine quality in ${city}.`;
      break;
  }

  if (config.customNotes?.trim()) {
    body += `\n\n📌 Note: ${config.customNotes.trim()}`;
  }

  const cta = phone
    ? `\n\n📲 Order / Inquire on WhatsApp: +91 ${phone}\n📍 Visit: ${shop}, ${city}`
    : `\n\n📍 Visit: ${shop}, ${city}\n⭐ Rated on Trustit & Google!`;

  const cleanShop = shop.replace(/[^a-zA-Z0-9]/g, "");
  const cleanCity = city.replace(/[^a-zA-Z0-9]/g, "");
  const cleanDish = dish.replace(/[^a-zA-Z0-9]/g, "");

  const hashtags = [
    `#${cleanCity}Foodies`,
    `#${cleanShop}`,
    `#${cleanDish}`,
    `#LocalFoodLove`,
    `#${cleanCity}Eats`,
    `#TrustitVerified`,
    "#TasteOfIndia",
    "#FreshFood",
  ];

  const fullCaption = `${headline}\n\n${body}${cta}\n\n${hashtags.join(" ")}`;

  return { headline, body, hashtags, fullCaption };
}
