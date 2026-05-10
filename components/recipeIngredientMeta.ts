import type { Recipe, RecipeUsesSource } from "./types";

export function isExpiringIngredient(
  recipe: Recipe,
  ingredientDisplayName: string
): boolean {
  const a = ingredientDisplayName.toLowerCase();
  return recipe.expiringIngredients.some((ex) => {
    const b = ex.toLowerCase();
    return (
      a.includes(b) ||
      b.includes(a) ||
      a.split(/\s+/).some((w) => w.length > 2 && b.includes(w))
    );
  });
}

export function findUseSource(
  recipe: Recipe,
  ingredientDisplayName: string
): RecipeUsesSource | undefined {
  const a = ingredientDisplayName.toLowerCase();
  return recipe.usesSources?.find((u) => {
    const k = u.ingredientLabel.toLowerCase();
    return (
      a.includes(k) ||
      k.split(/\s/).some((part) => part.length > 2 && a.includes(part))
    );
  });
}
