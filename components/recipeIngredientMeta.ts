import type { Recipe, RecipeUsesSource } from "./types";

export function isExpiringIngredient(
  recipe: Recipe,
  ingredientDisplayName: string
): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  const ingredient = normalize(ingredientDisplayName);
  const displayWords = normalize(ingredientDisplayName).split(" ");

  return recipe.expiringIngredients.some((expiring) => {
    const normalized = normalize(expiring);
    if (!normalized) return false;

    return normalized.split(" ").every((word) =>
      displayWords.some(
        (displayWord) =>
          displayWord === word ||
          displayWord === `${word}s` ||
          `${displayWord}s` === word
      )
    );
  });
}

export function findUseSource(
  recipe: Recipe,
  ingredientDisplayName: string
): RecipeUsesSource | undefined {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const display = normalize(ingredientDisplayName);

  return recipe.usesSources?.find((u) => {
    const pantry = normalize(u.ingredientLabel);

    if (!pantry) return false;

    const pantryWords = pantry.split(" ");

    return pantryWords.every((word) =>
      display.split(" ").some(
        (displayWord) =>
          displayWord === word ||
          displayWord === `${word}s` ||
          `${displayWord}s` === word
      )
    );
  });
}
