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

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "pantry", label: "Pantry", icon: "🧊" },
  { id: "recipes", label: "Recipes", icon: "🍳" },
  { id: "add", label: "Add", icon: "➕" },
  { id: "social", label: "Friends", icon: "👥" },
  { id: "profile", label: "Profile", icon: "👤" },
];

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
    <div className="min-h-screen bg-stone-100 flex items-start justify-center py-6 px-4">
      {/* Phone frame */}
      <div className="w-full max-w-sm bg-[#F9F9F6] rounded-[40px] border border-stone-200 overflow-hidden shadow-xl flex flex-col" style={{ minHeight: 780 }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#F9F9F6]">
          <span className="text-xs font-semibold text-stone-500">9:41</span>
          <span className="text-base font-bold text-green-700 tracking-tight">scraps</span>
          <span className="text-xs text-stone-400">●●●</span>
        </div>

        {/* Screen content */}
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 72 }}>
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

        {/* Bottom nav */}
        <div className="absolute bottom-0 left-0 right-0 max-w-sm mx-auto">
          <div className="bg-white border-t border-stone-100 flex items-center rounded-b-[40px] px-2 py-2">
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
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition-all ${
                    isActive ? "bg-green-50" : ""
                  }`}
                >
                  <div className="relative">
                    <span className="text-xl">{tab.icon}</span>
                    {badge !== null && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      isActive ? "text-green-700" : "text-stone-400"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
