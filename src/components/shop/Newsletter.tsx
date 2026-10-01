"use client";

import { useState, type FormEvent } from "react";
import { useUi } from "./ShopProvider";
import styles from "./Footer.module.css";

export function Newsletter() {
  const { notify } = useUi();
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await res.json()) as { ok: boolean; error?: string };
      if (!result.ok) throw new Error(result.error);
      notify("Murakoze! You're on the list.");
      form.reset();
    } catch (e) {
      notify(e instanceof Error && e.message ? e.message : "Couldn't subscribe right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.news} onSubmit={submit}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input id="newsletter-email" name="email" type="email" required placeholder="you@email.com" autoComplete="email" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
