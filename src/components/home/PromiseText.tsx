"use client";

import { useEffect, useRef } from "react";
import styles from "./PromiseText.module.css";

/** A statement whose words fill in as it scrolls through the viewport. */
export function PromiseText({ text }: { text: string }) {
  const el = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const p = el.current;
    if (!p || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = Array.from(p.querySelectorAll<HTMLElement>("span"));
    let queued = false;
    const fill = () => {
      queued = false;
      const r = p.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.4 + r.height)));
      words.forEach((w, i) => {
        const v = Math.max(0, Math.min(1, progress * (words.length + 3) - i));
        w.style.opacity = (0.16 + 0.84 * v).toFixed(2);
      });
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(fill);
      }
    };
    p.classList.add(styles.live!);
    fill();
    window.addEventListener("scroll", queue, { passive: true });
    return () => window.removeEventListener("scroll", queue);
  }, []);

  return (
    <section className={styles.section} aria-label="Our approach">
      <p ref={el}>
        {text.split(/\s+/).map((word, i) => (
          <span key={i}>{word} </span>
        ))}
      </p>
    </section>
  );
}
