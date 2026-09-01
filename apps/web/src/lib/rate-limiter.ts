// In-memory rate limiter for middleware
// Maps: "ip:path" -> { count, resetAt }
const limits = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  /** Max requests per window */
  max: number;
  /** Window size in seconds */
  windowSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = { max: 100, windowSeconds: 60 };
export const AUTH_CONFIG: RateLimitConfig = { max: 5, windowSeconds: 60 }; // 5 login attempts per minute

function getKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function getNow(): number {
  return Date.now();
}

export function checkRateLimit(
  ip: string,
  path: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = getKey(ip, path);
  const now = getNow();
  const entry = limits.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    limits.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { allowed: true, remaining: config.max - 1, resetAt: Math.ceil((now + config.windowSeconds * 1000) / 1000) };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: Math.ceil(entry.resetAt / 1000) };
  }

  entry.count += 1;
  return { allowed: true, remaining: config.max - entry.count, resetAt: Math.ceil(entry.resetAt / 1000) };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = getNow();
  for (const [key, entry] of limits.entries()) {
    if (now > entry.resetAt) limits.delete(key);
  }
}, 5 * 60 * 1000);
