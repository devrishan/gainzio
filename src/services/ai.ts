import { prisma } from "@/lib/prisma";
import { calculateSmartScore } from "@/lib/gamification";

interface AIResponse {
    text: string;
    action?: {
        label: string;
        url: string;
    };
}

export const processUserMessage = async (userId: string, message: string): Promise<AIResponse> => {
    const lowerMsg = message.toLowerCase();

    // 1. Context Fetching (Parallel)
    const [user, wallet, gamification] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, select: { username: true, email: true } }),
        prisma.wallet.findUnique({ where: { id: userId } }), // Fix: Wallet ID != User ID usually, but schema says userId @unique so findUnique({where: {userId}}) is correct? Schema check: userId is unique field in Wallet model? Yes.
        prisma.gamificationState.findUnique({ where: { userId } })
    ]);

    // Quick Fix: If wallet queries fail via findUnique on ID if ID!=UserId. 
    // Schema says: model Wallet { userId String @unique ... }
    // So we should use findUnique({ where: { userId } })

    const realWallet = await prisma.wallet.findUnique({ where: { userId } });

    // 2. Intent Analysis

    // BALANCE / EARNINGS
    if (lowerMsg.includes("balance") || lowerMsg.includes("earn") || lowerMsg.includes("money") || lowerMsg.includes("wallet")) {
        const balance = realWallet?.balance || 0;
        const total = realWallet?.totalEarned || 0;
        const coins = realWallet?.coins || 0;

        return {
            text: `Here is your financial summary, ${user?.username || 'Member'}:\n\n💰 **Balance**: ₹${balance}\n💸 **Total Earned**: ₹${total}\n🟡 **Coins**: ${coins}\n\nYou can withdraw your balance once you reach the threshold.`,
            action: { label: "Go to Wallet", url: "/member/withdraw" }
        };
    }

    // WITHDRAW
    if (lowerMsg.includes("withdraw") || lowerMsg.includes("payout") || lowerMsg.includes("cash out")) {
        return {
            text: "You can request a payout via UPI once you have sufficient balance. Withdrawals are processed within 24-48 hours.",
            action: { label: "Request Withdrawal", url: "/member/withdraw" }
        };
    }

    // GAMIFICATION / RANK
    if (lowerMsg.includes("rank") || lowerMsg.includes("xp") || lowerMsg.includes("level") || lowerMsg.includes("score")) {
        const score = await calculateSmartScore(userId);
        const rank = gamification?.rank || "NEWBIE";
        const xp = gamification?.xp || 0;

        return {
            text: `You are currently a **${rank}** with **${xp} XP**.\nYour Smart Score is **${score}** (Calculated as 100 pts per ₹1 earned).\n\nKeep completing tasks to rank up!`,
            action: { label: "View Leaderboard", url: "/member/leaderboard" }
        };
    }

    // COINS / SHOP
    if (lowerMsg.includes("shop") || lowerMsg.includes("buy") || lowerMsg.includes("spend")) {
        return {
            text: `You have **${realWallet?.coins || 0} Coins**.\nVisit the Coin Shop to buy power-ups like Streak Freezes or Task Peeks.`,
            action: { label: "Visit Shop", url: "/member/dashboard" } // Shop is on dashboard
        };
    }

    // TASKS
    if (lowerMsg.includes("task") || lowerMsg.includes("work")) {
        return {
            text: "Ready to earn? Check out the available Daily Quests and Tasks.",
            action: { label: "View Tasks", url: "/member/tasks" }
        };
    }

    // REFERRALS
    if (lowerMsg.includes("invite") || lowerMsg.includes("refer") || lowerMsg.includes("friend")) {
        return {
            text: "Invite friends and earn 10% of their revenue for life! You also get +100 XP per verified referral.",
            action: { label: "Get Referral Link", url: "/member/referrals" }
        };
    }

    // GREETING
    if (lowerMsg.includes("hi") || lowerMsg.includes("hello") || lowerMsg.includes("hey")) {
        return {
            text: `Hello ${user?.username}! I'm Gainzio AI. \nI can help you check your stats, find tasks, or explain how the platform works. What do you need?`
        };
    }

    // DEFAULT
    return {
        text: "I didn't quite catch that. I can help with:\n- Checking your **Balance** or **Rank**\n- Explaining **Withdrawals**\n- Finding **Tasks**\n\nWhat would you like to know?"
    };
};
