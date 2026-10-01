import Link from "next/link";
import { store } from "@/config/store";
import { Newsletter } from "./Newsletter";
import styles from "./Footer.module.css";

export function Footer() {
  const { whatsapp, email } = store.contact;
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div>
          <h2>New drops and offers, rarely.</h2>
          <Newsletter />
        </div>
        <nav className={styles.links} aria-label="Footer">
          <Link href="/#shop">The collection</Link>
          <Link href="/#pairs">Better together</Link>
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </a>
          )}
          {email && <a href={`mailto:${email}`}>{email}</a>}
        </nav>
      </div>
      <p className={styles.legal}>
        {store.delivery.note} Supplements are not intended to diagnose, treat or prevent any condition. Ask a doctor before use if
        you are pregnant, breastfeeding or taking medication.
      </p>
      <span className={styles.word} aria-hidden="true">
        {store.name}
      </span>
    </footer>
  );
}
