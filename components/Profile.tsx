"use client";

import React, { useState } from "react";
import type { UserProfile } from "./types";
import { pressDark, pressOutline } from "./pressableStyles";

export default function Profile({
  profile,
  onEditProfile,
  onSignOut,
}: {
  profile: UserProfile;
  onEditProfile: () => void;
  onSignOut: () => Promise<void>;
}) {
  const [signOutOpen, setSignOutOpen] = useState(false);

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      <div>
        <h1 className="font-display text-[34px] leading-[1.1] tracking-[-0.01em] text-stone-900">
          Hi, {profile.firstName}.
        </h1>
        <p className="text-[13px] text-stone-500 mt-3 leading-relaxed">
          Your account and pantry progress.
        </p>
      </div>

      <section className="border border-stone-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-sm font-semibold text-stone-600 border border-stone-200">
          {profile.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-stone-900 truncate">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-[12px] text-stone-500 truncate mt-0.5">{profile.email}</p>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className={`rounded-lg px-3 py-1.5 text-[12px] font-medium text-stone-700 ${pressOutline}`}
        >
          Edit
        </button>
      </section>

      <div className="border-b border-stone-200 pb-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-medium">
          Saved this month
        </p>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-display text-[56px] leading-none tracking-[-0.02em] text-stone-900 tabular-nums">
            ${profile.savedThisMonth}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-stone-500">Savings tracking is not connected yet.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 -mt-2">
        <Stat label="Items rescued" value={profile.ingredientsRescued} />
        <Stat label="CO₂ saved" value={`${profile.co2Saved} kg`} />
        <Stat label="Meals cooked" value={profile.mealsCooked} />
      </div>

      <div className="border border-stone-200 rounded-2xl p-4">
        <p className="text-[12px] font-medium text-stone-900">Impact tracking is coming later</p>
        <p className="text-[11px] leading-relaxed text-stone-500 mt-1">
          These values stay at zero until saved-food, cooking, and impact tracking are connected.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSignOutOpen(true)}
        className={`text-[13px] text-stone-500 text-center py-2 ${pressOutline} rounded-lg`}
      >
        Sign out
      </button>

      {signOutOpen && (
        <div className="fixed inset-0 z-[131] flex items-end justify-center bg-stone-900/40">
          <button type="button" aria-label="Dismiss" className="absolute inset-0 z-0" onClick={() => setSignOutOpen(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-t-[28px] shadow-2xl px-6 pt-6 pb-8 flex flex-col gap-4">
            <h2 className="font-display text-[22px] text-stone-900">Sign out?</h2>
            <p className="text-[13px] text-stone-600 leading-relaxed">You&apos;ll leave this session on this device. Your pantry remains saved to your account.</p>
            <div className="flex flex-col gap-2 mt-2">
              <button type="button" onClick={() => setSignOutOpen(false)} className={`w-full py-3 rounded-full text-[14px] font-semibold border border-stone-300 bg-white text-stone-900 ${pressOutline}`}>Stay signed in</button>
              <button
                type="button"
                onClick={() => void onSignOut()}
                className={`w-full py-3 rounded-full text-[14px] font-semibold bg-red-600 text-white ${pressDark}`}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-stone-200 rounded-2xl p-4">
      <p className="font-display text-[22px] leading-none text-stone-900 tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mt-2 leading-tight">{label}</p>
    </div>
  );
}
