"use client";
import React, { useState } from "react";
import { Recipe } from "../types";

interface RecipesProps {
  recipes: Recipe[];
}

export default function Recipes({ recipes }: RecipesProps) {
  const [filter, setFilter] = useState<"all" | "easy" | "quick">("all");
  const [cooked, setCooked] = useState<Set<string>>(new Set());

  const filtered = recipes.filter((r) => {
    if (filter === "easy") return r.difficulty === "Easy";
    if (filter === "quick") return parseInt(r.cookTime) <= 15;
    return true;
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800">Cook This First</h2>
        <p className="text-sm text-stone-400 mt-0.5">Prioritizing your expiring ingredients</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(["all", "easy", "quick"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-500"
            }`}
          >
            {f === "all" ? "All recipes" : f === "easy" ? "Easy only" : "Under 15 min"}
          </button>
        ))}
      </div>

      {/* Recipe cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((recipe) => {
          const isCookedNow = cooked.has(recipe.id);
          return (
            <div
              key={recipe.id}
              className={`bg-white rounded-3xl border overflow-hidden shadow-sm transition-all ${
                isCookedNow ? "border-green-300 opacity-60" : "border-stone-100"
              }`}
            >
              {/* Image area */}
              <div className="bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center py-8 text-6xl">
                {recipe.emoji}
              </div>

              <div className="p-4 flex flex-col gap-3">
                {/* Urgency badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-red-100 text-red-700 text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                    ⚠️ Uses {recipe.expiringIngredients.length} expiring items
                  </span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    Saves ~${recipe.savingsEstimate}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-stone-800">{recipe.name}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-stone-400">⏱ {recipe.cookTime}</span>
                    <span className="text-xs text-stone-400">👨‍🍳 {recipe.difficulty}</span>
                  </div>
                </div>

                {/* Ingredient tags */}
                <div className="flex flex-wrap gap-1.5">
                  {recipe.allIngredients.map((ing) => {
                    const isExpiring = recipe.expiringIngredients.includes(ing);
                    return (
                      <span
                        key={ing}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                          isExpiring ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isExpiring ? "⚡ " : ""}{ing}
                      </span>
                    );
                  })}
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    const next = new Set(cooked);
                    if (isCookedNow) next.delete(recipe.id);
                    else next.add(recipe.id);
                    setCooked(next);
                  }}
                  className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${
                    isCookedNow
                      ? "bg-green-100 text-green-700"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {isCookedNow ? "✓ Marked as cooked!" : "Cook this tonight"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
