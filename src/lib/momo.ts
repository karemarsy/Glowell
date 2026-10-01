import { toLocalMobile } from "./phone";

export interface MomoTarget {
  /** MoMo Pay merchant code. Takes priority over a number. */
  merchantCode?: string;
  /** Personal MoMo number. */
  number?: string;
}

/**
 * The USSD string a customer dials to pay, with the amount filled in.
 *  - merchant: *182*8*1*CODE*AMOUNT#
 *  - number:   *182*1*1*07XXXXXXXX*AMOUNT#
 */
export function momoUssd(target: MomoTarget, amount: number): string | null {
  const total = Math.round(amount);
  if (!Number.isFinite(total) || total <= 0) return null;
  const code = target.merchantCode?.replace(/\D/g, "");
  if (code) return `*182*8*1*${code}*${total}#`;
  const number = target.number ? toLocalMobile(target.number) : null;
  if (number) return `*182*1*1*${number}*${total}#`;
  return null;
}

/** A tel: link that opens the dialer with the USSD code typed in. */
export function ussdHref(ussd: string): string {
  return `tel:${ussd.replace(/#/g, "%23")}`;
}
