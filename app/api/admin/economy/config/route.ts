import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

const CONFIG_KEY = 'gamification_economy_settings';

const DEFAULT_SETTINGS = {
    xpPerRupee: 10,
    referralCommissionPercent: 5,
    rankThresholds: {
        silver: 1000,
        gold: 5000,
        diamond: 20000,
        master: 100000
    },
    minWithdrawalAmount: 100,
    maxWithdrawalAutoApprove: 500
};

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const config = await prisma.systemConfig.findUnique({
        where: { key: CONFIG_KEY }
    });

    return NextResponse.json({
        success: true,
        settings: config?.value || DEFAULT_SETTINGS
    });
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { xpPerRupee, referralCommissionPercent, rankThresholds, minWithdrawalAmount, maxWithdrawalAutoApprove } = body;

        // Validation could go here

        const newSettings = {
            xpPerRupee: Number(xpPerRupee),
            referralCommissionPercent: Number(referralCommissionPercent),
            rankThresholds,
            minWithdrawalAmount: Number(minWithdrawalAmount),
            maxWithdrawalAutoApprove: Number(maxWithdrawalAutoApprove)
        };

        const config = await prisma.systemConfig.upsert({
            where: { key: CONFIG_KEY },
            update: {
                value: newSettings,
                updatedBy: authUser.id,
                timestamp: new Date()
            },
            create: {
                key: CONFIG_KEY,
                value: newSettings,
                description: "Global Gamification & Economy Logic",
                updatedBy: authUser.id
            }
        });

        return NextResponse.json({ success: true, settings: config.value });

    } catch (error) {
        console.error("Economy Update Error: ", error);
        return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    }
}
