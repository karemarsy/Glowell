import type { Notifier } from "./index";

export function telegramNotifier(token: string, chatId: string): Notifier {
  return {
    name: "telegram",
    async send({ text }) {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) throw new Error(`Telegram responded ${res.status}`);
    },
  };
}
