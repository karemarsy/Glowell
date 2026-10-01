"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductScene } from "@/components/art/ProductArt";
import { AddToBag } from "@/components/shop/AddToBag";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cssVars } from "@/lib/css-vars";
import { formatRwf } from "@/lib/money";
import type { Product, ProductKind } from "@/lib/types";
import styles from "./Collection.module.css";

type Filter = "all" | ProductKind;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "skincare", label: "Skincare" },
  { value: "vitamin", label: "Vitamins" },
];

export function Collection({ products }: { products: readonly Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

  // Cards come alive only while they're mostly on screen.
  useEffect(() => {
    const cards = rail.current?.querySelectorAll<HTMLElement>("[data-card]");
    if (!cards || reduce) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.intersectionRatio >= 0.55) e.target.classList.add("play");
          else if (!e.isIntersecting) e.target.classList.remove("play");
        }),
      { threshold: [0, 0.55] },
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [reduce]);

  // Gentle parallax inside each card as the rail scrolls.
  useEffect(() => {
    const el = rail.current;
    if (!el || reduce) return;
    let queued = false;
    const update = () => {
      queued = false;
      const mid = window.innerWidth / 2;
      el.querySelectorAll<HTMLElement>("[data-parallax]").forEach((art) => {
        const r = art.parentElement!.getBoundingClientRect();
        if (r.width === 0) return;
        const d = Math.max(-36, Math.min(36, (r.left + r.width / 2 - mid) * -0.07));
        art.style.transform = `translate3d(${d.toFixed(1)}px,0,0)`;
      });
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    el.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      el.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, [reduce]);

  function applyFilter(next: Filter) {
    setFilter(next);
    rail.current?.scrollTo({ left: 0, behavior });
  }

  function step(direction: 1 | -1) {
    const card = rail.current?.querySelector<HTMLElement>("[data-card]:not([data-hidden])");
    if (card) rail.current?.scrollBy({ left: direction * (card.offsetWidth + 20), behavior });
  }

  return (
    <section id="shop" className={styles.section} aria-labelledby="shop-title">
      <div className={styles.head}>
        <div>
          <h2 id="shop-title">The collection</h2>
          <p>Skincare formulas and vitamins, made to work as one routine.</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.segmented} role="group" aria-label="Filter products">
            {FILTERS.map((f) => (
              <button key={f.value} aria-pressed={filter === f.value} onClick={() => applyFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className={styles.arrows}>
            <button className={styles.arrow} onClick={() => step(-1)} aria-label="Previous products">
              ←
            </button>
            <button className={styles.arrow} onClick={() => step(1)} aria-label="Next products">
              →
            </button>
          </div>
        </div>
      </div>

      <div ref={rail} className={styles.rail} tabIndex={0} aria-label="Products, scroll sideways">
        {products.map((p) => {
          const hidden = filter !== "all" && p.kind !== filter;
          return (
            <article
              key={p.id}
              data-card
              data-hidden={hidden || undefined}
              inert={hidden}
              className={`${styles.card} ${hidden ? styles.out : ""}`}
              style={cssVars({ "--b1": p.palette.from, "--b2": p.palette.to, "--fg": p.palette.ink, "--on": p.palette.onInk })}
            >
              <div className={styles.cardInner}>
                <div className={styles.visual}>
                  <div className="art" data-parallax>
                    <ProductScene product={p} uid={`card-${p.id}`} />
                  </div>
                </div>
                <div className={styles.body}>
                  <div className={styles.title}>
                    <h3>
                      <Link href={`/products/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <span className={styles.price}>{formatRwf(p.price)}</span>
                  </div>
                  <p className={styles.meta}>
                    {p.format}, {p.size}
                  </p>
                  <p className={styles.tagline}>{p.tagline}</p>
                  <dl>
                    <div>
                      <dt>Key ingredients</dt>
                      <dd>{p.ingredients}</dd>
                    </div>
                    <div>
                      <dt>How to use</dt>
                      <dd>{p.howToUse}</dd>
                    </div>
                  </dl>
                  <AddToBag productIds={[p.id]} className="btn btn-block" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
