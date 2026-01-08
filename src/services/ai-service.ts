import { prisma } from "@/lib/prisma";

export interface AIResponse {
    role: "assistant";
    content: string;
    suggestedActions?: {
        label: string;
        action: string; // e.g., "NAVIGATE:/tasks", "COPY:CODE"
    }[];
}

export class AIService {
    /**
     * Fetches relevant user context for the AI to make informed responses.
     */
    private async getUserContext(userId: string) {
        const [user, wallet, gamification, activeTasks] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, role: true }
            }),
            prisma.wallet.findUnique({
                where: { userId },
                select: { balance: true }
            }),
            prisma.gamificationState.findUnique({
                where: { userId },
                select: { rank: true, xp: true, streakDays: true }
            }),
            // Use SUBMITTED for pending tasks waiting for review
            prisma.taskSubmission.findMany({
                where: { userId, status: "SUBMITTED" },
                take: 3,
                include: { task: { select: { title: true } } }
            })
        ]);

        return {
            username: user?.username || "Traveler",
            balance: wallet?.balance || 0,
            rank: gamification?.rank || "Newbie",
            xp: gamification?.xp || 0,
            streak: gamification?.streakDays || 0,
            pendingTasks: activeTasks.map(t => t.task.title)
        };
    }

    /**
     * Processes a user message and returns an AI response.
     * Currently mocked to simulating intelligent behavior.
     */
    async processUserMessage(userId: string, message: string): Promise<AIResponse> {
        const context = await this.getUserContext(userId);
        const msg = message.toLowerCase();

        // 1. Balance / Earnings Query
        if (msg.includes("balance") || msg.includes("earn") || msg.includes("money")) {
            return {
                role: "assistant",
                content: `You currently have **${context.balance} Coins** in your wallet. \n\nDaily Streak: 🔥 ${context.streak} days\nRank: 🏆 ${context.rank}\n\nWant to earn more? Check out the latest tasks!`,
                suggestedActions: [
                    { label: "View Wallet", action: "NAVIGATE:/member/wallet" },
                    { label: "Go to Tasks", action: "NAVIGATE:/member/dashboard" }
                ]
            };
        }

        // 2. Task Help
        if (msg.includes("task") || msg.includes("pending")) {
            if (context.pendingTasks.length > 0) {
                return {
                    role: "assistant",
                    content: `You have ${context.pendingTasks.length} tasks under review:\n\n${context.pendingTasks.map(t => `- ${t}`).join("\n")}\n\nKeep it up!`,
                    suggestedActions: [
                        { label: "Check Status", action: "NAVIGATE:/member/tasks" }
                    ]
                };
            } else {
                return {
                    role: "assistant",
                    content: "You don't have any pending tasks right now. Ready to start a new one?",
                    suggestedActions: [
                        { label: "Browse Tasks", action: "NAVIGATE:/member/tasks" }
                    ]
                };
            }
        }

        // 3. Support / Help (Generic)
        if (msg.includes("help") || msg.includes("support")) {
            return {
                role: "assistant",
                content: "I'm Gainzio AI. I can help you check your stats, find tasks, or navigate the app. \n\nIf you need human assistance, you can submit a ticket.",
                suggestedActions: [
                    { label: "Contact Support", action: "NAVIGATE:/member/support" }
                ]
            };
        }

        // Default Response
        return {
            role: "assistant",
            content: "I'm here to help! Ask me about your **balance**, **tasks**, or **rank**.",
            suggestedActions: [
                { label: "Check Balance", action: "CMD:CHECK_BALANCE" }, // Example of internal command intent
                { label: "Find Tasks", action: "NAVIGATE:/member/tasks" }
            ]
        };
    }
}

export const aiService = new AIService();
