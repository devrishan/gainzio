import { getRedis } from './redis';

export type FeatureFlag = {
  key: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  targetUsers?: string[]; // Specific user IDs
  targetRoles?: string[]; // Specific roles
};

/**
 * Get feature flag value from Redis
 */
export async function getFeatureFlag(key: string): Promise<FeatureFlag | null> {
  const redis = getRedis();
  if (!redis) {
    // Fallback to environment variable if Redis not available
    const envValue = process.env[`FEATURE_${key.toUpperCase()}`];
    return {
      key,
      enabled: envValue === 'true',
      rolloutPercentage: 100,
    };
  }

  try {
    const cached = await redis.get(`feature_flag:${key}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error(`Error reading feature flag ${key}:`, error);
  }

  // Default: check environment variable
  const envValue = process.env[`FEATURE_${key.toUpperCase()}`];
  return {
    key,
    enabled: envValue === 'true',
    rolloutPercentage: 100,
  };
}

/**
 * Set feature flag value in Redis
 */
export async function setFeatureFlag(flag: FeatureFlag): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error('Redis not available');
  }

  await redis.set(`feature_flag:${flag.key}`, JSON.stringify(flag));
}

/**
 * Check if a feature is enabled for a user
 */
export async function isFeatureEnabled(
  key: string,
  userId?: string,
  userRole?: string,
): Promise<boolean> {
  const flag = await getFeatureFlag(key);

  if (!flag) {
    return false;
  }

  if (!flag.enabled) {
    return false;
  }

  // Check target users
  if (flag.targetUsers && userId && !flag.targetUsers.includes(userId)) {
    return false;
  }

  // Check target roles
  if (flag.targetRoles && userRole && !flag.targetRoles.includes(userRole)) {
    return false;
  }

  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    if (userId) {
      // Use consistent hashing based on userId
      const hash = simpleHash(userId + key);
      const userPercentage = (hash % 100) + 1;
      return userPercentage <= flag.rolloutPercentage;
    } else {
      // For anonymous users, use random
      return Math.random() * 100 <= flag.rolloutPercentage;
    }
  }

  return true;
}

/**
 * Simple hash function for consistent user assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const redis = getRedis();
  if (!redis) {
    return [];
  }

  try {
    const keys = await redis.keys('feature_flag:*');
    if (keys.length === 0) {
      return [];
    }

    const flags: FeatureFlag[] = [];
    for (const key of keys) {
      const cached = await redis.get(key);
      if (cached) {
        flags.push(JSON.parse(cached));
      }
    }

    return flags;
  } catch (error) {
    console.error('Error fetching all feature flags:', error);
    return [];
  }
}

/**
 * Delete a feature flag
 */
export async function deleteFeatureFlag(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error('Redis not available');
  }

  await redis.del(`feature_flag:${key}`);
}

