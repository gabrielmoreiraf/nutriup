/**
 * Rate limiting simples (janela fixa, em memória) para proteger os endpoints
 * de IA contra abuso e custo. Em serverless o limite é por instância — para
 * limite global em produção, trocar por Upstash Redis (plugável).
 */
type Bucket = { count: number; resetAt: number };

const globalForRL = globalThis as unknown as { __nutriupRL?: Map<string, Bucket> };
const buckets = globalForRL.__nutriupRL ?? new Map<string, Bucket>();
globalForRL.__nutriupRL = buckets;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true, retryAfter: 0 };

}

/** Limpeza preguiçosa para não vazar memória. */
export function sweepRateLimit() {
  const now = Date.now();
  for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
}
