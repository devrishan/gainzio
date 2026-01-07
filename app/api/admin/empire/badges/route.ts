import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { name, description, icon, reqType, reqValue, xpBonus } = body;

        // Create Badge (Assuming Badge model exists or using a JSON config approach if not)
        // Checking schema: The user hasn't shown me a Badge model, only UserBadge. 
        // I'll assume we are storing this in SystemConfig for now if Badge model is missing, 
        // OR I will assume a Badge model was added in V1. 
        // Let's use SystemConfig "custom_badges" to be safe and avoid schema conflicts without `prisma db push`.

        const configKey = "custom_badges";
        const existingConfig = await prisma.systemConfig.findUnique({ where: { key: configKey } });
        let badges = (existingConfig?.value as any[]) || [];

        const newBadge = {
            id: Date.now().toString(),
            name,
            description,
            icon: icon || "Star",
            requirement: { type: reqType, value: Number(reqValue) },
            xpBonus: Number(xpBonus)
        };

        badges.push(newBadge);

        await prisma.systemConfig.upsert({
            where: { key: configKey },
            update: { value: badges },
            create: { key: configKey, value: badges, description: "Custom Achievements" }
        });

        return NextResponse.json({ success: true, badge: newBadge });

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const config = await prisma.systemConfig.findUnique({ where: { key: "custom_badges" } });
    return NextResponse.json({ success: true, badges: config?.value || [] });
}
