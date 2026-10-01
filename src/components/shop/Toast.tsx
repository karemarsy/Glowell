"use client";

import { useUi } from "./ShopProvider";
import styles from "./Toast.module.css";

export function Toast() {
  const { toast, openDrawer } = useUi();
  return (
    <div className={`${styles.toast} ${toast ? styles.on : ""}`} role="status" aria-live="polite">
      <span>{toast?.message}</span>
      {toast?.showBag && <button onClick={() => openDrawer()}>View bag</button>}
    </div>
  );
}
