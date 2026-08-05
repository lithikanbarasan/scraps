import type { Ingredient } from "@/components/types";
import { getDaysLeft, getUrgency } from "@/components/ingredientUtils";
import type { Database } from "./supabase/database.types";

type PantryRow = Database["public"]["Tables"]["pantry_items"]["Row"];
type PantryInsert = Database["public"]["Tables"]["pantry_items"]["Insert"];
type PantryUpdate = Database["public"]["Tables"]["pantry_items"]["Update"];

export function pantryRowToIngredient(row: PantryRow): Ingredient {
  const daysLeft = getDaysLeft(row.expires_on);
  return {
    id: row.id,
    name: row.name,
    quantity: String(row.quantity),
    unit: row.unit,
    count: row.count,
    expiryDate: row.expires_on,
    daysLeft,
    urgency: getUrgency(daysLeft),
    estimatedValue: Number(row.estimated_value),
    emoji: row.emoji,
    // Social sharing is deliberately outside this vertical slice.
    isShared: false,
    autoShared: false,
  };
}

export function ingredientToPantryInsert(ingredient: Ingredient): PantryInsert {
  return {
    name: ingredient.name.trim(),
    quantity: Number(ingredient.quantity) || 1,
    unit: ingredient.unit.trim() || "count",
    count: Math.max(1, Math.floor(ingredient.count)),
    expires_on: ingredient.expiryDate,
    estimated_value: Math.max(0, ingredient.estimatedValue),
    emoji: ingredient.emoji || "🛒",
  };
}

export function ingredientToPantryUpdate(ingredient: Ingredient): PantryUpdate {
  return ingredientToPantryInsert(ingredient);
}
