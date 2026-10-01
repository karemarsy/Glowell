import "server-only";
import { z } from "zod";

const optional = z
  .string()
  .optional()
  .transform((v) => v?.trim() || undefined);

const schema = z.object({
  TELEGRAM_BOT_TOKEN: optional,
  TELEGRAM_CHAT_ID: optional,
  RESEND_API_KEY: optional,
  ORDER_EMAIL_TO: optional,
  ORDER_EMAIL_FROM: optional,
});

/** Server-only settings, validated once. Every value is optional. */
export const env = schema.parse(process.env);
