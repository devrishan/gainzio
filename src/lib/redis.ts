import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!redis) {
    const url = process.env.REDIS_URL;

    if (!url || (process.env.NODE_ENV === 'production' && (url.includes('localhost') || url.includes('127.0.0.1')))) {
      if (url) {
        console.warn('Redis is configured to use localhost in production. Disabling Redis to prevent connection errors.');
      } else {
        console.warn('REDIS_URL is not set. Redis features will be disabled.');
      }
      return null;
    }

    try {
      redis = new Redis(url, {
        maxRetriesPerRequest: 1, // Fail fast during static generation
        retryStrategy(times) {
          if (times > 3) return null; // Stop retrying after 3 attempts
          return Math.min(times * 50, 2000);
        },
      });

      // Prevent build crashes on connection errors
      redis.on('error', (err) => {
        // Suppress connection errors in logs to avoid noise
        // console.error('Redis connection error:', err instanceof Error ? err.message : err);
      });
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      return null;
    }
  }
  return redis;
}


