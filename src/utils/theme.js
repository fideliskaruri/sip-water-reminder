// Theme presets + runtime application for Sip's customizable primary colors.
// Each theme defines an accent (primary) and accent2 (lighter companion) used
// by gradients, the water gauge, buttons and the progress ring.

export const THEMES = [
  { id: "aqua", name: "Aqua", accent: "#2f8fff", accent2: "#5bd1ff" },
  { id: "mint", name: "Mint", accent: "#12b886", accent2: "#63e6be" },
  { id: "grape", name: "Grape", accent: "#7c5cff", accent2: "#b197fc" },
  { id: "indigo", name: "Indigo", accent: "#4263eb", accent2: "#748ffc" },
  { id: "sunset", name: "Sunset", accent: "#ff8a3d", accent2: "#ffc078" },
  { id: "rose", name: "Rose", accent: "#ff5d8f", accent2: "#ffa8c5" },
];

export const DEFAULT_THEME = THEMES[0];

function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex(v) {
  return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
}

// Lighten a hex colour by mixing toward white (amount 0..1).
export function lighten(hex, amount = 0.4) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c) => c + (255 - c) * amount;
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Build a full theme object from a single primary colour (used by the picker).
export function themeFromAccent(accent) {
  return { id: "custom", name: "Custom", accent, accent2: lighten(accent, 0.4) };
}

// Apply a theme by overriding the CSS variables Tailwind's utilities read from,
// plus the derived glow colour and the browser theme-color meta tag.
export function applyTheme(theme) {
  if (typeof document === "undefined" || !theme) return;
  const root = document.documentElement;
  root.style.setProperty("--color-accent", theme.accent);
  root.style.setProperty("--color-accent2", theme.accent2);
  root.style.setProperty("--accent-glow", rgba(theme.accent, 0.35));

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", theme.accent);
}
