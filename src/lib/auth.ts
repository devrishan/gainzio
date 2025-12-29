import { cookies } from 'next/headers';
import { verifyAccessToken } from './jwt';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  phone: string | null;
  email: string | null;
  username: string | null;
  role: Role;
  referralCode: string;
}

/**
 * Get authenticated user from access token
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('gainzio_access_token')?.value;

    if (!accessToken) {
      return null;
    }

    let userId: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userId = payload.sub;
    } catch {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isDeleted) {
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      username: user.username,
      role: user.role,
      referralCode: user.referralCode,
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

