import { NextResponse } from "next/server";
import type { Ingredient, Recipe } from "@/components/types";
import {
  filterByIngredient,
  ingredientFilterQueries,
  lookupMeal,
  mealToRecipe,
  searchByLetter,
  type PantryLite,
} from "@/lib/themealdb/mapMeal";
import {
  dedupeMealIds,
  rankByPantryCoverage,
} from "@/lib/themealdb/recipePipeline";

export const runtime = "nodejs";

const MAX_LOOKUPS = 40;
const MAX_FILTER_QUERIES = 14;

/** Build recipe list from TheMealDB: baseline `search.php?f=a` plus meals that use pantry ingredients. */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ingredients = (body.ingredients ?? []) as Pick<
      Ingredient,
      "name" | "urgency" | "daysLeft"
    >[];

    const pantry: PantryLite[] = ingredients.map((i) => ({
      name: i.name,
      urgency: i.urgency,
      daysLeft: i.daysLeft,
    }));

    // Collect candidate recipe IDs from TheMealDB.
    // The same meal may appear from multiple searches, so duplicates
    // are removed before performing individual meal lookups.
    const candidateIds: string[] = [];

    const letterMeals = await searchByLetter("a");

    for (const meal of letterMeals) {
      const id = meal.idMeal;

      if (id) {
        candidateIds.push(String(id));
      }
    }

    // Keep track of ingredient queries so the same search
    // is not sent to TheMealDB more than once.
    const tried = new Set<string>();

    for (const pantryItem of pantry) {
      for (const query of ingredientFilterQueries(pantryItem.name)) {
        if (tried.size >= MAX_FILTER_QUERIES) break;

        const key = query.toLowerCase();

        if (tried.has(key)) continue;

        tried.add(key);

        try {
          const ids = await filterByIngredient(query);
          candidateIds.push(...ids);
        } catch {
          // TheMealDB may not recognize every ingredient name.
        }
      }
    }

    // Remove duplicate IDs before performing recipe lookups.
    const ids = dedupeMealIds(candidateIds).slice(
      0,
      MAX_LOOKUPS + 20
    );

    const meals: NonNullable<
      Awaited<ReturnType<typeof lookupMeal>>
    >[] = [];

    for (const id of ids) {
      if (meals.length >= MAX_LOOKUPS) break;

      const meal = await lookupMeal(id);

      if (meal) {
        meals.push(meal);
      }
    }

    let recipes: Recipe[] = meals.map((meal) =>
      mealToRecipe(meal, pantry)
    );

    // If the user has pantry items, prefer recipes that
    // actually use at least one of those ingredients.
    const hasPantry = pantry.length > 0;

    if (hasPantry) {
      const withMatch = recipes.filter(
        (recipe) =>
          (recipe.usesSources?.filter(
            (source) => source.source === "yours"
          ).length ?? 0) > 0
      );

      if (withMatch.length > 0) {
        recipes = withMatch;
      }
    }

    // Rank recipes by how many of the user's pantry ingredients
    // they use. Recipe name is used as a tie breaker.
    recipes = rankByPantryCoverage(recipes);

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load recipes",
        recipes: [] as Recipe[],
      },
      { status: 500 }
    );
  }
}