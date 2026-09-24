import type { Recipe } from "../../components/types"; 

type RankableRecipe = Pick<Recipe, "name"| "usesSources">;

export function dedupeMealIds(
    ids: Array<string | null | undefined>
): string[]{
    return [...new Set(ids.filter((id): id is string => Boolean(id)))]
}

export function pantryMatchCount(recipe: RankableRecipe): number {
    return (
        recipe.usesSources?.filter((source) => source.source === "yours").length ?? 0 
    )
}

export function rankByPantryCoverage<T extends RankableRecipe>(
    recipes: T[]
): T[] {
    return [...recipes].sort((a,b) => {
        const matchDifference = pantryMatchCount(b) - pantryMatchCount(a);

        if (matchDifference != 0) {
            return matchDifference; 
        }

        return a.name.localeCompare(b.name);
    });
}