import type { CSSProperties } from "react";

/** Typed helper for CSS custom properties in inline styles. */
export const cssVars = (vars: Record<`--${string}`, string | number>): CSSProperties => vars as CSSProperties;
