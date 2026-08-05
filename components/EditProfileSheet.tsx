"use client";

import React, { useState } from "react";
import { pressDark, pressOutline } from "./pressableStyles";
import { initialsFromFullName } from "./profileInitials";

export default function EditProfileSheet({
  open,
  onClose,
  firstName,
  lastName,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  firstName: string;
  lastName: string;
  onSave: (next: { firstName: string; lastName: string }) => Promise<boolean>;
}) {
  const [draftFirstName, setDraftFirstName] = useState(firstName);
  const [draftLastName, setDraftLastName] = useState(lastName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const save = async () => {
    const nextFirstName = draftFirstName.trim();
    const nextLastName = draftLastName.trim();
    if (!nextFirstName || !nextLastName) {
      setError("Enter both your first and last name.");
      return;
    }
    setSaving(true);
    setError(null);
    const saved = await onSave({ firstName: nextFirstName, lastName: nextLastName });
    setSaving(false);
    if (saved) onClose();
    else setError("We couldn’t save your profile. Please try again.");
  };

  const initials = initialsFromFullName(`${draftFirstName} ${draftLastName}`);
  const inputClass = "w-full bg-transparent border-0 border-b border-stone-200 focus:border-stone-900 px-0 py-3 text-[15px] text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-0 transition-colors";

  return (
    <div className="fixed inset-0 z-[128] flex items-end justify-center bg-stone-900/40">
      <button type="button" aria-label="Close edit profile" className="absolute inset-0 z-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-t-[28px] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100 flex-shrink-0">
          <h2 className="font-display text-[22px] text-stone-900">Edit profile</h2>
          <button type="button" onClick={onClose} className={`text-[13px] font-semibold text-stone-900 rounded-lg px-3 py-1.5 ${pressOutline}`}>Cancel</button>
        </div>
        <div className="overflow-y-auto px-6 py-5 pb-8 flex flex-col gap-5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">First name</span>
            <input type="text" autoComplete="given-name" value={draftFirstName} onChange={(event) => setDraftFirstName(event.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">Last name</span>
            <input type="text" autoComplete="family-name" value={draftLastName} onChange={(event) => setDraftLastName(event.target.value)} className={inputClass} />
          </label>
          <div className="flex items-center gap-4 pt-1">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-lg font-semibold text-stone-600 border border-stone-200 flex-shrink-0" aria-hidden>{initials}</div>
            <div><p className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">Avatar initials</p><p className="text-[13px] text-stone-600 mt-1 leading-snug">Taken from your first and last name.</p></div>
          </div>
          {error && <p className="text-[12px] text-red-600" role="alert">{error}</p>}
          <button type="button" onClick={save} disabled={saving} className={`mt-2 w-full py-3 rounded-full text-[14px] font-semibold bg-stone-900 text-white disabled:bg-stone-300 ${pressDark}`}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
