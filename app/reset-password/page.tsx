"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const params = new URLSearchParams(window.location.search);

        if (params.has("error")) return;

        const { data, error } = await supabase.auth.getUser();

        if (active) {
          setValid(!error && Boolean(data.user));
        }
      } catch {
        if (active) setValid(false);
      } finally {
        if (active) setChecking(false);
      }
    }

    void checkSession();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      setDone(true);
    } catch {
      setError("Could not finish the reset. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-200 flex items-center justify-center p-4 text-stone-900">
      <section className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-xl">
        <h1 className="text-2xl font-semibold">Reset password</h1>

        {checking ? (
          <p className="mt-5 text-sm">Checking your reset link…</p>
        ) : done ? (
          <div className="mt-5">
            <p role="status" className="text-sm">
              Your password has been updated.
            </p>
            <a href="/" className="mt-4 block text-sm underline">
              Continue to Scraps
            </a>
          </div>
        ) : !valid ? (
          <div className="mt-5">
            <p role="alert" className="text-sm">
              This reset link is invalid or expired. Request another
              and open it in the same browser you used to request it.
            </p>
            <a
              href="/forgot-password"
              className="mt-4 block text-sm underline"
            >
              Request a new link
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-stone-300 p-3"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="rounded-lg border border-stone-300 p-3"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              disabled={busy}
              className="rounded-full bg-stone-900 p-3 text-white disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}