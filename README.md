# Glowell

Online shop for skincare and vitamins in Rwanda. Customers browse, fill a bag,
and check out with their phone number and address. Orders reach the owner
instantly (Telegram and/or email, plus WhatsApp), and customers pay with
MTN MoMo or cash on delivery.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Zod · Vitest · CSS Modules

## Getting started

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3000
```

In development, orders are printed to the terminal when no notifier is set up.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Lint, typecheck and unit tests |

## Running the shop

- **Products, pairs, prices:** `src/content/catalog.ts`. Prices are whole RWF.
- **Store settings** (WhatsApp, MoMo number or merchant code, delivery, pair
  discount): `src/config/store.ts`.
- **Product photos (optional):** put a file in `public/images/` and set
  `image: "/images/name.png"` on the product. It replaces the drawn artwork.

## Order notifications

Set at least one in production, or web orders are refused (WhatsApp ordering
keeps working):

- **Telegram (free, instant on your phone):** create a bot with
  [@BotFather](https://t.me/BotFather), send it a message, then read your chat
  id from `https://api.telegram.org/bot<TOKEN>/getUpdates`. Set
  `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
- **Email via [Resend](https://resend.com) (free tier):** set `RESEND_API_KEY`
  and `ORDER_EMAIL_TO`.

## Deploying (Netlify, free)

1. On [Netlify](https://app.netlify.com), choose **Add new site → Import from
   Git** and pick this repository. The settings come from `netlify.toml`.
2. Under **Site configuration → Environment variables**, add
   `NEXT_PUBLIC_SITE_URL` and the notifier variables above.
3. Every push to `main` deploys automatically.

## How it works

```
src/
  app/                   routes: home, /products/[slug], /api/orders, /api/subscribe, sitemap, robots
  components/art/        product artwork as SVG components, animated with CSS (styles/motion.css)
  components/home/       hero carousel, collection rail, pairs, scroll text
  components/shop/       nav, bag drawer, checkout, toast, footer, cart state
  config/store.ts        public store settings
  content/catalog.ts     products and pairs
  lib/                   pricing, MoMo USSD, phone rules, order schema, notifiers (unit tested)
```

- **Server-side pricing.** The order API ignores any prices sent by the browser
  and reprices the bag from the catalog with the same `priceCart` function the
  UI uses.
- **One validation schema** (Zod) for the checkout form and the API, so errors
  show instantly and the server enforces the same rules.
- **Spam protection:** honeypot field plus a per-IP rate limit on both APIs.
- **The bag** lives in `localStorage` behind a `useSyncExternalStore` store: no
  hydration mismatch, and it stays in sync across tabs.
- **Product pages** are statically generated, with metadata, canonical URLs,
  `Product` JSON-LD and a sitemap.
- **Animations** only run while a product is on screen, and are switched off
  for visitors who prefer reduced motion.

The original single-file HTML version is kept at tag `v1-static`.
