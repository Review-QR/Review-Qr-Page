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
  assert.match(gallerySource, /businessType: string \\| null/);
  assert.match(gallerySource, /const category = getBusinessCategoryProfile\\(businessType\\)/);
  assert.match(gallerySource, /const content = \\{ name: businessName, businessId, qrUrl, usable: qrUsable, compact, category \\}/);
  assert.match(gallerySource, /<CategoryArt kind=\\{category\\.artKind\\}/);
  assert.match(gallerySource, /\\{category\\.label\\}/);
  assert.match(gallerySource, /\\{category\\.message\\}/);
  for (const hardCodedCategory of [
    "Restaurant · Dining</p>",
    "Hotel · Stay · Hospitality</p>",
    "Laundry · Fresh care</p>",
    "Retail · Shop local</p>",
    "Salon · Beauty · Care</p>",
  ]) {
    assert.equal(gallerySource.includes(hardCodedCategory), false, `Hard-coded category remains: ${hardCodedCategory}`);
  }
  assert.match(gallerySource, /Sweet Shop · Sweets & Treats/);
  assert.match(gallerySource, /Hotel · Stay · Hospitality/);
  assert.match(gallerySource, /Laundry · Fresh Care/);
});
