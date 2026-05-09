"use client";
import React, { useState } from "react";
import { Ingredient, UrgencyLevel } from "../types";

interface PantryDashboardProps {
  ingredients: Ingredient[];
  onToggleShare: (id: string) => void;
}

const urgencyConfig: Record<UrgencyLevel, { bg: string; border: string; badge: string; badgeText: string; label: string }> = {
  red: {
    bg: "bg-red-50",
    border: "border-l-4 border-l-red-400",
    badge: "bg-red-100 text-red-700",
    badgeText: "text-red-700",
    label: "Urgent",
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-l-4 border-l-amber-400",
    badge: "bg-amber-100 text-amber-700",
    badgeText: "text-amber-700",
    label: "Soon",
  },
  green: {
    bg: "bg-white",
    border: "border-l-4 border-l-green-400",
    badge: "bg-green-100 text-green-700",
    badgeText: "text-green-700",
    label: "Fresh",
  },
};

export default function PantryDashboard({ ingredients, onToggleShare }: PantryDashboardProps) {
  const [filter, setFilter] = useState<"all" | UrgencyLevel>("all");

  const sorted = [...ingredients].sort((a, b) => a.daysLeft - b.daysLeft);
  const filtered = filter === "all" ? sorted : sorted.filter((i) => i.urgency === filter);

  const totalValue = ingredients.reduce((s, i) => s + i.estimatedValue, 0);
  const atRisk = ingredients.filter((i) => i.urgency !== "green").reduce((s, i) => s + i.estimatedValue, 0);
  const redCount = ingredients.filter((i) => i.urgency === "red").length;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm">
          <p className="text-[10px] text-stone-400 font-medium mb-1">Pantry value</p>
          <p className="text-lg font-semibold text-stone-800">${totalValue.toFixed(0)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 border border-red-100 shadow-sm">
          <p className="text-[10px] text-red-400 font-medium mb-1">At risk</p>
          <p className="text-lg font-semibold text-red-600">${atRisk.toFixed(0)}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-3 border border-green-100 shadow-sm">
          <p className="text-[10px] text-green-600 font-medium mb-1">Saved / mo</p>
          <p className="text-lg font-semibold text-green-700">$42</p>
        </div>
      </div>

      {/* Recipes available banner */}
      <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🍽️</span>
        <p className="text-sm font-medium text-green-800">You can make <span className="font-bold">12 recipes</span> right now</p>
      </div>

      {/* Urgent warning */}
      {redCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700">{redCount} item{redCount > 1 ? "s" : ""} expiring very soon</p>
            <p className="text-xs text-red-500 mt-0.5">These have been posted to your friends board automatically</p>
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2">
        {(["all", "red", "yellow", "green"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? f === "all"
                  ? "bg-stone-800 text-white"
                  : f === "red"
                  ? "bg-red-500 text-white"
                  : f === "yellow"
                  ? "bg-amber-400 text-white"
                  : "bg-green-600 text-white"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {f === "all" ? "All" : f === "red" ? "🔴 Urgent" : f === "yellow" ? "🟡 Soon" : "🟢 Fresh"}
          </button>
        ))}
      </div>

      {/* Section label */}
      {filter === "all" && (
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">
          Use First
        </p>
      )}

      {/* Ingredient list */}
      <div className="flex flex-col gap-2">
        {filtered.map((ing) => {
          const cfg = urgencyConfig[ing.urgency];
          return (
            <div
              key={ing.id}
              className={`${cfg.bg} ${cfg.border} rounded-2xl p-3 flex items-center gap-3 shadow-sm`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                ing.urgency === "red" ? "bg-red-100" : ing.urgency === "yellow" ? "bg-amber-100" : "bg-green-100"
              }`}>
                {ing.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">{ing.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {ing.quantity} {ing.unit} · ~${ing.estimatedValue.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {ing.daysLeft === 0 ? "Today!" : ing.daysLeft === 1 ? "1 day" : `${ing.daysLeft} days`}
                </span>
                {!ing.autoShared && (
                  <button
                    onClick={() => onToggleShare(ing.id)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all ${
                      ing.isShared
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {ing.isShared ? "✓ Shared" : "Share"}
                  </button>
                )}
                {ing.autoShared && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    Auto-posted
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
