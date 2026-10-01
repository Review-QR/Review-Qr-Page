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
  surface: string;
  border: string;
  heading: string;
  body: string;
  accent: string;
  button: string;
  qrPlate: string;
  badge: string;
}> = [
  { id: "template_1", name: "Fresh & Clear", description: "Clean blue and green", surface: "bg-gradient-to-br from-sky-50 via-white to-emerald-50", border: "border-sky-200", heading: "text-slate-900", body: "text-slate-600", accent: "text-emerald-700", button: "bg-emerald-600 text-white", qrPlate: "bg-white", badge: "bg-sky-100 text-blue-800" },
  { id: "template_2", name: "Warm & Natural", description: "Café-inspired earth tones", surface: "bg-[#f4e6d1]", border: "border-[#cfaa79]", heading: "text-[#452d1d]", body: "text-[#76583d]", accent: "text-[#42603b]", button: "bg-[#42603b] text-white", qrPlate: "bg-white", badge: "bg-[#e5d0ae] text-[#5b4028]" },
  { id: "template_3", name: "Color Pop", description: "Bright modern color", surface: "bg-gradient-to-br from-fuchsia-50 via-white to-amber-50", border: "border-fuchsia-200", heading: "text-slate-900", body: "text-slate-600", accent: "text-fuchsia-700", button: "bg-fuchsia-600 text-white", qrPlate: "bg-white", badge: "bg-amber-100 text-orange-800" },
  { id: "template_4", name: "Midnight", description: "Dark premium chalkboard", surface: "bg-[#17212b]", border: "border-slate-600", heading: "text-white", body: "text-slate-300", accent: "text-emerald-300", button: "bg-emerald-300 text-slate-950", qrPlate: "bg-white", badge: "bg-white/10 text-emerald-200" },
  { id: "template_5", name: "Ivory & Gold", description: "Elegant warm white", surface: "bg-[#fffdf8]", border: "border-[#dbc58e]", heading: "text-[#302817]", body: "text-[#70654d]", accent: "text-[#9b7628]", button: "bg-[#9b7628] text-white", qrPlate: "bg-white", badge: "bg-[#f3ecd9] text-[#765b20]" },
];
