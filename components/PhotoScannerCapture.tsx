"use client";

import React, { useRef } from "react";
import { pressDark, pressOutline } from "./pressableStyles";

interface PhotoScannerCaptureProps {
  scanning: boolean;
  previewUrl: string | null;
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export default function PhotoScannerCapture({
  scanning,
  previewUrl,
  onImageSelected,
  disabled = false,
}: PhotoScannerCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    onImageSelected(file);
  };

  const busy = scanning || disabled;

  return (
    <div className="bg-stone-50 rounded-[22px] aspect-[4/3] flex flex-col items-center justify-center gap-4 border border-stone-200 overflow-hidden relative">
      {previewUrl && !scanning && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Grocery photo preview"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 px-6">
        {scanning ? (
          <>
            <div className="w-11 h-11 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-[14px] text-stone-800 font-medium tracking-wide">
                Scanning your groceries with AI…
              </p>
              <p className="text-[12px] text-stone-500 mt-1">
                Identifying ingredients and quantities
              </p>
            </div>
          </>
        ) : (
          <>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#57534e"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <circle cx="12" cy="13" r="3.5" />
              <path d="M9 6l1.5-2h3L15 6" />
            </svg>
            <p className="text-[13px] text-stone-500 text-center leading-relaxed">
              Point at your fridge,
              <br />
              pantry, or grocery cart.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full max-w-[280px]">
              <button
                type="button"
                disabled={busy}
                onClick={() => cameraInputRef.current?.click()}
                className={`flex-1 bg-stone-900 text-white px-5 py-2.5 rounded-full text-[13px] font-medium disabled:opacity-50 ${pressDark}`}
              >
                Take photo
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => uploadInputRef.current?.click()}
                className={`flex-1 bg-white text-stone-900 px-5 py-2.5 rounded-full text-[13px] font-medium border border-stone-300 disabled:opacity-50 ${pressOutline}`}
              >
                Upload photo
              </button>
            </div>
          </>
        )}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
