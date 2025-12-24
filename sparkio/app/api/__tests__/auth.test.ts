import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as loginPost } from '../auth/login/route';
import { POST as registerPost } from '../auth/register/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    session: {
      create: vi.fn(),
      update: vi.fn(),
    },
    wallet: {
      create: vi.fn(),
    },
    gamificationState: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      user: {
        create: vi.fn(),
      },
      wallet: {
        create: vi.fn(),
      },
      gamificationState: {
        create: vi.fn(),
      },
    })),
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 10, resetAt: new Date() }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/referral-code', () => ({
  generateReferralCode: vi.fn().mockResolvedValue('TESTCODE123'),
}));

vi.mock('@/lib/referrals', () => ({
  createMultiLevelReferralEvents: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('access-token'),
  signRefreshToken: vi.fn().mockReturnValue('refresh-token'),
}));

vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}));

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password missing', async () => {
      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await loginPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 401 if user not found', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });

      const response = await loginPost(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields missing', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 409 if user already exists', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      } as any);

      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await registerPost(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
    });
  });
});

