import "server-only";
import { env } from "@/lib/env";
import { emailNotifier } from "./email";
import { telegramNotifier } from "./telegram";

export interface Notification {
  subject: string;
  text: string;
}

export interface Notifier {
  name: string;
  send(message: Notification): Promise<void>;
}

/** Every notifier whose credentials are set. */
export function configuredNotifiers(): Notifier[] {
  const list: Notifier[] = [];
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    list.push(telegramNotifier(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID));
  }
  if (env.RESEND_API_KEY && env.ORDER_EMAIL_TO) {
    list.push(
      emailNotifier(env.RESEND_API_KEY, env.ORDER_EMAIL_TO, env.ORDER_EMAIL_FROM ?? "Glowell <onboarding@resend.dev>"),
    );
  }
  return list;
}

export type DeliveryResult = "delivered" | "failed" | "unconfigured";

/**
 * Sends to every configured channel in parallel. Delivered if at least
 * one channel accepted it, so one outage doesn't lose the order.
 */
export async function notifyOwner(message: Notification): Promise<DeliveryResult> {
  const notifiers = configuredNotifiers();
  if (notifiers.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[notify:dev] ${message.subject}\n${message.text}`);
      return "delivered";
    }
    return "unconfigured";
  }
  const results = await Promise.allSettled(notifiers.map((n) => n.send(message)));
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[notify:${notifiers[i]!.name}]`, r.reason);
  });
  return results.some((r) => r.status === "fulfilled") ? "delivered" : "failed";
}
