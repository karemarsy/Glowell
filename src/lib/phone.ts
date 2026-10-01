/** Rwandan mobile numbers: MTN (078, 079) and Airtel (072, 073). */
const RW_MOBILE = /^(?:\+?250|0)?(7[2389]\d{7})$/;

const digits = (value: string) => value.replace(/[\s().-]/g, "");

export function isRwandanMobile(value: string): boolean {
  return RW_MOBILE.test(digits(value));
}

/** "078 123 4567" | "+250781234567" -> "0781234567". Returns null if invalid. */
export function toLocalMobile(value: string): string | null {
  const match = RW_MOBILE.exec(digits(value));
  return match ? `0${match[1]}` : null;
}

/** For wa.me links: "0781234567" -> "250781234567". */
export function toInternational(value: string): string | null {
  const local = toLocalMobile(value);
  return local ? `250${local.slice(1)}` : null;
}
