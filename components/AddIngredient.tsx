"use client";
import React, { useEffect, useState } from "react";
import { Ingredient, UrgencyLevel } from "./types";
import {
  estimateExpiryDate,
  getDaysLeft,
  getIngredientEmoji,
  getUrgency,
  parseAddBatchCount,
} from "./ingredientUtils";
import { pressDark, pressOutline } from "./pressableStyles";
import {
  type DetectedIngredient,
  fetchDetectedIngredients,
} from "./fetchDetectedIngredients";
import { createImagePreviewUrl, fileToBase64 } from "../lib/imageBase64";
import PhotoScannerCapture from "./PhotoScannerCapture";

interface AddIngredientProps {
  onAdd: (ingredient: Ingredient, options?: { stayOnAddTab?: boolean }) => Promise<void>;
}

interface ReviewIngredient {
  id: string;
  name: string;
  count: number;
  expiryDate: string;
  selected: boolean;
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

function detectedToReviewItem(item: DetectedIngredient, idx: number): ReviewIngredient {
  return {
    id: `${Date.now()}-${idx}-${item.name}`,
    name: item.name,
    count: Math.max(1, item.count),
    expiryDate: estimateExpiryDate(item.name),
    selected: true,
  };
}

function buildIngredientFromReview(item: ReviewIngredient): Ingredient {
  const days = getDaysLeft(item.expiryDate);
  const urgency = getUrgency(days);
  const count = Math.max(1, Math.floor(item.count));

  return {
    id: `${Date.now()}-${item.name}`,
    name: item.name.trim(),
    quantity: String(count),
    unit: "count",
    count,
    expiryDate: item.expiryDate,
    daysLeft: days,
    urgency,
    estimatedValue: 0,
    emoji: getIngredientEmoji(item.name),
    isShared: urgency === "red",
    autoShared: urgency === "red",
  };
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
  const [scanError, setScanError] = useState<string | null>(null);
  const [detectedNames, setDetectedNames] = useState<string[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewItems, setReviewItems] = useState<ReviewIngredient[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fillManualForm = (item: ReviewIngredient) => {
    setName(item.name);
    setQuantity(String(item.count));
    setUnit("count");
    setExpiryDate(item.expiryDate);
    setEstimatedValue("");
    setReviewOpen(false);
    setTab("manual");
  };

  const addBlankReviewItem = () => {
    setReviewItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        name: "",
        count: 1,
        expiryDate: estimateExpiryDate(""),
        selected: true,
      },
    ]);
  };

  const applyReviewedItems = async () => {
    const cleaned = reviewItems
      .filter((item) => item.selected)
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        count: Math.max(1, Math.floor(item.count)),
      }))
      .filter((item) => item.name.length > 0);

    if (cleaned.length === 0) {
      setScanError("Select at least one item with a name before saving.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setScanError(null);
    try {
      for (let i = 0; i < cleaned.length; i++) {
        const item = cleaned[i];
        await onAdd(buildIngredientFromReview(item), {
          stayOnAddTab: i < cleaned.length - 1,
        });
      }
      setDetectedNames(
        cleaned.map(
          (item) => `${item.count} ${item.name}${item.count > 1 ? "s" : ""}`
        )
      );
      setReviewOpen(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setSaveError("We couldn’t save the scanned items. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
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
      emoji: getIngredientEmoji(name),
      isShared: urgency === "red",
      autoShared: urgency === "red",
    };
    setSaving(true);
    setSaveError(null);
    try {
      await onAdd(newIngredient);
      setName("");
      setQuantity("");
      setExpiryDate("");
      setEstimatedValue("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setSaveError("We couldn’t save that pantry item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleScanImage = async (file: File) => {
    setScanError(null);
    setSaveError(null);
    setDetectedNames([]);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(createImagePreviewUrl(file));

    setScanning(true);
    try {
      const base64 = await fileToBase64(file);
      const detected = await fetchDetectedIngredients(base64);

      if (detected.length === 0) {
        setScanError(
          "No ingredients were detected. Try a clearer, well-lit grocery photo."
        );
        return;
      }

      setReviewItems(detected.map(detectedToReviewItem));
      setReviewOpen(true);
    } catch (error) {
      setScanError(
        error instanceof Error
          ? error.message
          : "Scan failed. Please check your connection and try again."
      );
    } finally {
      setScanning(false);
    }
  };

  const selectedReviewCount = reviewItems.filter((item) => item.selected).length;

  const inputClass =
    "w-full bg-transparent border-0 border-b border-stone-200 focus:border-stone-900 px-0 py-3 text-[15px] font-normal text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-0 transition-colors";

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      {reviewOpen && (
        <div className="fixed inset-0 z-[130] flex items-end justify-center bg-stone-900/40">
          <button
            type="button"
            aria-label="Close review"
            className="absolute inset-0 z-0"
            onClick={() => setReviewOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-t-[28px] shadow-2xl max-h-[88vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100">
              <div>
                <h2 className="font-display text-[22px] text-stone-900">Review scan</h2>
                <p className="text-[12px] text-stone-500 mt-0.5">
                  {reviewItems.length} detected · edit before saving
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewOpen(false)}
                className={`text-[13px] font-semibold text-stone-900 rounded-lg px-3 py-1.5 ${pressOutline}`}
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 pb-6 flex flex-col gap-4">
              {reviewItems.map((item) => {
                const days = item.expiryDate ? getDaysLeft(item.expiryDate) : null;
                const urgency =
                  days !== null ? getUrgency(days) : ("green" as UrgencyLevel);

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-3 flex flex-col gap-2.5 transition ${
                      item.selected
                        ? "border-stone-300 bg-stone-50/60"
                        : "border-stone-200 bg-white opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) =>
                          setReviewItems((prev) =>
                            prev.map((x) =>
                              x.id === item.id ? { ...x, selected: e.target.checked } : x
                            )
                          )
                        }
                        className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                        aria-label={`Include ${item.name || "item"}`}
                      />
                      <span className="text-[20px]" aria-hidden>
                        {getIngredientEmoji(item.name)}
                      </span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const nextName = e.target.value;
                          setReviewItems((prev) =>
                            prev.map((x) =>
                              x.id === item.id
                                ? {
                                    ...x,
                                    name: nextName,
                                    expiryDate: x.expiryDate || estimateExpiryDate(nextName),
                                  }
                                : x
                            )
                          );
                        }}
                        placeholder="Ingredient name"
                        className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-[14px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setReviewItems((prev) => prev.filter((x) => x.id !== item.id))
                        }
                        className={`text-stone-400 text-[18px] leading-none rounded-md px-1 ${pressOutline}`}
                        aria-label="Remove item"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-[78px_1fr] gap-2 items-end pl-[26px]">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.12em] text-stone-400 font-medium">
                          Qty
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.count}
                          onChange={(e) =>
                            setReviewItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id
                                  ? { ...x, count: Number(e.target.value) || 1 }
                                  : x
                              )
                            )
                          }
                          className="w-full border border-stone-300 rounded-xl px-2 py-2 text-[14px] text-stone-900 focus:outline-none focus:border-stone-900 text-center mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.12em] text-stone-400 font-medium">
                          Expires
                        </label>
                        <input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) =>
                            setReviewItems((prev) =>
                              prev.map((x) =>
                                x.id === item.id ? { ...x, expiryDate: e.target.value } : x
                              )
                            )
                          }
                          className="w-full border border-stone-300 rounded-xl px-3 py-2 text-[14px] text-stone-700 focus:outline-none focus:border-stone-900 mt-1"
                        />
                        {item.expiryDate && days !== null && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${urgencyDot[urgency]}`}
                            />
                            <span className={`text-[11px] font-medium ${urgencyText[urgency]}`}>
                              {days <= 0 ? "Expires today" : `${days} days left`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fillManualForm(item)}
                      className={`self-start ml-[26px] text-[11px] font-medium text-stone-500 underline-offset-2 hover:underline ${pressOutline}`}
                    >
                      Edit in full form
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addBlankReviewItem}
                className={`mt-1 py-2.5 rounded-full text-[12px] font-medium border border-stone-300 text-stone-700 ${pressOutline}`}
              >
                + Add missing item
              </button>
            </div>
            <div className="px-6 pb-6 pt-2 border-t border-stone-100 flex flex-col gap-2">
              {saveError && (
                <p className="text-[12px] text-red-600 text-center" role="alert">
                  {saveError}
                </p>
              )}
              <button
                type="button"
                onClick={applyReviewedItems}
                disabled={saving || selectedReviewCount === 0}
                className={`w-full py-3 rounded-full text-[13px] font-medium bg-stone-900 text-white disabled:bg-stone-200 disabled:text-stone-400 ${pressDark}`}
              >
                {saving
                  ? "Saving…"
                  : `Add ${selectedReviewCount} item${selectedReviewCount === 1 ? "" : "s"} to pantry`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="font-display text-[34px] leading-[1.1] tracking-[-0.01em] text-stone-900">
          Add to pantry.
        </h1>
      </div>

      <div className="grid grid-cols-2 bg-stone-100 rounded-full p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`rounded-full py-2 text-[12px] font-medium transition ${
            tab === "manual"
              ? `bg-white text-stone-900 shadow-sm ${pressOutline}`
              : "text-stone-500"
          }`}
        >
          Manual
        </button>
        <button
          type="button"
          onClick={() => setTab("scan")}
          className={`rounded-full py-2 text-[12px] font-medium transition ${
            tab === "scan"
              ? `bg-white text-stone-900 shadow-sm ${pressOutline}`
              : "text-stone-500"
          }`}
        >
          Scan
        </button>
      </div>

      {tab === "scan" ? (
        <div className="flex flex-col gap-4">
          <PhotoScannerCapture
            scanning={scanning}
            previewUrl={previewUrl}
            onImageSelected={handleScanImage}
            disabled={saving}
          />
          {success && (
            <p className="text-[12px] text-emerald-700 leading-relaxed text-center px-4">
              Added to pantry ✓
            </p>
          )}
          {detectedNames.length > 0 && !success && (
            <p className="text-[12px] text-emerald-700 leading-relaxed text-center px-4">
              Added to pantry: {detectedNames.join(", ")}
            </p>
          )}
          {(scanError || saveError) && (
            <p className="text-[12px] text-red-600 leading-relaxed text-center px-4" role="alert">
              {scanError ?? saveError}
            </p>
          )}
          <p className="text-[12px] text-stone-500 leading-relaxed text-center px-4">
            Snap or upload a grocery photo. AI detects ingredients, quantities, and
            estimated expiry — review and edit before saving.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {saveError && (
            <p className="text-[12px] text-red-600" role="alert">
              {saveError}
            </p>
          )}
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
                <span>{getIngredientEmoji(name)}</span>
                <span>
                  {getIngredientEmoji(name) !== "🥫"
                    ? "Recognized"
                    : "Will use generic icon"}
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
                className={`${inputClass} appearance-none cursor-pointer text-stone-700`}
              >
                {["count", "oz", "lbs", "kg", "g", "pint", "bag", "gallon", "cup", "bunch"].map(
                  (u) => (
                    <option key={u}>{u}</option>
                  )
                )}
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
              className={`${inputClass} text-stone-700`}
            />
            {expiryDate && (
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${urgencyDot[getUrgency(getDaysLeft(expiryDate))]}`}
                />
                <span
                  className={`text-[12px] font-medium ${urgencyText[getUrgency(getDaysLeft(expiryDate))]}`}
                >
                  {getDaysLeft(expiryDate) <= 0
                    ? "Expires today"
                    : `${getDaysLeft(expiryDate)} days left`}
                </span>
                {getUrgency(getDaysLeft(expiryDate)) === "red" && (
                  <span className="text-[11px] text-stone-400">· Will auto-share</span>
                )}
              </div>
            )}
          </div>

          {/* Value */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-medium">
              Estimated value
            </label>
            <div className="flex items-center gap-1 border-b border-stone-200">
              <span className="text-[15px] text-stone-400 pt-[1px]">$</span>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="flex-1 bg-transparent py-3 text-[15px] text-stone-900 placeholder-stone-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name || !expiryDate || saving}
            className={`w-full bg-stone-900 disabled:bg-stone-200 disabled:text-stone-400 disabled:active:scale-100 text-white font-medium py-3.5 rounded-full text-[13px] tracking-wide mt-2 ${pressDark}`}
          >
            {saving ? "Saving…" : success ? "Added ✓" : "Add to pantry"}
          </button>
        </div>
      )}
    </div>
  );
}
