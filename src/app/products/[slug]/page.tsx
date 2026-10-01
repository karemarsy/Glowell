import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductScene, ProductThumb } from "@/components/art/ProductArt";
import { AddToBag } from "@/components/shop/AddToBag";
import { store } from "@/config/store";
import { getProduct, getProductBySlug, pairFor, products } from "@/content/catalog";
import { cssVars } from "@/lib/css-vars";
import { formatRwf } from "@/lib/money";
import { pairPrice } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import styles from "./product.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.tagline} ${formatRwf(product.price)}, delivered across Rwanda.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name} · ${store.name}`, description: product.tagline },
  };
}

function structuredData(product: Product) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    brand: { "@type": "Brand", name: store.name },
    url: `${store.siteUrl}/products/${product.slug}`,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: store.currency,
      availability: "https://schema.org/InStock",
      areaServed: "RW",
    },
  };
  // Escape "<" so the JSON can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ProductPage({ params }: Props) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();

  const pair = pairFor(product.id);
  const partner = pair ? getProduct(pair.products.find((id) => id !== product.id)!) : undefined;
  const related = products.filter((p) => p.kind === product.kind && p.id !== product.id).slice(0, 3);
  const theme = cssVars({ "--b1": product.palette.from, "--b2": product.palette.to, "--fg": product.palette.ink, "--on": product.palette.onInk });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(product) }} />
      <article className={styles.page} style={theme}>
        <div className={`${styles.visual} play`}>
          <div className="art">
            <ProductScene product={product} uid={`pdp-${product.id}`} priority />
          </div>
        </div>

        <div className={styles.info}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link href="/#shop">The collection</Link> <span aria-hidden="true">/</span>{" "}
            {product.kind === "vitamin" ? "Vitamins" : "Skincare"}
          </nav>
          <h1>{product.name}</h1>
          <p className={styles.meta}>
            {product.format}, {product.size}
          </p>
          <p className={styles.price}>{formatRwf(product.price)}</p>
          <p className={styles.tagline}>{product.tagline}</p>
          <AddToBag productIds={[product.id]} className="btn btn-block" />
          <p className={styles.delivery}>{store.delivery.note} Pay with MoMo or cash on delivery.</p>

          <dl className={styles.details}>
            <div>
              <dt>Key ingredients</dt>
              <dd>{product.ingredients}</dd>
            </div>
            <div>
              <dt>How to use</dt>
              <dd>{product.howToUse}</dd>
            </div>
          </dl>

          {pair && partner && (
            <aside className={styles.pair} style={cssVars({ "--b1": partner.palette.from, "--b2": partner.palette.to })}>
              <div className={styles.pairThumb}>
                <ProductThumb product={partner} uid={`pdp-pair-${partner.id}`} />
              </div>
              <div>
                <p className={styles.pairKicker}>Better together · {pair.title}</p>
                <p>
                  Add <Link href={`/products/${partner.slug}`}>{partner.name}</Link> and save{" "}
                  {formatRwf(pairPrice(product, partner).saving)}.
                </p>
                <AddToBag
                  productIds={[product.id, partner.id]}
                  label="Add the pair"
                  className={`btn ${styles.pairButton}`}
                  message="Added the pair to your bag"
                />
              </div>
            </aside>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="related-title">
          <h2 id="related-title">You might also like</h2>
          <ul>
            {related.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} className={styles.relatedCard} style={cssVars({ "--b1": p.palette.from, "--b2": p.palette.to, "--fg": p.palette.ink })}>
                  <div className={styles.relatedThumb}>
                    <ProductThumb product={p} uid={`rel-${p.id}`} />
                  </div>
                  <span className={styles.relatedName}>{p.name}</span>
                  <span>{formatRwf(p.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
