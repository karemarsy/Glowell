import { store } from "@/config/store";
import { formatRwf } from "./money";
import { momoUssd, ussdHref } from "./momo";
import type { CartTotals } from "./pricing";
import type { Customer } from "./order-schema";

export type OrderChannel = "web" | "whatsapp";

/** What the order API returns, and what the confirmation screen shows. */
export interface PlacedOrder {
  id: string;
  createdAt: string;
  channel: OrderChannel;
  customer: Customer;
  lines: { name: string; size: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  payment: { ussd: string | null; href: string | null; payTo: string | null; link: string | null };
  whatsappUrl: string | null;
}

export type OrderResponse =
  | { ok: true; order: PlacedOrder }
  | { ok: false; error: string; fields?: Record<string, string> };

export function buildOrder(
  id: string,
  channel: OrderChannel,
  customer: Customer,
  totals: CartTotals,
  now = new Date(),
): PlacedOrder {
  const { momoMerchantCode, momoNumber, momoName, paymentLink } = store.payments;
  const ussd = momoUssd({ merchantCode: momoMerchantCode, number: momoNumber }, totals.total);
  const payTo = momoMerchantCode ? `MoMo Pay code ${momoMerchantCode}` : momoNumber || null;

  const order: PlacedOrder = {
    id,
    createdAt: now.toISOString(),
    channel,
    customer,
    lines: totals.lines.map((l) => ({
      name: l.product.name,
      size: l.product.size,
      quantity: l.quantity,
      lineTotal: l.lineTotal,
    })),
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: totals.total,
    payment: {
      ussd,
      href: ussd ? ussdHref(ussd) : null,
      payTo: payTo && momoName ? `${payTo} (${momoName})` : payTo,
      link: paymentLink || null,
    },
    whatsappUrl: null,
  };
  const wa = store.contact.whatsapp.replace(/\D/g, "");
  order.whatsappUrl = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(orderMessage(order))}` : null;
  return order;
}

/** Plain-text order, used for WhatsApp, Telegram and email alike. */
export function orderMessage(order: PlacedOrder): string {
  const { customer: c } = order;
  return [
    `New order ${order.id} from ${store.name}`,
    "",
    ...order.lines.map((l) => `${l.quantity} x ${l.name} (${l.size}) = ${formatRwf(l.lineTotal)}`),
    ...(order.discount > 0 ? [`Pair discount: -${formatRwf(order.discount)}`] : []),
    `TOTAL: ${formatRwf(order.total)}`,
    "",
    `Name: ${c.name}`,
    `Phone: ${c.phone}`,
    `Address: ${c.address}`,
    ...(c.email ? [`Email: ${c.email}`] : []),
    ...(c.notes ? [`Note: ${c.notes}`] : []),
    ...(order.channel === "whatsapp" ? ["", "(sent via WhatsApp)"] : []),
  ].join("\n");
}
