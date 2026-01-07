import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role, Rank } from '@prisma/client';
import { slugify } from '@/lib/utils'; // Assuming utils exists, or I will implement slug generation manually

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const tasks = await prisma.task.findMany({
        orderBy: { priority: 'desc' },
        include: { category: true }
    });

    return NextResponse.json({ success: true, tasks });
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { title, description, categoryId, rewardAmount, rewardCoins, difficulty, priority, isActive } = body;

        if (!title || !categoryId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        // Generate slug
        let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (await prisma.task.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const task = await prisma.task.create({
            data: {
                title,
                slug,
                description: description || "",
                categoryId,
                rewardAmount: Number(rewardAmount) || 0,
                rewardCoins: Number(rewardCoins) || 0,
                difficulty: difficulty || "EASY",
                priority: Number(priority) || 0,
                isActive: isActive ?? false,
                minRank: Rank.NEWBIE // Default for now
            }
        });

        return NextResponse.json({ success: true, task });

    } catch (error) {
        console.error("Create Task Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
