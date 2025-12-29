import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export interface AuthenticatedUser {
    userId: string;
    role?: string;
}

export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
    let accessToken: string | undefined;

    // 1. Try Bearer Token from Header (Priority for API/App)
    if (request) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }
    }

    // 2. Fallback to Cookies (For Web)
    if (!accessToken) {
        const cookieStore = cookies();
        accessToken = cookieStore.get('gainzio_access_token')?.value ||
            cookieStore.get('earniq_access_token')?.value; // Legacy fallback
    }

    // 3. Verify Token
    if (!accessToken) {
        return null;
    }

    try {
        const payload = await verifyAccessToken(accessToken);
        return {
            userId: payload.sub,
            role: payload.role,
        };
    } catch (error) {
        // Token valid check failed
        return null;
    }
}
