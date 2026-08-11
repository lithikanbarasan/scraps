import type { UrgencyLevel } from "./types";

export function getDaysLeft(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUrgency(days: number): UrgencyLevel {
  if (days <= 2) return "red";
  if (days <= 5) return "yellow";
  return "green";
}

/** Stable key for merging duplicate pantry lines (name + expiry). */
export function ingredientMatchKey(name: string, expiryDate: string): string {
  return `${name.trim().toLowerCase()}|${expiryDate}`;
}

/** How many units this add contributes (quantity field on the form). */
export function parseAddBatchCount(quantity: string): number {
  const n = Math.floor(Number.parseFloat(quantity));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/** Rough shelf-life estimate (days) used when scanning groceries. */
export function estimateShelfLifeDays(ingredientName: string): number {
  const lower = ingredientName.toLowerCase();
  if (lower.includes("berry") || lower.includes("spinach") || lower.includes("lettuce")) {
    return 4;
  }
  if (lower.includes("mushroom") || lower.includes("milk") || lower.includes("juice")) {
    return 6;
  }
  if (lower.includes("apple") || lower.includes("orange") || lower.includes("onion")) {
    return 12;
  }
  if (lower.includes("potato") || lower.includes("garlic")) {
    return 20;
  }
  return 7;
}

export function estimateExpiryDate(ingredientName: string): string {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + estimateShelfLifeDays(ingredientName));
  return expiry.toISOString().split("T")[0];
}

const INGREDIENT_EMOJI_MAP: Record<string, string> = {
  spinach: "🥬",
  strawberr: "🍓",
  tomato: "🍅",
  carrot: "🥕",
  cheese: "🧀",
  egg: "🥚",
  milk: "🥛",
  flour: "🌾",
  bread: "🍞",
  chicken: "🍗",
  beef: "🥩",
  fish: "🐟",
  rice: "🍚",
  pasta: "🍝",
  apple: "🍎",
  banana: "🍌",
  lemon: "🍋",
  onion: "🧅",
  garlic: "🧄",
  pepper: "🫑",
  broccoli: "🥦",
  potato: "🥔",
  mushroom: "🍄",
  butter: "🧈",
  yogurt: "🫙",
  orange: "🍊",
  blueberr: "🫐",
  avocado: "🥑",
  soup: "🥫",
};

export function getIngredientEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🛒";
}
