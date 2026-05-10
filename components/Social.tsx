"use client";
import React, { useState } from "react";
import { FriendPost, Ingredient, UrgencyLevel } from "./types";

interface SocialProps {
  friendPosts: FriendPost[];
  mySharedIngredients: Ingredient[];
  onRequest: (id: string) => void;
}

const urgencyDot: Record<UrgencyLevel, string> = {
  red: "bg-red-500",
  yellow: "bg-amber-400",
  green: "bg-emerald-500",
};

const urgencyText: Record<UrgencyLevel, string> = {
  red: "text-red-600",
  yellow: "text-amber-600",
  green: "text-stone-500",
};

// Neutral avatar tints — not semantic, just visual variety
const avatarTints = [
  "bg-stone-100 text-stone-700",
  "bg-stone-200 text-stone-700",
  "bg-amber-50 text-amber-900",
  "bg-stone-50 text-stone-700",
];

export default function Social({
  friendPosts,
  mySharedIngredients,
  onRequest,
}: SocialProps) {
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [posts, setPosts] = useState(friendPosts);

  const handleRequest = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, requested: true } : p))
    );
    onRequest(id);
  };

  const urgentPosts = posts.filter((p) => p.urgency === "red");
  const otherPosts = posts.filter((p) => p.urgency !== "red");

  return (
    <div className="flex flex-col gap-7 px-6 pt-5 pb-2">
      {/* Header avatars */}
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center text-sm font-medium text-stone-600 border border-stone-200">
          SC
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
          Friends.
        </h1>
        <p className="text-[13px] text-stone-500 mt-3">
          Claim what's expiring or share your surplus.
        </p>
      </div>

      {/* Tab pills */}
      <div className="flex gap-2">
        {(["available", "mine"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-full text-[13px] font-medium transition-all border ${
                active
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-300"
              }`}
            >
              {t === "available" ? "From friends" : "My posts"}
            </button>
          );
        })}
      </div>

      {tab === "available" ? (
        <div className="flex flex-col gap-1">
          {/* Urgent section */}
          {urgentPosts.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <h2 className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-medium">
                  Expiring soon
                </h2>
              </div>
              <div className="flex flex-col gap-3 mb-4">
                {urgentPosts.map((post, i) => (
                  <FriendPostCard
                    key={post.id}
                    post={post}
                    avatarColor={avatarTints[i % avatarTints.length]}
                    onRequest={handleRequest}
                  />
                ))}
              </div>
            </>
          )}

          {otherPosts.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                <h2 className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-medium">
                  Surplus available
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {otherPosts.map((post, i) => (
                  <FriendPostCard
                    key={post.id}
                    post={post}
                    avatarColor={
                      avatarTints[(i + urgentPosts.length) % avatarTints.length]
                    }
                    onRequest={handleRequest}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="border border-stone-200 rounded-2xl px-4 py-3.5">
            <p className="text-[12px] text-stone-600 leading-relaxed">
              <span className="font-medium text-stone-900">Auto-share:</span>{" "}
              items expiring within 2 days appear here automatically. You can also share surplus manually from your pantry.
            </p>
          </div>

          {mySharedIngredients.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-stone-400">
              <span className="text-3xl opacity-50">🫙</span>
              <p className="text-[13px] font-medium text-stone-600">
                Nothing shared yet
              </p>
              <p className="text-[11px] text-center px-8 leading-relaxed">
                Items expiring in 2 days or less will appear here automatically.
              </p>
            </div>
          ) : (
            mySharedIngredients.map((ing, idx) => (
              <div
                key={ing.id}
                className={`flex items-center gap-4 py-3.5 ${
                  idx !== 0 ? "border-t border-stone-100" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {ing.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${urgencyDot[ing.urgency]}`}
                    />
                    <p className="text-[15px] text-stone-900 font-medium truncate">
                      {ing.name}
                    </p>
                  </div>
                  <p className="text-[12px] text-stone-400 mt-0.5 ml-3.5">
                    {ing.quantity} {ing.unit}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span
                    className={`text-[13px] tabular-nums font-medium ${urgencyText[ing.urgency]}`}
                  >
                    {ing.daysLeft <= 1 ? "Today" : `${ing.daysLeft}d`}
                  </span>
                  {ing.autoShared && (
                    <span className="text-[10px] text-stone-400 tracking-wide">
                      Auto
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function FriendPostCard({
  post,
  avatarColor,
  onRequest,
}: {
  post: FriendPost;
  avatarColor: string;
  onRequest: (id: string) => void;
}) {
  const urgencyDot: Record<UrgencyLevel, string> = {
    red: "bg-red-500",
    yellow: "bg-amber-400",
    green: "bg-emerald-500",
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      {/* Friend row */}
      <div className="flex items-center gap-3 mb-3.5">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-semibold ${avatarColor}`}
        >
          {post.friendInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-stone-900 truncate">
            {post.friendName}
          </p>
          <p className="text-[11px] text-stone-500">
            {post.isAutoShared ? "Sharing expiring item" : "Sharing surplus"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot[post.urgency]}`} />
          <span className="text-[11px] text-stone-600 tabular-nums">
            {post.daysLeft <= 1 ? "1 day" : `${post.daysLeft} days`}
          </span>
        </div>
      </div>

      {/* Item row */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{post.ingredientEmoji}</span>
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-stone-900 truncate">
              {post.ingredientName}
            </p>
            <p className="text-[11px] text-stone-400">{post.quantity}</p>
          </div>
        </div>
        <button
          onClick={() => onRequest(post.id)}
          disabled={post.requested}
          className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all active:scale-[0.97] flex-shrink-0 ${
            post.requested
              ? "bg-white text-stone-500 border border-stone-200"
              : "bg-stone-900 text-white"
          }`}
        >
          {post.requested ? "Requested ✓" : "Request"}
        </button>
      </div>
    </div>
  );
}
