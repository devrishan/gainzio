import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFeatureFlag,
  setFeatureFlag,
  isFeatureEnabled,
  getAllFeatureFlags,
  deleteFeatureFlag,
} from '../feature-flags';

vi.mock('@/lib/redis', () => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  };
  return {
    getRedis: () => mockRedis,
  };
});

// We don't need to mock getRedis anymore if we mock ioredis, 
// unless we want to bypass redis.ts logic. 
// However, redis.ts logic checks env vars.
// Let's rely on standard redis.ts behavior but with mocked ioredis.

// But wait, redis.ts exports getRedis.
// If we verify that getRedis logic works with mocked ioredis.
// The test uses standard imports.

describe('Feature Flags', () => {
  const mockRedis = getRedis() as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeatureFlag', () => {
    it('should return flag from Redis', async () => {
      const flag = { key: 'TEST_FLAG', enabled: true, rolloutPercentage: 100 };
      mockRedis.get.mockResolvedValue(JSON.stringify(flag));

      const result = await getFeatureFlag('TEST_FLAG');

      expect(result).toEqual(flag);
      expect(mockRedis.get).toHaveBeenCalledWith('feature_flag:TEST_FLAG');
    });

    it('should return null if flag not found', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getFeatureFlag('NON_EXISTENT');

      expect(result).toBeNull();
    });

    it('should fallback to environment variable if Redis unavailable', async () => {
      vi.mock('../redis', () => ({
        getRedis: () => null,
      }));

      process.env.FEATURE_TEST_FLAG = 'true';
      const result = await getFeatureFlag('TEST_FLAG');
      expect(result?.enabled).toBe(true);
      expect(result?.rolloutPercentage).toBe(100);
    });
  });

  describe('setFeatureFlag', () => {
    it('should set flag in Redis', async () => {
      const flag = { key: 'TEST_FLAG', enabled: true, rolloutPercentage: 50 };
      mockRedis.set.mockResolvedValue('OK');

      await setFeatureFlag(flag);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'feature_flag:TEST_FLAG',
        JSON.stringify(flag),
      );
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true if flag is enabled and rollout is 100%', async () => {
      const flag = { key: 'TEST_FLAG', enabled: true, rolloutPercentage: 100 };
      mockRedis.get.mockResolvedValue(JSON.stringify(flag));

      const result = await isFeatureEnabled('TEST_FLAG', 'user123');

      expect(result).toBe(true);
    });

    it('should return false if flag is disabled', async () => {
      const flag = { key: 'TEST_FLAG', enabled: false, rolloutPercentage: 100 };
      mockRedis.get.mockResolvedValue(JSON.stringify(flag));

      const result = await isFeatureEnabled('TEST_FLAG', 'user123');

      expect(result).toBe(false);
    });

    it('should respect rollout percentage', async () => {
      const flag = { key: 'TEST_FLAG', enabled: true, rolloutPercentage: 50 };
      mockRedis.get.mockResolvedValue(JSON.stringify(flag));

      // Test multiple users to see rollout distribution
      const results = await Promise.all([
        isFeatureEnabled('TEST_FLAG', 'user1'),
        isFeatureEnabled('TEST_FLAG', 'user2'),
        isFeatureEnabled('TEST_FLAG', 'user3'),
        isFeatureEnabled('TEST_FLAG', 'user4'),
      ]);

      // At 50% rollout, some users should have it enabled
      expect(results.some((r) => r === true)).toBe(true);
    });

    it('should check target users', async () => {
      const flag = {
        key: 'TEST_FLAG',
        enabled: true,
        rolloutPercentage: 100,
        targetUsers: ['user1', 'user2'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(flag));

      expect(await isFeatureEnabled('TEST_FLAG', 'user1')).toBe(true);
      expect(await isFeatureEnabled('TEST_FLAG', 'user2')).toBe(true);
      expect(await isFeatureEnabled('TEST_FLAG', 'user3')).toBe(false);
    });

    it('should check target roles', async () => {
      const flag = {
        key: 'TEST_FLAG',
        enabled: true,
        rolloutPercentage: 100,
        targetRoles: ['ADMIN'],
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(flag));

      expect(await isFeatureEnabled('TEST_FLAG', 'user1', 'ADMIN')).toBe(true);
      expect(await isFeatureEnabled('TEST_FLAG', 'user2', 'USER')).toBe(false);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all flags from Redis', async () => {
      const flags = [
        { key: 'FLAG1', enabled: true, rolloutPercentage: 100 },
        { key: 'FLAG2', enabled: false, rolloutPercentage: 50 },
      ];
      mockRedis.keys.mockResolvedValue(['feature_flag:FLAG1', 'feature_flag:FLAG2']);
      mockRedis.get
        .mockResolvedValueOnce(JSON.stringify(flags[0]))
        .mockResolvedValueOnce(JSON.stringify(flags[1]));

      const result = await getAllFeatureFlags();

      expect(result).toHaveLength(2);
      expect(result).toEqual(flags);
    });

    it('should return empty array if no flags exist', async () => {
      mockRedis.keys.mockResolvedValue([]);

      const result = await getAllFeatureFlags();

      expect(result).toEqual([]);
    });
  });

  describe('deleteFeatureFlag', () => {
    it('should delete flag from Redis', async () => {
      mockRedis.del.mockResolvedValue(1);

      await deleteFeatureFlag('TEST_FLAG');

      expect(mockRedis.del).toHaveBeenCalledWith('feature_flag:TEST_FLAG');
    });
  });
});

