/**
 * Initialize default feature flags in Redis
 * Run this script to set up default feature flags for the platform
 */

import { setFeatureFlag } from '../src/lib/feature-flags';

const defaultFlags = [
  {
    key: 'GAMIFICATION_ENABLED',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable gamification features (XP, ranks, badges, streaks)',
  },
  {
    key: 'MULTI_LEVEL_REFERRALS_ENABLED',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable multi-level referral system (L1/L2/L3 commissions)',
  },
  {
    key: 'SPARK_WALL_ENABLED',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enable Spark Wall real-time event feed',
  },
];

async function initFeatureFlags() {
  console.log('🚀 Initializing default feature flags...');

  for (const flag of defaultFlags) {
    try {
      await setFeatureFlag({
        key: flag.key,
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
      });
      console.log(`✅ Created flag: ${flag.key} (${flag.enabled ? 'enabled' : 'disabled'}, ${flag.rolloutPercentage}% rollout)`);
    } catch (error) {
      console.error(`❌ Failed to create flag ${flag.key}:`, error);
    }
  }

  console.log('✨ Feature flags initialization complete!');
  console.log('\nYou can manage feature flags at /admin/feature-flags');
}

// Run if called directly
if (require.main === module) {
  initFeatureFlags()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error initializing feature flags:', error);
      process.exit(1);
    });
}

export { initFeatureFlags };

