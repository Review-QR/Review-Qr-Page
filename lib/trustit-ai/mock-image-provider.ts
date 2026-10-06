import type { AIImageProvider, AIImageRequest, GeneratedImage } from "./provider-contracts";
import { resolveBusinessTheme } from "./qr-design-theme.ts";

function artworkFor(templateIndex: number, colors: readonly string[], revision: number) {
  const [primary, secondary, highlight] = colors;
  const shift = ((revision % 5) + 5) % 5;
  const scene = (templateIndex + shift) % 5;
  const base = `<defs><linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${primary}" stop-opacity=".94"/><stop offset="1" stop-color="${secondary}" stop-opacity=".82"/></linearGradient><radialGradient id="glow"><stop stop-color="${highlight}" stop-opacity=".9"/><stop offset="1" stop-color="${highlight}" stop-opacity="0"/></radialGradient><clipPath id="artwork"><rect width="820" height="620"/></clipPath></defs><rect width="1200" height="620" rx="48" fill="url(#wash)"/><circle cx="210" cy="180" r="260" fill="url(#glow)"/>`;
  const scenes = [
    `<path d="M80 500 C210 240 390 240 520 500 S830 760 1050 380" fill="none" stroke="${highlight}" stroke-opacity=".8" stroke-width="22"/><circle cx="310" cy="250" r="96" fill="${highlight}" fill-opacity=".7"/><circle cx="500" cy="390" r="46" fill="${secondary}" fill-opacity=".85"/>`,
    `<path d="M95 455 C220 90 500 100 620 430 S930 700 1100 250" fill="none" stroke="${highlight}" stroke-opacity=".65" stroke-width="16"/><circle cx="805" cy="190" r="150" fill="${highlight}" fill-opacity=".56"/><circle cx="310" cy="315" r="112" fill="${secondary}" fill-opacity=".56"/>`,
    `<path d="M40 170 Q300 20 555 170 T1070 170 M40 280 Q300 130 555 280 T1070 280 M40 390 Q300 240 555 390 T1070 390" fill="none" stroke="${highlight}" stroke-opacity=".62" stroke-width="24"/><circle cx="760" cy="170" r="72" fill="${secondary}" fill-opacity=".75"/>`,
    `<path d="M95 500V330 Q95 155 270 155 Q445 155 445 330V500 M360 500V300 Q360 115 545 115 Q730 115 730 300V500" fill="none" stroke="${highlight}" stroke-opacity=".76" stroke-width="28"/><circle cx="900" cy="170" r="100" fill="${secondary}" fill-opacity=".74"/>`,
    `<path d="M260 310 L390 80 L520 310 L750 215 L650 450 L890 520 L600 540 L440 480 L250 560 L340 400Z" fill="${highlight}" fill-opacity=".62"/><circle cx="810" cy="160" r="84" fill="${secondary}" fill-opacity=".8"/><circle cx="150" cy="170" r="38" fill="${highlight}" fill-opacity=".8"/>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620">${base}<g clip-path="url(#artwork)">${scenes[scene]}</g></svg>`;
}

export class MockAIImageProvider implements AIImageProvider {
  readonly provider = "mock" as const;

  async generateImage(request: AIImageRequest): Promise<GeneratedImage> {
    const theme = resolveBusinessTheme(request.prompt.themeId);
    const templateIndex = Number(request.prompt.templateId.slice(-1)) - 1;
    const svg = artworkFor(templateIndex, theme.palette, request.revision);
    return {
      bytes: new TextEncoder().encode(svg),
      mimeType: "image/svg+xml",
      width: request.width,
      height: request.height,
    };
  }
}
