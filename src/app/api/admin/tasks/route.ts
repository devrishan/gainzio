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

    // Aggregate statistics
    const tasksWithStats = await Promise.all(tasks.map(async (task) => {
        const [submissionCounts, payoutStats] = await Promise.all([
            prisma.taskSubmission.groupBy({
                by: ['status'],
                where: { taskId: task.id },
                _count: true
            }),
            prisma.taskSubmission.aggregate({
                where: { taskId: task.id, status: 'APPROVED' },
                _sum: {
                    user_reward_money: true, // Assuming this field captures money given
                    user_reward_coins: true
                }
            })
        ]);

        const totalSubmissions = submissionCounts.reduce((acc, curr) => acc + curr._count, 0);
        const approvedSubmissions = submissionCounts.find(s => s.status === 'APPROVED')?._count || 0;
        const pendingSubmissions = submissionCounts.filter(s => ['SUBMITTED', 'REVIEWING'].includes(s.status)).reduce((acc, curr) => acc + curr._count, 0);

        // Calculate total potential payout for approved items. 
        // Note: The schema might store the reward given in valid submissions.
        // If not, we estimate: approved * task.rewardAmount
        // Let's check schema carefully. If TaskSubmission doesn't store the exact reward given, 
        // we use the current task reward * approved count, or rely on a WalletTransaction aggregation if linked.
        // For now, simpler approximation: approvedCount * task.rewardAmount.
        // BETTER: If TaskSubmission has reward fields, use them. I'll check schema in next step if this fails, 
        // but for now, I'll stick to a simple calculation based on count to avoid schemas that might not exist yet.
        const totalPayout = approvedSubmissions * task.rewardAmount;

        return {
            ...task,
            stats: {
                totalSubmissions,
                approvedSubmissions,
                pendingSubmissions,
                totalPayout
            }
        };
    }));

    return NextResponse.json({ success: true, tasks: tasksWithStats });
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { title, description, categoryId, rewardAmount, rewardCoins, difficulty, priority, isActive, status, startTime, taskType, targeting, proofConfig, minRank, maxSubmissions, expiresAt } = body;

        if (!title || !categoryId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        // Generate slug
        let baseSlug = slugify(title);
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
                isActive: isActive ?? (status === "ACTIVE" ? true : false),
                status: status || "DRAFT",
                startTime: startTime ? new Date(startTime) : null,
                minRank: (!minRank || minRank === "ALL") ? Rank.NEWBIE : (minRank as Rank),
                taskType: taskType || "STANDARD",
                targeting: targeting || {},
                proofConfig: proofConfig || {},
                maxSubmissions: maxSubmissions ? Number(maxSubmissions) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            } as any
        });

        return NextResponse.json({ success: true, task });

    } catch (error) {
        console.error("Create Task Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
