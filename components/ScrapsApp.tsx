"use client";
import React, { useState } from "react";
import PantryDashboard from "./PantryDashboard";
import AddIngredient from "./AddIngredient";
import Recipes from "./Recipes";
import Social from "./Social";
import Profile from "./Profile";
import { Ingredient } from "./types";
import {
  mockIngredients,
  mockRecipes,
  mockFriendPosts,
  mockProfile,
} from "./mockData";

type Tab = "pantry" | "add" | "recipes" | "social" | "profile";

const tabs: { id: Tab; label: string }[] = [
  { id: "pantry", label: "Pantry" },
  { id: "add", label: "Add" },
  { id: "recipes", label: "Cook" },
  { id: "social", label: "Friends" },
  { id: "profile", label: "You" },
];

// Monoline icons — 1.5 stroke, neutral, consistent geometry
function TabIcon({ id, active }: { id: Tab; active: boolean }) {
  const stroke = active ? "#0c0a09" : "#a8a29e";
  const fill = active ? "#0c0a09" : "none";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (id) {
    case "pantry":
      // Jar / pantry container
      return (
        <svg {...common}>
          <path d="M7 4h10l-1 3H8L7 4z" fill={active ? "#0c0a09" : "none"} />
          <rect x="6" y="7" width="12" height="13" rx="2" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      );
    case "add":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "recipes":
      // Heart (favorite recipes — matches image 1 aesthetic)
      return (
        <svg {...common} fill={fill}>
          <path
            d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
            stroke={stroke}
          />
        </svg>
      );
    case "social":
      // Two people
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3" />
          <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
          <circle cx="17" cy="8" r="2.5" />
          <path d="M15 14c2.5 0 5 1.5 5 4" />
        </svg>
      );
    case "profile":
      // List / menu (matches image 1 list icon)
      return (
        <svg {...common}>
          <circle cx="5" cy="7" r="0.6" fill={stroke} />
          <circle cx="5" cy="12" r="0.6" fill={stroke} />
          <circle cx="5" cy="17" r="0.6" fill={stroke} />
          <line x1="9" y1="7" x2="20" y2="7" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="17" x2="20" y2="17" />
        </svg>
      );
  }
}

export default function ScrapsApp() {
  const [activeTab, setActiveTab] = useState<Tab>("pantry");
  const [ingredients, setIngredients] = useState<Ingredient[]>(mockIngredients);

  const handleAddIngredient = (newIng: Ingredient) => {
    setIngredients((prev) => {
      const updated = [newIng, ...prev];
      return updated.sort((a, b) => a.daysLeft - b.daysLeft);
    });
    setTimeout(() => setActiveTab("pantry"), 1200);
  };

  const handleToggleShare = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, isShared: !ing.isShared } : ing
      )
    );
  };

  const sharedIngredients = ingredients.filter((i) => i.isShared);
  const unreadNotifs = mockProfile.notifications.filter((n) => !n.read).length;
  const urgentCount = ingredients.filter((i) => i.urgency === "red").length;

  return (
    <>
      {/* Font loading — Playfair (display serif) + Inter (body sans) */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");
        .font-display {
          font-family: "Playfair Display", Georgia, serif;
          font-feature-settings: "ss01";
        }
        .font-sans-i {
          font-family: "Inter", system-ui, sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-stone-200 flex items-start justify-center py-6 px-4 font-sans-i">
        {/* Phone frame — pure white interior */}
        <div
          className="relative w-full max-w-sm bg-white rounded-[44px] border border-stone-300 overflow-hidden shadow-2xl flex flex-col"
          style={{ minHeight: 800 }}
        >
          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pt-3 pb-1">
            <span className="text-[12px] font-semibold text-stone-900 tabular-nums">
              9:41
            </span>
            <div className="flex items-center gap-[3px]">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
              <span className="text-[12px] font-semibold tracking-tight text-stone-900 lowercase">
                scraps
              </span>
            </div>
            <span className="text-[10px] text-stone-400 tracking-widest">
              ●●●
            </span>
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto pb-24">
            {activeTab === "pantry" && (
              <PantryDashboard
                ingredients={ingredients}
                onToggleShare={handleToggleShare}
              />
            )}
            {activeTab === "add" && (
              <AddIngredient onAdd={handleAddIngredient} />
            )}
            {activeTab === "recipes" && <Recipes recipes={mockRecipes} />}
            {activeTab === "social" && (
              <Social
                friendPosts={mockFriendPosts}
                mySharedIngredients={sharedIngredients}
                onRequest={(id) => console.log("Requested:", id)}
              />
            )}
            {activeTab === "profile" && <Profile profile={mockProfile} />}
          </div>

          {/* Bottom nav — flat 5 tabs, monoline icons, hairline top border */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-100">
            <div className="flex items-center px-2 pt-2.5 pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const badge =
                  tab.id === "profile" && unreadNotifs > 0
                    ? unreadNotifs
                    : tab.id === "pantry" && urgentCount > 0
                    ? urgentCount
                    : null;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-1.5"
                    aria-label={tab.label}
                  >
                    <div className="relative">
                      <TabIcon id={tab.id} active={isActive} />
                      {badge !== null && (
                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-semibold tabular-nums w-[15px] h-[15px] rounded-full flex items-center justify-center">
                          {badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Home indicator */}
            <div className="flex justify-center pb-2">
              <div className="w-32 h-[3px] rounded-full bg-stone-900/80" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
