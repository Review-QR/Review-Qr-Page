import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { jsPDF } from "jspdf";
import { buildTrustitReviewUrl } from "../../../../lib/trustit-qr.ts";
import {
  getQrTemplateFilename,
  getQrTemplatePrintCss,
  getQrTemplatePrintDimensions,
  qrTemplates,
} from "./templates.ts";

const gallerySource = await readFile(new URL("./qr-template-gallery.tsx", import.meta.url), "utf8");
const themeSource = await readFile(new URL("../../../../lib/trustit-ai/qr-design-theme.ts", import.meta.url), "utf8");
const qrUtilitySource = await readFile(new URL("../../../../lib/trustit-qr.ts", import.meta.url), "utf8");
const dashboardCssSource = await readFile(new URL("../dashboard.css", import.meta.url), "utf8");

test("all five QR poster exports retain their exact print page dimensions and orientation", () => {
  const expected = [
    ["template_1", "4 × 6 in", "Portrait", 4, 6, "portrait"],
    ["template_2", "4 × 6 in", "Portrait", 4, 6, "portrait"],
    ["template_3", "4 × 6 in", "Portrait", 4, 6, "portrait"],
    ["template_4", "6 × 4 in", "Landscape", 6, 4, "landscape"],
    ["template_5", "6 × 4 in", "Landscape", 6, 4, "landscape"],
  ];

  assert.equal(qrTemplates.length, 5);
  for (const [id, size, orientation, widthIn, heightIn, cssOrientation] of expected) {
    const template = qrTemplates.find((item) => item.id === id);
    assert.ok(template);
    assert.equal(template.printSize, size);
    assert.equal(template.orientation, orientation);
    assert.deepEqual(getQrTemplatePrintDimensions(id), { widthIn, heightIn, orientation: cssOrientation });
    assert.match(getQrTemplatePrintCss(id), new RegExp(`@page \\{ size: ${widthIn}in ${heightIn}in; margin: 0; \\}`));
  }
});

test("PDF pages use the physical poster dimensions rather than a default page size", () => {
  for (const template of qrTemplates) {
    const { widthIn, heightIn, orientation } = getQrTemplatePrintDimensions(template.id);
    const pdf = new jsPDF({ orientation, unit: "in", format: [widthIn, heightIn], compress: true });
    assert.equal(pdf.internal.pageSize.getWidth(), widthIn);
    assert.equal(pdf.internal.pageSize.getHeight(), heightIn);
  }
});

test("download filenames include sanitized template, merchant, business ID, and safe extensions", () => {
  assert.equal(
    getQrTemplateFilename("template_1", "Café / North & South", "QR-45180409", "png"),
    "Trustit-Classic-Portrait-Cafe-North-South-QR-QR-45180409.png",
  );
  assert.equal(
    getQrTemplateFilename("template_4", "Shop", "../QR/45 18", "pdf"),
    "Trustit-Local-Landscape-Shop-QR-QR-45-18.pdf",
  );
});

test("export uses the authenticated business route and the active preview/current template", () => {
  const businessId = "Merchant / A?";
  const route = buildTrustitReviewUrl("https://trustit.example", businessId);
  assert.equal(route, "https://trustit.example/r/Merchant%20%2F%20A%3F");
  assert.match(gallerySource, /const exportTemplateId = previewTemplate \?\? selectedTemplate/);
  assert.match(gallerySource, /default\.toDataURL\(reviewRoute/);
  assert.match(gallerySource, /errorCorrectionLevel: "H"[\s\S]*?margin: 4[\s\S]*?width: 1200/);
  assert.match(gallerySource, /getQrTemplateFilename\(templateId, businessName, businessId, format\)/);
  assert.match(gallerySource, /data-template-id=\{templateId\}/);
  assert.doesNotMatch(gallerySource, /QR-45180409/);
});

test("print CSS isolates the poster and preserves print colors without page breaks", () => {
  const portrait = getQrTemplatePrintCss("template_1");
  const landscape = getQrTemplatePrintCss("template_5");
  for (const css of [portrait, landscape]) {
    assert.match(css, /body \* \{ visibility: hidden !important; \}/);
    assert.match(css, /#trustit-print-root, #trustit-print-root \* \{[\s\S]*print-color-adjust: exact/);
    assert.match(css, /break-inside: avoid !important; page-break-inside: avoid !important/);
  }
  assert.match(portrait, /@page \{ size: 4in 6in; margin: 0; \}/);
  assert.match(landscape, /@page \{ size: 6in 4in; margin: 0; \}/);
});

test("selected template and preview expose PNG, PDF, and print controls", () => {
  assert.match(gallerySource, /Download PNG/);
  assert.match(gallerySource, /Download PDF/);
  assert.match(gallerySource, /Preparing print…/);
  assert.match(gallerySource, /window\.print\(\)/);
  assert.match(gallerySource, /aria-label="Download and print QR poster"/);
});


test("all five QR designs consume one merchant business category instead of template categories", () => {
  assert.match(gallerySource, /businessType: string \| null/);
  assert.match(gallerySource, /const category = getBusinessCategoryProfile\(businessType, categoryConfig\)/);
  assert.match(gallerySource, /const posterCategory = categoryTheme \? \{ \.\.\.category, experiences: categoryTheme\.experiences, palette: categoryTheme\.palette, backgroundArtDirection: categoryTheme\.backgroundArtDirection \}/);
  assert.match(gallerySource, /const content = \{ name: businessName, businessId, qrUrl, usable: qrUsable, compact, category: posterCategory, designAsset: designAssets\?\.\[templateId\], footer, digital, googleReviewLink, variation \}/);
  assert.match(gallerySource, /href=\{safeGoogleLink\} target="_blank" rel="noopener noreferrer"/);
  assert.equal((gallerySource.match(/<CategoryArt iconName=\{category\.iconName\} designFamily=\{category\.designFamily\} designAsset=\{designAsset\} experiences=\{category\.experiences\} qrIcons=\{category\.qrIcons\} palette=\{category\.palette\} variation=\{variation\} compact=\{compact\}/g) ?? []).length, 5);
  assert.match(gallerySource, /experiences\.slice\(0, 3\)/);
  assert.match(gallerySource, /data-background-direction=\{posterCategory\.backgroundArtDirection\}/);
  assert.match(gallerySource, /Digital · 1080×1350/);
  assert.match(gallerySource, /image\.width !== 1080 \|\| image\.height !== 1350/);
  assert.equal((gallerySource.match(/<FooterMessage message=\{footer\}/g) ?? []).length, 5, "every full-size template renders its locked design-family footer");
  assert.match(gallerySource, /QR_DESIGN_THEMES\.find\(\(theme\) => theme\.name === template\.designTheme\)/);
  assert.match(gallerySource, /\{category\.label\}/);
  assert.match(gallerySource, /\{category\.message\}/);
  for (const hardCodedCategory of [
    "Restaurant · Dining</p>",
    "Hotel · Stay · Hospitality</p>",
    "Laundry · Fresh care</p>",
    "Retail · Shop local</p>",
    "Salon · Beauty · Care</p>",
  ]) {
    assert.equal(gallerySource.includes(hardCodedCategory), false, `Hard-coded category remains: ${hardCodedCategory}`);
  }
  assert.match(themeSource, /posterLabel: "Sweet Shop · Sweets & Treats"/);
  assert.match(themeSource, /posterLabel: "Hotel · Stay · Hospitality"/);
  assert.match(themeSource, /posterLabel: "Laundry · Fresh Care"/);
});

test("normal merchant page rendering reads saved artwork only and never starts paid generation", async () => {
  const qrPage = await readFile(new URL("./page.tsx", import.meta.url), "utf8");
  const dashboardPage = await readFile(new URL("../page.tsx", import.meta.url), "utf8");
  assert.match(qrPage, /getPersistedBusinessQrDesignAssets/);
  assert.match(dashboardPage, /getPersistedBusinessQrDesignAssets/);
  assert.doesNotMatch(qrPage, /getBusinessQrDesignAssets\(/);
  assert.doesNotMatch(dashboardPage, /getBusinessQrDesignAssets\(/);
  const assetService = await readFile(new URL("../../../../lib/trustit-ai/qr-design-assets.server.ts", import.meta.url), "utf8");
  assert.match(assetService, /export async function getPersistedBusinessQrDesignAssets/);
  assert.match(assetService, /return loadPersistedAssets\(/);
});

test("QR regeneration falls back to built-in designs when optional AI generation fails", async () => {
  const source = await readFile(new URL("./regenerate-design-action.ts", import.meta.url), "utf8");
  assert.match(source, /provider: "procedural"/);
  assert.match(source, /fallback: true/);
  assert.match(gallerySource, /result\.provider === "procedural"/);
});

test("QR tiles use a fixed quiet zone, remain above poster artwork, and long business names can wrap and scale down", async () => {
  assert.match(gallerySource, /relative z-30 isolate inline-flex shrink-0[^`]*bg-white/);
  assert.match(qrUtilitySource, /margin=12/);
  assert.match(gallerySource, /overflowWrap: "break-word"/);
  assert.match(gallerySource, /length > 60/);
  assert.match(gallerySource, /length > 42/);
  assert.match(gallerySource, /textWrap: "balance"/);
  assert.match(gallerySource, /title=\{name\}/);
  const sample = "Deepak Sweets Bahraich";
  const longSample = "Deepak Sweets Bahraich Traditional Family Confectioners and Celebrations Since 1984";
  assert.ok(sample.length < 42);
  assert.ok(longSample.length > 60);
});

test("all five template frames keep a single business QR payload and separate the quiet zone from decoration", () => {
  const payload = buildTrustitReviewUrl("https://trustit.example", "biz-identity-123");
  assert.equal(payload, "https://trustit.example/r/biz-identity-123");
  assert.equal((gallerySource.match(/<ReviewQr url=\{qrUrl\}/g) ?? []).length, 5);
  assert.match(gallerySource, /qrCodeModule\.default\.toDataURL\(reviewRoute,\s*\{\s*errorCorrectionLevel: "H",\s*margin: 4,/);
  assert.match(gallerySource, /background: `linear-gradient\(/);
  assert.match(gallerySource, /data-qr-design-background="true"/);
  for (const id of [1, 2, 3, 4, 5]) assert.match(gallerySource, new RegExp(`template_${id}: "border`), `template_${id} should get a frame outside the QR quiet zone`);
  assert.doesNotMatch(gallerySource, /toDataURL\([^\n]*templateId/);
  assert.doesNotMatch(gallerySource, /toDataURL\([^\n]*variation/);
});

test("phone QR previews keep landscape posters readable inside their frame", () => {
  assert.match(gallerySource, /template\.ratio === "3 \/ 2" \? " merchant-template-tile--landscape"/);
  assert.match(dashboardCssSource, /merchant-template-tile--landscape\s*\{\s*grid-column:\s*span 2/);
  assert.match(gallerySource, /qrUsable=\{qrUsable\} category=\{category\} designAssets=\{designAssets\} googleReviewLink=\{googleReviewLink\} compact=/);
  assert.match(gallerySource, /screenPreview\?: boolean/);
  assert.match(dashboardCssSource, /data-template-id="template_1"/);
  assert.match(dashboardCssSource, /data-template-id="template_3"/);
});
