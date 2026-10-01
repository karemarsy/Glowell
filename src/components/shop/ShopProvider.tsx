"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { getProduct } from "@/content/catalog";
import { cartStore } from "@/lib/cart-store";
import { priceCart, type CartTotals } from "@/lib/pricing";
import type { CartLine } from "@/lib/types";

export type DrawerView = "bag" | "checkout" | "placed";

interface CartApi {
  lines: readonly CartLine[];
  totals: CartTotals;
  add: (productId: string, quantity?: number, options?: { quiet?: boolean }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

interface Toast {
  id: number;
  message: string;
  showBag: boolean;
}

interface UiApi {
  drawerOpen: boolean;
  view: DrawerView;
  setView: (view: DrawerView) => void;
  openDrawer: (view?: DrawerView) => void;
  closeDrawer: () => void;
  toast: Toast | null;
  notify: (message: string, options?: { showBag?: boolean }) => void;
  dismissToast: () => void;
}

const CartContext = createContext<CartApi | null>(null);
const UiContext = createContext<UiApi | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const totals = useMemo(() => priceCart(lines), [lines]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState<DrawerView>("bag");
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismissToast = useCallback(() => setToast(null), []);
  const notify = useCallback((message: string, options?: { showBag?: boolean }) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, showBag: !!options?.showBag });
    toastTimer.current = setTimeout(() => setToast(null), 3400);
  }, []);

  const add = useCallback<CartApi["add"]>(
    (productId, quantity = 1, options) => {
      cartStore.add(productId, quantity);
      const product = getProduct(productId);
      if (!options?.quiet && product) notify(`Added ${product.name} to your bag`, { showBag: true });
    },
    [notify],
  );

  const openDrawer = useCallback((next: DrawerView = "bag") => {
    setView(next);
    setToast(null);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const cart = useMemo<CartApi>(
    () => ({
      lines,
      totals,
      add,
      setQuantity: cartStore.setQuantity,
      remove: cartStore.remove,
      clear: cartStore.clear,
    }),
    [lines, totals, add],
  );
  const ui = useMemo<UiApi>(
    () => ({ drawerOpen, view, setView, openDrawer, closeDrawer, toast, notify, dismissToast }),
    [drawerOpen, view, openDrawer, closeDrawer, toast, notify, dismissToast],
  );

  return (
    <CartContext value={cart}>
      <UiContext value={ui}>{children}</UiContext>
    </CartContext>
  );
}

export function useCart(): CartApi {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <ShopProvider>");
  return ctx;
}

export function useUi(): UiApi {
  const ctx = use(UiContext);
  if (!ctx) throw new Error("useUi must be used inside <ShopProvider>");
  return ctx;
}
