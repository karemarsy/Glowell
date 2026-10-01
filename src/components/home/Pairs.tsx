"use client";

import { useEffect, useRef } from "react";
import { ProductThumb } from "@/components/art/ProductArt";
import { AddToBag } from "@/components/shop/AddToBag";
import { store } from "@/config/store";
import { cssVars } from "@/lib/css-vars";
import { formatRwf } from "@/lib/money";
import { pairPrice } from "@/lib/pricing";
import type { Pair, Product } from "@/lib/types";
import styles from "./Pairs.module.css";

export interface ResolvedPair extends Pair {
  items: readonly [Product, Product];
}

export function Pairs({ pairs }: { pairs: readonly ResolvedPair[] }) {
  const list = useRef<HTMLDivElement>(null);

  // Tiles wipe in the first time each pair scrolls into view.
  useEffect(() => {
    const rows = list.current?.querySelectorAll("[data-pair]");
    if (!rows) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.in!);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  if (pairs.length === 0) return null;
  const percent = Math.round(store.pairDiscount * 100);

  return (
    <section id="pairs" className={styles.section} aria-labelledby="pairs-title">
      <h2 id="pairs-title">Better together</h2>
      <p className={styles.lede}>
        Pair a topical formula with the vitamin that supports the same goal from within.
        {percent > 0 && ` Save ${percent}% on every pair.`}
      </p>
      <div ref={list}>
        {pairs.map((pair) => {
          const [a, b] = pair.items;
          const { full, saving, price } = pairPrice(a, b);
          return (
            <div key={pair.id} data-pair className={styles.pair}>
              <div className={styles.tiles}>
                {pair.items.map((p) => (
                  <div key={p.id} className={styles.tile} style={cssVars({ "--b1": p.palette.from, "--b2": p.palette.to })}>
                    <ProductThumb product={p} uid={`pair-${pair.id}-${p.id}`} />
                  </div>
                ))}
                <span className={styles.plus} aria-hidden="true">
                  +
                </span>
              </div>
              <div className={styles.copy}>
                <h3>{pair.title}</h3>
                <p>{pair.text}</p>
                <p className={styles.items}>
                  {a.name}, {a.size} and {b.name}, {b.size}
                </p>
                <div className={styles.price}>
                  <span>{formatRwf(price)}</span>
                  {saving > 0 && (
                    <>
                      <s>{formatRwf(full)}</s>
                      <small>Save {formatRwf(saving)}</small>
                    </>
                  )}
                </div>
                <AddToBag productIds={[a.id, b.id]} label="Add both to bag" message="Added the pair to your bag" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
