"use client";
import React, { useState } from "react";
import { Ingredient, UrgencyLevel } from "./types";

interface PantryDashboardProps {
  ingredients: Ingredient[];
  onToggleShare: (id: string) => void;
}

// URGENCY = the only semantic color in the entire app
const urgencyDot: Record<UrgencyLevel, string> = {
  red: "bg-red-500",
  yellow: "bg-amber-400",
  green: "bg-emerald-500",
};

const urgencyText: Record<UrgencyLevel, string> = {
  red: "text-red-600",
  yellow: "text-amber-600",
  green: "text-stone-400",
};

export default function PantryDashboard({
  ingredients,
  onToggleShare,
}: PantryDashboardProps) {
  const [filter, setFilter] = useState<"all" | UrgencyLevel>("all");

  const sorted = [...ingredients].sort((a, b) => a.daysLeft - b.daysLeft);
  const filtered =
    filter === "all" ? sorted : sorted.filter((i) => i.urgency === filter);

  const totalValue = ingredients.reduce((s, i) => s + i.estimatedValue, 0);
  const atRisk = ingredients
    .filter((i) => i.urgency !== "green")
    .reduce((s, i) => s + i.estimatedValue, 0);
  const redCount = ingredients.filter((i) => i.urgency === "red").length;

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      {/* Editorial header — avatar circle on left, dots menu on right (matches image 1) */}
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
          Good morning,
          <br />
          Sarah.
        </h1>
        <p className="text-[13px] text-stone-500 mt-3 leading-relaxed">
          You have <span className="text-stone-900 font-medium">{redCount} items</span>{" "}
          to use this week.
        </p>
      </div>

      {/* Search-style stat row with hairline underline (echoes the search bar in image 1) */}
      <div className="border-b border-stone-200 pb-3 flex items-end justify-between">
        <div className="flex items-baseline gap-5">
          <div>
            <p className="font-display text-[22px] text-stone-900 tabular-nums leading-none">
              ${totalValue.toFixed(0)}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 mt-1.5">
              Pantry value
            </p>
          </div>
          <div className="w-px h-9 bg-stone-200" />
          <div>
            <p className="font-display text-[22px] text-stone-900 tabular-nums leading-none">
              ${atRisk.toFixed(0)}
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400 mt-1.5">
              At risk
            </p>
          </div>
        </div>
        <button className="w-9 h-9 flex items-center justify-center text-stone-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="16" x2="14" y2="16" />
          </svg>
        </button>
      </div>

      {/* Pill filter row — overflow scroll (matches image 1) */}
      <div className="flex gap-2 -mx-6 px-6 overflow-x-auto scrollbar-none">
        {(["all", "red", "yellow", "green"] as const).map((f) => {
          const active = filter === f;
          const label =
            f === "all" ? "All"
            : f === "red" ? "Urgent"
            : f === "yellow" ? "Soon"
            : "Fresh";
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 border ${
                active
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300"
              }`}
            >
              {f !== "all" && (
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot[f]}`} />
              )}
              {label}
            </button>
          );
        })}
      </div>

      {/* "Use first" section title — serif, matches "Recommended for you" pattern */}
      <div className="flex items-baseline justify-between -mb-3">
        <h2 className="font-display text-[20px] text-stone-900 tracking-tight">
          {filter === "all" ? "Use first" : filter === "red" ? "Urgent items" : filter === "yellow" ? "Coming up" : "Plenty of time"}
        </h2>
        <span className="text-[12px] text-stone-400 tabular-nums">{filtered.length} items</span>
      </div>

      {/* Ingredient list — flat with hairline dividers */}
      <div className="flex flex-col">
        {filtered.map((ing, idx) => (
          <div
            key={ing.id}
            className={`flex items-center gap-4 py-4 ${
              idx !== 0 ? "border-t border-stone-100" : ""
            }`}
          >
            {/* Emoji — neutral disc */}
            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-2xl flex-shrink-0">
              {ing.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgencyDot[ing.urgency]}`} />
                <p className="text-[15px] text-stone-900 truncate font-medium">
                  {ing.name}
                </p>
              </div>
              <p className="text-[12px] text-stone-400 mt-0.5 ml-3.5">
                {ing.quantity} {ing.unit} · ${ing.estimatedValue.toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className={`text-[13px] tabular-nums font-medium ${urgencyText[ing.urgency]}`}>
                {ing.daysLeft === 0
                  ? "Today"
                  : ing.daysLeft === 1
                  ? "1 day"
                  : `${ing.daysLeft} days`}
              </span>
              {ing.autoShared ? (
                <span className="text-[10px] text-stone-400 tracking-wide">
                  Auto-shared
                </span>
              ) : (
                <button
                  onClick={() => onToggleShare(ing.id)}
                  className={`text-[10px] tracking-wide transition-all ${
                    ing.isShared
                      ? "text-stone-900 font-medium"
                      : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  {ing.isShared ? "Shared" : "Share"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
