"use client";

import { ProductThumb } from "@/components/art/ProductArt";
import { cssVars } from "@/lib/css-vars";
import { formatRwf } from "@/lib/money";
import { useCart } from "./ShopProvider";
import styles from "./CartDrawer.module.css";

export function BagView({ onCheckout }: { onCheckout: () => void }) {
  const { totals, setQuantity, remove } = useCart();
  const { lines, freeDelivery } = totals;
  const empty = lines.length === 0;

  return (
    <div className={styles.view}>
      {freeDelivery.threshold > 0 && (
        <div className={styles.ship}>
          <p>
            {empty
              ? `Free delivery on bags over ${formatRwf(freeDelivery.threshold)}.`
              : freeDelivery.unlocked
                ? "Free delivery unlocked."
                : `Add ${formatRwf(freeDelivery.remaining)} for free delivery.`}
          </p>
          <div className={styles.bar}>
            <i style={{ width: `${freeDelivery.progress * 100}%` }} />
          </div>
        </div>
      )}

      {empty ? (
        <p className={styles.empty}>Your bag is empty. Add a formula or a vitamin to start.</p>
      ) : (
        <>
          <ul className={styles.lines}>
            {lines.map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className={styles.line} style={cssVars({ "--b1": product.palette.from, "--b2": product.palette.to })}>
                <div className={styles.thumb}>
                  <ProductThumb product={product} uid={`bag-${product.id}`} />
                </div>
                <div>
                  <b>{product.name}</b>
                  <small>
                    {product.size}, {formatRwf(product.price)} each
                  </small>
                  <div className={styles.qty}>
                    <button onClick={() => setQuantity(product.id, quantity - 1)} aria-label={`Fewer ${product.name}`}>
                      −
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button onClick={() => setQuantity(product.id, quantity + 1)} aria-label={`More ${product.name}`}>
                      +
                    </button>
                  </div>
                </div>
                <div className={styles.lineTotal}>
                  {formatRwf(lineTotal)}
                  <button className={styles.remove} onClick={() => remove(product.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.totals}>
            <div>
              <span>Subtotal</span>
              <span>{formatRwf(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div>
                <span>Pair discount</span>
                <span>−{formatRwf(totals.discount)}</span>
              </div>
            )}
            <div className={styles.grand}>
              <span>Total</span>
              <span>{formatRwf(totals.total)}</span>
            </div>
            <button className="btn btn-block" onClick={onCheckout}>
              Check out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
