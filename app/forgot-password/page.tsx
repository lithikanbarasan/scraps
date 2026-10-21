"use client";

import { useMemo, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      );

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("Could not send the email. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-200 flex items-center justify-center p-4 text-stone-900 font-sans">
      <section className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-xl">
        <h1 className="font-display text-[34px] text-stone-900">Forgot password?</h1>

        {sent ? (
          <p className="mt-5 text-sm" role="status">
            If an account exists for that email, you’ll receive a
            password reset link. Check your inbox and spam folder.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <p className="text-sm">
              Enter your account email and we’ll send a reset link.
            </p>

            <label className="flex flex-col gap-2 text-sm">
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <a href="/" className="mt-5 block text-sm underline">
          Back to sign in
        </a>
      </section>
    </main>
  );
}