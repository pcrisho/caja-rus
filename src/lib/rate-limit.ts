/**
 * Rate limiter en memoria, best-effort.
 *
 * LIMITACIÓN CONOCIDA: el estado vive en la memoria del proceso. En un
 * despliegue serverless con múltiples instancias concurrentes (Vercel), cada
 * instancia tiene su propio contador — el límite real efectivo puede ser
 * hasta N veces mayor al configurado, donde N = instancias activas. Esto es
 * una mitigación de "abuso obvio" y NO un rate limiter distribuido correcto.
 *
 * Cuando el tráfico lo justifique, reemplazar por un backend compartido
 * (p. ej. `@upstash/ratelimit` con Upstash Redis, que ya tiene tier gratuito).
 * Ver docs/audit/informe-auditoria-cajarus.md #1.4.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Evita que el Map crezca indefinidamente en un proceso de larga duración
// (dev server, contenedor persistente). Se poda perezosamente en cada check.
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Ventana fija simple: permite hasta `limit` requests cada `windowMs` por
 * `key` (normalmente `userId` o `ip`).
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}
