// Minimal in-memory sliding-window rate limiter (docs/03: 5/hr/IP on the
// appointment route). Adequate for a low-traffic brochure site on a single
// serverless region; resets on cold start, which only ever makes it more
// lenient, never less safe. No external store, no dependency.

const hits = new Map<string, number[]>()

export function rateLimit(key: string, limit = 5, windowMs = 3600_000): { ok: boolean; remaining: number } {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false, remaining: 0 }
  }
  recent.push(now)
  hits.set(key, recent)
  // opportunistic cleanup so the map can't grow unbounded
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k)
  return { ok: true, remaining: limit - recent.length }
}
