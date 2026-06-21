import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a money amount with the tenant's currency symbol. */
export function formatMoney(amount: number | string, symbol = "₹") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${symbol} ${n.toLocaleString("en-AE", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Human friendly order number: CK-2406-0042 */
export function makeOrderNo(seq: number) {
  const d = new Date();
  const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `CK-${ym}-${String(seq).padStart(4, "0")}`;
}

/** Convert a hex color (#rrggbb) to an "r g b" triple for CSS variables. */
export function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r} ${g} ${b}`;
}

export function readableOn(hex: string): "0 0 0" | "255 255 255" {
  const rgb = hexToRgb(hex).split(" ").map(Number);
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return lum > 0.6 ? "0 0 0" : "255 255 255";
}
