/**
 * Premium Vector Standee Generator for Trustit Review Physical Acrylic & Wood Display Kits
 * Produces 300-DPI-equivalent vector SVG ready for laser cut and flatbed UV acrylic printing.
 */

export type StandeeTheme = "royal_gold" | "studio_white" | "google_verified";

export interface StandeeOptions {
  businessName: string;
  businessId: string;
  city?: string;
  reviewUrl: string;
  theme?: StandeeTheme;
  sku?: string;
  orderId?: string;
}

export function generateStylishStandeeSvg(options: StandeeOptions): string {
  const {
    businessName,
    businessId,
    city = "Bahraich",
    reviewUrl,
    theme = "royal_gold",
    sku = "TRUSTIT-ACRYLIC-A5",
    orderId = "PREVIEW",
  } = options;

  // Real QR Server API URL embedded into SVG image
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(
    reviewUrl
  )}`;

  const safeName = businessName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const safeCity = city
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (theme === "royal_gold") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 1700" width="1200" height="1700">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37" />
      <stop offset="35%" stop-color="#FFF2A3" />
      <stop offset="65%" stop-color="#AA771C" />
      <stop offset="100%" stop-color="#8B6508" />
    </linearGradient>
    <linearGradient id="goldBorder" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFE885" />
      <stop offset="50%" stop-color="#B8860B" />
      <stop offset="100%" stop-color="#6B4E00" />
    </linearGradient>
    <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141824" />
      <stop offset="100%" stop-color="#07090E" />
    </linearGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Obsidian Acrylic Base -->
  <rect width="100%" height="100%" fill="#05070A" />
  <rect x="40" y="40" width="1120" height="1620" rx="40" fill="url(#darkBg)" stroke="url(#goldBorder)" stroke-width="6" />
  
  <!-- Outer Gold Geometric Filigree Inset -->
  <rect x="65" y="65" width="1070" height="1570" rx="30" fill="none" stroke="#B8860B" stroke-width="1.5" stroke-dasharray="12,6" opacity="0.6" />

  <!-- Top Crown Shield & Trustit Header -->
  <g transform="translate(600, 150)">
    <circle cx="0" cy="0" r="48" fill="#141824" stroke="url(#goldBorder)" stroke-width="3" />
    <path d="M-20 -15 L0 -30 L20 -15 L20 15 Q0 30 -20 15 Z" fill="none" stroke="url(#goldGradient)" stroke-width="3" />
    <text x="0" y="8" font-family="'Cinzel', 'Trajan Pro', Georgia, serif" font-size="22" font-weight="900" fill="url(#goldGradient)" text-anchor="middle">T</text>
  </g>

  <!-- Title / Verified Kicker -->
  <text x="600" y="250" font-family="'Cinzel', Georgia, serif" font-size="24" font-weight="bold" fill="url(#goldGradient)" text-anchor="middle" letter-spacing="8">OFFICIAL VERIFIED PARTNER</text>
  <text x="600" y="300" font-family="Arial, sans-serif" font-size="16" fill="#94A3B8" text-anchor="middle" letter-spacing="4">GOOGLE REVIEWS &amp; TRUSTIT CERTIFIED</text>

  <!-- Business Name (Bold Luxury) -->
  <text x="600" y="410" font-family="'Montserrat', Arial, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">${safeName}</text>
  <text x="600" y="460" font-family="Arial, sans-serif" font-size="20" fill="url(#goldGradient)" text-anchor="middle" letter-spacing="1">📍 ${safeCity}</text>

  <!-- Gold 5-Star Rating Indicator -->
  <g transform="translate(600, 520)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="44" fill="url(#goldGradient)" text-anchor="middle" letter-spacing="12">★ ★ ★ ★ ★</text>
  </g>
  <text x="600" y="565" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#E2E8F0" text-anchor="middle" letter-spacing="1">TOP RATED CUSTOMER EXPERIENCE</text>

  <!-- QR Frame Container -->
  <rect x="360" y="630" width="480" height="480" rx="32" fill="#FFFFFF" stroke="url(#goldBorder)" stroke-width="8" filter="url(#goldGlow)" />
  
  <!-- Real QR Code Image -->
  <image xlink:href="${qrCodeUrl}" x="385" y="655" width="430" height="430" />

  <!-- NFC / Contactless Pill Badge -->
  <rect x="440" y="1150" width="320" height="48" rx="24" fill="#141824" stroke="url(#goldBorder)" stroke-width="2" />
  <text x="600" y="1182" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="url(#goldGradient)" text-anchor="middle" letter-spacing="2">📱 TOUCH PHONE OR SCAN</text>

  <!-- Scan Instructions -->
  <text x="600" y="1270" font-family="'Montserrat', Arial, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle">Scan Camera to Leave Review</text>
  <text x="600" y="1315" font-family="Arial, sans-serif" font-size="20" fill="#94A3B8" text-anchor="middle">Takes less than 15 seconds · 100% Verified Review</text>
  <text x="600" y="1355" font-family="monospace" font-size="16" fill="url(#goldGradient)" text-anchor="middle">${reviewUrl}</text>

  <!-- Footer Watermark / SKU -->
  <line x1="200" y1="1450" x2="1000" y2="1450" stroke="#B8860B" stroke-width="1" opacity="0.4" />
  <text x="600" y="1500" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#64748B" text-anchor="middle">TRUSTIT VERIFIED ACRYLIC STANDEE KIT</text>
  <text x="600" y="1535" font-family="monospace" font-size="14" fill="#475569" text-anchor="middle">SKU: ${sku} · REF: ${orderId} · ID: ${businessId}</text>
</svg>`;
  }

  // Theme: Studio Minimalist Arctic White
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 1700" width="1200" height="1700">
  <defs>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Pure White Acrylic Base -->
  <rect width="100%" height="100%" fill="#FFFFFF" />
  <rect x="40" y="40" width="1120" height="1620" rx="40" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4" />

  <!-- Google 4-Color Accent Bar at Top -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="270" height="8" rx="4" fill="#4285F4" />
    <rect x="270" y="0" width="270" height="8" rx="4" fill="#EA4335" />
    <rect x="540" y="0" width="270" height="8" rx="4" fill="#FBBC05" />
    <rect x="810" y="0" width="270" height="8" rx="4" fill="#34A853" />
  </g>

  <!-- Verified Badge Pill -->
  <rect x="420" y="130" width="360" height="48" rx="24" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="2" />
  <text x="600" y="161" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1D4ED8" text-anchor="middle" letter-spacing="2">✓ OFFICIAL REVIEW DESK</text>

  <!-- Business Name -->
  <text x="600" y="270" font-family="'Montserrat', Arial, sans-serif" font-size="52" font-weight="900" fill="#0F172A" text-anchor="middle">${safeName}</text>
  <text x="600" y="320" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="#64748B" text-anchor="middle">📍 ${safeCity}</text>

  <!-- Rating Stars -->
  <text x="600" y="390" font-family="Arial, sans-serif" font-size="44" fill="#F59E0B" text-anchor="middle" letter-spacing="10">★ ★ ★ ★ ★</text>
  <text x="600" y="435" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#334155" text-anchor="middle">Rate Our Quality on Google &amp; Trustit</text>

  <!-- QR Frame Container -->
  <rect x="360" y="500" width="480" height="480" rx="32" fill="#FFFFFF" stroke="#0F172A" stroke-width="8" filter="url(#subtleShadow)" />
  <image xlink:href="${qrCodeUrl}" x="385" y="525" width="430" height="430" />

  <!-- Action CTA -->
  <rect x="360" y="1030" width="480" height="72" rx="36" fill="#1D4ED8" />
  <text x="600" y="1076" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">SCAN CAMERA TO REVIEW</text>

  <!-- Instructional Steps -->
  <g transform="translate(600, 1170)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="18" fill="#475569" text-anchor="middle">1. Open Phone Camera or Google Lens</text>
    <text x="0" y="35" font-family="Arial, sans-serif" font-size="18" fill="#475569" text-anchor="middle">2. Point at QR Code &amp; Tap the Link</text>
    <text x="0" y="70" font-family="Arial, sans-serif" font-size="18" fill="#475569" text-anchor="middle">3. Leave your 5-Star Rating &amp; Feedback</text>
  </g>

  <!-- Direct Web Link -->
  <rect x="300" y="1320" width="600" height="42" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
  <text x="600" y="1347" font-family="monospace" font-size="15" fill="#64748B" text-anchor="middle">${reviewUrl}</text>

  <!-- Production Specifications -->
  <line x1="200" y1="1450" x2="1000" y2="1450" stroke="#CBD5E1" stroke-width="1" />
  <text x="600" y="1500" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#94A3B8" text-anchor="middle">OFFICIAL TRUSTIT PHYSICAL DISPLAY STAND</text>
  <text x="600" y="1530" font-family="monospace" font-size="13" fill="#94A3B8" text-anchor="middle">SKU: ${sku} · REF: ${orderId} · ID: ${businessId}</text>
</svg>`;
}
