import { z } from "zod";
import { isRwandanMobile, toLocalMobile } from "./phone";

export const MAX_QUANTITY = 20;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .refine(isRwandanMobile, "Enter a Rwandan mobile number, like 078 123 4567")
    .transform((v) => toLocalMobile(v)!),
  address: z.string().trim().min(5, "Add your district, sector and a landmark").max(300),
  email: z
    .union([z.literal(""), z.email("That email doesn't look right")])
    .optional()
    .transform((v) => v || undefined),
  notes: optionalText(500),
});

export const orderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(40),
        quantity: z.number().int().min(1).max(MAX_QUANTITY),
      }),
    )
    .min(1, "Your bag is empty")
    .max(30),
  customer: customerSchema,
  channel: z.enum(["web", "whatsapp"]),
  /** Honeypot: real people never see or fill this field. */
  website: z.string().max(0).optional(),
});

export type OrderRequest = z.input<typeof orderRequestSchema>;
export type ParsedOrderRequest = z.output<typeof orderRequestSchema>;
export type Customer = z.output<typeof customerSchema>;

export const subscribeSchema = z.object({
  email: z.email("That email doesn't look right").max(200),
  website: z.string().max(0).optional(),
});

/** Flattens zod issues into { field: message } for the checkout form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.at(-1);
    if (typeof key === "string" && !out[key]) out[key] = issue.message;
  }
  return out;
}
