import { NextResponse, type NextRequest } from "next/server";
import { notifyOwner } from "@/lib/notify";
import { buildOrder, orderMessage, type OrderResponse } from "@/lib/order";
import { createOrderId } from "@/lib/order-id";
import { fieldErrors, orderRequestSchema } from "@/lib/order-schema";
import { priceCart } from "@/lib/pricing";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { formatRwf } from "@/lib/money";

const allow = createRateLimiter({ limit: 8, windowMs: 10 * 60_000 });

const fail = (status: number, error: string, fields?: Record<string, string>) =>
  NextResponse.json<OrderResponse>({ ok: false, error, fields }, { status });

export async function POST(request: NextRequest) {
  if (!allow(clientKey(request.headers))) {
    return fail(429, "Too many orders from this connection. Please wait a few minutes.");
  }

  const body: unknown = await request.json().catch(() => null);
  if (body === null || typeof body !== "object") return fail(400, "Invalid request.");
  const parsed = orderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "Please check the highlighted fields.", fieldErrors(parsed.error));
  }
  const { items, customer, channel, website } = parsed.data;

  // Honeypot filled in: pretend it worked so bots learn nothing.
  if (website) {
    return NextResponse.json<OrderResponse>({ ok: true, order: buildOrder(createOrderId(), channel, customer, priceCart([])) });
  }

  // Never trust client prices: recalculate everything from the catalog.
  const totals = priceCart(items);
  if (totals.lines.length === 0) return fail(422, "Your bag is empty.");

  const order = buildOrder(createOrderId(), channel, customer, totals);
  const delivery = await notifyOwner({
    subject: `New order ${order.id} · ${formatRwf(order.total)}`,
    text: orderMessage(order),
  });

  // WhatsApp orders reach the owner through WhatsApp itself, so the
  // notification is only a backup copy there.
  if (delivery !== "delivered" && channel === "web") {
    return fail(503, "We couldn't send your order right now. Please order on WhatsApp instead.");
  }

  return NextResponse.json<OrderResponse>({ ok: true, order }, { status: 201 });
}
