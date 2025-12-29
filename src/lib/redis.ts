import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      console.warn('REDIS_URL is not set. Redis features will be disabled.');
      return null;
    }
    redis = new Redis(url);

    // Prevent build crashes on connection errors
    redis.on('error', (err) => {
      console.error('Redis connection error:', err instanceof Error ? err.message : err);
    });
  }
  return redis;
}


