"use client";

import { formatRwf } from "@/lib/money";
import type { PlacedOrder } from "@/lib/order";
import styles from "./CartDrawer.module.css";

interface OrderPlacedProps {
  order: PlacedOrder;
  whatsappOpened: boolean;
  onDone: () => void;
}

export function OrderPlaced({ order, whatsappOpened, onDone }: OrderPlacedProps) {
  const { payment, customer } = order;
  const viaWhatsapp = order.channel === "whatsapp" && order.whatsappUrl;
  const firstName = customer.name.split(" ")[0];
  return (
    <div className={`${styles.view} ${styles.placed}`}>
      <p className={styles.big}>Murakoze!</p>
      <p>
        Thank you, {firstName}. We&apos;ll call {customer.phone} to confirm your delivery.
      </p>
      <span className={styles.orderId}>
        Order {order.id} · {formatRwf(order.total)}
      </span>
      {viaWhatsapp && !whatsappOpened && (
        <>
          <p className={styles.momo}>One more step: send the order to us on WhatsApp.</p>
          <a className="btn btn-block" href={order.whatsappUrl!} target="_blank" rel="noopener noreferrer">
            Send order on WhatsApp
          </a>
        </>
      )}
      {payment.ussd && (
        <>
          <p className={styles.momo}>
            Send {formatRwf(order.total)} by MoMo to {payment.payTo}. Dial <strong>{payment.ussd}</strong>, or pay cash on
            delivery.
          </p>
          <a className="btn btn-block" href={payment.href ?? undefined}>
            Pay with MoMo
          </a>
        </>
      )}
      {payment.link && (
        <a className="btn btn-block" href={payment.link} target="_blank" rel="noopener noreferrer">
          Pay online
        </a>
      )}
      <button className="btn btn-ghost btn-block" onClick={onDone}>
        Keep shopping
      </button>
      {viaWhatsapp && whatsappOpened && (
        <a className={styles.waAgain} href={order.whatsappUrl!} target="_blank" rel="noopener noreferrer">
          WhatsApp didn&apos;t open? Send the order again
        </a>
      )}
    </div>
  );
}
