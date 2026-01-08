import { prisma as db } from "@/lib/prisma";

export const getGamificationProfile = async (userId: string) => {
    const profile = await db.gamificationState.findUnique({
        where: { userId },
        include: {
            inventory: {
                include: {
                    shopItem: true
                }
            },
            badges: {
                include: {
                    badge: true
                }
            }
        }
    });

    if (!profile) {
        // Auto-create if missing
        return await db.gamificationState.create({
            data: { userId }
        });
    }

    return profile;
};

export const getShopItems = async () => {
    return await db.shopItem.findMany({
        where: { isActive: true },
        orderBy: { cost: 'asc' }
    });
};

export const calculateSmartScore = async (userId: string) => {
    // 1. Get stats
    const [user, referrals, tasks] = await Promise.all([
        db.user.findUnique({
            where: { id: userId },
            select: {
                gamification: true,
                wallet: true,
                createdAt: true
            }
        }),
        db.referral.count({
            where: { referrerId: userId, status: 'verified' }
        }),
        db.taskSubmission.count({
            where: { userId, status: 'APPROVED' }
        })
    ]);

    if (!user || !user.gamification) return 0;

    // 2. Logic
    // - Referral: 10 pts
    // - Task: 5 pts
    // - Streak: 2 pts/day
    // - Earnings: 1 pt per 100 currency
    const referralScore = referrals * 10;
    const taskScore = tasks * 5;
    const streakScore = (user.gamification.streakDays ?? 0) * 2;
    // 1 Rupee = 100 Points
    const earningScore = Math.floor(Number(user.wallet?.totalEarned ?? 0) * 100);

    const totalScore = referralScore + taskScore + streakScore + earningScore;

    // 3. Update DB
    await db.gamificationState.update({
        where: { userId },
        data: {
            smartScore: totalScore,
            lastScoreUpdate: new Date()
        }
    });

    return totalScore;
};

export const purchaseItem = async (userId: string, itemId: string) => {
    // Transaction to ensure atomic coin deduction + item add
    return await db.$transaction(async (tx) => {
        const item = await tx.shopItem.findUnique({ where: { id: itemId } });
        if (!item) throw new Error("Item not found");

        const wallet = await tx.wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.coins < item.cost) {
            throw new Error("Insufficient coins");
        }

        // Deduct coins
        await tx.wallet.update({
            where: { userId },
            data: { coins: { decrement: item.cost } }
        });

        // Add to Inventory
        // Check if consumable or unique
        const existing = await tx.userInventory.findUnique({
            where: {
                gamificationId_shopItemId: {
                    gamificationId: (await tx.gamificationState.findUniqueOrThrow({ where: { userId } })).id,
                    shopItemId: itemId
                }
            }
        });

        if (existing) {
            await tx.userInventory.update({
                where: { id: existing.id },
                data: { quantity: { increment: 1 } }
            });
        } else {
            const gamification = await tx.gamificationState.findUniqueOrThrow({ where: { userId } });
            await tx.userInventory.create({
                data: {
                    userId,
                    gamificationId: gamification.id,
                    shopItemId: itemId,
                    quantity: 1,
                    remainingUses: item.type === 'CONSUMABLE' ? 1 : null // Default logic
                }
            });
        }

        // Log Transaction
        await tx.coinTransaction.create({
            data: {
                userId,
                amount: -item.cost,
                type: 'SPEND',
                description: `Purchased ${item.name}`,
                source: 'SHOP'
            }
        });

        return { success: true, item };
    });
};
