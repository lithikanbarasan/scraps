"use client";
import React, { useState } from "react";
import { Ingredient, UrgencyLevel } from "../types";

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
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return "🥫";
}

function getDaysLeft(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getUrgency(days: number): UrgencyLevel {
  if (days <= 2) return "red";
  if (days <= 5) return "yellow";
  return "green";
}

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
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name,
      quantity: quantity || "1",
      unit,
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
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800">Add Ingredient</h2>
        <p className="text-sm text-stone-400 mt-0.5">Scan or enter manually after shopping</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-stone-100 rounded-2xl p-1 gap-1">
        <button
          onClick={() => setTab("manual")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === "manual" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
          }`}
        >
          ✏️ Manual
        </button>
        <button
          onClick={() => setTab("scan")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === "scan" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
          }`}
        >
          📷 Scan Photo
        </button>
      </div>

      {tab === "scan" ? (
        <div className="flex flex-col gap-4">
          <div className="bg-stone-100 rounded-3xl flex flex-col items-center justify-center py-16 gap-4 border-2 border-dashed border-stone-300">
            {scanning ? (
              <>
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-stone-500 font-medium">Scanning ingredients...</p>
              </>
            ) : (
              <>
                <span className="text-5xl">📷</span>
                <p className="text-sm text-stone-500 font-medium text-center px-4">
                  Point at your fridge, pantry, or receipt
                </p>
                <button
                  onClick={handleSimulateScan}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Simulate Scan
                </button>
              </>
            )}
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
            <p className="text-xs text-amber-700 font-medium">
              💡 AI will identify your ingredient and suggest a typical shelf life. You can confirm or edit before saving.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-stone-500 mb-1 block">Ingredient name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Baby Spinach"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {name && (
              <p className="text-xs text-stone-400 mt-1 ml-1">
                {getEmoji(name)} Detected: {getEmoji(name) !== "🥫" ? name : "unknown item"}
              </p>
            )}
          </div>

          {/* Quantity + Unit */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {["count", "oz", "lbs", "kg", "g", "pint", "bag", "gallon", "cup", "bunch"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Expiry date */}
          <div>
            <label className="text-xs font-semibold text-stone-500 mb-1 block">Expiry date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            {expiryDate && (
              <div className={`mt-1.5 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                getUrgency(getDaysLeft(expiryDate)) === "red"
                  ? "bg-red-100 text-red-700"
                  : getUrgency(getDaysLeft(expiryDate)) === "yellow"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {getDaysLeft(expiryDate) <= 0
                  ? "Expires today!"
                  : `${getDaysLeft(expiryDate)} days left`}
                {getUrgency(getDaysLeft(expiryDate)) === "red" && " · Will auto-post to friends"}
              </div>
            )}
          </div>

          {/* Estimated value */}
          <div>
            <label className="text-xs font-semibold text-stone-500 mb-1 block">Estimated value ($)</label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleAdd}
            disabled={!name || !expiryDate}
            className="w-full bg-green-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all active:scale-95 mt-1"
          >
            {success ? "✓ Added to pantry!" : "Add to Pantry"}
          </button>

          {/* Receipt stretch goal hint */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-3 text-center">
            <p className="text-xs text-stone-400">
              📄 <span className="font-medium">Receipt scan</span> coming soon — auto-imports all items at once
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
