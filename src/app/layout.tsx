import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "@/components/shop/Footer";
import { Nav } from "@/components/shop/Nav";
import { ShopProvider } from "@/components/shop/ShopProvider";
import { Toast } from "@/components/shop/Toast";
import { store } from "@/config/store";
import { configuredNotifiers } from "@/lib/notify";
import "./globals.css";

const serif = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(store.siteUrl),
  title: { default: `${store.name}: ${store.tagline.toLowerCase()}`, template: `%s · ${store.name}` },
  description: store.description,
  openGraph: {
    type: "website",
    siteName: store.name,
    title: `${store.name}: glow, inside and out`,
    description: store.description,
    locale: "en_RW",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#5A1330",
  viewportFit: "cover",
};

// Hides the hero copy before first paint so its intro can play. Home only,
// and never when the visitor prefers reduced motion.
const INTRO = `try{if(location.pathname==="/"&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&document.visibilityState==="visible")document.documentElement.classList.add("intro")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  // Without a notifier, production can't deliver web orders, so checkout
  // offers WhatsApp only. Development always allows them (they're logged).
  const webOrders = configuredNotifiers().length > 0 || process.env.NODE_ENV !== "production";
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO }} />
      </head>
      {/* Browser extensions (ColorZilla, Grammarly…) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>
        <ShopProvider webOrders={webOrders}>
          <div id="page">
            <Nav />
            <main>{children}</main>
            <Footer />
          </div>
          <CartDrawer />
          <Toast />
        </ShopProvider>
      </body>
    </html>
  );
}
