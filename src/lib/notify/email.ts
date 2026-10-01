import type { Notifier } from "./index";

/** Email through Resend's HTTP API (no SDK needed). */
export function emailNotifier(apiKey: string, to: string, from: string): Notifier {
  return {
    name: "email",
    async send({ subject, text }) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), subject, text }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    },
  };
}
