// Crockford-style alphabet: no I, L, O, U, so IDs are easy to read over the phone.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** "GW-7K3QZM": short, random, unambiguous. */
export function createOrderId(random: (bytes: Uint8Array) => Uint8Array = (b) => crypto.getRandomValues(b)): string {
  const bytes = random(new Uint8Array(6));
  let id = "";
  for (const byte of bytes) id += ALPHABET[byte % ALPHABET.length];
  return `GW-${id}`;
}
