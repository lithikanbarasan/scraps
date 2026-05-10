"use client";
import React, { useState } from "react";
import { Recipe } from "./types";

interface RecipesProps {
  recipes: Recipe[];
}

// Soft neutral tints for recipe card backgrounds — these are decorative,
// not semantic. Cycled per card for visual variety.
const cardTints = [
  "bg-stone-100",
  "bg-amber-50",
  "bg-orange-50",
  "bg-stone-50",
];

export default function Recipes({ recipes }: RecipesProps) {
  const [filter, setFilter] = useState<"all" | "easy" | "quick">("all");
  const [cooked, setCooked] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["1"]));

  const filtered = recipes.filter((r) => {
    if (filter === "easy") return r.difficulty === "Easy";
    if (filter === "quick") return parseInt(r.cookTime) <= 15;
    return true;
  });

  const toggleFav = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavorites(next);
  };

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      {/* Header avatars (consistent with Pantry header) */}
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 border border-stone-200">
          SC
        </div>
        <button className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="12" r="1.5" fill="#0c0a09" />
            <circle cx="12" cy="12" r="1.5" fill="#0c0a09" />
            <circle cx="18" cy="12" r="1.5" fill="#0c0a09" />
          </svg>
        </button>
      </div>

      {/* Big serif title */}
      <div>
        <h1 className="font-display text-[34px] leading-[1.1] tracking-[-0.01em] text-stone-900">
          Cook tonight.
        </h1>
        <p className="text-[13px] text-stone-500 mt-3">
          Recipes that use what's expiring.
        </p>
      </div>

      {/* Search bar with hairline underline (matches image 1) */}
      <div className="border-b border-stone-200 pb-3 flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="6" />
          <line x1="20" y1="20" x2="15.5" y2="15.5" />
        </svg>
        <input
          type="text"
          placeholder="Search recipes"
          className="flex-1 bg-transparent text-[14px] text-stone-800 placeholder-stone-400 focus:outline-none"
        />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c0a09" strokeWidth="1.5" strokeLinecap="round">
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="10" y1="16" x2="14" y2="16" />
        </svg>
      </div>

      {/* Pill filter row */}
      <div className="flex gap-2 -mx-6 px-6 overflow-x-auto scrollbar-none">
        {(["all", "easy", "quick"] as const).map((f) => {
          const active = filter === f;
          const label = f === "all" ? "All" : f === "easy" ? "Easy" : "Under 15 min";
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-medium transition-all border ${
                active
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300"
              }`}
            >
              {label}
            </button>
          );
        })}
        <button className="flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-medium bg-white text-stone-700 border border-stone-300">
          Cuisines
        </button>
      </div>

      {/* "Recommended for you" — serif heading */}
      <div className="flex items-baseline justify-between -mb-3">
        <h2 className="font-display text-[20px] text-stone-900 tracking-tight">
          Recommended for you
        </h2>
        <button className="text-[12px] text-stone-500 underline underline-offset-2">
          View all
        </button>
      </div>

      {/* Recipe cards — large, editorial, with heart overlay (matches image 1) */}
      <div className="flex flex-col gap-5">
        {filtered.map((recipe, idx) => {
          const isCookedNow = cooked.has(recipe.id);
          const isFav = favorites.has(recipe.id);
          return (
            <div
              key={recipe.id}
              className={`flex flex-col gap-3 transition-opacity ${
                isCookedNow ? "opacity-50" : ""
              }`}
            >
              {/* Big "image" area — emoji on tinted background, with heart overlay */}
              <div className={`relative ${cardTints[idx % cardTints.length]} rounded-[22px] aspect-[4/3] flex items-center justify-center overflow-hidden`}>
                <span className="text-8xl" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }}>
                  {recipe.emoji}
                </span>
                {/* Heart button — top right, white circle */}
                <button
                  onClick={() => toggleFav(recipe.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={isFav ? "#0c0a09" : "none"}
                    stroke="#0c0a09"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
                  </svg>
                </button>
                {/* Urgent badge — bottom left, only red dot */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] font-medium text-stone-800 tracking-wide">
                    Uses {recipe.expiringIngredients.length} expiring
                  </span>
                </div>
              </div>

              {/* Title + meta */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-display text-[20px] text-stone-900 tracking-tight leading-snug">
                    {recipe.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[12px] text-stone-500">
                      {recipe.cookTime}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-[12px] text-stone-500">
                      {recipe.difficulty}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className="text-[12px] text-stone-500 tabular-nums">
                      Saves ~${recipe.savingsEstimate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ingredient chips — minimal, hairline border */}
              <div className="flex flex-wrap gap-1.5">
                {recipe.allIngredients.map((ing) => {
                  const isExpiring = recipe.expiringIngredients.includes(ing);
                  return (
                    <span
                      key={ing}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-stone-200 text-stone-700 flex items-center gap-1.5"
                    >
                      {isExpiring && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                      {ing}
                    </span>
                  );
                })}
              </div>

              {/* CTA — primary black button */}
              <button
                onClick={() => {
                  const next = new Set(cooked);
                  if (isCookedNow) next.delete(recipe.id);
                  else next.add(recipe.id);
                  setCooked(next);
                }}
                className={`w-full py-3.5 rounded-full text-[13px] font-medium tracking-wide transition-all active:scale-[0.99] mt-1 ${
                  isCookedNow
                    ? "bg-white text-stone-900 border border-stone-300"
                    : "bg-stone-900 text-white"
                }`}
              >
                {isCookedNow ? "Marked as cooked ✓" : "Cook this tonight"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
