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
