export const qrTemplateIds = [
  "template_1",
  "template_2",
  "template_3",
  "template_4",
  "template_5",
] as const;

export type QrTemplateId = (typeof qrTemplateIds)[number];

export function isQrTemplateId(value: string): value is QrTemplateId {
  return (qrTemplateIds as readonly string[]).includes(value);
}

export const qrTemplates: Array<{
  id: QrTemplateId;
  name: string;
  description: string;
  printSize: "4 × 6 in" | "6 × 4 in";
  orientation: "Portrait" | "Landscape";
  ratio: "2 / 3" | "3 / 2";
}> = [
  { id: "template_1", name: "Classic Portrait", description: "Warm portrait layout with a centered QR", printSize: "4 × 6 in", orientation: "Portrait", ratio: "2 / 3" },
  { id: "template_2", name: "Elegant Portrait", description: "Premium dark portrait layout", printSize: "4 × 6 in", orientation: "Portrait", ratio: "2 / 3" },
  { id: "template_3", name: "Fresh Portrait", description: "Clean, light portrait layout", printSize: "4 × 6 in", orientation: "Portrait", ratio: "2 / 3" },
  { id: "template_4", name: "Local Landscape", description: "Compact landscape layout with side QR", printSize: "6 × 4 in", orientation: "Landscape", ratio: "3 / 2" },
  { id: "template_5", name: "Modern Landscape", description: "Polished landscape layout with side QR", printSize: "6 × 4 in", orientation: "Landscape", ratio: "3 / 2" },
];

export function getQrTemplatePrintDimensions(templateId: QrTemplateId) {
  const template = qrTemplates.find((item) => item.id === templateId);
  if (!template) throw new Error("Unknown QR template.");

  const match = template.printSize.match(/^(\d+) × (\d+) in$/);
  if (!match) throw new Error(`Invalid print size for ${template.name}.`);

  const widthIn = Number(match[1]);
  const heightIn = Number(match[2]);
  const orientation = widthIn > heightIn ? "landscape" : "portrait";
  if (template.orientation.toLowerCase() !== orientation) {
    throw new Error(`Print size and orientation do not match for ${template.name}.`);
  }

  return { widthIn, heightIn, orientation } as const;
}

function sanitizeFilenamePart(value: string) {
  const sanitized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/g, "");

  return sanitized || "Business";
}

export function getQrTemplateFilename(
  templateId: QrTemplateId,
  businessName: string,
  businessId: string,
  format: "png" | "pdf",
) {
  const template = qrTemplates.find((item) => item.id === templateId);
  if (!template) throw new Error("Unknown QR template.");

  return `Trustit-${sanitizeFilenamePart(template.name)}-${sanitizeFilenamePart(businessName)}-QR-${sanitizeFilenamePart(businessId)}.${format}`;
}

export function getQrTemplatePrintCss(templateId: QrTemplateId) {
  const { widthIn, heightIn } = getQrTemplatePrintDimensions(templateId);
  return `
    @page { size: ${widthIn}in ${heightIn}in; margin: 0; }
    @media print {
      html, body { width: ${widthIn}in !important; height: ${heightIn}in !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
      body * { visibility: hidden !important; }
      #trustit-print-root {
        position: fixed !important; inset: 0 auto auto 0 !important;
        width: ${widthIn}in !important; height: ${heightIn}in !important;
        max-width: none !important; max-height: none !important;
        overflow: hidden !important; border-radius: 0 !important; box-shadow: none !important;
        visibility: visible !important;
      }
      #trustit-print-root, #trustit-print-root * {
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      #trustit-print-root [data-template-id] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; border-radius: 0 !important; box-shadow: none !important; }
      #trustit-print-root img { max-width: 100% !important; object-fit: contain !important; }
      #trustit-print-root, #trustit-print-root * { break-inside: avoid !important; page-break-inside: avoid !important; }
    }
  `;
}
