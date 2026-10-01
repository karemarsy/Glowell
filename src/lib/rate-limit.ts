/**
 * Fixed-window rate limiter kept in memory. On serverless hosts each
 * instance has its own memory, so this is a speed bump against bursts
 * and bots, not a hard guarantee.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return function allow(key: string, now = Date.now()): boolean {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size > 5_000) hits.clear();
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}

export function clientKey(headers: Headers): string {
  return headers.get("x-nf-client-connection-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}
