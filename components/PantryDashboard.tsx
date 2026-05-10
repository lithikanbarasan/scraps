"use client";
import React, { useEffect, useState } from "react";
import { Ingredient, UrgencyLevel } from "./types";
import { getDaysLeft, getUrgency } from "./ingredientUtils";
import { pressDark, pressOutline } from "./pressableStyles";

interface PantryDashboardProps {
  ingredients: Ingredient[];
  userFirstName: string;
  onToggleShare: (id: string) => void;
  onUpdateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  onRemoveIngredient: (id: string) => void;
}

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
  userFirstName,
  onToggleShare,
  onUpdateIngredient,
  onRemoveIngredient,
}: PantryDashboardProps) {
  const [filter, setFilter] = useState<"all" | UrgencyLevel>("all");
  const [detailId, setDetailId] = useState<string | null>(null);

  const sorted = [...ingredients].sort((a, b) => a.daysLeft - b.daysLeft);
  const filtered =
    filter === "all" ? sorted : sorted.filter((i) => i.urgency === filter);

  const totalValue = ingredients.reduce((s, i) => s + i.estimatedValue, 0);
  const atRisk = ingredients
    .filter((i) => i.urgency !== "green")
    .reduce((s, i) => s + i.estimatedValue, 0);
  const redCount = ingredients.filter((i) => i.urgency === "red").length;

  const detail = detailId
    ? ingredients.find((i) => i.id === detailId)
    : undefined;

  const [draftExpiry, setDraftExpiry] = useState("");
  const [draftCost, setDraftCost] = useState("");

  const openDetail = (id: string) => {
    const ing = ingredients.find((i) => i.id === id);
    if (ing) {
      setDraftExpiry(ing.expiryDate);
      setDraftCost(String(ing.estimatedValue));
    }
    setDetailId(id);
  };

  useEffect(() => {
    if (!detailId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailId]);

  const saveDetail = () => {
    if (!detailId) return;
    const cost = parseFloat(draftCost);
    onUpdateIngredient(detailId, {
      expiryDate: draftExpiry,
      estimatedValue: Number.isFinite(cost) ? cost : 0,
    });
    setDetailId(null);
  };

  const adjustCount = (id: string, delta: number) => {
    const ing = ingredients.find((i) => i.id === id);
    if (!ing) return;
    const next = ing.count + delta;
    onUpdateIngredient(id, { count: next });
    if (next <= 0) setDetailId(null);
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-stone-200 focus:border-stone-900 px-0 py-3 text-[15px] text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-0 transition-colors";

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2 relative">
      <div>
        <h1 className="font-display text-[34px] leading-[1.1] tracking-[-0.01em] text-stone-900">
          Good morning,
          <br />
          {userFirstName}.
        </h1>
        <p className="text-[13px] text-stone-500 mt-3 leading-relaxed">
          You have{" "}
          <span className="text-stone-900 font-medium">{redCount} items</span>{" "}
          expiring soon.
        </p>
      </div>

      <div className="border-b border-stone-200 pb-3 flex items-end">
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
      </div>

      <div className="flex gap-2 -mx-6 px-6 overflow-x-auto scrollbar-none">
        {(["all", "red", "yellow", "green"] as const).map((f) => {
          const active = filter === f;
          const label =
            f === "all"
              ? "All"
              : f === "red"
              ? "Urgent"
              : f === "yellow"
              ? "Soon"
              : "Fresh";
          return (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-medium flex items-center gap-2 border ${
                active
                  ? `bg-stone-900 text-white border-stone-900 ${pressDark}`
                  : `bg-white text-stone-700 border-stone-300 ${pressOutline}`
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

      <div className="flex items-baseline justify-between -mb-3">
        <h2 className="font-display text-[20px] text-stone-900 tracking-tight">
          {filter === "all"
            ? "Use first"
            : filter === "red"
            ? "Urgent items"
            : filter === "yellow"
            ? "Coming up"
            : "Plenty of time"}
        </h2>
        <span className="text-[12px] text-stone-400 tabular-nums">
          {filtered.length} items
        </span>
      </div>

      <div className="flex flex-col">
        {filtered.map((ing, idx) => (
          <div
            key={ing.id}
            role="button"
            tabIndex={0}
            onClick={() => openDetail(ing.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openDetail(ing.id);
              }
            }}
            className={`flex items-center gap-4 py-4 w-full text-left rounded-lg -mx-1 px-1 cursor-pointer ${pressOutline} ${
              idx !== 0 ? "border-t border-stone-100" : ""
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-2xl flex-shrink-0">
              {ing.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgencyDot[ing.urgency]}`}
                />
                <p className="text-[15px] text-stone-900 truncate font-medium">
                  {ing.name}
                </p>
              </div>
              <p className="text-[12px] text-stone-400 mt-0.5 ml-3.5">
                {ing.count > 1 ? `${ing.count} × ` : ""}
                {ing.quantity} {ing.unit} · ${ing.estimatedValue.toFixed(2)}
              </p>
            </div>

            <div
              className="flex flex-col items-end gap-0.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className={`text-[13px] tabular-nums font-medium ${urgencyText[ing.urgency]}`}
              >
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
                  type="button"
                  onClick={() => onToggleShare(ing.id)}
                  className={`text-[10px] tracking-wide rounded px-1 py-0.5 ${pressOutline} ${
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

      {detail && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-stone-900/40">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={() => setDetailId(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-t-[28px] shadow-2xl px-6 pt-6 pb-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-stone-50 flex items-center justify-center text-3xl flex-shrink-0">
                {detail.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-[24px] text-stone-900 leading-tight">
                  {detail.name}
                </h2>
                <p className="text-[13px] text-stone-500 mt-1">
                  {detail.count > 1 ? `${detail.count} × ` : ""}
                  {detail.quantity} {detail.unit}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                  How many (tap − / + after using one)
                </label>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    aria-label="Decrease count"
                    onClick={() => adjustCount(detail.id, -1)}
                    className={`w-11 h-11 rounded-full border border-stone-300 text-stone-900 text-xl font-medium leading-none flex items-center justify-center ${pressOutline}`}
                  >
                    −
                  </button>
                  <span className="font-display text-[28px] text-stone-900 tabular-nums min-w-[2ch] text-center">
                    {detail.count}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase count"
                    onClick={() => adjustCount(detail.id, 1)}
                    className={`w-11 h-11 rounded-full border border-stone-300 text-stone-900 text-xl font-medium leading-none flex items-center justify-center ${pressOutline}`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                  Expiration date
                </label>
                <input
                  type="date"
                  value={draftExpiry}
                  onChange={(e) => setDraftExpiry(e.target.value)}
                  className={inputClass}
                />
                {draftExpiry && (
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${urgencyDot[getUrgency(getDaysLeft(draftExpiry))]}`}
                    />
                    <span
                      className={`text-[12px] font-medium ${urgencyText[getUrgency(getDaysLeft(draftExpiry))]}`}
                    >
                      {getDaysLeft(draftExpiry) <= 0
                        ? "Expires today"
                        : `${getDaysLeft(draftExpiry)} days left`}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                  Estimated cost
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[15px] text-stone-400 pt-3">
                    $
                  </span>
                  <input
                    type="number"
                    value={draftCost}
                    onChange={(e) => setDraftCost(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className={`${inputClass} pl-4`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={saveDetail}
                className={`w-full bg-stone-900 text-white font-medium py-3.5 rounded-full text-[13px] tracking-wide mt-2 ${pressDark}`}
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setDetailId(null)}
                className={`w-full py-3 rounded-full text-[13px] font-medium border border-stone-300 text-stone-700 ${pressOutline}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveIngredient(detail.id);
                  setDetailId(null);
                }}
                className={`w-full py-3 rounded-full text-[13px] font-medium border border-red-200 text-red-700 bg-red-50/80 ${pressOutline}`}
              >
                Remove from pantry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
