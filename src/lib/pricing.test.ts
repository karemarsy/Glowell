import { describe, expect, it } from "vitest";
import { pairPrice, priceCart } from "./pricing";
import type { Pair, Product } from "./types";

const product = (id: string, price: number): Product => ({
  id,
  slug: id,
  name: id,
  kind: "skincare",
  label: [id, id],
  format: "",
  size: "",
  price,
  tagline: "",
  ingredients: "",
  howToUse: "",
  palette: { from: "#000000", to: "#000000", ink: "#ffffff", onInk: "#000000" },
  art: { shape: "jar" },
});

const catalog = new Map([product("a", 10_000), product("b", 5_000), product("c", 3_333)].map((p) => [p.id, p]));
const pairs: Pair[] = [{ id: "ab", products: ["a", "b"], title: "", text: "" }];
const opts = { lookup: (id: string) => catalog.get(id), pairs, pairDiscount: 0.15, freeDeliveryOver: 30_000 };

describe("priceCart", () => {
  it("sums lines and counts items", () => {
    const t = priceCart([{ productId: "a", quantity: 2 }, { productId: "c", quantity: 1 }], opts);
    expect(t.subtotal).toBe(23_333);
    expect(t.itemCount).toBe(3);
    expect(t.discount).toBe(0);
    expect(t.total).toBe(23_333);
  });

  it("discounts each complete pair once", () => {
    const t = priceCart([{ productId: "a", quantity: 3 }, { productId: "b", quantity: 2 }], opts);
    // two complete pairs: 2 * 15,000 * 15%
    expect(t.discount).toBe(4_500);
    expect(t.total).toBe(40_000 - 4_500);
  });

  it("merges duplicate lines and ignores unknown products and bad quantities", () => {
    const t = priceCart(
      [
        { productId: "a", quantity: 1 },
        { productId: "a", quantity: 1 },
        { productId: "ghost", quantity: 4 },
        { productId: "b", quantity: 0 },
        { productId: "c", quantity: 1.5 },
      ],
      opts,
    );
    expect(t.lines).toHaveLength(1);
    expect(t.lines[0]).toMatchObject({ quantity: 2, lineTotal: 20_000 });
  });

  it("tracks free delivery progress", () => {
    expect(priceCart([{ productId: "a", quantity: 1 }], opts).freeDelivery).toMatchObject({
      remaining: 20_000,
      unlocked: false,
      progress: 1 / 3,
    });
    expect(priceCart([{ productId: "a", quantity: 3 }], opts).freeDelivery.unlocked).toBe(true);
  });

  it("returns whole francs", () => {
    const t = priceCart([{ productId: "c", quantity: 1 }], { ...opts, pairs: [{ id: "x", products: ["c", "c"], title: "", text: "" }] });
    expect(Number.isInteger(t.discount)).toBe(true);
  });
});

describe("pairPrice", () => {
  it("applies the pair discount", () => {
    expect(pairPrice(catalog.get("a")!, catalog.get("b")!, 0.15)).toEqual({ full: 15_000, saving: 2_250, price: 12_750 });
  });
});
