import { store } from "@/config/store";
import { getProduct, pairs as catalogPairs } from "@/content/catalog";
import type { CartLine, Pair, Product } from "./types";

export interface PricedLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export interface CartTotals {
  lines: PricedLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  freeDelivery: { threshold: number; remaining: number; unlocked: boolean; progress: number };
}

export interface PricingOptions {
  lookup?: (id: string) => Product | undefined;
  pairs?: readonly Pair[];
  pairDiscount?: number;
  freeDeliveryOver?: number;
}

/**
 * Prices a cart. Pure and deterministic so the browser and the order API
 * always agree; the API runs it again on the server so a client can't
 * change what it pays. Unknown products and bad quantities are dropped,
 * duplicate lines are merged, and all amounts are whole RWF.
 */
export function priceCart(cart: readonly CartLine[], options: PricingOptions = {}): CartTotals {
  const {
    lookup = getProduct,
    pairs = catalogPairs,
    pairDiscount = store.pairDiscount,
    freeDeliveryOver = store.delivery.freeOver,
  } = options;

  const quantities = new Map<string, number>();
  for (const { productId, quantity } of cart) {
    if (!Number.isInteger(quantity) || quantity < 1 || !lookup(productId)) continue;
    quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
  }

  const lines: PricedLine[] = [];
  let subtotal = 0;
  let itemCount = 0;
  for (const [productId, quantity] of quantities) {
    const product = lookup(productId)!;
    const lineTotal = product.price * quantity;
    lines.push({ product, quantity, lineTotal });
    subtotal += lineTotal;
    itemCount += quantity;
  }

  let discount = 0;
  for (const pair of pairs) {
    const [a, b] = pair.products.map(lookup);
    if (!a || !b) continue;
    const sets = Math.min(quantities.get(a.id) ?? 0, quantities.get(b.id) ?? 0);
    discount += Math.round(sets * (a.price + b.price) * pairDiscount);
  }

  const total = subtotal - discount;
  const remaining = Math.max(0, freeDeliveryOver - total);
  return {
    lines,
    itemCount,
    subtotal,
    discount,
    total,
    freeDelivery: {
      threshold: freeDeliveryOver,
      remaining,
      unlocked: freeDeliveryOver > 0 && remaining === 0,
      progress: freeDeliveryOver > 0 ? Math.min(1, total / freeDeliveryOver) : 0,
    },
  };
}

/** Price of a pair bought together, and what it saves. */
export function pairPrice(a: Product, b: Product, rate: number = store.pairDiscount) {
  const full = a.price + b.price;
  const saving = Math.round(full * rate);
  return { full, saving, price: full - saving };
}
