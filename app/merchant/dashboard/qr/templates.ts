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
  { id: "template_1", name: "Restaurant", description: "A warm welcome for diners", printSize: "4 × 6 in", orientation: "Portrait", ratio: "2 / 3" },
  { id: "template_2", name: "Hotel / Stay", description: "Made for a memorable stay", printSize: "4 × 6 in", orientation: "Portrait", ratio: "2 / 3" },
  { id: "template_3", name: "Laundry", description: "Fresh, clean and ready to share", printSize: "4 × 6 in", orientation: "Portrait", ratio: "2 / 3" },
  { id: "template_4", name: "Retail Shop", description: "A little more love for local shops", printSize: "6 × 4 in", orientation: "Landscape", ratio: "3 / 2" },
  { id: "template_5", name: "Salon / Beauty", description: "A polished finish for every visit", printSize: "6 × 4 in", orientation: "Landscape", ratio: "3 / 2" },
];
