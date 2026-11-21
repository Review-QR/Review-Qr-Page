/**
 * Simple HTML sanitization for user-generated content.
 * Removes script tags, event handlers, and dangerous attributes.
 * For production, replace with DOMPurify when available.
 */

const DANGEROUS_TAGS = [
  "script", "iframe", "object", "embed", "form", "input",
  "button", "textarea", "select", "style", "link", "meta",
];

const DANGEROUS_ATTRS = [
  "onclick", "onerror", "onload", "onmouseover", "onfocus",
  "onblur", "onchange", "onsubmit", "onkeydown", "onkeyup",
  "onkeypress", "onmousedown", "onmouseup", "oncontextmenu",
  "onabort", "onbeforeunload", "onhashchange", "onresize",
  "onscroll", "onselect", "onunload", "onerror", "onload",
  "onreadystatechange", "onreset", "onsearch", "onselect",
  "onstorage", "ontoggle",
];

const DANGEROUS_PROTOCOLS = ["javascript:", "vbscript:", "data:text/html"];

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Remove script-like tags and content
  let cleaned = input.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
  cleaned = cleaned.replace(/<object[\s\S]*?<\/object>/gi, "");
  cleaned = cleaned.replace(/<embed[\s\S]*?>/gi, "");
  cleaned = cleaned.replace(/<form[\s\S]*?<\/form>/gi, "");

  // Remove dangerous attributes (event handlers)
  DANGEROUS_ATTRS.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  // Remove dangerous protocols in href/src
  DANGEROUS_PROTOCOLS.forEach(protocol => {
    const regex = new RegExp(`(href|src)\\s*=\\s*("[^"]*${protocol}[^"]*")`, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  // Remove style tags (can hide malicious content)
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");

  return cleaned.trim();
}

export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Strip all HTML tags for plain text fields
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

export function sanitizeFilename(name: string): string {
  if (!name || typeof name !== "string") return "";

  return name
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+/, "")
    .slice(0, 255);
}
