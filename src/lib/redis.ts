import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) {
      console.warn('REDIS_URL is not set. Redis features will be disabled.');
      // @ts-expect-error - returning null for environments without Redis configured
      return null;
    }
    redis = new Redis(url);
  }
  return redis;
}


