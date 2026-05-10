"use client";
import React, { useState } from "react";
import { Ingredient, UrgencyLevel } from "./types";
import { getDaysLeft, getUrgency, parseAddBatchCount } from "./ingredientUtils";
import { pressDark, pressOutline } from "./pressableStyles";

interface AddIngredientProps {
  onAdd: (ingredient: Ingredient) => void;
}

const EMOJI_MAP: Record<string, string> = {
  spinach: "🥬", strawberr: "🍓", tomato: "🍅", carrot: "🥕",
  cheese: "🧀", egg: "🥚", milk: "🥛", flour: "🌾", bread: "🍞",
  chicken: "🍗", beef: "🥩", fish: "🐟", rice: "🍚", pasta: "🍝",
  apple: "🍎", banana: "🍌", lemon: "🍋", onion: "🧅", garlic: "🧄",
  pepper: "🫑", broccoli: "🥦", potato: "🥔", mushroom: "🍄", butter: "🧈",
  yogurt: "🫙", orange: "🍊", blueberr: "🫐", avocado: "🥑",
  soup: "🥫",
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🛒";
}

const urgencyDot: Record<UrgencyLevel, string> = {
  red: "bg-red-500",
  yellow: "bg-amber-400",
  green: "bg-emerald-500",
};

const urgencyText: Record<UrgencyLevel, string> = {
  red: "text-red-600",
  yellow: "text-amber-600",
  green: "text-emerald-700",
};

export default function AddIngredient({ onAdd }: AddIngredientProps) {
  const [tab, setTab] = useState<"manual" | "scan">("manual");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("count");
  const [expiryDate, setExpiryDate] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [success, setSuccess] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleAdd = () => {
    if (!name || !expiryDate) return;
    const days = getDaysLeft(expiryDate);
    const urgency = getUrgency(days);
    const isCountableUnit = unit === "count" || unit === "bag";
    const lineCount = isCountableUnit ? parseAddBatchCount(quantity || "1") : 1;
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name,
      quantity: quantity || "1",
      unit,
      count: lineCount,
      expiryDate,
      daysLeft: days,
      urgency,
      estimatedValue: parseFloat(estimatedValue) || 0,
      emoji: getEmoji(name),
      isShared: urgency === "red",
      autoShared: urgency === "red",
    };
    onAdd(newIngredient);
    setName(""); setQuantity(""); setExpiryDate(""); setEstimatedValue("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setTab("manual");
      setName("Baby Spinach");
      setQuantity("5");
      setUnit("oz");
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setExpiryDate(d.toISOString().split("T")[0]);
      setEstimatedValue("3.50");
    }, 1800);
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-stone-200 focus:border-stone-900 px-0 py-3 text-[15px] text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-0 transition-colors";

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      {/* Title */}
      <div>
        <h1 className="font-display text-[34px] leading-[1.1] tracking-[-0.01em] text-stone-900">
          Add to pantry.
        </h1>
      </div>

      {tab === "scan" ? (
        <div className="flex flex-col gap-4">
          <div className="bg-stone-50 rounded-[22px] aspect-[4/3] flex flex-col items-center justify-center gap-4 border border-stone-200">
            {scanning ? (
              <>
                <div className="w-10 h-10 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-[13px] text-stone-600 font-medium tracking-wide">
                  Scanning...
                </p>
              </>
            ) : (
              <>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#57534e" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="6" width="18" height="14" rx="2" />
                  <circle cx="12" cy="13" r="3.5" />
                  <path d="M9 6l1.5-2h3L15 6" />
                </svg>
                <p className="text-[13px] text-stone-500 text-center px-6 leading-relaxed">
                  Point at your fridge,
                  <br />
                  pantry, or receipt.
                </p>
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className={`bg-stone-900 text-white px-6 py-2.5 rounded-full text-[13px] font-medium ${pressDark}`}
                >
                  Simulate scan
                </button>
              </>
            )}
          </div>
          <p className="text-[12px] text-stone-500 leading-relaxed text-center px-4">
            AI identifies your ingredient and suggests a typical shelf life. You confirm before saving.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
              Ingredient
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Baby spinach"
              className={inputClass}
            />
            {name && (
              <p className="text-[11px] text-stone-400 mt-1.5 flex items-center gap-1.5">
                <span>{getEmoji(name)}</span>
                <span>
                  {getEmoji(name) !== "🥫" ? "Recognized" : "Will use generic icon"}
                </span>
              </p>
            )}
          </div>

          {/* Quantity + Unit */}
          <div className="flex gap-5">
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {["count", "oz", "lbs", "kg", "g", "pint", "bag", "gallon", "cup", "bunch"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
              Expires
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputClass}
            />
            {expiryDate && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot[getUrgency(getDaysLeft(expiryDate))]}`} />
                <span className={`text-[12px] font-medium ${urgencyText[getUrgency(getDaysLeft(expiryDate))]}`}>
                  {getDaysLeft(expiryDate) <= 0
                    ? "Expires today"
                    : `${getDaysLeft(expiryDate)} days left`}
                </span>
                {getUrgency(getDaysLeft(expiryDate)) === "red" && (
                  <span className="text-[11px] text-stone-400">
                    · Will auto-share
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Value */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
              Estimated value
            </label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[15px] text-stone-400 pt-3">
                $
              </span>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className={`${inputClass} pl-4`}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name || !expiryDate}
            className={`w-full bg-stone-900 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100 text-white font-medium py-3.5 rounded-full text-[13px] tracking-wide mt-2 ${pressDark}`}
          >
            {success ? "Added ✓" : "Add to pantry"}
          </button>
        </div>
      )}
    </div>
  );
}
