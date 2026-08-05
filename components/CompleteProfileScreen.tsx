"use client";

import React, { useState } from "react";
import { pressDark } from "./pressableStyles";

export default function CompleteProfileScreen({
  email,
  onSave,
}: {
  email: string;
  onSave: (firstName: string, lastName: string) => Promise<boolean>;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) {
      setError("Enter both your first and last name.");
      return;
    }
    setSaving(true);
    setError(null);
    const saved = await onSave(first, last);
    if (!saved) setError("We couldn’t save your profile. Please try again.");
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-stone-200 flex items-center justify-center p-4 font-sans">
      <section className="w-full max-w-sm rounded-[28px] bg-white border border-stone-300 shadow-2xl p-7">
        <h1 className="font-display text-[34px] text-stone-900">Complete your profile</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-stone-500">
          Add your name before using your pantry. Signed in as {email}.
        </p>
        <form className="mt-7 flex flex-col gap-5" onSubmit={submit}>
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">First name</span>
            <input
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="border-b border-stone-300 py-2 text-stone-900 outline-none focus:border-stone-900"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">Last name</span>
            <input
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="border-b border-stone-300 py-2 text-stone-900 outline-none focus:border-stone-900"
            />
          </label>
          {error && <p className="text-[12px] text-red-600" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className={`rounded-full bg-stone-900 py-3 text-[13px] font-medium text-white disabled:bg-stone-300 ${pressDark}`}
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
    </main>
  );
}
