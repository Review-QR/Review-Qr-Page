import type { GeneratedImage } from "./provider-contracts";

const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function decodeOpenAIPng(encoded: unknown): GeneratedImage {
  if (typeof encoded !== "string" || !encoded || encoded.length > 32_000_000) {
    throw new Error("OpenAI image generation returned invalid image data.");
  }

  const isBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded);
  if (!isBase64) throw new Error("OpenAI image generation returned invalid image data.");

  const bytes = Buffer.from(encoded, "base64");
  if (bytes.toString("base64") !== encoded || bytes.length < 24) {
    throw new Error("OpenAI image generation returned invalid image data.");
  }
  if (!PNG_SIGNATURE.every((value, index) => bytes[index] === value)
    || bytes.toString("ascii", 12, 16) !== "IHDR"
    || bytes.readUInt32BE(8) !== 13) {
    throw new Error("OpenAI image generation returned an invalid PNG image.");
  }

  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== 1536 || height !== 1024) {
    throw new Error("OpenAI image generation returned unexpected image dimensions.");
  }

  return { bytes: new Uint8Array(bytes), mimeType: "image/png", width, height };
}
