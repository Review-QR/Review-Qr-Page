import type { AIImageProvider, AIImageRequest, GeneratedImage } from "./provider-contracts";
import { isQrTemplateId } from "../../app/merchant/dashboard/qr/templates.ts";
import { resolveBusinessTheme } from "./qr-design-theme.ts";

type Palette = { primary: string; secondary: string; highlight: string };

/** Fixed, source-controlled SVG fragments: no model text or user input enters SVG markup. */
function motifSvg(motif: ReturnType<typeof resolveBusinessTheme>["motif"], color: Palette): string {
  const { primary: p, secondary: s, highlight: h } = color;
  const outline = `fill="none" stroke="${p}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"`;
  switch (motif) {
    case "sweets": return `<ellipse cx="120" cy="143" rx="93" ry="24" fill="${s}" opacity=".45"/><path d="M35 143Q40 170 120 171Q200 170 205 143" fill="${s}" stroke="${p}" stroke-width="7"/><circle cx="77" cy="111" r="28" fill="${h}" stroke="${p}" stroke-width="7"/><circle cx="124" cy="94" r="30" fill="${s}" stroke="${p}" stroke-width="7"/><circle cx="169" cy="112" r="27" fill="${h}" stroke="${p}" stroke-width="7"/><path d="m68 110 9-11 9 12-9 11Zm47-17 9-13 10 14-10 12Zm46 17 8-10 9 11-9 10Z" fill="#fff8e8"/>`;
    case "fast-food": return `<path d="M37 87Q43 35 120 31Q197 35 203 87Z" fill="${h}" stroke="${p}" stroke-width="8"/><path d="M35 96H205" stroke="${p}" stroke-width="10"/><path d="M45 109Q120 121 195 109L183 125H56Z" fill="${s}" stroke="${p}" stroke-width="6"/><path d="M49 133Q120 145 191 133Q184 166 120 168Q56 166 49 133Z" fill="${h}" stroke="${p}" stroke-width="8"/><path d="M78 57q5 7 10 0m22-7q5 7 10 0m22 7q5 7 10 0" ${outline}/>`;
    case "coffee": return `<path d="M42 82H167L157 155Q153 173 104 173Q56 173 52 155Z" fill="${h}" stroke="${p}" stroke-width="8"/><path d="M166 96H187Q211 96 206 122Q202 143 163 140" fill="none" stroke="${p}" stroke-width="9"/><path d="M65 66Q53 45 70 28M104 64Q91 39 109 20M143 65Q130 42 147 27" fill="none" stroke="${s}" stroke-width="8" stroke-linecap="round"/><path d="M76 101Q104 120 135 101Q119 139 94 133Z" fill="${s}" opacity=".85"/>`;
    case "dining": return `<circle cx="120" cy="104" r="70" fill="#fffaf0" stroke="${p}" stroke-width="8"/><circle cx="120" cy="104" r="46" fill="${h}" stroke="${s}" stroke-width="7"/><path d="M85 105Q104 75 126 104Q145 82 157 105Q141 139 111 132Q93 128 85 105Z" fill="${s}"/><path d="M31 55V150M20 55V84Q20 99 31 99Q42 99 42 84V55M207 55V150M195 55V90Q195 103 207 103" ${outline}/>`;
    case "hotel": return `<path d="M33 151V82H54V109H184V93Q184 77 201 77H207V151" fill="${s}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M55 108Q55 82 80 82H105Q122 82 122 108M127 108Q127 82 151 82H168Q184 82 184 108" fill="${h}" stroke="${p}" stroke-width="7"/><path d="M32 153H209M48 153V174M193 153V174" ${outline}/><path d="M177 45V22H202V61" ${outline}/>`;
    case "beauty": return `<rect x="34" y="26" width="108" height="142" rx="49" fill="${h}" stroke="${p}" stroke-width="8"/><rect x="51" y="42" width="74" height="108" rx="36" fill="#fff8f5" stroke="${s}" stroke-width="6"/><path d="M161 58 202 99M202 58 161 99M172 48 212 88M151 69 191 109" ${outline}/><path d="M73 124H117L111 158H79Z" fill="${s}" stroke="${p}" stroke-width="6"/><path d="M80 119Q95 98 110 119" ${outline}/>`;
    case "shopping": return `<path d="M42 71H197L182 169H56Z" fill="${h}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M78 77Q78 31 120 31Q162 31 162 77" fill="none" stroke="${p}" stroke-width="9"/><path d="M71 104H168M84 131H154" stroke="${s}" stroke-width="9" stroke-linecap="round"/><path d="m123 99 12 12-12 12-12-12Z" fill="${s}"/>`;
    case "grocery": return `<path d="M42 81H199L180 165H62Z" fill="${s}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M60 82Q70 34 120 48Q168 30 184 82" fill="none" stroke="${p}" stroke-width="8"/><circle cx="91" cy="74" r="23" fill="${h}" stroke="${p}" stroke-width="6"/><circle cx="143" cy="66" r="24" fill="#f7cc70" stroke="${p}" stroke-width="6"/><path d="M143 43Q154 26 170 34" ${outline}/><path d="M77 117H166" stroke="#fff8e8" stroke-width="8" stroke-linecap="round"/>`;
    case "healthcare": return `<path d="M91 32H149V81H198V139H149V187H91V139H42V81H91Z" fill="${h}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M113 64V105M134 105V145M113 145Q87 165 73 145V128" ${outline}/><circle cx="73" cy="121" r="9" fill="${s}"/>`;
    case "pharmacy": return `<path d="M75 45V28H163V45L178 62V159Q178 173 163 173H75Q60 173 60 159V62Z" fill="${h}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M60 77H178M87 28V47M149 28V47" ${outline}/><path d="M119 91V137M96 114H142" stroke="${s}" stroke-width="13" stroke-linecap="round"/><path d="M193 49Q211 66 193 83Q175 66 193 49Z" fill="${s}" stroke="${p}" stroke-width="5"/>`;
    case "fitness": return `<path d="M47 84V137M64 65V156M176 65V156M193 84V137M64 111H176" ${outline}/><rect x="91" y="88" width="58" height="46" rx="22" fill="${h}" stroke="${p}" stroke-width="7"/><path d="M88 160H152" stroke="${s}" stroke-width="8" stroke-linecap="round"/>`;
    case "laundry": return `<rect x="49" y="23" width="137" height="157" rx="18" fill="#f7fcff" stroke="${p}" stroke-width="8"/><path d="M50 63H185" ${outline}/><circle cx="117" cy="119" r="42" fill="${s}" stroke="${p}" stroke-width="7"/><circle cx="117" cy="119" r="26" fill="#fff" stroke="${h}" stroke-width="7"/><path d="M92 123Q105 105 118 123Q132 140 145 120" fill="none" stroke="${p}" stroke-width="6"/><circle cx="72" cy="43" r="5" fill="${h}"/><circle cx="91" cy="43" r="5" fill="${h}"/>`;
    case "automotive": return `<path d="M34 123 49 92Q57 75 78 75H154Q173 75 184 97L201 124V151H34Z" fill="${h}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="m66 90-12 29H177L163 91Q158 84 148 84H83Q72 84 66 90Z" fill="#f6fbfc" stroke="${p}" stroke-width="6"/><circle cx="71" cy="151" r="17" fill="${s}" stroke="${p}" stroke-width="7"/><circle cx="165" cy="151" r="17" fill="${s}" stroke="${p}" stroke-width="7"/>`;
    case "library": return `<path d="M40 52Q77 31 119 58V164Q78 138 40 159ZM200 52Q161 31 119 58V164Q161 138 200 159Z" fill="${h}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M61 79Q84 70 101 82M61 103Q83 95 101 106M138 82Q160 70 179 79M138 106Q160 95 179 103" fill="none" stroke="${s}" stroke-width="7" stroke-linecap="round"/><path d="M119 58V164" ${outline}/>`;
    case "education": return `<path d="m25 77 95-48 95 48-95 49Z" fill="${h}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M66 99V142Q120 184 174 142V99M210 82V139" ${outline}/><circle cx="210" cy="151" r="10" fill="${s}" stroke="${p}" stroke-width="5"/><path d="M102 128H138" stroke="#fff8e8" stroke-width="7" stroke-linecap="round"/>`;
    case "travel": return `<rect x="39" y="61" width="163" height="112" rx="18" fill="${h}" stroke="${p}" stroke-width="8"/><path d="M88 61V42Q88 28 103 28H137Q152 28 152 42V61M39 102H202M98 102V118H142V102" ${outline}/><path d="m132 119 8 17 19 3-14 12 4 18-17-9-17 9 4-18-14-12 19-3Z" fill="${s}"/>`;
    case "professional": return `<rect x="40" y="69" width="161" height="104" rx="12" fill="${h}" stroke="${p}" stroke-width="8"/><path d="M87 69V51Q87 38 101 38H140Q154 38 154 51V69M41 111H200M100 108V121H142V108" ${outline}/><path d="M64 147H104M121 147H177" stroke="${s}" stroke-width="8" stroke-linecap="round"/>`;
    case "pet-care": return `<path d="M120 157Q95 139 77 124Q51 102 70 83Q87 65 106 88L120 105 134 88Q153 65 170 83Q189 102 163 124Z" fill="${h}" stroke="${p}" stroke-width="8"/><ellipse cx="57" cy="53" rx="19" ry="25" transform="rotate(-25 57 53)" fill="${s}" stroke="${p}" stroke-width="6"/><ellipse cx="102" cy="37" rx="18" ry="24" transform="rotate(-9 102 37)" fill="${s}" stroke="${p}" stroke-width="6"/><ellipse cx="149" cy="38" rx="18" ry="24" transform="rotate(9 149 38)" fill="${s}" stroke="${p}" stroke-width="6"/><ellipse cx="190" cy="56" rx="17" ry="23" transform="rotate(25 190 56)" fill="${s}" stroke="${p}" stroke-width="6"/>`;
    case "photography": return `<rect x="35" y="63" width="171" height="108" rx="16" fill="${h}" stroke="${p}" stroke-width="8"/><path d="M75 63 88 43H137L151 63" ${outline}/><circle cx="122" cy="117" r="39" fill="#f8fbfc" stroke="${p}" stroke-width="8"/><circle cx="122" cy="117" r="23" fill="${s}" stroke="${p}" stroke-width="6"/><circle cx="177" cy="84" r="8" fill="${s}"/>`;
    case "events": return `<path d="M69 88Q52 61 77 45Q98 33 109 68ZM167 88Q189 57 165 43Q145 34 130 69Z" fill="${h}" stroke="${p}" stroke-width="7"/><path d="M88 91 62 170M150 91 177 170" ${outline}/><path d="M87 131H151L144 174H94Z" fill="${s}" stroke="${p}" stroke-width="7"/><path d="M91 131Q120 107 148 131M119 117V173" fill="none" stroke="#fff7e7" stroke-width="6"/>`;
    case "universal": return `<path d="M36 89 120 33 204 89V169H36Z" fill="${h}" stroke="${p}" stroke-width="8" stroke-linejoin="round"/><path d="M26 91 120 24 214 91M91 169V108H149V169" ${outline}/><path d="M55 112H78V136H55ZM163 112H186V136H163Z" fill="${s}" stroke="${p}" stroke-width="5"/><path d="M120 44Q134 30 147 39Q139 54 120 56Q101 54 93 39Q106 30 120 44Z" fill="#fff8e8"/>`;
  }
}

function artworkFor(theme: ReturnType<typeof resolveBusinessTheme>, templateIndex: number, revision: number, width: number, height: number) {
  const [primary, secondary, highlight] = theme.palette;
  const scene = ((templateIndex + revision) % 5 + 5) % 5;
  const motif = motifSvg(theme.motif, { primary, secondary, highlight });
  const compositions = [
    `<g transform="translate(52 27) scale(2.35)">${motif}</g><circle cx="94" cy="100" r="48" fill="${highlight}" opacity=".22"/>`,
    `<g transform="translate(22 115) scale(1.08)">${motif}</g><g transform="translate(257 10) scale(.92)">${motif}</g><g transform="translate(485 135) scale(.75)">${motif}</g>`,
    `<rect x="40" y="38" width="570" height="535" rx="220" fill="${highlight}" opacity=".24"/><g transform="translate(153 62) scale(2.1)">${motif}</g>`,
    `<path d="M35 490Q245 305 615 477" fill="none" stroke="${highlight}" stroke-width="32" stroke-linecap="round" opacity=".42"/><g transform="translate(36 118) scale(1.45)">${motif}</g><g transform="translate(405 116) scale(1.18)">${motif}</g>`,
    `<path d="M25 167Q320 4 703 148" fill="none" stroke="${highlight}" stroke-width="25" stroke-linecap="round" opacity=".5"/><g transform="translate(74 57) rotate(-7 120 100) scale(1.76)">${motif}</g><circle cx="655" cy="465" r="54" fill="${secondary}" opacity=".55"/>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1200 620" data-theme="${theme.id}" data-motif="${theme.motif}" data-template-id="template_${templateIndex + 1}" data-revision="${revision}"><defs><linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${primary}" stop-opacity=".96"/><stop offset="1" stop-color="${secondary}" stop-opacity=".84"/></linearGradient><radialGradient id="glow"><stop stop-color="${highlight}" stop-opacity=".86"/><stop offset="1" stop-color="${highlight}" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="620" rx="48" fill="url(#wash)"/><circle cx="258" cy="256" r="355" fill="url(#glow)"/><g>${compositions[scene]}</g></svg>`;
}

export class MockAIImageProvider implements AIImageProvider {
  readonly provider = "mock" as const;

  async generateImage(request: AIImageRequest): Promise<GeneratedImage> {
    if (!isQrTemplateId(request.prompt.templateId)) throw new Error("Unsupported QR design template.");
    if (!Number.isInteger(request.revision) || request.revision < 0 || request.revision > 4) throw new Error("Unsupported QR design revision.");
    if (![request.width, request.height].every((dimension) => Number.isInteger(dimension) && dimension > 0 && dimension <= 4096)) {
      throw new Error("Unsupported QR design image dimensions.");
    }
    const theme = resolveBusinessTheme(request.prompt.themeId);
    const templateIndex = Number(request.prompt.templateId.slice(-1)) - 1;
    const svg = artworkFor(theme, templateIndex, request.revision, request.width, request.height);
    return { bytes: new TextEncoder().encode(svg), mimeType: "image/svg+xml", width: request.width, height: request.height };
  }
}
