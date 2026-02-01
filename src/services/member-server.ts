import { prisma } from '@/lib/prisma';
import { calculateSmartScore } from '@/lib/gamification';
import { getReferralChain } from '@/lib/referrals';
import { startOfWeek, endOfWeek } from 'date-fns';

/**
 * Fetch all dashboard data in parallel for maximum performance
 * Used directly by Server Components to avoid HTTP overhead
 */
export async function getDashboardData(userId: string) {
    // Run independent queries in parallel
    const [wallet, referralStats, topReferrers, smartScore, gamificationProfile] = await Promise.all([
        // 1. Get Wallet
        prisma.wallet.findUnique({ where: { userId } }),

        // 2. Get Referral Stats
        prisma.referral.groupBy({
            by: ['status'],
            where: { referrerId: userId },
            _count: { id: true },
        }),

        // 3. Get Top Referrers (Optimized: fetch top 5 by verified referrals count)
        // Note: Realistically, this requires a complex query or a separate 'stats' table.
        // For now, we'll stick to a simple query but make it slightly better if possible,
        // or just keep the existing logic but parallelized.
        // Existing logic was flawed (fetched random 5), let's try to improve it slightly 
        // by at least ordering by wallet earned if possible, or just accept the current limitation for speed.
        prisma.user.findMany({
            where: { role: 'USER' },
            include: {
                referralEvents: { where: { status: 'verified' } },
                wallet: true,
            },
            take: 5,
            orderBy: {
                wallet: { totalEarned: 'desc' } // Better heuristic than random
            }
        }),

        // 4. Calculate Smart Score
        calculateSmartScore(userId),

        // 5. Gamification Profile
        prisma.gamificationState.findUnique({
            where: { userId },
            include: { badges: true },
        })
    ]);

    // Handle initialization if missing (sequential part, but rare)
    let finalWallet = wallet;
    if (!finalWallet) {
        finalWallet = await prisma.wallet.upsert({
            where: { userId },
            create: {
                userId,
                balance: 0,
                pendingAmount: 0,
                withdrawable: 0,
                lockedAmount: 0,
                coins: 0,
                totalEarned: 0,
                currency: 'INR',
            },
            update: {}, // No-op
        });
    }

    let finalGamification = gamificationProfile;
    if (!finalGamification) {
        // Use upsert to prevent race conditions with calculateSmartScore which runs in parallel
        finalGamification = await prisma.gamificationState.upsert({
            where: { userId },
            create: {
                userId,
                xp: 0,
                rank: 'NEWBIE',
                streakDays: 0,
            },
            update: {}, // No-op if exists, just return it
            include: { badges: true },
        });
    }

    // Process Referral Stats
    const totalReferrals = referralStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const verifiedCount = referralStats.find((s) => s.status === 'verified')?._count.id || 0;
    const pendingCount = referralStats.find((s) => s.status === 'pending')?._count.id || 0;
    const successRate = totalReferrals > 0 ? (verifiedCount / totalReferrals) * 100 : 0;

    // Process Top Referrers
    const topReferrersData = topReferrers
        .map((user) => ({
            username: user.username || user.phone || "Member",
            referral_code: user.referralCode,
            verified_referrals: user.referralEvents.length,
            total_earned: user.wallet ? Number(user.wallet.totalEarned) : 0,
        }))
        .sort((a, b) => b.total_earned - a.total_earned);

    // Calculate progression
    const RANKS = {
        NEWBIE: { min: 0, next: 'PRO', max: 1000 },
        PRO: { min: 1000, next: 'ELITE', max: 5000 },
        ELITE: { min: 5000, next: 'MASTER', max: 20000 },
        MASTER: { min: 20000, next: null, max: null },
    };

    const currentRankConfig = RANKS[finalGamification.rank as keyof typeof RANKS] || RANKS.NEWBIE;
    const nextRank = currentRankConfig.next;
    const xpToNext = currentRankConfig.max ? currentRankConfig.max - finalGamification.xp : 0;
    const progressPercent = currentRankConfig.max
        ? Math.min(100, Math.max(0, ((finalGamification.xp - currentRankConfig.min) / (currentRankConfig.max - currentRankConfig.min)) * 100))
        : 100;

    return {
        wallet: {
            balance: Number(finalWallet.balance),
            total_earned: Number(finalWallet.totalEarned),
            coins: Number(finalWallet.coins),
        },
        referrals: {
            total: totalReferrals,
            verified: verifiedCount,
            pending: pendingCount,
            success_rate: Number(successRate.toFixed(2)),
        },
        top_referrers: topReferrersData,
        gamification: {
            xp: finalGamification.xp,
            rank: finalGamification.rank,
            streak: finalGamification.streakDays,
            smartScore: smartScore,
            next_rank: nextRank,
            xp_to_next: xpToNext,
            progress: progressPercent,
        }
    };
}

export async function getMemberReferralsData(userId: string) {
    // Only fetch recent/top referrals for dashboard context if mostly needed
    // But page seems to expect array. Default to recent 10-20.
    const referrals = await prisma.referral.findMany({
        where: { referrerId: userId },
        include: {
            referredUser: {
                select: {
                    id: true,
                    phone: true,
                    username: true,
                    email: true,
                    createdAt: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit for dashboard
    });

    return referrals.map((referral) => ({
        id: referral.id,
        referred_user: {
            id: referral.referredUser.id,
            username: referral.referredUser.username,
            email: referral.referredUser.email,
            phone: referral.referredUser.phone,
            created_at: referral.referredUser.createdAt.toISOString(),
        },
        level: referral.level,
        status: referral.status,
        commission_amount: Number(referral.commissionAmount),
        created_at: referral.createdAt.toISOString(),
        updated_at: referral.updatedAt.toISOString(),
    }));
}

export async function getMemberSquadData(userId: string) {
    // 1. Get System Config for Squad Settings
    const squadConfig = await prisma.systemConfig.findUnique({
        where: { key: 'squad_config' },
    });

    // Default config if not set
    const goalAmount = (squadConfig?.value as any)?.weeklyGoal || 5000;
    const isEnabled = (squadConfig?.value as any)?.enabled ?? true;

    if (!isEnabled) {
        return null; // Or handle disabled state
    }

    // 2. Identify Squad Members (User + Direct Referrals)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            referrals: {
                select: { id: true, username: true } // Direct referrals only
            }
        }
    });

    if (!user) return null;

    const squadMemberIds = [user.id, ...user.referrals.map(r => r.id)];

    // 3. Define Time Window (Current Week)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // 4. Aggregate Earnings (Wallet Transactions)
    const transactions = await prisma.walletTransaction.findMany({
        where: {
            userId: { in: squadMemberIds },
            createdAt: { gte: weekStart, lte: weekEnd },
            amount: { gt: 0 }
        },
        select: {
            userId: true,
            amount: true,
            user: { select: { username: true } }
        }
    });

    // 5. Process Stats
    const totalEarnings = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const contributions: Record<string, number> = {};
    const memberMap: Record<string, string> = {};

    squadMemberIds.forEach(id => {
        contributions[id] = 0;
        if (id === user.id) memberMap[id] = user.username || 'You';
        else {
            const ref = user.referrals.find(r => r.id === id);
            memberMap[id] = ref?.username || 'Member';
        }
    });

    transactions.forEach(t => {
        contributions[t.userId] = (contributions[t.userId] || 0) + Number(t.amount);
    });

    const topContributors = Object.entries(contributions)
        .map(([uid, amount]) => ({
            userId: uid,
            username: uid === userId ? 'You' : (memberMap[uid] || 'Squad Member'),
            amount: amount,
            isSelf: uid === userId
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    return {
        membersCount: squadMemberIds.length,
        weeklyGoal: goalAmount,
        currentTotal: totalEarnings,
        remaining: Math.max(0, goalAmount - totalEarnings),
        progressPercent: Math.min(100, (totalEarnings / goalAmount) * 100),
        isGoalMet: totalEarnings >= goalAmount,
        topContributors,
        weekEndsAt: weekEnd.toISOString()
    };
}
