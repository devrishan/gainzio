import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIResponse {
    role: "assistant";
    content: string;
    suggestedActions?: {
        label: string;
        action: string; // e.g., "NAVIGATE:/tasks", "COPY:CODE"
    }[];
}

const getGenAIModel = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
};

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
            pendingTasks: activeTasks.map((t: any) => t.task.title)
        };
    }

    /**
     * Processes a user message and returns an AI response using Gemini.
     */
    async processUserMessage(userId: string, message: string): Promise<AIResponse> {
        try {
            const model = getGenAIModel();
            const context = await this.getUserContext(userId);

            const systemInstruction = `
                You are Gainzio AI, a helpful assistant for the Gainzio platform. 
                Gainzio is a platform where users earn money by completing tasks.
                
                User Context:
                - Username: ${context.username}
                - Balance: ${context.balance} Coins
                - Rank: ${context.rank}
                - XP: ${context.xp}
                - Streak: ${context.streak} days
                - Pending Tasks: ${context.pendingTasks.join(", ") || "None"}
                
                Instructions:
                1. Be concise, friendly, and helpful.
                2. Use the user context to answer questions about their account.
                3. If the user asks about earning more, suggest they check the tasks.
                4. You MUST respond in a valid JSON format that matches this schema:
                   {
                     "content": "string (markdown allowed)",
                     "suggestedActions": [
                       { "label": "string", "action": "string" }
                     ]
                   }
                5. Valid actions for suggestedActions:
                   - "NAVIGATE:<path>" (e.g., "NAVIGATE:/member/tasks", "NAVIGATE:/member/wallet")
                   - "CMD:<command>" (e.g., "CMD:CHECK_BALANCE")
                6. Do not include any text before or after the JSON.
            `;

            const result = await model.generateContent(`${systemInstruction}\n\nUser Question: ${message}`);

            const responseText = result.response.text();

            try {
                const parsed = JSON.parse(responseText);

                return {
                    role: "assistant",
                    content: parsed.content || "I'm sorry, I couldn't process your request.",
                    suggestedActions: parsed.suggestedActions || []
                };
            } catch (parseError) {
                console.error("Failed to parse Gemini JSON response:", responseText, parseError);
                return {
                    role: "assistant",
                    content: "I received an invalid response format from my brain. Here is the raw message: " + responseText,
                    suggestedActions: [
                        { label: "View Tasks", action: "NAVIGATE:/member/tasks" }
                    ]
                };
            }
        } catch (error: any) {
            console.error("Gemini AI Processing Error:", error);

            // Check for specific missing key error
            if (error.message && error.message.includes("GEMINI_API_KEY")) {
                return {
                    role: "assistant",
                    content: "I'm currently undergoing maintenance (Missing API Configuration). Please contact the administrator.",
                    suggestedActions: []
                };
            }

            return {
                role: "assistant",
                content: "I'm having trouble connecting to my brain right now. Please try again later!",
                suggestedActions: [
                    { label: "Refresh Page", action: "CMD:REFRESH" }
                ]
            };
        }
    }
}

export const aiService = new AIService();
