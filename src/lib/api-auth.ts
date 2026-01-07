import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export interface AuthenticatedUser {
    userId: string;
    id: string;
    role?: string;
    username?: string;
    email?: string;
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
    // 1. Try NextAuth Session (Preferred for Google/Email Login)
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
        return {
            userId: session.user.id,
            id: session.user.id,
            username: (session.user as any).username || session.user.name || "Admin",
            role: (session.user as any).role || "USER",
            email: session.user.email
        };
    }

    let accessToken: string | undefined;

    // 2. Try Bearer Token from Header (Priority for API/App)
    if (request) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        }
    }

    // 3. Fallback to Cookies (For Web - Legacy or Custom)
    if (!accessToken) {
        const cookieStore = cookies();
        accessToken = cookieStore.get('gainzio_access_token')?.value ||
            cookieStore.get('earniq_access_token')?.value; // Legacy fallback
    }

    // 4. Verify Custom Token
    if (!accessToken) {
        return null;
    }

    try {
        const payload = await verifyAccessToken(accessToken);
        return {
            userId: payload.sub,
            id: payload.sub,
            username: payload.username || "User",
            role: payload.role,
        };
    } catch (error) {
        // Token valid check failed
        return null;
    }
}
