import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateRank, addXP, XP_REWARDS } from '../gamification';
import { Rank } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Mock feature flags
vi.mock('../feature-flags', () => ({
  isFeatureEnabled: vi.fn().mockResolvedValue(true),
}));

describe('Gamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateRank', () => {
    it('should return NEWBIE for 0 XP', () => {
      expect(calculateRank(0)).toBe(Rank.NEWBIE);
    });

    it('should return NEWBIE for 999 XP', () => {
      expect(calculateRank(999)).toBe(Rank.NEWBIE);
    });

    it('should return PRO for 1000 XP', () => {
      expect(calculateRank(1000)).toBe(Rank.PRO);
    });

    it('should return PRO for 4999 XP', () => {
      expect(calculateRank(4999)).toBe(Rank.PRO);
    });

    it('should return ELITE for 5000 XP', () => {
      expect(calculateRank(5000)).toBe(Rank.ELITE);
    });

    it('should return ELITE for 19999 XP', () => {
      expect(calculateRank(19999)).toBe(Rank.ELITE);
    });

    it('should return MASTER for 20000 XP', () => {
      expect(calculateRank(20000)).toBe(Rank.MASTER);
    });

    it('should return MASTER for 50000 XP', () => {
      expect(calculateRank(50000)).toBe(Rank.MASTER);
    });
  });

  describe('addXP', () => {
    it('should create gamification state if it does not exist', async () => {
      vi.mocked(prisma.gamificationState.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.gamificationState.create).mockResolvedValue({
        id: 'gamification-1',
        userId: 'user-1',
        xp: 100,
        rank: Rank.NEWBIE,
        streakDays: 0,
        lastLoginAt: null,
      });
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as any);

      const result = await addXP('user-1', 100, 'Test XP', { test: true });

      expect(result.newXP).toBe(100);
      expect(result.newRank).toBe(Rank.NEWBIE);
      expect(result.rankUpgraded).toBe(false);
      expect(prisma.gamificationState.create).toHaveBeenCalled();
    });

    it('should update existing gamification state', async () => {
      vi.mocked(prisma.gamificationState.findUnique).mockResolvedValue({
        id: 'gamification-1',
        userId: 'user-1',
        xp: 500,
        rank: Rank.NEWBIE,
        streakDays: 0,
        lastLoginAt: null,
      });
      vi.mocked(prisma.gamificationState.update).mockResolvedValue({
        id: 'gamification-1',
        userId: 'user-1',
        xp: 600,
        rank: Rank.NEWBIE,
        streakDays: 0,
        lastLoginAt: null,
      });
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as any);

      const result = await addXP('user-1', 100, 'Test XP');

      expect(result.newXP).toBe(600);
      expect(prisma.gamificationState.update).toHaveBeenCalled();
    });

    it('should detect rank upgrade', async () => {
      vi.mocked(prisma.gamificationState.findUnique).mockResolvedValue({
        id: 'gamification-1',
        userId: 'user-1',
        xp: 500,
        rank: Rank.NEWBIE,
        streakDays: 0,
        lastLoginAt: null,
      });
      vi.mocked(prisma.gamificationState.update).mockResolvedValue({
        id: 'gamification-1',
        userId: 'user-1',
        xp: 1500,
        rank: Rank.PRO,
        streakDays: 0,
        lastLoginAt: null,
      });
      vi.mocked(prisma.activityLog.create).mockResolvedValue({} as any);

      const result = await addXP('user-1', 1000, 'Test XP');

      expect(result.rankUpgraded).toBe(true);
      expect(result.newRank).toBe(Rank.PRO);
    });
  });

  describe('XP_REWARDS', () => {
    it('should have correct reward values', () => {
      expect(XP_REWARDS.TASK_APPROVED).toBe(100);
      expect(XP_REWARDS.REFERRAL_VERIFIED).toBe(50);
      expect(XP_REWARDS.DAILY_LOGIN).toBe(10);
      expect(XP_REWARDS.FIRST_TASK).toBe(50);
    });
  });
});

