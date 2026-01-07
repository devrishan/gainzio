import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

const CONFIG_KEY = 'system_maintenance_mode';

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const config = await prisma.systemConfig.findUnique({
        where: { key: CONFIG_KEY }
    });

    return NextResponse.json({
        success: true,
        isLocked: config?.value ? (config.value as any).enabled : false
    });
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { enabled } = await request.json();

        const config = await prisma.systemConfig.upsert({
            where: { key: CONFIG_KEY },
            update: {
                value: { enabled, updatedBy: authUser.id, timestamp: new Date() },
                updatedBy: authUser.id
            },
            create: {
                key: CONFIG_KEY,
                value: { enabled, updatedBy: authUser.id, timestamp: new Date() },
                description: "Global System Lockdown Switch",
                updatedBy: authUser.id
            }
        });

        return NextResponse.json({ success: true, isLocked: enabled });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Lockdown failed' }, { status: 500 });
    }
}
