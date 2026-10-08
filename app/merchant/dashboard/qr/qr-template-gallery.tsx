"use client";

import { useRef, useState, useTransition } from "react";
import { buildTrustitQrImageUrl, buildTrustitReviewUrl, trustitAppOrigin } from "@/lib/trustit-qr";
import { resolveBusinessTheme } from "@/lib/trustit-ai/qr-design-theme";
import { getBusinessCategory, QR_DESIGN_THEMES } from "@/lib/config/business-catalog";
import BusinessCategoryIcon from "@/app/components/business-category-icon";
import type { QrDesignAsset, QrDesignAssets } from "@/lib/trustit-ai/provider-contracts";
import { saveQrTemplateAction } from "./actions";
import { regenerateQrDesignAction } from "./regenerate-design-action";
import { getQrTemplateFilename, getQrTemplatePrintCss, getQrTemplatePrintDimensions, qrTemplates, type QrTemplateId } from "./templates";

type ExportAction = "png" | "pdf" | "print";

type Props = {
  businessId: string;
  businessName: string;
  businessType: string | null;
  qrStatus: string | null;
  expiry: string | null;
  initialTemplate: string;
  initialDesignAssets?: QrDesignAssets;
  initialDesignRevision?: number;
  initialDesignError?: string;
  display?: "carousel" | "dashboard";
};

function TrustitMark({ templateId, className = "", compact = false }: { templateId: QrTemplateId; className?: string; compact?: boolean }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <span className={`inline-flex items-center gap-2 font-black tracking-[0.13em] ${className}`} aria-label="Trustit">
      <svg aria-hidden="true" viewBox="0 0 40 40" className={`shrink-0 ${compact ? "h-6 w-6" : "h-8 w-8"}`}>
        {templateId === "template_1" && <><circle cx="20" cy="20" r="17" fill="currentColor" opacity=".13" /><path {...common} d="m11 20 6 6 12-13" /></>}
        {templateId === "template_2" && <><path d="M20 36C8 29 7 16 20 5c13 11 12 24 0 31Z" fill="currentColor" opacity=".16" /><path {...common} d="M13 27c6-2 10-7 13-14M17 21l-1-7m5 3 7 1" /></>}
        {templateId === "template_3" && <><path d="M20 2 24 13 36 9 31 20 39 28 27 29 24 39 18 30 7 35 11 24 2 17 14 16Z" fill="currentColor" opacity=".18" /><path {...common} d="m14 20 4 4 8-9" /></>}
        {templateId === "template_4" && <><path d="M20 2 36 11v18L20 38 4 29V11Z" fill="currentColor" opacity=".16" /><path {...common} d="m11 20 6 6 12-13M8 11l4-2m16 22 4-2" /></>}
        {templateId === "template_5" && <><path d="M20 2 38 20 20 38 2 20Z" fill="currentColor" opacity=".13" /><path {...common} d="M13 21c1-6 13-6 14 0M14 24c2 8 10 8 12 0m-6-10v19" /></>}
      </svg>
      <span className={compact ? "text-sm" : ""}>TRUSTIT</span>
    </span>
  );
}

function GoogleReviewMark({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
      <span aria-hidden="true" className={`font-black text-[#4285f4] ${compact ? "text-base" : "text-xl"}`}>G</span>
      <span className={compact ? "text-[9px]" : ""}><span className="font-normal">Review on</span> <span className="font-bold">Google</span></span>
    </span>
  );
}

function FiveStars({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return <span className={`font-bold tracking-[0.12em] text-amber-500 ${dark ? "text-amber-300" : ""} ${compact ? "text-sm" : "text-xl"}`} aria-label="Five stars">★★★★★</span>;
}

type CategoryArtKind = import("@/lib/trustit-ai/qr-design-theme").QrArtworkKind;

type BusinessCategoryProfile = {
  label: string;
  message: string;
  artKind: CategoryArtKind;
  iconName: string;
  designFamily: string;
};

function getBusinessCategoryProfile(businessType: string | null): BusinessCategoryProfile {
  const theme = resolveBusinessTheme(businessType);
  const category = getBusinessCategory(businessType);
  return { label: theme.posterLabel, message: theme.posterMessage, artKind: theme.artKind, iconName: category?.primaryIcon ?? "Store", designFamily: category?.designFamily ?? "general" };
}

function CategoryIcon({ iconName, designFamily, className = "" }: { iconName: string; designFamily: string; className?: string }) {
  return <BusinessCategoryIcon name={iconName} family={designFamily} className={className} />;
}
function CategoryArt({ iconName, designFamily, designAsset, className = "" }: { iconName: string; designFamily: string; designAsset?: QrDesignAsset; className?: string }) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${className}`}>
      {designAsset?.url
        ? <img src={designAsset.url} alt="" aria-hidden="true" data-qr-design-background="true" className="absolute inset-0 h-full w-full object-cover" />
        : <CategoryIcon iconName={iconName} designFamily={designFamily} className="relative z-10 h-full w-full drop-shadow-sm" />}
      {designAsset?.url && <span aria-hidden="true" className="absolute bottom-1 right-1 rounded-full bg-white/90 p-1 shadow-sm"><CategoryIcon iconName={iconName} designFamily={designFamily} className="h-4 w-4 text-slate-700" /></span>}
    </span>
  );
}

function BusinessName({ name, dark = false, landscape = false, compact = false }: { name: string; dark?: boolean; landscape?: boolean; compact?: boolean }) {
  const length = name.trim().length;
  const fontSize = compact
    ? landscape
      ? (length > 48 ? "clamp(0.54rem, 1.35vw, 0.68rem)" : length > 30 ? "clamp(0.62rem, 1.6vw, 0.78rem)" : "clamp(0.76rem, 1.9vw, 0.95rem)")
      : (length > 60 ? "clamp(0.64rem, 2.4vw, 0.82rem)" : length > 42 ? "clamp(0.72rem, 2.8vw, 0.92rem)" : length > 30 ? "clamp(0.82rem, 3.2vw, 1.05rem)" : "clamp(0.95rem, 4vw, 1.3rem)")
    : landscape
      ? (length > 54 ? "clamp(0.76rem, 1.9vw, 1.08rem)" : length > 36 ? "clamp(0.9rem, 2.2vw, 1.3rem)" : length > 30 ? "clamp(0.95rem, 2.4vw, 1.55rem)" : "clamp(1.15rem, 3vw, 1.95rem)")
      : (length > 60 ? "clamp(0.78rem, 2.4vw, 1.15rem)" : length > 42 ? "clamp(0.9rem, 2.8vw, 1.35rem)" : length > 24 ? "clamp(1.05rem, 3.2vw, 1.65rem)" : length > 18 ? "clamp(1.2rem, 3.7vw, 1.9rem)" : "clamp(1.45rem, 4.4vw, 2.35rem)");
  return <h3
    className={`relative z-10 max-w-full shrink-0 whitespace-normal font-bold leading-[1.05] ${dark ? "text-white" : "text-slate-950"}`}
    style={{ fontSize, textWrap: "balance", overflowWrap: "break-word", wordBreak: "normal", hyphens: "none" }}
    title={name}
  >{name}</h3>;
}

function ReviewQr({ url, usable, businessName, compact = false, landscape = false }: { url: string; usable: boolean; businessName: string; compact?: boolean; landscape?: boolean }) {
  const size = compact
    ? "h-16 w-16"
    : landscape ? "h-36 w-36 sm:h-44 sm:w-44" : "h-52 w-52 sm:h-56 sm:w-56";
  return (
    <div className={`relative z-30 isolate inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-900/10 ${compact ? "p-1.5" : "p-3"}`}>
      {usable && url ? <img src={url} alt={`Trustit review QR for ${businessName}`} className={`${size} block max-w-full object-contain`} /> : <div className={`${size} flex items-center justify-center bg-slate-50 p-3 text-center text-xs font-medium text-slate-600`}>QR unavailable while the business is inactive or expired</div>}
    </div>
  );
}

function GoogleMessage({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return <div className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${compact ? "text-[9px]" : "text-xs"}`}><GoogleReviewMark dark={dark} compact={compact} /><span className={dark ? "text-slate-300" : "text-slate-600"}>Also share your feedback on Google</span></div>;
}

function FooterMessage({ message, dark = false }: { message: string; dark?: boolean }) {
  return <p className={`mt-2 max-w-full text-[8px] font-semibold uppercase tracking-[0.12em] ${dark ? "text-slate-300" : "text-slate-600"}`}>{message}</p>;
}

function RestaurantPoster({ name, businessId, qrUrl, usable, compact, category, designAsset, footer }: PosterContentProps) {
  return (
    <div className={`relative flex h-full w-full flex-col items-center overflow-hidden bg-[#fff8ed] text-center text-[#392a1d] ${compact ? "p-3" : "p-6 sm:p-8"}`}>
      <div className="pointer-events-none absolute -right-10 top-28 z-0 h-40 w-40 rounded-full border-[18px] border-[#efdfc5]/60" />
      <TrustitMark templateId="template_1" className="relative z-10 text-emerald-800" compact={compact} />
      <div className={`${compact ? "my-1" : "my-2"} flex w-full items-center justify-center rounded-xl bg-[#f5ead8] ${compact ? "h-8" : "h-24"}`}><CategoryArt iconName={category.iconName} designFamily={category.designFamily} designAsset={designAsset} className={compact ? "h-8 w-20 text-[#976a3c]" : "h-20 w-36 text-[#976a3c]"} /></div>
      {!compact && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94642e]">{category.label}</p>}
      <BusinessName name={name} compact={compact} />
      <FiveStars compact={compact} />
      {!compact && <p className="mt-1 max-w-xs text-sm">{category.message}</p>}
      <div className={`my-auto ${compact ? "py-1" : "py-3"}`}><ReviewQr url={qrUrl} usable={usable} businessName={name} compact={compact} /></div>
      <p className={`rounded-full bg-emerald-800 font-bold text-white ${compact ? "px-4 py-2 text-[10px]" : "px-6 py-3 text-sm"}`}>SCAN TO REVIEW</p>
      {!compact && <div className="mt-3"><GoogleMessage /></div>}
      {!compact && <FooterMessage message={footer} />}
      {!compact && <p className="mt-2 font-mono text-[9px] text-[#74593c]">{businessId}</p>}
    </div>
  );
}

function HotelPoster({ name, businessId, qrUrl, usable, compact, category, designAsset, footer }: PosterContentProps) {
  return (
    <div className={`relative flex h-full w-full flex-col items-center overflow-hidden bg-[#173b48] text-center text-white ${compact ? "p-3" : "p-6 sm:p-8"}`}>
      <div className="pointer-events-none absolute -left-16 top-20 z-0 h-48 w-48 rounded-full bg-[#396b6c]/45 blur-2xl" />
      <TrustitMark templateId="template_2" className="relative z-10 text-[#d9c28e]" compact={compact} />
      <div className={`${compact ? "my-1" : "my-2"} flex w-full items-center justify-center rounded-xl bg-[#285561] ${compact ? "h-8" : "h-24"}`}><CategoryArt iconName={category.iconName} designFamily={category.designFamily} designAsset={designAsset} className={compact ? "h-8 w-20 text-[#e2c997]" : "h-20 w-44 text-[#e2c997]"} /></div>
      {!compact && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e5ce98]">{category.label}</p>}
      <BusinessName name={name} dark compact={compact} />
      <FiveStars dark compact={compact} />
      {!compact && <p className="mt-1 max-w-xs text-sm text-slate-100">{category.message}</p>}
      <div className={`my-auto ${compact ? "py-1" : "py-3"}`}><ReviewQr url={qrUrl} usable={usable} businessName={name} compact={compact} /></div>
      <p className={`rounded-full bg-[#e5ce98] font-bold text-[#183a45] ${compact ? "px-4 py-2 text-[10px]" : "px-6 py-3 text-sm"}`}>SCAN TO REVIEW</p>
      {!compact && <div className="mt-3"><GoogleMessage dark /></div>}
      {!compact && <FooterMessage message={footer} dark />}
      {!compact && <p className="mt-2 font-mono text-[9px] text-slate-300">{businessId}</p>}
    </div>
  );
}

function LaundryPoster({ name, businessId, qrUrl, usable, compact, category, designAsset, footer }: PosterContentProps) {
  return (
    <div className={`relative flex h-full w-full flex-col items-center overflow-hidden bg-[#eef8fb] text-center text-[#183e55] ${compact ? "p-3" : "p-6 sm:p-8"}`}>
      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-0 h-20 bg-[radial-gradient(ellipse_at_center,#cae8f1_0%,transparent_70%)]" />
      <TrustitMark templateId="template_3" className="relative z-10 text-[#237c9d]" compact={compact} />
      <div className={`${compact ? "my-1" : "my-2"} flex w-full items-center justify-center rounded-xl bg-white/80 ${compact ? "h-8" : "h-24"}`}><CategoryArt iconName={category.iconName} designFamily={category.designFamily} designAsset={designAsset} className={compact ? "h-8 w-20 text-[#4b9db6]" : "h-20 w-36 text-[#4b9db6]"} /></div>
      {!compact && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#31829c]">{category.label}</p>}
      <BusinessName name={name} compact={compact} />
      <FiveStars compact={compact} />
      {!compact && <p className="mt-1 max-w-xs text-sm">{category.message}</p>}
      <div className={`my-auto ${compact ? "py-1" : "py-3"}`}><ReviewQr url={qrUrl} usable={usable} businessName={name} compact={compact} /></div>
      <p className={`rounded-full bg-[#247f9e] font-bold text-white ${compact ? "px-4 py-2 text-[10px]" : "px-6 py-3 text-sm"}`}>SCAN TO REVIEW</p>
      {!compact && <div className="mt-3"><GoogleMessage /></div>}
      {!compact && <FooterMessage message={footer} />}
      {!compact && <p className="mt-2 font-mono text-[9px] text-[#4b7180]">{businessId}</p>}
    </div>
  );
}

function RetailPoster({ name, businessId, qrUrl, usable, compact, category, designAsset, footer }: PosterContentProps) {
  return (
    <div className={`relative grid h-full w-full grid-cols-[1fr_auto] items-center overflow-hidden bg-[#fff7e7] text-[#382d1d] ${compact ? "gap-2 p-3" : "gap-4 p-6 sm:gap-8 sm:p-9"}`}>
      <div className="absolute inset-y-0 left-0 z-0 w-2 bg-[#cf963e]" />
      <div className="relative z-10 flex h-full flex-col items-start justify-center pl-2 text-left">
        <TrustitMark templateId="template_4" className="text-[#846021]" compact={compact} />
        {!compact && <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#a07127]">{category.label}</p>}
        <BusinessName name={name} landscape compact={compact} />
        <FiveStars compact={compact} />
        {!compact && <p className="mt-2 max-w-sm text-sm">{category.message}</p>}
        <CategoryArt iconName={category.iconName} designFamily={category.designFamily} designAsset={designAsset} className={`text-[#9d742f] ${compact ? "h-7 w-20" : "mt-1 h-24 w-40"}`} />
        <p className={`mt-auto rounded-full bg-[#895d1d] font-bold text-white ${compact ? "px-3 py-1.5 text-[9px]" : "px-5 py-2.5 text-sm"}`}>SCAN TO REVIEW</p>
        {compact ? null : <div className="mt-2"><GoogleMessage /></div>}
        {!compact && <FooterMessage message={footer} />}
        {compact ? null : <p className="mt-1 font-mono text-[9px] text-[#765b32]">{businessId}</p>}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-2">
        <ReviewQr url={qrUrl} usable={usable} businessName={name} compact={compact} landscape />
        <span className="text-center text-[9px] font-semibold uppercase tracking-wider text-[#6a512b]">Honest reviews welcome</span>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-28 z-0 h-36 w-36 rounded-full border-[14px] border-[#f0dcba]" />
    </div>
  );
}

function SalonPoster({ name, businessId, qrUrl, usable, compact, category, designAsset, footer }: PosterContentProps) {
  return (
    <div className={`relative grid h-full w-full grid-cols-[1fr_auto] items-center overflow-hidden bg-[#fff3f1] text-[#432b35] ${compact ? "gap-2 p-3" : "gap-4 p-6 sm:gap-8 sm:p-9"}`}>
      <div className="absolute inset-y-0 left-0 z-0 w-2 bg-[#bb7189]" />
      <div className="relative z-10 flex h-full flex-col items-start justify-center pl-2 text-left">
        <TrustitMark templateId="template_5" className="text-[#99586f]" compact={compact} />
        {!compact && <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#a35070]">{category.label}</p>}
        <BusinessName name={name} landscape compact={compact} />
        <FiveStars compact={compact} />
        {!compact && <p className="mt-2 max-w-sm text-sm">{category.message}</p>}
        <CategoryArt iconName={category.iconName} designFamily={category.designFamily} designAsset={designAsset} className={`text-[#a65c79] ${compact ? "h-7 w-20" : "mt-1 h-24 w-40"}`} />
        <p className={`mt-auto rounded-full bg-[#a45170] font-bold text-white ${compact ? "px-3 py-1.5 text-[9px]" : "px-5 py-2.5 text-sm"}`}>SCAN TO REVIEW</p>
        {compact ? null : <div className="mt-2"><GoogleMessage /></div>}
        {!compact && <FooterMessage message={footer} />}
        {compact ? null : <p className="mt-1 font-mono text-[9px] text-[#745565]">{businessId}</p>}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-2">
        <ReviewQr url={qrUrl} usable={usable} businessName={name} compact={compact} landscape />
        <span className="text-center text-[9px] font-semibold uppercase tracking-wider text-[#805767]">Your feedback matters</span>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 right-28 z-0 h-36 w-36 rounded-full border-[14px] border-[#f3d9df]" />
    </div>
  );
}

type PosterContentProps = { name: string; businessId: string; qrUrl: string; usable: boolean; compact: boolean; category: BusinessCategoryProfile; designAsset?: QrDesignAsset; footer: string };

function PosterByTemplate({ templateId, businessName, businessId, qrUrl, qrUsable, category, designAssets, compact = false, screenPreview = false }: {
  templateId: QrTemplateId;
  businessName: string;
  businessId: string;
  qrUrl: string;
  qrUsable: boolean;
  category: BusinessCategoryProfile;
  designAssets?: QrDesignAssets;
  compact?: boolean;
  screenPreview?: boolean;
}) {
  const template = qrTemplates.find((item) => item.id === templateId)!;
  const footer = QR_DESIGN_THEMES.find((theme) => theme.name === template.designTheme)?.footer ?? QR_DESIGN_THEMES[4].footer;
  const content = { name: businessName, businessId, qrUrl, usable: qrUsable, compact, category, designAsset: designAssets?.[templateId], footer };
  const aspect = template.ratio === "3 / 2" ? "aspect-[3/2]" : "aspect-[2/3]";
  return (
    <div className={`${aspect} w-full overflow-hidden rounded-xl shadow-inner`} data-template-id={templateId} data-screen-preview={screenPreview ? "true" : undefined} data-print-size={template.printSize} data-orientation={template.orientation} data-ratio={template.ratio}>
      {templateId === "template_1" && <RestaurantPoster {...content} />}
      {templateId === "template_2" && <HotelPoster {...content} />}
      {templateId === "template_3" && <LaundryPoster {...content} />}
      {templateId === "template_4" && <RetailPoster {...content} />}
      {templateId === "template_5" && <SalonPoster {...content} />}
    </div>
  );
}

export function QrPosterPreview({ businessId, businessName, businessType, qrStatus, expiry, templateId, designAssets, screenPreview = false }: {
  businessId: string;
  businessName: string;
  businessType: string | null;
  qrStatus: string | null;
  expiry: string | null;
  templateId: string | null;
  designAssets?: QrDesignAssets;
  screenPreview?: boolean;
}) {
  const origin = trustitAppOrigin;
  const selectedId = qrTemplates.some((template) => template.id === templateId)
    ? templateId as QrTemplateId
    : qrTemplates[0].id;
  const reviewRoute = buildTrustitReviewUrl(origin, businessId);
  const qrUrl = buildTrustitQrImageUrl(reviewRoute);
  const category = getBusinessCategoryProfile(businessType);
  const qrUsable = isQrUsable(qrStatus, expiry);

  return <PosterByTemplate templateId={selectedId} businessName={businessName} businessId={businessId} qrUrl={qrUrl} qrUsable={qrUsable} category={category} designAssets={designAssets} compact={screenPreview} screenPreview={screenPreview} />;
}

function isQrUsable(status: string | null, expiry: string | null) {
  const today = new Date().toISOString().slice(0, 10);
  return status?.trim().toLowerCase() === "active" && (!expiry || expiry >= today);
}

export default function QrTemplateGallery({ businessId, businessName, businessType, qrStatus, expiry, initialTemplate, initialDesignAssets = {}, initialDesignRevision = 0, initialDesignError, display = "carousel" }: Props) {
  const origin = trustitAppOrigin;
  const [selectedTemplate, setSelectedTemplate] = useState<QrTemplateId>(qrTemplates.some((template) => template.id === initialTemplate) ? initialTemplate as QrTemplateId : "template_1");
  const [designAssets, setDesignAssets] = useState<QrDesignAssets>(initialDesignAssets);
  const [designRevision, setDesignRevision] = useState(initialDesignRevision);
  const [previewTemplate, setPreviewTemplate] = useState<QrTemplateId | null>(null);
  const [statusMessage, setStatusMessage] = useState(initialDesignError ?? "");
  const [exportStatus, setExportStatus] = useState("");
  const [exportAction, setExportAction] = useState<ExportAction | null>(null);
  const [isPending, startTransition] = useTransition();
  const galleryRef = useRef<HTMLDivElement>(null);
  const exportStageRef = useRef<HTMLDivElement>(null);
  const reviewRoute = buildTrustitReviewUrl(origin, businessId);
  const qrUrl = buildTrustitQrImageUrl(reviewRoute);
  const qrUsable = isQrUsable(qrStatus, expiry);
  const category = getBusinessCategoryProfile(businessType);
  const exportTemplateId = previewTemplate ?? selectedTemplate;
  const exportTemplate = qrTemplates.find((template) => template.id === exportTemplateId)!;
  const exportDimensions = getQrTemplatePrintDimensions(exportTemplateId);

  function chooseTemplate(templateId: QrTemplateId) {
    setStatusMessage("");
    setExportStatus("");
    startTransition(async () => {
      const result = await saveQrTemplateAction(templateId);
      if (!result.ok) {
        setStatusMessage(result.error);
        return;
      }
      setSelectedTemplate(templateId);
      setStatusMessage("QR design saved for this business.");
    });
  }

  function regenerateDesign() {
    setStatusMessage("");
    startTransition(async () => {
      const result = await regenerateQrDesignAction(designRevision);
      if (!result.ok) {
        setStatusMessage(result.error);
        return;
      }
      setDesignAssets(result.assets);
      setDesignRevision(result.revision);
      const refreshed = result.provider === "AI" ? "AI design variations refreshed." : "Mock design variations refreshed.";
      setStatusMessage(`${refreshed} Your selected QR template is unchanged.${result.revision >= 4 ? " All five design versions are now used." : ""}`);
    });
  }

  function scrollGallery(direction: -1 | 1) {
    galleryRef.current?.scrollBy({ left: direction * Math.max(260, galleryRef.current.clientWidth * 0.75), behavior: "smooth" });
  }

  async function replaceExportQr() {
    if (!qrUsable || !reviewRoute) throw new Error("A valid active business QR is required for export.");
    const poster = exportStageRef.current?.querySelector<HTMLElement>(`[data-template-id="${exportTemplateId}"]`);
    const qrImage = poster?.querySelector<HTMLImageElement>('img[alt^="Trustit review QR for "]');
    if (!poster || !qrImage) throw new Error("The selected QR poster is not ready to export.");

    const previousSource = qrImage.src;
    const qrCodeModule = await import("qrcode");
    const qrPng = await qrCodeModule.default.toDataURL(reviewRoute, {
      errorCorrectionLevel: "H",
      margin: 4,
      width: 1200,
      color: { dark: "#000000", light: "#ffffff" },
    });
    qrImage.src = qrPng;
    await qrImage.decode();
    await document.fonts.ready;

    return {
      poster,
      restore: () => { qrImage.src = previousSource; },
    };
  }

  async function makePosterPng() {
    const { poster, restore } = await replaceExportQr();
    try {
      const { domToPng } = await import("modern-screenshot");
      const png = await domToPng(poster, {
        scale: 4,
        backgroundColor: "#ffffff",
        style: { borderRadius: "0px", boxShadow: "none" },
      });
      const image = new Image();
      image.src = png;
      await image.decode();

      const expectedRatio = exportDimensions.widthIn / exportDimensions.heightIn;
      if (Math.abs(image.width / image.height - expectedRatio) > 0.002) {
        throw new Error("The exported poster dimensions do not match the selected print size.");
      }
      if (image.width < exportDimensions.widthIn * 300 || image.height < exportDimensions.heightIn * 300) {
        throw new Error("The exported poster resolution is below 300 DPI.");
      }
      return png;
    } finally {
      restore();
    }
  }

  async function downloadPoster(templateId: QrTemplateId, format: "png" | "pdf") {
    if (!qrUsable) {
      setExportStatus("Downloads are available when this business QR is active and unexpired.");
      return;
    }

    setExportAction(format);
    setExportStatus("");
    try {
      const png = await makePosterPng();
      const filename = getQrTemplateFilename(templateId, businessName, businessId, format);
      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const { widthIn, heightIn, orientation } = getQrTemplatePrintDimensions(templateId);
        const pdf = new jsPDF({ orientation, unit: "in", format: [widthIn, heightIn], compress: true });
        pdf.addImage(png, "PNG", 0, 0, widthIn, heightIn, undefined, "FAST");
        pdf.save(filename);
      } else {
        const link = document.createElement("a");
        link.href = png;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      setExportStatus(`${filename} is ready.`);
    } catch (error) {
      setExportStatus(error instanceof Error ? error.message : "The poster could not be exported.");
    } finally {
      setExportAction(null);
    }
  }

  async function printPoster() {
    if (!qrUsable) {
      setExportStatus("Printing is available when this business QR is active and unexpired.");
      return;
    }
    setExportAction("print");
    setExportStatus("");
    let restoreQr: (() => void) | undefined;
    let printStyle: HTMLStyleElement | undefined;
    let printRoot: HTMLDivElement | null = null;
    let timeout: number | undefined;
    const cleanup = () => {
      if (timeout) window.clearTimeout(timeout);
      window.removeEventListener("afterprint", cleanup);
      if (printStyle?.isConnected) printStyle.remove();
      if (printRoot?.id === "trustit-print-root") printRoot.removeAttribute("id");
      restoreQr?.();
      setExportAction(null);
    };

    try {
      const exportQr = await replaceExportQr();
      printRoot = exportStageRef.current;
      if (!printRoot) throw new Error("The selected QR poster is not ready to print.");
      restoreQr = exportQr.restore;
      printRoot.id = "trustit-print-root";
      printStyle = document.createElement("style");
      printStyle.dataset.trustitPrint = "true";
      printStyle.textContent = getQrTemplatePrintCss(exportTemplateId);
      document.head.appendChild(printStyle);
      window.addEventListener("afterprint", cleanup);
      timeout = window.setTimeout(cleanup, 60_000);
      window.print();
      setExportStatus(`Print dialog opened for ${exportTemplate.printSize} ${exportTemplate.orientation.toLowerCase()}.`);
    } catch (error) {
      cleanup();
      setExportStatus(error instanceof Error ? error.message : "The poster could not be printed.");
    }
  }

  function exportButtons(templateId: QrTemplateId, className = "") {
    const disabled = !qrUsable || Boolean(exportAction);
    const buttonClass = "rounded-lg border border-slate-300 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";
    return (
      <div className={`grid grid-cols-3 gap-2 ${className}`} aria-label="Download and print QR poster">
        <button type="button" className={buttonClass} disabled={disabled} onClick={() => void downloadPoster(templateId, "png")}>{exportAction === "png" ? "Preparing PNG…" : "Download PNG"}</button>
        <button type="button" className={buttonClass} disabled={disabled} onClick={() => void downloadPoster(templateId, "pdf")}>{exportAction === "pdf" ? "Preparing PDF…" : "Download PDF"}</button>
        <button type="button" className={buttonClass} disabled={disabled} onClick={() => void printPoster()}>{exportAction === "print" ? "Preparing print…" : "Print"}</button>
      </div>
    );
  }

  return (
    <section aria-labelledby="qr-template-heading" className="space-y-5">
      <div className={display === "dashboard" ? "hidden" : "flex flex-wrap items-end justify-between gap-4"}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Make it yours</p>
          <h2 id="qr-template-heading" className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">Choose Your QR Template</h2>
          <p className="mt-1 text-sm text-slate-600">Every design uses the same QR and opens this business’s Trustit review page.</p>
        </div>
        <div className="hidden gap-2 sm:flex" aria-label="Template gallery controls">
          <button type="button" onClick={() => scrollGallery(-1)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" aria-label="Scroll templates left">←</button>
          <button type="button" onClick={() => scrollGallery(1)} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" aria-label="Scroll templates right">→</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <p className="text-xs leading-5 text-slate-600">Five business-matched design variations share one QR identity. AI mode creates and securely stores business-matched artwork; mock mode makes no paid external AI calls.</p>
        <button type="button" onClick={regenerateDesign} disabled={isPending || designRevision >= 4} className="min-h-10 shrink-0 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-60">
          {isPending ? "Preparing designs…" : designRevision >= 4 ? "All versions used" : "Regenerate Design"}
        </button>
      </div>

      <div ref={galleryRef} className={display === "dashboard" ? "merchant-template-grid" : "flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin]"} aria-label="Trustit QR template gallery">
        {qrTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          return (
            <article key={template.id} className={display === "dashboard" ? `merchant-template-tile${template.ratio === "3 / 2" ? " merchant-template-tile--landscape" : ""}${isSelected ? " is-selected" : ""}` : `w-[min(84vw,360px)] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[min(50vw,420px)] lg:w-[min(40vw,480px)] xl:w-[min(38vw,480px)] ${isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"}`}>
              <button type="button" onClick={() => setPreviewTemplate(template.id)} className={display === "dashboard" ? "merchant-template-tile__poster" : "relative block w-full text-left"} aria-label={`Preview ${template.designTheme} ${template.name} QR design`}>
                <PosterByTemplate templateId={template.id} businessName={businessName} businessId={businessId} qrUrl={qrUrl} qrUsable={qrUsable} category={category} designAssets={designAssets} compact />
                {isSelected && <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-sm font-black text-white shadow" aria-label="Currently selected">✓</span>}
              </button>
              <div className={display === "dashboard" ? "" : "px-1 pb-1 pt-3"}>
                <h3 className={display === "dashboard" ? "merchant-template-tile__name" : "font-semibold text-slate-900"}>{template.designTheme}<span className="ml-1 text-xs font-normal text-slate-500">· {template.name}</span></h3>
                {display !== "dashboard" && <>
                  <p className="mt-0.5 text-xs text-slate-500">{template.description}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{template.printSize} · {template.orientation}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPreviewTemplate(template.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Preview</button>
                    <button type="button" onClick={() => chooseTemplate(template.id)} disabled={isPending || isSelected} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-default disabled:opacity-60">{isSelected ? "Selected" : isPending ? "Saving…" : "Select"}</button>
                  </div>
                  {isSelected && exportButtons(template.id, "mt-2")}
                </>}
                {display === "dashboard" && <button type="button" onClick={() => chooseTemplate(template.id)} disabled={isPending || isSelected} className="merchant-template-tile__select">{isSelected ? "Selected" : isPending ? "Saving…" : "Choose design"}</button>}
              </div>
            </article>
          );
        })}
      </div>
      {display === "dashboard" && <div className="merchant-template-exports">{exportButtons(selectedTemplate)}</div>}
      <p role="status" aria-live="polite" className={`min-h-5 text-sm ${statusMessage.includes("could not") || statusMessage.startsWith("Sign in") || statusMessage.startsWith("Choose") ? "text-rose-700" : "text-emerald-700"}`}>{statusMessage}</p>
      <p role="status" aria-live="polite" className="min-h-5 text-sm text-slate-600">{exportStatus}</p>

      <div
        ref={exportStageRef}
        aria-hidden="true"
        className="pointer-events-none fixed -left-[20000px] top-0 -z-10 overflow-hidden"
        style={{ width: exportTemplate.ratio === "3 / 2" ? "660px" : "440px" }}
      >
        <PosterByTemplate templateId={exportTemplateId} businessName={businessName} businessId={businessId} qrUrl={qrUrl} qrUsable={qrUsable} category={category} designAssets={designAssets} />
      </div>

      {previewTemplate && (
        <div role="presentation" onClick={() => setPreviewTemplate(null)} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
          <section role="dialog" aria-modal="true" aria-labelledby="qr-preview-title" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === "Escape") setPreviewTemplate(null); }} tabIndex={-1} className="my-auto w-full max-w-5xl rounded-3xl bg-white p-4 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Merchant-specific print preview</p><h2 id="qr-preview-title" className="mt-1 text-lg font-bold text-slate-950">{qrTemplates.find((template) => template.id === previewTemplate)?.name} · {qrTemplates.find((template) => template.id === previewTemplate)?.printSize} {qrTemplates.find((template) => template.id === previewTemplate)?.orientation}</h2></div>
              <button type="button" onClick={() => setPreviewTemplate(null)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" aria-label="Close template preview">Close</button>
            </div>
            <div data-qr-preview="true" className={`mx-auto w-full ${previewTemplate === "template_4" || previewTemplate === "template_5" ? "max-w-5xl" : "max-w-[440px]"}`}>
              <PosterByTemplate templateId={previewTemplate} businessName={businessName} businessId={businessId} qrUrl={qrUrl} qrUsable={qrUsable} category={category} designAssets={designAssets} compact />
            </div>
            {exportButtons(previewTemplate, "mt-4")}
            <button type="button" onClick={() => { chooseTemplate(previewTemplate); setPreviewTemplate(null); }} disabled={isPending || selectedTemplate === previewTemplate} className="mt-2 w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{selectedTemplate === previewTemplate ? "This is your selected design" : isPending ? "Saving…" : "Select this design"}</button>
          </section>
        </div>
      )}
    </section>
  );
}
