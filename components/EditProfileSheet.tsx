"use client";
import React, { useEffect, useMemo, useState } from "react";
import { pressDark, pressOutline } from "./pressableStyles";
import { initialsFromFullName } from "./profileInitials";

export default function EditProfileSheet({
  open,
  onClose,
  name,
  fallbackInitials,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  fallbackInitials: string;
  onSave: (next: { name: string; initials: string }) => void;
}) {
  const [draftName, setDraftName] = useState(name);

  useEffect(() => {
    if (!open) return;
    setDraftName(name);
  }, [open, name]);

  const previewInitials = useMemo(() => {
    const computed = initialsFromFullName(draftName);
    return computed || fallbackInitials;
  }, [draftName, fallbackInitials]);

  if (!open) return null;

  const save = () => {
    const n = draftName.trim() || name;
    const ini = initialsFromFullName(n) || fallbackInitials;
    onSave({ name: n, initials: ini });
    onClose();
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-stone-200 focus:border-stone-900 px-0 py-3 text-[15px] text-stone-900 placeholder-stone-300 focus:outline-none focus:ring-0 transition-colors";

  return (
    <div className="fixed inset-0 z-[128] flex items-end justify-center bg-stone-900/40">
      <button
        type="button"
        aria-label="Close edit profile"
        className="absolute inset-0 z-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-t-[28px] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-100 flex-shrink-0">
          <h2 className="font-display text-[22px] text-stone-900">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            className={`text-[13px] font-semibold text-stone-900 rounded-lg px-3 py-1.5 ${pressOutline}`}
          >
            Cancel
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 pb-8 flex flex-col gap-5">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">
              Display name
            </span>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className={inputClass}
              autoComplete="name"
              placeholder="Your name"
            />
          </label>

          <div className="flex items-center gap-4 pt-1">
            <div
              className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-lg font-semibold text-stone-600 border border-stone-200 flex-shrink-0"
              aria-hidden
            >
              {previewInitials}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">
                Avatar initials
              </p>
              <p className="text-[13px] text-stone-600 mt-1 leading-snug">
                Taken from your first and last name.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            className={`mt-2 w-full py-3 rounded-full text-[14px] font-semibold bg-stone-900 text-white ${pressDark}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
