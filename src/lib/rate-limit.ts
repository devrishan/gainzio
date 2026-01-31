import { getRedis } from './redis';

export interface RateLimitOptions {
  identifier: string; // phone, email, IP, userId
  type: string; // "otp", "login", "api"
  limit: number; // max requests
  windowSeconds: number; // time window in seconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Redis-based rate limiter using sliding window log algorithm
 */
export async function checkRateLimit(
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { identifier, type, limit, windowSeconds } = options;
  const redis = getRedis();

  if (!redis) {
    // If Redis is not available, allow the request (fallback for development)
    console.warn('Redis not available, rate limiting disabled');
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }

  const key = `rate:${type}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Remove old entries outside the window
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count current requests in window
  const count = await redis.zcard(key);

  if (count >= limit) {
    // Get the oldest entry to calculate reset time
    const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetAt = oldest.length > 0 ? new Date(parseInt(oldest[1]) + windowSeconds * 1000) : new Date(now + windowSeconds * 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, windowSeconds);

  return {
    allowed: true,
    remaining: limit - count - 1,
    resetAt: new Date(now + windowSeconds * 1000),
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

