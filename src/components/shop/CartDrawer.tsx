"use client";

import { useEffect, useRef, useState } from "react";
import type { PlacedOrder } from "@/lib/order";
import { BagView } from "./BagView";
import { CheckoutForm } from "./CheckoutForm";
import { OrderPlaced } from "./OrderPlaced";
import { useUi, type DrawerView } from "./ShopProvider";
import styles from "./CartDrawer.module.css";

const TITLES: Record<DrawerView, string> = {
  bag: "Your bag",
  checkout: "Checkout",
  placed: "Order placed",
};

/** Slide-in bag: bag -> checkout -> order placed. Modal while open. */
export function CartDrawer() {
  const { drawerOpen, view, setView, closeDrawer } = useUi();
  const [placed, setPlaced] = useState<{ order: PlacedOrder; whatsappOpened: boolean } | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // While open: the rest of the page is inert, Escape closes, focus moves in.
  // On close: focus goes back to whatever opened the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const page = document.getElementById("page");
    returnFocus.current = document.activeElement as HTMLElement | null;
    page?.setAttribute("inert", "");
    const t = setTimeout(() => closeButton.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      page?.removeAttribute("inert");
      returnFocus.current?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  // After a placed order, the next open starts on a fresh bag.
  useEffect(() => {
    if (drawerOpen || view !== "placed") return;
    const t = setTimeout(() => setView("bag"), 650);
    return () => clearTimeout(t);
  }, [drawerOpen, view, setView]);

  return (
    <>
      <div className={`${styles.scrim} ${drawerOpen ? styles.on : ""}`} onClick={closeDrawer} aria-hidden="true" />
      <aside
        className={`${styles.drawer} ${drawerOpen ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        inert={!drawerOpen}
      >
        <div className={styles.head}>
          <h2 id="drawer-title">{TITLES[view]}</h2>
          <button ref={closeButton} className={styles.close} onClick={closeDrawer} aria-label="Close bag">
            ×
          </button>
        </div>
        {view === "bag" && <BagView onCheckout={() => setView("checkout")} />}
        {view === "checkout" && (
          <CheckoutForm
            onBack={() => setView("bag")}
            onPlaced={(order, { whatsappOpened }) => {
              setPlaced({ order, whatsappOpened });
              setView("placed");
            }}
          />
        )}
        {view === "placed" && placed && <OrderPlaced {...placed} onDone={closeDrawer} />}
      </aside>
    </>
  );
}
