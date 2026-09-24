import { describe, expect, it } from "vitest";
import {
  findUseSource,
  isExpiringIngredient,
} from "./recipeIngredientMeta";
import type { Recipe } from "./types";

const baseRecipe: Recipe = {
  id: "recipe-1",
  name: "Chicken Pasta",
  emoji: "🍝",
  cookTime: "30 min",
  cookTimeMinutes: 30,
  difficulty: "Easy",
  expiringIngredients: ["chicken", "spinach"],
  allIngredients: ["chicken breast", "pasta", "spinach"],
  savingsEstimate: 8,
  dietaryTags: [],
  cuisine: "Italian",
  ingredientMatch: "pantry_only",
  usesSources: [
    {
      ingredientLabel: "chicken",
      source: "yours",
    },
    {
      ingredientLabel: "spinach",
      source: "friend",
      friendName: "Alex",
    },
  ],
  steps: ["Cook pasta", "Cook chicken", "Combine ingredients"],
};

describe("isExpiringIngredient", () => {
  it("identifies an ingredient that is expiring", () => {
    expect(isExpiringIngredient(baseRecipe, "chicken breast")).toBe(true);
  });

  it("identifies another expiring ingredient", () => {
    expect(isExpiringIngredient(baseRecipe, "fresh spinach")).toBe(true);
  });

  it("returns false for an ingredient that is not expiring", () => {
    expect(isExpiringIngredient(baseRecipe, "pasta")).toBe(false);
  });
});

describe("findUseSource", () => {
  it("identifies an ingredient from the user's pantry", () => {
    expect(findUseSource(baseRecipe, "chicken breast")).toEqual({
      ingredientLabel: "chicken",
      source: "yours",
    });
  });

  it("identifies an ingredient supplied by a friend", () => {
    expect(findUseSource(baseRecipe, "fresh spinach")).toEqual({
      ingredientLabel: "spinach",
      source: "friend",
      friendName: "Alex",
    });
  });

  it("returns undefined when there is no matching source", () => {
    expect(findUseSource(baseRecipe, "pasta")).toBeUndefined();
  });
});