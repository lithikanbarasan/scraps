"use client";
import React, { useState } from "react";
import { UserProfile } from "./types";

interface ProfileProps {
  profile: UserProfile;
}

export default function Profile({ profile }: ProfileProps) {
  const [notifications, setNotifications] = useState(profile.notifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Notifications: minimal — small dot indicates unread, type indicated by glyph not color
  const notifGlyph: Record<string, string> = {
    warning: "!",
    success: "✓",
    info: "i",
  };

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      {/* Header avatars */}
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 border border-stone-200">
          {profile.initials}
        </div>
        <button className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="12" r="1.5" fill="#0c0a09" />
            <circle cx="12" cy="12" r="1.5" fill="#0c0a09" />
            <circle cx="18" cy="12" r="1.5" fill="#0c0a09" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div>
        <h1 className="font-display text-[34px] leading-[1.1] tracking-[-0.01em] text-stone-900">
          Hi, {profile.name.split(" ")[0]}.
        </h1>
        <p className="text-[13px] text-stone-500 mt-3">
          Reducing waste daily.
        </p>
      </div>

      {/* Big stat — savings highlight, serif */}
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

      {/* Three stat row — all neutral */}
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
            <span className="text-[12px] font-sans-i font-medium text-stone-400 ml-0.5">kg</span>
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

      {/* Notifications */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[20px] text-stone-900 tracking-tight">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="text-[12px] text-stone-500 tabular-nums">
                ({unreadCount})
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[12px] text-stone-500 underline underline-offset-2"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex flex-col">
          {notifications.map((notif, idx) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3.5 py-3.5 transition-opacity ${
                idx !== 0 ? "border-t border-stone-100" : ""
              } ${notif.read ? "opacity-50" : ""}`}
            >
              <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[11px] font-semibold text-stone-700 flex-shrink-0 mt-0.5">
                {notifGlyph[notif.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-stone-800 leading-snug">
                  {notif.message}
                </p>
                <p className="text-[11px] text-stone-400 mt-1">{notif.time}</p>
              </div>
              {!notif.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-stone-900 flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings menu */}
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
            className="flex items-center justify-between w-full py-3.5 border-b border-stone-100 last:border-0 group"
          >
            <p className="text-[14px] text-stone-800 group-hover:text-stone-900 transition-colors">
              {item.label}
            </p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
