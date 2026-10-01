/**
 * Store settings. Public values only: anything secret belongs in env vars.
 */
export const store = {
  name: "Glowell",
  tagline: "Skincare and vitamins, inside and out",
  description:
    "Glowell makes skincare and vitamins that work as one routine. Delivered across Rwanda, pay with MoMo.",
  currency: "RWF",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  contact: {
    /** Country code + number, digits only. Empty string hides WhatsApp. */
    whatsapp: "250784346538",
    email: "karemarsy@gmail.com",
  },

  payments: {
    /** MTN MoMo number customers send money to. */
    momoNumber: "0784346538",
    /** Name registered on the MoMo number, shown so customers can check it. */
    momoName: "",
    /** MoMo Pay merchant code. When set, it replaces the number above. */
    momoMerchantCode: "",
    /** Optional hosted payment page (Flutterwave, IremboPay…). */
    paymentLink: "",
  },

  delivery: {
    note: "Kigali delivery in 24h. Other provinces in 2 to 3 days.",
    /** Bag total (RWF) that unlocks free delivery. 0 disables it. */
    freeOver: 50_000,
  },

  /** Discount applied to each complete "Better together" pair. */
  pairDiscount: 0.15,
} as const;

export type StoreConfig = typeof store;
