const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** 35000 -> "35,000 RWF" — the way Rwandan shops usually write prices. */
export function formatRwf(value: number): string {
  return `${amount.format(Math.round(value))} RWF`;
}
