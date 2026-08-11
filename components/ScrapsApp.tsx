"use client";
import React, { useMemo, useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import PantryDashboard from "./PantryDashboard";
import AddIngredient from "./AddIngredient";
import Recipes from "./Recipes";
import Social from "./Social";
import Profile from "./Profile";
import NotificationsSheet from "./NotificationsSheet";
import EditProfileSheet from "./EditProfileSheet";
import AuthScreen from "./AuthScreen";
import CompleteProfileScreen from "./CompleteProfileScreen";
import { pressFlat } from "./pressableStyles";
import {
  Ingredient,
  IngredientExchangeRequest,
  Notification,
  UserProfile,
} from "./types";
import { getDaysLeft, getUrgency } from "./ingredientUtils";
import { initialsFromFullName } from "./profileInitials";

import { createClient } from "../lib/supabase/client";
import {
  ingredientToPantryInsert,
  ingredientToPantryUpdate,
  pantryRowToIngredient,
} from "../lib/pantryItems";
import type { Database } from "../lib/supabase/database.types";

type Tab = "pantry" | "add" | "recipes" | "social" | "profile";
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/* Cook (chef hat) and Add (+) are swapped vs. the original order */
const tabs: { id: Tab; label: string }[] = [
  { id: "pantry", label: "Pantry" },
  { id: "recipes", label: "Cook" },
  { id: "add", label: "Add" },
  { id: "social", label: "Friends" },
  { id: "profile", label: "Home" },
];

function profileHasRealName(row: ProfileRow | null): boolean {
  return Boolean(row?.first_name?.trim() && row?.last_name?.trim());
}

function toUserProfile(row: ProfileRow, email: string): UserProfile {
  const firstName = row.first_name!.trim();
  const lastName = row.last_name!.trim();
  return {
    firstName,
    lastName,
    initials: initialsFromFullName(`${firstName} ${lastName}`),
    email,
    savedThisMonth: 0,
    ingredientsRescued: 0,
    co2Saved: 0,
    mealsCooked: 0,
  };
}

// Monoline icons: 1.5 stroke, neutral, consistent geometry
function TabIcon({ id, active }: { id: Tab; active: boolean }) {
  const stroke = active ? "#0c0a09" : "#a8a29e";
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
      // Grocery basket + handle, pantry ingredients (no jar, no tab badge)
      return (
        <svg {...common}>
          <path d="M8 9V7.5a4 4 0 018 0V9" />
          <path d="M5 10h14l-1.5 10a2 2 0 01-2 1.5H8.5a2 2 0 01-2-1.5L5 10z" />
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
      // Fork & knife, "meals" / dining (readable at 22px)
      return (
        <svg {...common}>
          <path d="M8 4v15" />
          <path d="M6 4v4M8 4v4M10 4v4" />
          <path d="M17 4l5 15" />
          <path d="M17 4l3 4v7l-3 4" />
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
      // Settings / more
      return (
        <svg {...common}>
          <line x1="5" y1="7" x2="19" y2="7" />
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="5" y1="17" x2="19" y2="17" />
        </svg>
      );
  }
}

export default function ScrapsApp() {
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("pantry");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [pantryError, setPantryError] = useState<string | null>(null);
  const [savingPantry, setSavingPantry] = useState(false);
  const [pantryReloadKey, setPantryReloadKey] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [notifications] = useState<Notification[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<
    IngredientExchangeRequest[]
  >([]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;
      setSession(currentSession);
      setLoadingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingAuth(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    async function loadProfile() {
      if (!session) {
        setProfile(null);
        setLoadingProfile(false);
        setProfileError(null);
        return;
      }
      setLoadingProfile(true);
      setProfileError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();
      if (error) {
        console.error("Failed to load profile:", error);
        setProfileError("We couldn’t load your profile. Please refresh and try again.");
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoadingProfile(false);
    }

    void loadProfile();
  }, [session, supabase]);

  // RLS scopes this query to the authenticated user's user_id.
  useEffect(() => {
    async function loadPantry() {
      if (!session) {
        setIngredients([]);
        setLoadingPantry(false);
        return;
      }

      setLoadingPantry(true);
      setPantryError(null);
      const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .order("expires_on", { ascending: true });

      if (error) {
        console.error("Failed to load pantry:", error);
        setPantryError("We couldn’t load your pantry. Please try refreshing.");
        setLoadingPantry(false);
        return;
      }

      setIngredients((data ?? []).map(pantryRowToIngredient));
      setLoadingPantry(false);
    }

    loadPantry();
  }, [pantryReloadKey, session, supabase]);

  const handleAddIngredient = async (
    newIng: Ingredient,
    options?: { stayOnAddTab?: boolean }
  ) => {
    setSavingPantry(true);
    setPantryError(null);
    const { data, error } = await supabase
      .from("pantry_items")
      .insert(ingredientToPantryInsert(newIng))
      .select()
      .single();
    setSavingPantry(false);

    if (error || !data) {
      console.error("Failed to save ingredient:", error);
      setPantryError("We couldn’t save that pantry item. Please try again.");
      throw error ?? new Error("Pantry item was not returned after saving.");
    }

    setIngredients((prev) =>
      [...prev, pantryRowToIngredient(data)].sort((a, b) => a.daysLeft - b.daysLeft)
    );
    if (!options?.stayOnAddTab) {
      setTimeout(() => setActiveTab("pantry"), 1200);
    }
  };

  const handleRemoveIngredient = async (id: string) => {
    setSavingPantry(true);
    setPantryError(null);
    const { error } = await supabase.from("pantry_items").delete().eq("id", id);
    setSavingPantry(false);
    if (error) {
      console.error("Failed to delete ingredient:", error);
      setPantryError("We couldn’t remove that pantry item. Please try again.");
      return false;
    }
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    return true;
  };

  const handleToggleShare = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, isShared: !ing.isShared } : ing
      )
    );
  };

  const handleUpdateIngredient = async (
    id: string,
    updates: Partial<Ingredient>
  ) => {
    const current = ingredients.find((ingredient) => ingredient.id === id);
    if (!current) return false;
    if (updates.count !== undefined && updates.count <= 0) return handleRemoveIngredient(id);

    const next = { ...current, ...updates };
    if (updates.count !== undefined && current.count !== updates.count) {
      next.estimatedValue = current.count > 0
        ? current.estimatedValue * (updates.count / current.count)
        : current.estimatedValue;
    }
    if (updates.expiryDate !== undefined) {
      next.daysLeft = getDaysLeft(updates.expiryDate);
      next.urgency = getUrgency(next.daysLeft);
    }

    setSavingPantry(true);
    setPantryError(null);
    const { data, error } = await supabase
      .from("pantry_items")
      .update(ingredientToPantryUpdate(next))
      .eq("id", id)
      .select()
      .single();
    setSavingPantry(false);
    if (error || !data) {
      console.error("Failed to update ingredient:", error);
      setPantryError("We couldn’t update that pantry item. Please try again.");
      return false;
    }

    const saved = pantryRowToIngredient(data);
    setIngredients((prev) =>
      prev.map((ingredient) => ingredient.id === id ? saved : ingredient)
        .sort((a, b) => a.daysLeft - b.daysLeft)
    );
    return true;
  };

  const openNotifications = () => setNotificationsOpen(true);

  const saveProfileNames = async (next: { firstName: string; lastName: string }) => {
    if (!session) return false;
    const firstName = next.firstName.trim();
    const lastName = next.lastName.trim();
    if (!firstName || !lastName) return false;
  
    const { data, error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
      })
      .eq("id", session.user.id)
      .select()
      .single();
  
    if (error || !data) {
      console.error("Failed to save profile:", error);
      return false;
    }
    setProfile(data);
    return true;
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setPantryError("We couldn’t sign you out. Please try again.");
      return;
    }
    setIngredients([]);
    setProfile(null);
    setExchangeRequests([]);
    setNotificationsOpen(false);
    setProfileEditOpen(false);
    setActiveTab("pantry");
  };

  if (loadingAuth) {
    return (
      <main className="min-h-screen bg-stone-200 flex items-center justify-center font-sans">
        <p className="text-[13px] text-stone-600">Loading Scraps…</p>
      </main>
    );
  }

  if (!session) {
    return <AuthScreen supabase={supabase} />;
  }

  if (loadingProfile) {
    return (
      <main className="min-h-screen bg-stone-200 flex items-center justify-center font-sans">
        <p className="text-[13px] text-stone-600">Loading your profile…</p>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="min-h-screen bg-stone-200 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm rounded-[28px] bg-white border border-stone-300 shadow-2xl p-7 text-center">
          <p className="text-[13px] text-red-600" role="alert">{profileError}</p>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className={`mt-5 text-[13px] text-stone-600 ${pressFlat}`}
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  if (!profileHasRealName(profile)) {
    return (
      <CompleteProfileScreen
        email={session.user.email ?? ""}
        onSave={(firstName, lastName) =>
          saveProfileNames({ firstName, lastName })
        }
      />
    );
  }

  const userProfile = toUserProfile(profile!, session.user.email ?? "");
  const sharedIngredients = ingredients.filter((i) => i.isShared);
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const notifBadge = unreadNotifs > 0 ? (unreadNotifs > 9 ? "9+" : String(unreadNotifs)) : null;

  return (
    <>
      {/* Font loading: Playfair (display serif) + Inter (body sans) */}
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
        {/* Phone frame, fixed height so the tab bar stays at the bottom of the screen */}
        <div className="relative w-full max-w-sm bg-white rounded-[44px] border border-stone-300 overflow-hidden shadow-2xl flex flex-col h-[812px] max-h-[calc(100vh-48px)]">
          <NotificationsSheet
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            notifications={notifications}
            onMarkAllRead={() => {}}
            onMarkRead={() => {}}
          />
          <EditProfileSheet
            key={
              profileEditOpen
                ? `open-${userProfile.firstName}-${userProfile.lastName}`
                : "closed"
            }
            open={profileEditOpen}
            onClose={() => setProfileEditOpen(false)}
            firstName={userProfile.firstName}
            lastName={userProfile.lastName}
            onSave={saveProfileNames}
          />
          {/* iPhone-style chrome: island + nav row (avatar · centered title · mail) */}
          <header className="shrink-0 bg-white">
            <div className="flex justify-center pt-3 pb-2" aria-hidden>
              <div className="h-[31px] w-[126px] rounded-[20px] bg-stone-900 shadow-inner shadow-black/15" />
            </div>
            <div className="flex items-center min-h-[44px] px-4 pb-3 pt-0.5">
              <div className="w-11 shrink-0 flex justify-start items-center">
                <button
                  type="button"
                  onClick={() => setProfileEditOpen(true)}
                  className={`w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 border border-stone-200 ${pressFlat}`}
                  aria-label="Edit profile"
                >
                  {userProfile.initials}
                </button>
              </div>
              <h1 className="flex-1 min-w-0 text-center font-display text-[30px] font-semibold tracking-[-0.02em] text-stone-900 leading-snug px-2">
                Scraps
              </h1>
              <div className="w-11 shrink-0 flex justify-end items-center">
                <button
                  type="button"
                  onClick={openNotifications}
                  className={`relative w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-800 border border-stone-200/80 ${pressFlat}`}
                  aria-label={
                    unreadNotifs > 0
                      ? `Notifications, ${unreadNotifs} unread`
                      : "Notifications"
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 8.5 6.5a2 2 0 0 0 2.5 0L21 7" />
                  </svg>
                  {notifBadge !== null && (
                    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-[5px] rounded-full bg-red-500 text-white text-[10px] font-bold leading-none flex items-center justify-center tabular-nums ring-2 ring-white">
                      {notifBadge}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Screen content, scrolls; nav stays pinned to the frame bottom */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain pb-[88px]">
            {activeTab === "pantry" && (
              <PantryDashboard
                ingredients={ingredients}
                userFirstName={userProfile.firstName}
                loading={loadingPantry}
                error={pantryError}
                saving={savingPantry}
                onRetry={() => setPantryReloadKey((current) => current + 1)}
                onToggleShare={handleToggleShare}
                onUpdateIngredient={handleUpdateIngredient}
                onRemoveIngredient={handleRemoveIngredient}
              />
            )}
            {activeTab === "add" && (
              <AddIngredient onAdd={handleAddIngredient} />
            )}
            <div className={activeTab === "recipes" ? "block" : "hidden"}>
              <Recipes pantryIngredients={ingredients} />
            </div>
            {activeTab === "social" && (
              <Social
                friendPosts={[]}
                mySharedIngredients={sharedIngredients}
                exchangeRequests={exchangeRequests}
                setExchangeRequests={setExchangeRequests}
              />
            )}
            {activeTab === "profile" && (
              <Profile
                profile={userProfile}
                onEditProfile={() => setProfileEditOpen(true)}
                onSignOut={handleSignOut}
              />
            )}
          </div>

          {/* Bottom nav, flat 5 tabs, monoline icons, hairline top border */}
          <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-100">
            <div className="flex items-center px-2 pt-2.5 pb-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl ${pressFlat}`}
                    aria-label={tab.label}
                  >
                    <TabIcon id={tab.id} active={isActive} />
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
