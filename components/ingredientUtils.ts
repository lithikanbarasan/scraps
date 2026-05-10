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
