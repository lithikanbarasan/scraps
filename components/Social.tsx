"use client";
import React, { useState } from "react";
import { FriendPost, Ingredient, UrgencyLevel } from "../types";

interface SocialProps {
  friendPosts: FriendPost[];
  mySharedIngredients: Ingredient[];
  onRequest: (id: string) => void;
}

const urgencyBadge: Record<UrgencyLevel, string> = {
  red: "bg-red-100 text-red-700",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-green-100 text-green-700",
};

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

export default function Social({ friendPosts, mySharedIngredients, onRequest }: SocialProps) {
  const [tab, setTab] = useState<"available" | "mine">("available");
  const [posts, setPosts] = useState(friendPosts);

  const handleRequest = (id: string) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, requested: true } : p));
    onRequest(id);
  };

  const urgentPosts = posts.filter((p) => p.urgency === "red");
  const otherPosts = posts.filter((p) => p.urgency !== "red");

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800">Friends Board</h2>
        <p className="text-sm text-stone-400 mt-0.5">Request expiring ingredients or surplus items</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-stone-100 rounded-2xl p-1 gap-1">
        <button
          onClick={() => setTab("available")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === "available" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
          }`}
        >
          From Friends
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === "mine" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
          }`}
        >
          My Posts
        </button>
      </div>

      {tab === "available" ? (
        <div className="flex flex-col gap-3">
          {/* Urgent section */}
          {urgentPosts.length > 0 && (
            <>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1">
                🔴 Expiring soon — act fast
              </p>
              {urgentPosts.map((post, i) => (
                <FriendPostCard
                  key={post.id}
                  post={post}
                  avatarColor={avatarColors[i % avatarColors.length]}
                  onRequest={handleRequest}
                />
              ))}
              {otherPosts.length > 0 && (
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-2">
                  Surplus available
                </p>
              )}
            </>
          )}

          {otherPosts.map((post, i) => (
            <FriendPostCard
              key={post.id}
              post={post}
              avatarColor={avatarColors[(i + urgentPosts.length) % avatarColors.length]}
              onRequest={handleRequest}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs text-amber-700 font-medium">
            💡 Red items are auto-posted. You can also manually share surplus items from your pantry.
          </div>
          {mySharedIngredients.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3 text-stone-400">
              <span className="text-4xl">🫙</span>
              <p className="text-sm font-medium">Nothing shared yet</p>
              <p className="text-xs text-center">Items expiring in 2 days or less will appear here automatically</p>
            </div>
          ) : (
            mySharedIngredients.map((ing) => (
              <div key={ing.id} className="bg-white rounded-2xl border border-stone-100 p-3 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-stone-100 flex-shrink-0">
                  {ing.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-stone-800">{ing.name}</p>
                  <p className="text-xs text-stone-400">{ing.quantity} {ing.unit}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${urgencyBadge[ing.urgency]}`}>
                    {ing.daysLeft <= 1 ? "Expires today!" : `${ing.daysLeft}d left`}
                  </span>
                  {ing.autoShared && (
                    <span className="text-[10px] text-stone-400">Auto-posted</span>
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
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-3.5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor}`}>
          {post.friendInitials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-stone-800">{post.friendName}</p>
          <p className="text-xs text-stone-400">
            {post.isAutoShared ? "⚠️ Expiring soon" : "🎁 Sharing surplus"}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${urgencyBadge[post.urgency]}`}>
          {post.daysLeft <= 1 ? "1 day" : `${post.daysLeft} days`}
        </span>
      </div>

      <div className="flex items-center justify-between bg-stone-50 rounded-xl p-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{post.ingredientEmoji}</span>
          <div>
            <p className="text-sm font-medium text-stone-800">{post.ingredientName}</p>
            <p className="text-xs text-stone-400">{post.quantity}</p>
          </div>
        </div>
        <button
          onClick={() => onRequest(post.id)}
          disabled={post.requested}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
            post.requested
              ? "bg-green-100 text-green-700"
              : "bg-green-600 text-white"
          }`}
        >
          {post.requested ? "✓ Requested" : "Request"}
        </button>
      </div>
    </div>
  );
}
