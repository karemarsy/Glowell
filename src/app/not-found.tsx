import Link from "next/link";
import { cssVars } from "@/lib/css-vars";

export default function NotFound() {
  return (
    <section style={{ minHeight: "80svh", display: "grid", placeContent: "center", gap: 20, padding: "120px var(--gutter)", textAlign: "center" }}>
      <h1 style={{ font: "500 clamp(42px, 7vw, 96px)/1 var(--serif)", letterSpacing: "-0.025em" }}>Page not found</h1>
      <p>That page isn&apos;t here, but your next favourite product might be.</p>
      <p>
        <Link className="btn" href="/#shop" style={cssVars({ "--fg": "var(--paper-ink)", "--on": "var(--paper)" })}>
          Browse the collection
        </Link>
      </p>
    </section>
  );
}
