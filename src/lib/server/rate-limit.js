// Best-effort in-memory sliding window.
//
// This lives in the memory of a single serverless instance, which Vercel may
// recycle or scale out at any time, so it is not a real distributed limiter.
// It exists to stop naive flooding from one client burning through the Resend
// daily quota, not to defend against a determined distributed attacker.

/** @type {Map<string, number[]>} */
const hits = new Map();

/**
 * @param {string} key           Usually the client IP.
 * @param {{ max?: number, windowMs?: number }} [options]
 * @returns {{ allowed: boolean, retryAfterMs: number }}
 */
export function checkRateLimit(key, { max = 3, windowMs = 600_000 } = {}) {
  const now = Date.now();

  // Prune expired buckets so the map cannot grow without bound.
  for (const [k, timestamps] of hits) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    if (fresh.length) hits.set(k, fresh);
    else hits.delete(k);
  }

  const recent = hits.get(key) ?? [];

  if (recent.length >= max) {
    const retryAfterMs = windowMs - (now - recent[0]);
    return { allowed: false, retryAfterMs };
  }

  recent.push(now);
  hits.set(key, recent);
  return { allowed: true, retryAfterMs: 0 };
}
