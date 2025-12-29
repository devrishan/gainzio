import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!redis) {
    const url = process.env.REDIS_URL;

    // Check for invalid Redis URL configurations
    if (!url || (process.env.NODE_ENV === 'production' && (url.includes('localhost') || url.includes('127.0.0.1')))) {
      if (url) {
        // Case: URL exists but is localhost in production
        console.warn('Redis is configured to use localhost in production. Disabling Redis to prevent connection errors.');
      } else {
        // Case: URL is empty
        // During build phase, REDIS_URL might not be set, but we still want to proceed without error.
        // If it's production and URL is empty, we disable it.
        // If it's not production and URL is empty, we disable it.
        if (process.env.NODE_ENV === 'production') {
          // During build, REDIS_URL might not be set. We still disable Redis features.
          console.warn('REDIS_URL is not set in production. Redis features will be disabled.');
        } else {
          console.warn('REDIS_URL is not set. Redis features will be disabled.');
        }
      }
      return null; // Disable Redis features for these cases
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


