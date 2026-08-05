"use client";

import React, { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { pressDark, pressOutline } from "./pressableStyles";

type Mode = "signIn" | "signUp";

export default function AuthScreen({
  supabase,
}: {
  supabase: SupabaseClient<Database>;
}) {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatus(null);

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    if (mode === "signUp" && (!normalizedFirstName || !normalizedLastName)) {
      setError("Enter both your first and last name.");
      setSubmitting(false);
      return;
    }

    const result =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: normalizedFirstName,
                last_name: normalizedLastName,
              },
            },
          });

    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signUp" && !result.data.session) {
      setStatus("Check your email to confirm your account, then sign in.");
    }
  };

  return (
    <main className="min-h-screen bg-stone-200 flex items-center justify-center p-4 font-sans">
      <section className="w-full max-w-sm rounded-[28px] bg-white border border-stone-300 shadow-2xl p-7">
        <h1 className="font-display text-[34px] text-stone-900">Scraps</h1>
        <p className="text-[13px] text-stone-500 mt-2">
          {mode === "signIn" ? "Sign in to your pantry." : "Create your pantry account."}
        </p>

        <form className="mt-7 flex flex-col gap-5" onSubmit={submit}>
          {mode === "signUp" && (
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-b border-stone-300 py-2 text-stone-900 outline-none focus:border-stone-900"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">Password</span>
            <input
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-b border-stone-300 py-2 text-stone-900 outline-none focus:border-stone-900"
            />
          </label>

          {error && <p className="text-[12px] text-red-600" role="alert">{error}</p>}
          {status && <p className="text-[12px] text-emerald-700">{status}</p>}

          <button
            type="submit"
            disabled={submitting}
            className={`rounded-full bg-stone-900 py-3 text-[13px] font-medium text-white disabled:bg-stone-300 ${pressDark}`}
          >
            {submitting ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === "signIn" ? "signUp" : "signIn"));
            setError(null);
            setStatus(null);
          }}
          className={`mt-5 w-full rounded-lg py-2 text-[12px] text-stone-600 ${pressOutline}`}
        >
          {mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
