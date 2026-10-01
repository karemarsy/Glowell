import { Collection } from "@/components/home/Collection";
import { Hero } from "@/components/home/Hero";
import { Pairs, type ResolvedPair } from "@/components/home/Pairs";
import { PromiseText } from "@/components/home/PromiseText";
import { featuredProducts, getProduct, pairs, products } from "@/content/catalog";

function resolvePairs(): ResolvedPair[] {
  return pairs.flatMap((pair) => {
    const a = getProduct(pair.products[0]);
    const b = getProduct(pair.products[1]);
    return a && b ? [{ ...pair, items: [a, b] as const }] : [];
  });
}

export default function HomePage() {
  return (
    <>
      <Hero products={featuredProducts()} />
      <Collection products={products} />
      <Pairs pairs={resolvePairs()} />
      <PromiseText text="Skin shows what you put on it and what you put in it. We make both halves of the routine, and keep every formula short." />
    </>
  );
}
