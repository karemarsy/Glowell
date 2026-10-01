import type { MetadataRoute } from "next";
import { store } from "@/config/store";
import { products } from "@/content/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: store.siteUrl, changeFrequency: "weekly", priority: 1 },
    ...products.map((p) => ({
      url: `${store.siteUrl}/products/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
