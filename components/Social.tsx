"use client";
import React, { useState } from "react";
import type { FriendPost, Ingredient } from "./types";
import { pressDark, pressOutline } from "./pressableStyles";

export type FriendConnection = {
  id: string; otherId: string; name: string; handle: string | null;
  status: string; incoming: boolean;
};
export type ShareRequest = {
  id: string; listingId: string; direction: "incoming" | "outgoing";
  personName: string; ingredientName: string; ingredientEmoji: string;
  quantity: string; status: string;
};

type Tab = "feed" | "mine" | "requests" | "friends";

export default function Social({
  myHandle, friendPosts, pantryItems, shareRequests, connections, loading, error,
  onSetHandle, onInvite, onRespond, onToggleShare, onRequestItem,
  onResolveRequest, onRefresh,
}: {
  myHandle: string | null;
  friendPosts: FriendPost[];
  pantryItems: Ingredient[];
  shareRequests: ShareRequest[];
  connections: FriendConnection[];
  loading: boolean;
  error: string | null;
  onSetHandle: (handle: string) => Promise<boolean>;
  onInvite: (handle: string) => Promise<boolean>;
  onRespond: (id: string, status: "accepted" | "declined") => Promise<void>;
  onToggleShare: (id: string) => Promise<void>;
  onRequestItem: (listingId: string) => Promise<boolean>;
  onResolveRequest: (requestId: string, resolution: "accepted" | "declined" | "cancelled") => Promise<void>;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<Tab>("feed");
  const [handle, setHandle] = useState("");
  const [invite, setInvite] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const mine = friendPosts.filter(p => p.friendName === "You");
  const available = friendPosts.filter(p => p.friendName !== "You");
  const unshared = pantryItems.filter(i => !i.isShared && i.daysLeft >= 0);
  const pendingListings = new Set(shareRequests.filter(r => r.direction === "outgoing" && r.status === "pending").map(r => r.listingId));
  const run = async (key: string, task: () => Promise<unknown>) => {
    setBusy(key);
    try { await task(); } finally { setBusy(null); }
  };
  const submit = async (kind: "handle" | "invite") => {
    await run(kind, async () => {
      const ok = kind === "handle" ? await onSetHandle(handle) : await onInvite(invite);
      setMessage(ok ? kind === "handle" ? "Handle saved." : "Invitation sent." :
        kind === "handle" ? "Could not save that handle. Try another one." : "Could not send invitation. Check the handle or existing invitations.");
      if (ok) { setHandle(""); setInvite(""); }
    });
  };
  return (
    <div className="flex flex-col gap-5 px-6 pt-5 pb-8 text-stone-900">
      <header>
        <h1 className="font-display text-[34px] leading-tight text-stone-900">Community Pantry.</h1>
        <p className="text-[13px] text-stone-600 mt-2">Give good food a new home with friends.</p>
      </header>
      <nav aria-label="Community Pantry" className="flex gap-2 overflow-x-auto -mx-6 px-6 pb-1">
        {([ ["feed", "Available"], ["mine", "My posts"], ["requests", "Requests"], ["friends", "Friends"] ] as const).map(([id,label]) =>
          <button key={id} type="button" onClick={() => { setTab(id); onRefresh(); }}
            className={`shrink-0 px-4 py-2.5 rounded-full text-[12px] font-medium border ${tab === id ? `bg-stone-900 border-stone-900 text-white ${pressDark}` : `bg-white border-stone-300 text-stone-900 ${pressOutline}`}`}>{label}{id === "requests" && shareRequests.some(r => r.direction === "incoming" && r.status === "pending") ? " •" : ""}</button>)}
      </nav>
      {error && <p role="alert" className="text-sm text-red-700">{error} <button type="button" onClick={onRefresh} className="underline">Retry</button></p>}
      {loading && <p className="text-sm text-stone-600">Updating…</p>}

      {tab === "feed" && <section className="space-y-3">
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-stone-600">Available from friends</h2>
        {available.length === 0 && !loading && <Empty>Nothing shared yet. Connect with friends to see their posts.</Empty>}
        {available.map(post => <article key={post.id} className="border border-stone-200 rounded-2xl p-4 bg-white">
          <div className="flex justify-between gap-2 text-[12px] text-stone-600"><span>{post.friendName}</span><span>{post.daysLeft <= 0 ? "Use today" : `${post.daysLeft} days left`}</span></div>
          <div className="flex items-center gap-3 mt-3"><span className="text-2xl" aria-hidden>{post.ingredientEmoji}</span><div className="flex-1 min-w-0"><h3 className="font-medium text-[16px] text-stone-900 truncate">{post.ingredientName}</h3><p className="text-[12px] text-stone-600">{post.quantity}</p></div></div>
          <button type="button" disabled={busy !== null || pendingListings.has(post.id)}
            onClick={() => void run(post.id, () => onRequestItem(post.id))}
            className={`mt-4 w-full rounded-full py-2.5 text-[13px] font-medium ${pendingListings.has(post.id) ? "bg-stone-100 text-stone-700" : `bg-stone-900 text-white ${pressDark}`} disabled:opacity-60`}>{pendingListings.has(post.id) ? "Requested" : busy === post.id ? "Requesting…" : "Request item"}</button>
        </article>)}
      </section>}

      {tab === "mine" && <section className="space-y-5">
        <div className="rounded-2xl bg-stone-100 p-4">
          <h2 className="font-display text-[20px]">Share from your pantry</h2>
          <p className="text-[12px] text-stone-600 mt-1">Only friends you accept can see your posts.</p>
          {unshared.length === 0 ? <p className="text-[12px] text-stone-600 mt-4">No unshared pantry items available.</p> :
            <div className="mt-3 space-y-2 max-h-44 overflow-y-auto">{unshared.map(i => <div key={i.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
              <span>{i.emoji}</span><span className="min-w-0 flex-1 truncate text-[13px]">{i.name}</span><button type="button" disabled={busy !== null} onClick={() => void run(i.id, () => onToggleShare(i.id))} className="text-[12px] font-semibold underline disabled:opacity-50">Share</button>
            </div>)}</div>}
        </div>
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-stone-600">Your active posts</h2>
        {mine.length === 0 && !loading && <Empty>No posts yet. Share something from your pantry above.</Empty>}
        {mine.map(p => <div key={p.id} className="border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">{p.ingredientEmoji}</span><div className="flex-1 min-w-0"><p className="font-medium truncate">{p.ingredientName}</p><p className="text-[12px] text-stone-600">{p.quantity} · Shared with friends</p></div>
          <button type="button" disabled={busy !== null} onClick={() => { const item = pantryItems.find(i => i.id === p.pantryItemId); if (item) void run(p.id, () => onToggleShare(item.id)); }} className="text-[12px] underline font-medium disabled:opacity-50">Unshare</button>
        </div>)}
      </section>}

      {tab === "requests" && <section className="space-y-3">
        <p className="text-[12px] text-stone-600">Accepting a request claims the item and removes it from everyone’s available feed.</p>
        {shareRequests.length === 0 && !loading && <Empty>No requests yet.</Empty>}
        {shareRequests.map(r => <article key={r.id} className="border border-stone-200 rounded-2xl p-4">
          <p className="text-[12px] text-stone-600">{r.direction === "incoming" ? `${r.personName} requested your item` : `Requested from ${r.personName}`}</p>
          <p className="font-medium mt-2">{r.ingredientEmoji} {r.ingredientName} <span className="text-[12px] font-normal text-stone-600">· {r.quantity}</span></p>
          {r.status === "pending" ? <div className="flex gap-2 mt-4">
            {r.direction === "incoming" ? <><button disabled={busy !== null} onClick={() => void run(r.id, () => onResolveRequest(r.id, "declined"))} className="flex-1 py-2 rounded-full border border-stone-300 text-[12px]">Decline</button><button disabled={busy !== null} onClick={() => void run(r.id, () => onResolveRequest(r.id, "accepted"))} className="flex-1 py-2 rounded-full bg-stone-900 text-white text-[12px]">Accept & claim</button></> :
            <button disabled={busy !== null} onClick={() => void run(r.id, () => onResolveRequest(r.id, "cancelled"))} className="text-[12px] underline">Cancel request</button>}
          </div> : <p className="mt-3 text-[12px] font-semibold capitalize text-stone-700">{r.status === "accepted" ? r.direction === "incoming" ? "Claimed by friend" : "Claim accepted" : r.status}</p>}
        </article>)}
      </section>}

      {tab === "friends" && <section className="space-y-5">
        <div className="border border-stone-200 rounded-2xl p-4 space-y-3">
          <p className="text-[13px] font-medium">Your handle: {myHandle ? `@${myHandle}` : "Set one to let friends find you"}</p>
          {!myHandle && <form onSubmit={e => { e.preventDefault(); void submit("handle"); }} className="flex gap-2">
            <input aria-label="Choose a handle" value={handle} onChange={e => setHandle(e.target.value.toLowerCase())} placeholder="3–24 letters, numbers, _" pattern="[a-z0-9_]{3,24}" required className="min-w-0 flex-1 border rounded-lg p-2 text-sm text-stone-900 placeholder:text-stone-500" />
            <button disabled={busy !== null} className="bg-stone-900 text-white rounded-lg px-3 text-xs">Save</button>
          </form>}
        </div>
        <form onSubmit={e => { e.preventDefault(); void submit("invite"); }} className="flex gap-2">
          <input aria-label="Friend's handle" value={invite} onChange={e => setInvite(e.target.value.toLowerCase())} placeholder="Friend’s handle" pattern="[a-z0-9_]{3,24}" required className="min-w-0 flex-1 border border-stone-300 rounded-lg p-2 text-sm text-stone-900 placeholder:text-stone-500" />
          <button disabled={busy !== null} className="bg-stone-900 text-white rounded-lg px-3 text-xs">Invite</button>
        </form>
        {message && <p role="status" className="text-xs text-stone-700">{message}</p>}
        {connections.length === 0 && !loading && <Empty>No friends or invitations yet.</Empty>}
        {connections.map(c => <div key={c.id} className="border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-2">
          <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-stone-600">{c.handle ? `@${c.handle} · ` : ""}{c.status === "accepted" ? "Friend" : c.incoming ? "Invited you" : "Invitation sent"}</p></div>
          {c.incoming && c.status === "pending" && <div className="flex gap-2 text-xs"><button onClick={() => void onRespond(c.id, "declined")} className="underline">Decline</button><button onClick={() => void onRespond(c.id, "accepted")} className="rounded-full bg-stone-900 text-white px-3 py-2">Accept</button></div>}
        </div>)}
      </section>}
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-stone-600 py-8 text-center">{children}</p>;
}
