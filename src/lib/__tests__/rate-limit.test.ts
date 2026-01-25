import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, getClientIp } from '../rate-limit';
import { getRedis } from '../redis';

vi.mock('@/lib/redis', () => {
  const mockRedis = {
    zremrangebyscore: vi.fn(),
    zcard: vi.fn(),
    zrange: vi.fn(),
    zadd: vi.fn(),
    expire: vi.fn(),
  };
  return {
    getRedis: () => mockRedis,
  };
});

describe('Rate Limiting', () => {
  const mockRedis = getRedis() as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard.mockResolvedValue(5); // 5 requests, limit is 10
      mockRedis.zadd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await checkRateLimit({
        identifier: 'test-user',
        type: 'api',
        limit: 10,
        windowSeconds: 60,
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // 10 - 5 - 1
    });

    it('should reject request when over limit', async () => {
      mockRedis.zremrangebyscore.mockResolvedValue(0);
      mockRedis.zcard.mockResolvedValue(10); // 10 requests, limit is 10
      mockRedis.zrange.mockResolvedValue(['timestamp-123', '1234567890']);

      const result = await checkRateLimit({
        identifier: 'test-user',
        type: 'api',
        limit: 10,
        windowSeconds: 60,
      });

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should fallback gracefully when Redis unavailable', async () => {
      vi.mock('../redis', () => ({
        getRedis: () => null,
      }));

      const result = await checkRateLimit({
        identifier: 'test-user',
        type: 'api',
        limit: 10,
        windowSeconds: 60,
      });

      expect(result.allowed).toBe(true); // Should allow in fallback mode
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://example.com', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://example.com', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.2');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const request = new Request('http://example.com', {
        headers: {
          'cf-connecting-ip': '192.168.1.3',
        },
      });

      const ip = getClientIp(request);

      expect(ip).toBe('192.168.1.3');
    });

    it('should return unknown if no IP headers found', () => {
      const request = new Request('http://example.com');

      const ip = getClientIp(request);

      expect(ip).toBe('unknown');
    });
  });
});

