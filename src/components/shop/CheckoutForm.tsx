"use client";

import { useId, useState, type FormEvent } from "react";
import { store } from "@/config/store";
import { formatRwf } from "@/lib/money";
import type { OrderResponse, PlacedOrder } from "@/lib/order";
import { customerSchema, fieldErrors, type OrderRequest } from "@/lib/order-schema";
import { useCart, useUi } from "./ShopProvider";
import styles from "./CartDrawer.module.css";

type Channel = OrderRequest["channel"];

interface FieldProps {
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  multiline?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "tel" | "email" | "text";
}

function Field({ name, label, error, optional, multiline, ...input }: FieldProps) {
  const id = useId();
  const props = {
    id,
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    required: !optional,
    ...input,
  };
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label} {optional && <small>(optional)</small>}
      </label>
      {multiline ? <textarea {...props} /> : <input {...props} />}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Opens a tab synchronously (so popup blockers allow it), then points it at WhatsApp later. */
function openPendingTab(): Window | null {
  const tab = window.open("", "_blank");
  if (tab) tab.opener = null;
  return tab;
}

interface CheckoutFormProps {
  onBack: () => void;
  onPlaced: (order: PlacedOrder, options: { whatsappOpened: boolean }) => void;
}

export function CheckoutForm({ onBack, onPlaced }: CheckoutFormProps) {
  const { lines, totals, clear } = useCart();
  const { notify } = useUi();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Channel | null>(null);
  const whatsapp = Boolean(store.contact.whatsapp);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || lines.length === 0) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel: Channel = submitter?.value === "whatsapp" ? "whatsapp" : "web";
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

    // Same rules as the server, so most mistakes are caught instantly.
    const check = customerSchema.safeParse(data);
    if (!check.success) {
      setErrors(fieldErrors(check.error));
      return;
    }
    setErrors({});
    setPending(channel);
    const tab = channel === "whatsapp" ? openPendingTab() : null;

    try {
      const body: OrderRequest = {
        items: lines.map(({ productId, quantity }) => ({ productId, quantity })),
        customer: { name: data.name ?? "", phone: data.phone ?? "", address: data.address ?? "", email: data.email, notes: data.notes },
        channel,
        website: data.website,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await res.json()) as OrderResponse;
      if (!result.ok) {
        tab?.close();
        if (result.fields) setErrors(result.fields);
        notify(result.error);
        return;
      }
      // If the popup was blocked, the confirmation screen offers the link instead
      // of navigating away from the shop (which would hide the payment details).
      if (tab && result.order.whatsappUrl) tab.location.href = result.order.whatsappUrl;
      else tab?.close();
      clear();
      onPlaced(result.order, { whatsappOpened: Boolean(tab && result.order.whatsappUrl) });
    } catch {
      tab?.close();
      notify(whatsapp ? "Couldn't send the order. Check your connection or try WhatsApp." : "Couldn't send the order. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <form className={`${styles.view} ${styles.checkout}`} onSubmit={submit} noValidate>
      <button type="button" className={styles.back} onClick={onBack}>
        ← Back to bag
      </button>
      <ul className={styles.summary}>
        {totals.lines.map(({ product, quantity, lineTotal }) => (
          <li key={product.id}>
            <span>
              {quantity} × {product.name}
            </span>
            <span>{formatRwf(lineTotal)}</span>
          </li>
        ))}
        {totals.discount > 0 && (
          <li>
            <span>Pair discount</span>
            <span>−{formatRwf(totals.discount)}</span>
          </li>
        )}
        <li className={styles.summaryTotal}>
          <span>Total</span>
          <span>{formatRwf(totals.total)}</span>
        </li>
      </ul>

      <Field name="name" label="Full name" autoComplete="name" error={errors.name} />
      <Field name="phone" label="Phone (MoMo number)" type="tel" inputMode="tel" autoComplete="tel" placeholder="078 123 4567" error={errors.phone} />
      <Field name="address" label="Delivery address" multiline placeholder="District, sector, street or a landmark" error={errors.address} />
      <Field name="email" label="Email" type="email" inputMode="email" autoComplete="email" optional error={errors.email} />
      <Field name="notes" label="Note" multiline optional placeholder="Delivery time, gift message…" error={errors.notes} />
      {/* Honeypot: hidden from people, irresistible to bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />

      <button className="btn btn-block" type="submit" value="web" disabled={!!pending}>
        {pending === "web" ? "Sending…" : "Place order"}
      </button>
      {whatsapp && (
        <button className="btn btn-ghost btn-block" type="submit" value="whatsapp" disabled={!!pending}>
          {pending === "whatsapp" ? "Opening WhatsApp…" : "Order on WhatsApp"}
        </button>
      )}
      <p className={styles.note}>Pay with MoMo or cash on delivery. We&apos;ll call to confirm before we send it.</p>
    </form>
  );
}
