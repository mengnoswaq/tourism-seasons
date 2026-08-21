/**
 * Sliding Window Rate Limiter for Authentication & Admin Endpoints
 * Protects login endpoints against brute-force and credential stuffing attacks.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for Edge/Node middleware instances
const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every 60 seconds

export interface RateLimitOptions {
  limit?: number; // Max requests allowed per window (default: 10)
  windowMs?: number; // Time window in milliseconds (default: 60000 = 1 min)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60000; // 1 minute window
  const now = Date.now();

  const key = `ratelimit:${identifier}`;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // New window or expired
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetMs: windowMs,
    };
  }

  // Increment counter
  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  const resetMs = Math.max(0, entry.resetTime - now);

  if (entry.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  return {
    success: true,
    limit,
    remaining,
    resetMs,
  };
}
