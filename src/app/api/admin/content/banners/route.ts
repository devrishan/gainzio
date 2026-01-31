import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

const CONFIG_KEY = 'home_banners';

export async function GET(request: NextRequest) {
    const config = await prisma.systemConfig.findUnique({ where: { key: CONFIG_KEY } });
    return NextResponse.json({
        success: true,
        banners: config?.value || [] // Array of { id, imageUrl, link, isActive }
    });
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { banners } = body; // Expecting full array replace for simplicity

        const config = await prisma.systemConfig.upsert({
            where: { key: CONFIG_KEY },
            update: {
                value: banners,
                updatedBy: authUser.id,
                updatedAt: new Date()
            },
            create: {
                key: CONFIG_KEY,
                value: banners,
                description: "Home Page Rotating Banners",
                updatedBy: authUser.id
            }
        });

        return NextResponse.json({ success: true, banners: config.value });

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
