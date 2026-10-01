"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { store } from "@/config/store";
import { useCart, useUi } from "./ShopProvider";
import styles from "./Nav.module.css";

export function Nav() {
  const { totals } = useCart();
  const { openDrawer } = useUi();
  const count = useRef<HTMLSpanElement>(null);
  const previous = useRef(totals.itemCount);

  // Little bump on the counter whenever something is added.
  useEffect(() => {
    if (totals.itemCount > previous.current) {
      count.current?.animate?.([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], {
        duration: 420,
        easing: "ease-out",
      });
    }
    previous.current = totals.itemCount;
  }, [totals.itemCount]);

  const n = totals.itemCount;
  return (
    <nav className={styles.nav} aria-label="Main">
      <Link className={`${styles.pill} ${styles.brand}`} href="/" aria-label={`${store.name}, home`}>
        {store.name}
      </Link>
      <button className={styles.pill} onClick={() => openDrawer()} aria-label={`Open bag, ${n} item${n === 1 ? "" : "s"}`}>
        Bag{" "}
        <span ref={count} className={styles.count}>
          {n}
        </span>
      </button>
    </nav>
  );
}
