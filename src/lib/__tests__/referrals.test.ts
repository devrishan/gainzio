import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateMultiLevelCommissions } from '../referrals';

describe('Referrals', () => {
  describe('calculateMultiLevelCommissions', () => {
    it('should calculate L1 commission correctly', () => {
      const baseAmount = 1000;
      const commissions = calculateMultiLevelCommissions(baseAmount, 50, 30, 20);

      expect(commissions).toHaveLength(3);
      expect(commissions[0].level).toBe(1);
      expect(commissions[0].amount).toBe(500); // 50% of 1000
      expect(commissions[0].percentage).toBe(50);
    });

    it('should calculate L2 commission correctly', () => {
      const baseAmount = 1000;
      const commissions = calculateMultiLevelCommissions(baseAmount, 50, 30, 20);

      expect(commissions[1].level).toBe(2);
      expect(commissions[1].amount).toBe(300); // 30% of 1000
      expect(commissions[1].percentage).toBe(30);
    });

    it('should calculate L3 commission correctly', () => {
      const baseAmount = 1000;
      const commissions = calculateMultiLevelCommissions(baseAmount, 50, 30, 20);

      expect(commissions[2].level).toBe(3);
      expect(commissions[2].amount).toBe(200); // 20% of 1000
      expect(commissions[2].percentage).toBe(20);
    });

    it('should handle zero percentages', () => {
      const baseAmount = 1000;
      const commissions = calculateMultiLevelCommissions(baseAmount, 100, 0, 0);

      expect(commissions).toHaveLength(1);
      expect(commissions[0].level).toBe(1);
      expect(commissions[0].amount).toBe(1000);
    });

    it('should handle custom percentages', () => {
      const baseAmount = 2000;
      const commissions = calculateMultiLevelCommissions(baseAmount, 60, 25, 15);

      expect(commissions[0].amount).toBe(1200); // 60% of 2000
      expect(commissions[1].amount).toBe(500); // 25% of 2000
      expect(commissions[2].amount).toBe(300); // 15% of 2000
    });
  });
});

