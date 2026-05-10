/** Shared interactive feedback for buttons (tap / click). */
export const press =
  "select-none touch-manipulation transition-[transform,opacity,background-color,filter] duration-100 ease-out active:scale-[0.96] active:opacity-[0.88] motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:active:opacity-100";

export const pressFlat =
  `${press} active:bg-stone-200/90`;

export const pressOutline =
  `${press} active:bg-stone-100`;

export const pressDark =
  `${press} active:bg-stone-800 active:opacity-100`;
