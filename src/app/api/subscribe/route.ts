import { NextResponse, type NextRequest } from "next/server";
import { notifyOwner } from "@/lib/notify";
import { subscribeSchema } from "@/lib/order-schema";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

export async function POST(request: NextRequest) {
  if (!allow(clientKey(request.headers))) {
    return NextResponse.json({ ok: false, error: "Please try again in a few minutes." }, { status: 429 });
  }
  const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "That email doesn't look right." }, { status: 422 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const delivery = await notifyOwner({
    subject: "New newsletter subscriber",
    text: `New subscriber: ${parsed.data.email}`,
  });
  if (delivery !== "delivered") {
    return NextResponse.json({ ok: false, error: "Couldn't subscribe right now." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
