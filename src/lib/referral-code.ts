import { prisma } from './prisma';

/**
 * Generate a unique referral code
 */
export async function generateReferralCode(length: number = 8): Promise<string> {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const maxIndex = characters.length - 1;

  let code: string;
  let exists: boolean;

  do {
    code = '';
    for (let i = 0; i < length; i++) {
      code += characters[Math.floor(Math.random() * maxIndex)];
    }

    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    exists = !!existing;
  } while (exists);

  return code;
}

