"use client";

import { useCart, useUi } from "./ShopProvider";

interface AddToBagProps {
  productIds: readonly string[];
  label?: string;
  className?: string;
  /** Toast shown when several products are added at once. */
  message?: string;
}

export function AddToBag({ productIds, label = "Add to bag", className = "btn", message }: AddToBagProps) {
  const { add } = useCart();
  const { notify } = useUi();
  return (
    <button
      className={className}
      onClick={() => {
        const single = productIds.length === 1;
        productIds.forEach((id) => add(id, 1, { quiet: !single }));
        if (!single && message) notify(message, { showBag: true });
      }}
    >
      {label}
    </button>
  );
}
