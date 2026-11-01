export interface RenderCreativeOptions {
  canvas: HTMLCanvasElement;
  image?: HTMLImageElement | null;
  style: "foodie_craving" | "festive_gold" | "discount_dhamaka" | "minimal_luxe";
  businessName: string;
  dishName: string;
  price?: string;
  unit?: string;
  badgeText?: string;
  rating?: number;
  phone?: string;
  city?: string;
}

export function renderCreativePoster(opts: RenderCreativeOptions) {
  const { canvas, image, style, businessName, dishName, price, badgeText, rating = 4.8, phone, city = "Bahraich" } = opts;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = (canvas.width = 1080);
  const height = (canvas.height = 1080);

  ctx.clearRect(0, 0, width, height);

  // 1. Draw Base & Image
  if (image && image.complete && image.naturalWidth > 0) {
    // Cover the canvas
    const imgAspect = image.naturalWidth / image.naturalHeight;
    const canvasAspect = width / height;
    let renderW = width;
    let renderH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > canvasAspect) {
      renderW = height * imgAspect;
      offsetX = (width - renderW) / 2;
    } else {
      renderH = width / imgAspect;
      offsetY = (height - renderH) / 2;
    }

    ctx.save();
    ctx.drawImage(image, offsetX, offsetY, renderW, renderH);
    ctx.restore();
  } else {
    // Beautiful placeholder gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📷 Click or Upload Dish / Item Photo", width / 2, height / 2 - 20);
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Your creative poster will generate automatically", width / 2, height / 2 + 30);
  }

  // 2. Apply Style Overlays & Typography
  switch (style) {
    case "foodie_craving":
      renderFoodieCravingStyle(ctx, width, height, opts);
      break;
    case "festive_gold":
      renderFestiveGoldStyle(ctx, width, height, opts);
      break;
    case "discount_dhamaka":
      renderDiscountDhamakaStyle(ctx, width, height, opts);
      break;
    case "minimal_luxe":
    default:
      renderMinimalLuxeStyle(ctx, width, height, opts);
      break;
  }
}

function renderFoodieCravingStyle(ctx: CanvasRenderingContext2D, width: number, height: number, opts: RenderCreativeOptions) {
  // Top Vignette
  const topGrad = ctx.createLinearGradient(0, 0, 0, 240);
  topGrad.addColorStop(0, "rgba(0,0,0,0.85)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 240);

  // Bottom Deep Vignette
  const botGrad = ctx.createLinearGradient(0, height - 480, 0, height);
  botGrad.addColorStop(0, "rgba(0,0,0,0)");
  botGrad.addColorStop(0.3, "rgba(15,23,42,0.85)");
  botGrad.addColorStop(1, "rgba(15,23,42,0.98)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, height - 480, width, 480);

  // Top Header: Business Name & Trust Badge
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 38px sans-serif";
  ctx.fillText(opts.businessName || "Trustit Business", 60, 80);

  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 24px sans-serif";
  ctx.fillText(`⭐ ${(opts.rating ?? 4.8).toFixed(1)} Trustit & Google Verified • ${opts.city || "Bahraich"}`, 60, 120);

  // Badge Ribbon
  const badge = opts.badgeText || "🔥 TODAY'S SPECIAL";
  ctx.fillStyle = "#ef4444";
  roundRect(ctx, 60, height - 370, 260, 48, 24);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(badge, 190, height - 338);

  // Dish Name
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 54px sans-serif";
  ctx.fillText(opts.dishName || "Special Dish / Item", 60, height - 260);

  // Price Tag Pill
  if (opts.price) {
    ctx.fillStyle = "#fbbf24";
    roundRect(ctx, 60, height - 230, 220, 60, 16);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.font = "900 36px sans-serif";
    ctx.fillText(`₹${opts.price}`, 80, height - 188);
  }

  // Footer: Order WhatsApp CTA
  ctx.fillStyle = "#22c55e";
  roundRect(ctx, 60, height - 120, width - 120, 64, 32);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  const ctaText = opts.phone
    ? `📲 Order / Inquire on WhatsApp: +91 ${opts.phone}`
    : `📍 Visit Us: ${opts.businessName}, ${opts.city || "Bahraich"}`;
  ctx.fillText(ctaText, width / 2, height - 80);
}

function renderFestiveGoldStyle(ctx: CanvasRenderingContext2D, width: number, height: number, opts: RenderCreativeOptions) {
  // Royal Maroon & Gold Border
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 4;
  ctx.strokeRect(46, 46, width - 92, height - 92);

  // Top Bar Banner
  ctx.fillStyle = "rgba(136, 19, 55, 0.92)";
  roundRect(ctx, 60, 60, width - 120, 110, 20);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#fef08a";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("✨ FESTIVE CELEBRATIONS ✨", width / 2, 102);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 36px sans-serif";
  ctx.fillText(opts.businessName || "Trustit Business", width / 2, 145);

  // Bottom Content Card
  ctx.fillStyle = "rgba(88, 28, 135, 0.94)";
  roundRect(ctx, 60, height - 360, width - 120, 290, 28);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Dish Title
  ctx.fillStyle = "#fde047";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(opts.badgeText || "Tradition & Pure Taste", width / 2, height - 305);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 50px sans-serif";
  ctx.fillText(opts.dishName || "Festive Special", width / 2, height - 245);

  if (opts.price) {
    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 42px sans-serif";
    ctx.fillText(`Special Price: ₹${opts.price}`, width / 2, height - 185);
  }

  // Footer CTA
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`⭐ ${(opts.rating ?? 4.8).toFixed(1)} Rated • Visit ${opts.businessName}, ${opts.city || "Bahraich"}`, width / 2, height - 110);
}

function renderDiscountDhamakaStyle(ctx: CanvasRenderingContext2D, width: number, height: number, opts: RenderCreativeOptions) {
  // Vibrant Vignette
  const grad = ctx.createLinearGradient(0, height - 420, 0, height);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.3, "rgba(180, 83, 9, 0.9)");
  grad.addColorStop(1, "rgba(120, 53, 15, 0.98)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, height - 420, width, 420);

  // Top Left Brand Tag
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  roundRect(ctx, 40, 40, 440, 80, 16);
  ctx.fill();
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 28px sans-serif";
  ctx.fillText(opts.businessName, 60, 80);
  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText(`⭐ ${(opts.rating ?? 4.8).toFixed(1)} Verified Business`, 60, 105);

  // Top Right Diagonal Dhamaka Badge
  ctx.fillStyle = "#dc2626";
  roundRect(ctx, width - 360, 40, 320, 80, 20);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = "#fef08a";
  ctx.font = "900 28px sans-serif";
  ctx.fillText("🔥 SPECIAL OFFER", width - 200, 78);
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Limited Time Only", width - 200, 105);

  // Bottom Content
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px sans-serif";
  ctx.fillText(opts.dishName, 60, height - 260);

  if (opts.price) {
    ctx.fillStyle = "#fef08a";
    ctx.font = "900 44px sans-serif";
    ctx.fillText(`₹${opts.price}`, 60, height - 195);
  }

  // CTA Button
  ctx.fillStyle = "#16a34a";
  roundRect(ctx, 60, height - 130, width - 120, 65, 32);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(opts.phone ? `📲 Order Now on WhatsApp: +91 ${opts.phone}` : `📍 Visit Us in ${opts.city}`, width / 2, height - 88);
}

function renderMinimalLuxeStyle(ctx: CanvasRenderingContext2D, width: number, height: number, opts: RenderCreativeOptions) {
  // Clean Dark Bottom Card
  const botGrad = ctx.createLinearGradient(0, height - 380, 0, height);
  botGrad.addColorStop(0, "rgba(0,0,0,0)");
  botGrad.addColorStop(0.3, "rgba(15,23,42,0.85)");
  botGrad.addColorStop(1, "rgba(15,23,42,0.98)");
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, height - 380, width, 380);

  // Elegant Top Header
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  roundRect(ctx, 40, 40, width - 80, 90, 24);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 32px sans-serif";
  ctx.fillText(opts.businessName, 70, 85);

  ctx.textAlign = "right";
  ctx.fillStyle = "#b45309";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`⭐ ${(opts.rating ?? 4.8).toFixed(1)} Trustit Certified`, width - 70, 85);

  ctx.fillStyle = "#64748b";
  ctx.font = "18px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(opts.city || "Bahraich", 70, 114);

  // Bottom Content
  ctx.textAlign = "left";
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(opts.badgeText || "SIGNATURE SELECTION", 60, height - 260);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px sans-serif";
  ctx.fillText(opts.dishName, 60, height - 195);

  if (opts.price) {
    ctx.fillStyle = "#facc15";
    ctx.font = "900 38px sans-serif";
    ctx.fillText(`₹${opts.price}`, 60, height - 135);
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(opts.phone ? `WhatsApp: +91 ${opts.phone}` : (opts.city || "Bahraich"), width - 60, height - 135);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function getCategoryEmblem(type?: string | null): { icon: string; label: string } {
  const t = (type || "").toLowerCase();
  if (t.includes("cafe") || t.includes("coffee")) return { icon: "☕", label: "Cafe & Lounge" };
  if (t.includes("restaurant") || t.includes("food") || t.includes("hotel") || t.includes("dhaba") || t.includes("dining"))
    return { icon: "🍽️", label: "Restaurant & Dining" };
  if (t.includes("sweet") || t.includes("mithai") || t.includes("dessert") || t.includes("cake") || t.includes("bakery"))
    return { icon: "🧁", label: "Sweets & Bakery" };
  if (t.includes("salon") || t.includes("beauty") || t.includes("spa") || t.includes("parlour"))
    return { icon: "💇", label: "Salon & Spa" };
  if (t.includes("jewel") || t.includes("gold")) return { icon: "💎", label: "Jewellery & Gems" };
  if (t.includes("cloth") || t.includes("fashion") || t.includes("garment") || t.includes("boutique"))
    return { icon: "👗", label: "Fashion & Apparel" };
  if (t.includes("electr") || t.includes("mobile") || t.includes("phone"))
    return { icon: "📱", label: "Electronics & Mobile" };
  if (t.includes("grocery") || t.includes("kirana") || t.includes("supermarket") || t.includes("mart"))
    return { icon: "🛒", label: "Grocery & Retail" };
  if (t.includes("health") || t.includes("pharma") || t.includes("medical"))
    return { icon: "💊", label: "Healthcare & Pharmacy" };
  if (t.includes("auto") || t.includes("motor") || t.includes("car") || t.includes("bike"))
    return { icon: "🚗", label: "Automobile & Services" };
  return { icon: "🏪", label: type || "Verified Business" };
}

export interface RenderOccasionPosterOptions {
  canvas: HTMLCanvasElement;
  style: "royal_gold" | "ivory_cream";
  businessName: string;
  businessType?: string | null;
  logoImg?: HTMLImageElement | null;
  occasionType: "birthday" | "anniversary" | "festival" | "offer";
  headline: string;
  customerName?: string;
  subtitle: string;
  couponCode: string;
  discountPercent: number;
  couponValidityDays: number;
}

export function renderOccasionGreetingPoster(opts: RenderOccasionPosterOptions) {
  const {
    canvas,
    style,
    businessName,
    businessType,
    logoImg,
    occasionType,
    headline,
    subtitle,
    couponCode,
    discountPercent,
    couponValidityDays,
  } = opts;

  const emblem = getCategoryEmblem(businessType);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = (canvas.width = 1080);
  const height = (canvas.height = 1350); // 4:5 Portrait Mobile Poster / WhatsApp Screen Fit

  ctx.clearRect(0, 0, width, height);

  const occasionIcon =
    occasionType === "birthday"
      ? "🎂"
      : occasionType === "anniversary"
      ? "💍"
      : occasionType === "festival"
      ? "🪔"
      : "🔥";

  if (style === "royal_gold") {
    // ── CARD 1: ROYAL DARK GOLD LUXURY ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#19150c");
    bgGrad.addColorStop(0.5, "#0b0a08");
    bgGrad.addColorStop(1, "#1f180d");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Card Frame
    ctx.save();
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 6;
    ctx.shadowColor = "rgba(212, 175, 55, 0.4)";
    ctx.shadowBlur = 25;
    roundRect(ctx, 40, 40, width - 80, height - 80, 48);
    ctx.stroke();
    ctx.restore();

    // Corner Golden Waves
    ctx.save();
    const waveGrad1 = ctx.createRadialGradient(80, 80, 10, 80, 80, 300);
    waveGrad1.addColorStop(0, "rgba(245, 215, 127, 0.25)");
    waveGrad1.addColorStop(1, "transparent");
    ctx.fillStyle = waveGrad1;
    ctx.fillRect(0, 0, 400, 400);

    const waveGrad2 = ctx.createRadialGradient(width - 80, 80, 10, width - 80, 80, 300);
    waveGrad2.addColorStop(0, "rgba(245, 215, 127, 0.25)");
    waveGrad2.addColorStop(1, "transparent");
    ctx.fillStyle = waveGrad2;
    ctx.fillRect(width - 400, 0, 400, 400);
    ctx.restore();

    // Top Logo Frame (140x140)
    const logoX = (width - 140) / 2;
    const logoY = 95;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 4;
    ctx.shadowColor = "rgba(212, 175, 55, 0.5)";
    ctx.shadowBlur = 15;
    roundRect(ctx, logoX, logoY, 140, 140, 32);
    ctx.fill();
    ctx.stroke();

    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.clip();
      ctx.drawImage(logoImg, logoX + 10, logoY + 10, 120, 120);
    } else {
      ctx.font = "64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emblem.icon, width / 2, logoY + 70);
    }
    ctx.restore();

    // Business Name
    ctx.textAlign = "center";
    ctx.fillStyle = "#e5c158";
    ctx.font = "900 34px sans-serif";
    ctx.fillText(businessName.toUpperCase(), width / 2, 285);

    // Category Badge
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`✦ ${emblem.label.toUpperCase()} ✦`, width / 2, 320);

    // Occasion Icon
    ctx.font = "80px sans-serif";
    ctx.fillText(occasionIcon, width / 2, 420);

    // Headline
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 58px sans-serif";
    ctx.fillText(headline, width / 2, 510);

    // Ornate Golden Divider
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("✦ ────── ‹ ❖ › ────── ✦", width / 2, 580);

    // Subtitle Wishes
    ctx.fillStyle = "#f0dfaa";
    ctx.font = "italic 32px Georgia, serif";
    ctx.fillText(`"${subtitle}"`, width / 2, 650);

    // Coupon Ticket Box
    const couponBoxW = width - 240;
    const couponBoxH = 290;
    const couponBoxX = 120;
    const couponBoxY = 750;

    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.strokeStyle = "rgba(212, 175, 55, 0.8)";
    ctx.lineWidth = 3;
    roundRect(ctx, couponBoxX, couponBoxY, couponBoxW, couponBoxH, 36);
    ctx.fill();
    ctx.stroke();

    // Ticket Header
    ctx.fillStyle = "#e5c158";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`EXCLUSIVE GIFT COUPON (VALID ${couponValidityDays} DAYS)`, width / 2, couponBoxY + 55);

    // Golden Ticket Pill
    const pillW = 460;
    const pillH = 84;
    const pillX = (width - pillW) / 2;
    const pillY = couponBoxY + 85;

    const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
    pillGrad.addColorStop(0, "#d4af37");
    pillGrad.addColorStop(0.5, "#fcedbf");
    pillGrad.addColorStop(1, "#d4af37");
    ctx.fillStyle = pillGrad;
    roundRect(ctx, pillX, pillY, pillW, pillH, 24);
    ctx.fill();

    // Code
    ctx.fillStyle = "#1a1205";
    ctx.font = "900 38px monospace";
    ctx.fillText(`VIP PASS · ${discountPercent}% OFF`, width / 2, pillY + 56);

    // Ticket Subtext
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(`Flat ${discountPercent}% OFF On Your Visit!`, width / 2, couponBoxY + 225);
    ctx.font = "italic 20px sans-serif";
    ctx.fillStyle = "#f0dfaa";
    ctx.fillText(`(Show WhatsApp message code below to redeem)`, width / 2, couponBoxY + 258);
    ctx.restore();

    // Golden Ribbon Bow at the bottom
    ctx.font = "70px sans-serif";
    ctx.fillText("🎀", width / 2, 1140);
  } else {
    // ── CARD 2: WARM IVORY CREAM ELEGANCE ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#fdfbf7");
    bgGrad.addColorStop(0.5, "#f7f2ea");
    bgGrad.addColorStop(1, "#eee5d8");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Card Frame
    ctx.save();
    ctx.strokeStyle = "#d9c7a7";
    ctx.lineWidth = 6;
    ctx.shadowColor = "rgba(180, 150, 110, 0.25)";
    ctx.shadowBlur = 20;
    roundRect(ctx, 40, 40, width - 80, height - 80, 48);
    ctx.stroke();
    ctx.restore();

    // Botanical Corner Leaves
    ctx.font = "90px sans-serif";
    ctx.fillText("🌿", width - 130, 140);
    ctx.fillText("🍃", 130, height - 120);

    // Top Logo Frame
    const logoX = (width - 140) / 2;
    const logoY = 95;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#cbb28b";
    ctx.lineWidth = 4;
    roundRect(ctx, logoX, logoY, 140, 140, 32);
    ctx.fill();
    ctx.stroke();

    if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
      ctx.clip();
      ctx.drawImage(logoImg, logoX + 10, logoY + 10, 120, 120);
    } else {
      ctx.font = "64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emblem.icon, width / 2, logoY + 70);
    }
    ctx.restore();

    // Business Name
    ctx.textAlign = "center";
    ctx.fillStyle = "#5c3e1e";
    ctx.font = "900 34px sans-serif";
    ctx.fillText(businessName.toUpperCase(), width / 2, 285);

    // Category Badge
    ctx.fillStyle = "#8a6d4d";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText(`✦ ${emblem.label.toUpperCase()} ✦`, width / 2, 320);

    // Occasion Icon
    ctx.font = "80px sans-serif";
    ctx.fillText(occasionIcon, width / 2, 420);

    // Headline
    ctx.fillStyle = "#3a2717";
    ctx.font = "900 58px sans-serif";
    ctx.fillText(headline, width / 2, 510);

    // Ornate Divider
    ctx.fillStyle = "#b89564";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText("✦ ────── ‹ ❖ › ────── ✦", width / 2, 580);

    // Subtitle Wishes
    ctx.fillStyle = "#4a3420";
    ctx.font = "italic 32px Georgia, serif";
    ctx.fillText(`"${subtitle}"`, width / 2, 650);

    // Dashed Coupon Ticket Box
    const couponBoxW = width - 240;
    const couponBoxH = 290;
    const couponBoxX = 120;
    const couponBoxY = 750;

    ctx.save();
    ctx.fillStyle = "#faf6f0";
    ctx.strokeStyle = "#cbb28b";
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 10]);
    roundRect(ctx, couponBoxX, couponBoxY, couponBoxW, couponBoxH, 36);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Ticket Header
    ctx.fillStyle = "#5c3e1e";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`EXCLUSIVE GIFT COUPON (VALID ${couponValidityDays} DAYS)`, width / 2, couponBoxY + 55);

    // Ticket Pill
    const pillW = 460;
    const pillH = 84;
    const pillX = (width - pillW) / 2;
    const pillY = couponBoxY + 85;

    const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
    pillGrad.addColorStop(0, "#f0d9ab");
    pillGrad.addColorStop(0.5, "#fcedcf");
    pillGrad.addColorStop(1, "#e8cb97");
    ctx.fillStyle = pillGrad;
    ctx.strokeStyle = "#dfc698";
    ctx.lineWidth = 2;
    roundRect(ctx, pillX, pillY, pillW, pillH, 24);
    ctx.fill();
    ctx.stroke();

    // Code
    ctx.fillStyle = "#3a2510";
    ctx.font = "900 38px monospace";
    ctx.fillText(`VIP PASS · ${discountPercent}% OFF`, width / 2, pillY + 56);

    // Ticket Subtext
    ctx.fillStyle = "#2d1e11";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(`Flat ${discountPercent}% OFF On Your Visit!`, width / 2, couponBoxY + 225);
    ctx.font = "italic 20px sans-serif";
    ctx.fillStyle = "#8a6d4d";
    ctx.fillText(`(Show WhatsApp message code below to redeem)`, width / 2, couponBoxY + 258);
    ctx.restore();
  }
}
