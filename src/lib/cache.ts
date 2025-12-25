import { getRedis } from './redis';

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Cache utility for Redis-based caching
 */
export class Cache {
  /**
   * Get a value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) {
      return null;
    }

    try {
      const value = await redis.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with TTL
   */
  static async set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete a value from cache
   */
  static async delete(key: string): Promise<void> {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  static async deletePattern(pattern: string): Promise<void> {
    const redis = getRedis();
    if (!redis) {
      return;
    }

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Get or set a value (cache-aside pattern)
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_TTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalidate cache for a specific key pattern
   */
  static async invalidate(pattern: string): Promise<void> {
    await this.deletePattern(pattern);
  }
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  wallet: (userId: string) => `wallet:${userId}`,
  leaderboard: (type: string, period: string) => `leaderboard:${type}:${period}`,
  topSuggestions: () => 'top-suggestions',
  task: (taskId: string) => `task:${taskId}`,
  tasks: (filters: string) => `tasks:${filters}`,
  featureFlag: (key: string) => `feature_flag:${key}`,
};

