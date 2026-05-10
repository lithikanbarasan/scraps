"use client";
import React from "react";
import { UserProfile } from "./types";
import { pressOutline } from "./pressableStyles";

interface ProfileProps {
  profile: UserProfile;
}

export default function Profile({ profile }: ProfileProps) {
  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      <div>
        <h1 className="font-display text-[34px] leading-[1.1] tracking-[-0.01em] text-stone-900">
          Hi, {profile.name.split(" ")[0]}.
        </h1>
        <p className="text-[13px] text-stone-500 mt-3">
          Reducing waste daily.
        </p>
      </div>

      <div className="border-b border-stone-200 pb-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-medium">
          Saved this month
        </p>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="font-display text-[56px] leading-none tracking-[-0.02em] text-stone-900 tabular-nums">
            ${profile.savedThisMonth}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 -mt-2">
        <div className="border border-stone-200 rounded-2xl p-4">
          <p className="font-display text-[22px] leading-none text-stone-900 tabular-nums">
            {profile.ingredientsRescued}
          </p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mt-2 leading-tight">
            Items rescued
          </p>
        </div>
        <div className="border border-stone-200 rounded-2xl p-4">
          <p className="font-display text-[22px] leading-none text-stone-900 tabular-nums">
            {profile.co2Saved}
            <span className="text-[12px] font-sans-i font-medium text-stone-400 ml-0.5">
              kg
            </span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mt-2 leading-tight">
            CO₂ saved
          </p>
        </div>
        <div className="border border-stone-200 rounded-2xl p-4">
          <p className="font-display text-[22px] leading-none text-stone-900 tabular-nums">
            {profile.mealsCooked}
          </p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mt-2 leading-tight">
            Meals cooked
          </p>
        </div>
      </div>

      <div className="border-t border-stone-200 pt-2">
        {[
          { label: "Notification preferences" },
          { label: "Manage friends" },
          { label: "Environmental impact" },
          { label: "Settings" },
          { label: "Sign out" },
        ].map((item, i) => (
          <button
            key={i}
            type="button"
            className={`flex items-center justify-between w-full py-3.5 border-b border-stone-100 last:border-0 rounded-lg -mx-1 px-1 ${pressOutline}`}
          >
            <p className="text-[14px] text-stone-800 text-left">{item.label}</p>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8a29e"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
