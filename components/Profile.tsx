"use client";
import React, { useState } from "react";
import { UserProfile } from "../types";

interface ProfileProps {
  profile: UserProfile;
}

export default function Profile({ profile }: ProfileProps) {
  const [notifications, setNotifications] = useState(profile.notifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const notifColor: Record<string, string> = {
    warning: "bg-amber-50 border-amber-100",
    success: "bg-green-50 border-green-100",
    info: "bg-blue-50 border-blue-100",
  };
  const notifIcon: Record<string, string> = {
    warning: "⚠️",
    success: "✅",
    info: "ℹ️",
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Profile header */}
      <div className="bg-white rounded-3xl border border-stone-100 p-5 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-700 flex-shrink-0">
          {profile.initials}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stone-800">{profile.name}</h2>
          <p className="text-xs text-stone-400 mt-0.5">Scraps member · reducing waste daily 🌱</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <p className="text-2xl font-bold text-green-700">${profile.savedThisMonth}</p>
          <p className="text-xs text-green-600 mt-1 font-medium">Saved this month</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-2xl font-bold text-amber-600">{profile.ingredientsRescued}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">Ingredients rescued</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{profile.co2Saved} kg</p>
          <p className="text-xs text-blue-600 mt-1 font-medium">CO₂ saved</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-2xl font-bold text-purple-600">{profile.mealsCooked}</p>
          <p className="text-xs text-purple-600 mt-1 font-medium">Meals cooked</p>
        </div>
      </div>

      {/* Notifications section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-stone-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-green-600 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-opacity ${
                notifColor[notif.type]
              } ${notif.read ? "opacity-50" : ""}`}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{notifIcon[notif.type]}</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-stone-700">{notif.message}</p>
                <p className="text-[10px] text-stone-400 mt-1">{notif.time}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings footer */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        {[
          { icon: "🔔", label: "Notification preferences" },
          { icon: "👥", label: "Manage friends" },
          { icon: "🌿", label: "Environmental impact" },
          { icon: "⚙️", label: "Settings" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-50 last:border-0 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <span>{item.icon}</span>
            <p className="text-sm text-stone-700 font-medium flex-1">{item.label}</p>
            <span className="text-stone-300 text-xs">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}
