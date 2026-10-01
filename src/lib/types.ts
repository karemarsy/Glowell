export type ProductKind = "skincare" | "vitamin";

/** Colours for the product's backdrop gradient and the text/buttons on top of it. */
export interface Palette {
  from: string;
  to: string;
  ink: string;
  onInk: string;
}

/** Drawn, animated artwork. Each variant carries only what that shape needs. */
export type ProductArt =
  | { shape: "dropper"; glass: string }
  | { shape: "pump"; glass: string }
  | { shape: "jar"; cream?: string }
  | { shape: "tube"; tube: string }
  | { shape: "capsules"; capsule: readonly [string, string] }
  | { shape: "softgels" };

export interface Product {
  id: string;
  slug: string;
  name: string;
  kind: ProductKind;
  /** Two lines printed on the drawn label. */
  label: readonly [string, string];
  format: string;
  size: string;
  /** Whole Rwandan francs. */
  price: number;
  tagline: string;
  ingredients: string;
  howToUse: string;
  palette: Palette;
  art: ProductArt;
  /** Shown in the homepage hero carousel. */
  featured?: boolean;
  /** Optional photo (path under /public). Replaces the drawn artwork. */
  image?: string;
}

export interface Pair {
  id: string;
  products: readonly [string, string];
  title: string;
  text: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}
