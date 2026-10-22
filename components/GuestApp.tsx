"use client";

import { useEffect, useRef, useState } from "react";
import AddIngredient from "./AddIngredient";
import PantryDashboard from "./PantryDashboard";
import Recipes from "./Recipes";
import { getDaysLeft, getUrgency } from "./ingredientUtils";
import type { Ingredient } from "./types";

const STORAGE_KEY = "scraps.guest.pantry.v1";

type Tab = "pantry" | "add" | "recipes" | "friends";

function refresh(item: Ingredient): Ingredient {
  const daysLeft = getDaysLeft(item.expiryDate);

  return {
    ...item,
    daysLeft,
    urgency: getUrgency(daysLeft),
    isShared: false,
    autoShared: false,
  };
}

function isIngredient(value: unknown): value is Ingredient {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    ["id", "name", "quantity", "unit", "expiryDate", "emoji"].every(
      (key) => typeof item[key] === "string"
    ) &&
    typeof item.count === "number" &&
    Number.isFinite(item.count) &&
    item.count > 0 &&
    typeof item.estimatedValue === "number" &&
    Number.isFinite(item.estimatedValue) &&
    Number.isFinite(Date.parse(item.expiryDate as string))
  );
}

export default function GuestApp({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<Tab>("pantry");
  const [items, setItems] = useState<Ingredient[]>([]);
  const itemsRef = useRef<Ingredient[]>([]);
  const storageLoaded = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];

      if (!Array.isArray(parsed) || !parsed.every(isIngredient)) {
        throw new Error("Invalid guest pantry");
      }

      itemsRef.current = parsed.map(refresh);
      setItems(itemsRef.current);
      storageLoaded.current = true;
    } catch {
      setError(
        "Could not read your guest pantry. Your saved data has not been changed. Please reload or try another browser."
      );
    }

    setReady(true);
  }, []);

  useEffect(() => {
    const updateDates = () => {
      itemsRef.current = itemsRef.current.map(refresh);
      setItems(itemsRef.current);
    };

    window.addEventListener("focus", updateDates);
    const timer = window.setInterval(updateDates, 60_000);

    return () => {
      window.removeEventListener("focus", updateDates);
      window.clearInterval(timer);
    };
  }, []);

  function save(next: Ingredient[]): boolean {
    if (!storageLoaded.current) {
      setError(
        "Reload the page before making changes. Your saved pantry could not be read."
      );
      return false;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      itemsRef.current = next;
      setItems(next);
      setError(null);
      return true;
    } catch {
      setError(
        "Your browser could not save this change. Enable site storage or free some browser storage and try again."
      );
      return false;
    }
  }

  async function add(
    item: Ingredient,
    options?: { stayOnAddTab?: boolean }
  ) {
    const next = [
      ...itemsRef.current,
      refresh({ ...item, id: crypto.randomUUID() }),
    ];

    if (!save(next)) {
      throw new Error("Could not save guest pantry.");
    }

    if (!options?.stayOnAddTab) {
      setTab("pantry");
    }
  }

  async function remove(id: string) {
    return save(itemsRef.current.filter((item) => item.id !== id));
  }

  async function update(
    id: string,
    changes: Partial<Ingredient>
  ) {
    const current = itemsRef.current.find((item) => item.id === id);

    if (!current) return false;

    if (changes.count !== undefined && changes.count <= 0) {
      return remove(id);
    }

    const next = { ...current, ...changes, id: current.id };

    if (changes.count !== undefined) {
      next.estimatedValue =
        (current.estimatedValue * changes.count) / current.count;
      next.quantity = String(changes.count);
    }

    return save(
      itemsRef.current.map((item) =>
        item.id === id ? refresh(next) : item
      )
    );
  }

  async function promptForAccount() {
    setTab("friends");
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "pantry", label: "Pantry" },
    { id: "recipes", label: "Cook" },
    { id: "add", label: "Add" },
    { id: "friends", label: "Friends" },
  ];

  return (
    <main className="min-h-screen bg-stone-200 p-4 font-sans text-stone-900">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");

        .font-display {
          font-family: "Playfair Display", Georgia, serif;
        }
      `}</style>

      <section className="mx-auto max-w-md overflow-hidden rounded-[28px] bg-white shadow-xl">
        <header className="border-b border-stone-200 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-[30px]">Scraps</h1>

            <button
              type="button"
              onClick={onExit}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
            >
              Sign in / Sign up
            </button>
          </div>

          <p className="mt-3 text-xs text-stone-600">
            Guest mode · Your pantry is saved only in this browser.
            Clearing browser data removes it. Guest items do not
            transfer to an account yet.
          </p>
        </header>

        <nav
          aria-label="Guest navigation"
          className="flex border-b border-stone-200 p-2"
        >
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`flex-1 rounded-full py-2 text-sm ${
                tab === id
                  ? "bg-stone-900 text-white"
                  : "text-stone-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <p role="alert" className="px-6 pt-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {tab === "pantry" && (
          <PantryDashboard
            ingredients={items}
            userFirstName="Guest"
            loading={!ready}
            error={null}
            saving={false}
            onRetry={() => window.location.reload()}
            onToggleShare={promptForAccount}
            onUpdateIngredient={update}
            onRemoveIngredient={remove}
          />
        )}

        {tab === "add" && ready && (
          <AddIngredient onAdd={add} />
        )}

        {ready && (
          <div hidden={tab !== "recipes"}>
            <Recipes
              pantryIngredients={items}
              onRequestIngredient={() => setTab("friends")}
            />
          </div>
        )}

        {tab === "friends" && (
          <div className="px-6 py-10 text-center">
            <h2 className="font-display text-2xl">
              Share with friends
            </h2>

            <p className="mt-3 text-sm text-stone-600">
              Sign in or create an account to add friends, share
              food, and claim community pantry items.
            </p>

            <button
              type="button"
              onClick={onExit}
              className="mt-5 rounded-full bg-stone-900 px-5 py-3 text-sm text-white"
            >
              Sign in / Sign up
            </button>

            <button
              type="button"
              onClick={() => setTab("pantry")}
              className="mt-3 block w-full py-2 text-sm text-stone-700"
            >
              Back to my pantry
            </button>
          </div>
        )}
      </section>
    </main>
  );
}