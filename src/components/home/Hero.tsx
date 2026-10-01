"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductScene } from "@/components/art/ProductArt";
import { AddToBag } from "@/components/shop/AddToBag";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cssVars } from "@/lib/css-vars";
import { formatRwf } from "@/lib/money";
import type { Product, ProductKind } from "@/lib/types";
import styles from "./Hero.module.css";

const SLIDE_MS = 6000;
/** Wait for the scene to slide in before its product starts animating. */
const PLAY_DELAY_MS = 700;
const SPOT_SWAP_MS = 340;
const GROUPS: { kind: ProductKind; label: string }[] = [
  { kind: "skincare", label: "Skincare" },
  { kind: "vitamin", label: "Vitamins" },
];

export function Hero({ products }: { products: readonly Product[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [shown, setShown] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const activeRef = useRef(0);

  const hero = useRef<HTMLElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // Intro: the inline script in <head> adds .intro before paint; drop it now.
  useEffect(() => {
    const root = document.documentElement;
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        root.classList.add("introrun");
        root.classList.remove("intro");
      });
    });
    const t = setTimeout(() => root.classList.remove("introrun"), 2600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  // Each slide change: crossfade backdrops, swap the copy, start the motion.
  useEffect(() => {
    const play = setTimeout(() => setPlaying(active), reduce ? 0 : PLAY_DELAY_MS);
    const swap = setTimeout(
      () => {
        setShown(active);
        setSwapping(false);
      },
      reduce ? 0 : SPOT_SWAP_MS,
    );
    const fade = setTimeout(() => setPrevious(null), 1400);
    return () => [play, swap, fade].forEach(clearTimeout);
  }, [active, reduce]);

  const go = useCallback((target: number) => {
    const current = activeRef.current;
    if (target === current) return;
    activeRef.current = target;
    setPrevious(current);
    setSwapping(true);
    setActive(target);
  }, []);

  useEffect(() => {
    if (!autoplay || reduce || products.length < 2) return;
    const id = setInterval(() => {
      if (!document.hidden) go((activeRef.current + 1) % products.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [autoplay, reduce, products.length, go]);

  // Studio light follows the pointer; the stage drifts the other way.
  useEffect(() => {
    const el = hero.current;
    if (!el || reduce) return;
    let tx = el.clientWidth * 0.68,
      ty = el.clientHeight * 0.42,
      gx = tx,
      gy = ty,
      px = 0,
      py = 0,
      sx = 0,
      sy = 0,
      visible = true,
      raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      px = (e.clientX / window.innerWidth - 0.5) * 2;
      py = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const leave = () => {
      tx = el.clientWidth * 0.68;
      ty = el.clientHeight * 0.42;
      px = py = 0;
    };
    const io = new IntersectionObserver(([entry]) => (visible = !!entry?.isIntersecting));
    io.observe(el);
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      gx += (tx - gx) * 0.06;
      gy += (ty - gy) * 0.06;
      sx += (px - sx) * 0.05;
      sy += (py - sy) * 0.05;
      glow.current?.style.setProperty("transform", `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`);
      stage.current?.style.setProperty("transform", `translate3d(${(sx * -16).toFixed(1)}px,${(sy * -10).toFixed(1)}px,0)`);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reduce]);

  const current = products[active]!;
  const spot = products[shown]!;

  return (
    <section ref={hero} className={styles.hero} style={cssVars({ "--fg": current.palette.ink, "--on": current.palette.onInk })}>
      <div className={styles.backdrops} aria-hidden="true">
        {products.map((p, i) => (
          <div
            key={p.id}
            className={`${styles.backdrop} ${i === active || i === previous ? styles.on : ""}`}
            style={{
              zIndex: i === active ? 2 : 1,
              background: `radial-gradient(90% 80% at 68% 46%, ${p.palette.from}, ${p.palette.to} 78%)`,
            }}
          />
        ))}
      </div>
      <div className={styles.vignette} aria-hidden="true" />
      <div ref={glow} className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <h1 className={styles.headline} aria-label="Glow, inside and out.">
          <span className={styles.line} aria-hidden="true">
            <span>Glow, inside</span>
          </span>
          <span className={styles.line} aria-hidden="true">
            <span>and out.</span>
          </span>
        </h1>

        <div className={styles.stage} aria-hidden="true">
          <div ref={stage} className={styles.stageInner}>
            {products.map((p, i) => (
              <div key={p.id} className={`${styles.scene} ${i === active ? styles.on : ""} ${i === playing ? "play" : ""}`}>
                <ProductScene product={p} uid={`hero-${p.id}`} priority={i === 0} />
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.spot} ${swapping ? styles.swapping : ""}`} aria-live="polite">
          <h2 className={styles.spotName}>{spot.name}</h2>
          <p className={styles.spotMeta}>
            {spot.format}, {spot.size}
          </p>
          <p className={styles.spotLine}>{spot.tagline}</p>
          <div className={styles.spotRow}>
            <span className={styles.spotPrice}>{formatRwf(spot.price)}</span>
            <AddToBag productIds={[spot.id]} />
            <Link className="btn btn-ghost" href={`/products/${spot.slug}`}>
              Details
            </Link>
          </div>
        </div>

        <div className={styles.index} role="tablist" aria-label="Featured products">
          {GROUPS.map(({ kind, label }) =>
            products.some((p) => p.kind === kind) ? (
              <div key={kind} className={styles.group}>
                <span className={styles.groupLabel}>{label}</span>
                <div className={styles.tabs}>
                  {products.map((p, i) =>
                    p.kind === kind ? (
                      <button
                        key={p.id}
                        role="tab"
                        aria-selected={i === active}
                        className={styles.tab}
                        onClick={() => {
                          setAutoplay(false);
                          go(i);
                        }}
                      >
                        <span>{p.name}</span>
                        <span key={i === active ? `on-${active}` : "off"} className={`${styles.progress} ${i === active && autoplay && !reduce ? styles.running : ""}`} />
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}
