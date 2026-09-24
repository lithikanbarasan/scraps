import { describe, expect, it } from "vitest";

import {
  dedupeMealIds,
  pantryMatchCount,
  rankByPantryCoverage,
} from "./recipePipeline";

const yours = (ingredientLabel: string) => ({
  ingredientLabel,
  source: "yours" as const,
});

const friend = (ingredientLabel: string) => ({
  ingredientLabel,
  source: "friend" as const,
  friendName: "Alex",
});

describe("dedupeMealIds", () => {
  it("removes duplicate TheMealDB recipe IDs", () => {
    const ids = ["123", "456", "123", "789", "456"];

    expect(dedupeMealIds(ids)).toEqual(["123", "456", "789"]);
  });

  it("ignores missing IDs", () => {
    const ids = ["123", undefined, null, "456", "123"];

    expect(dedupeMealIds(ids)).toEqual(["123", "456"]);
  });
});

describe("pantryMatchCount", () => {
  it("counts only ingredients from the user's pantry", () => {
    const recipe = {
      name: "Chicken Rice Bowl",
      usesSources: [
        yours("chicken"),
        yours("rice"),
        friend("onion"),
      ],
    };

    expect(pantryMatchCount(recipe)).toBe(2);
  });
});

describe("rankByPantryCoverage", () => {
  it("ranks recipes with more pantry ingredient matches first", () => {
    const recipes = [
      {
        name: "One Match",
        usesSources: [yours("chicken")],
      },
      {
        name: "Three Matches",
        usesSources: [
          yours("chicken"),
          yours("rice"),
          yours("onion"),
        ],
      },
      {
        name: "Two Matches",
        usesSources: [
          yours("chicken"),
          yours("rice"),
        ],
      },
    ];

    const ranked = rankByPantryCoverage(recipes);

    expect(ranked.map((recipe) => recipe.name)).toEqual([
      "Three Matches",
      "Two Matches",
      "One Match",
    ]);
  });

  it("does not count a friend's ingredients as pantry matches", () => {
    const recipes = [
      {
        name: "Mostly Friend Ingredients",
        usesSources: [
          yours("chicken"),
          friend("rice"),
          friend("onion"),
        ],
      },
      {
        name: "Two Pantry Matches",
        usesSources: [
          yours("chicken"),
          yours("rice"),
        ],
      },
    ];

    const ranked = rankByPantryCoverage(recipes);

    expect(ranked[0].name).toBe("Two Pantry Matches");
  });

  it("uses recipe name as a tie breaker when match counts are equal", () => {
    const recipes = [
      {
        name: "Zucchini Bowl",
        usesSources: [
          yours("rice"),
          yours("onion"),
        ],
      },
      {
        name: "Chicken Bowl",
        usesSources: [
          yours("chicken"),
          yours("rice"),
        ],
      },
    ];

    const ranked = rankByPantryCoverage(recipes);

    expect(ranked.map((recipe) => recipe.name)).toEqual([
      "Chicken Bowl",
      "Zucchini Bowl",
    ]);
  });
});