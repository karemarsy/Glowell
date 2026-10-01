import { MAX_QUANTITY } from "./order-schema";
import type { CartLine } from "./types";

/**
 * A tiny external store for the bag, persisted to localStorage and kept
 * in sync across tabs. Consumed through useSyncExternalStore, so server
 * and first client render agree (empty bag) and there's no hydration gap.
 */
const KEY = "glowell:bag:v1";
const EMPTY: readonly CartLine[] = Object.freeze([]);
const listeners = new Set<() => void>();
let cache: readonly CartLine[] | null = null;

function read(): readonly CartLine[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return EMPTY;
    return raw.filter(
      (l): l is CartLine =>
        typeof l?.productId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0,
    );
  } catch {
    return EMPTY;
  }
}

function write(next: readonly CartLine[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or storage full: keep the in-memory bag */
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: (): readonly CartLine[] => (cache ??= read()),
  getServerSnapshot: (): readonly CartLine[] => EMPTY,

  add(productId: string, quantity = 1) {
    const lines = cartStore.getSnapshot();
    const existing = lines.find((l) => l.productId === productId);
    write(
      existing
        ? lines.map((l) => (l === existing ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) } : l))
        : [...lines, { productId, quantity: Math.min(MAX_QUANTITY, quantity) }],
    );
  },
  setQuantity(productId: string, quantity: number) {
    const lines = cartStore.getSnapshot();
    write(
      quantity < 1
        ? lines.filter((l) => l.productId !== productId)
        : lines.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(MAX_QUANTITY, quantity) } : l)),
    );
  },
  remove(productId: string) {
    write(cartStore.getSnapshot().filter((l) => l.productId !== productId));
  },
  clear() {
    write(EMPTY);
  },
};
