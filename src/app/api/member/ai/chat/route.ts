import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { aiService } from "@/services/ai-service";
import { settingsService } from "@/services/settings-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Invalid message" }, { status: 400 });
        }

        // --- SETTINGS & LIMITS CHECK ---
        const settings = await settingsService.getEffectiveSettings(user.id);

        if (!settings.ai.enabled || !settings.ai.chat) {
            return NextResponse.json({ error: "AI Chat is currently disabled" }, { status: 403 });
        }

        const maxRequests = settings.limits.maxAiRequestsPerDay;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Usage Check using RateLimit model
        // We use windowStart as the day identifier
        let rateLimit = await prisma.rateLimit.findFirst({
            where: {
                identifier: user.id,
                type: "ai_chat",
                windowStart: today
            }
        });

        if (rateLimit && rateLimit.count >= maxRequests) {
            return NextResponse.json({ error: `Daily AI limit reached (${maxRequests} requests/day)` }, { status: 429 });
        }
        // -------------------------------

        const response = await aiService.processUserMessage(user.id, message);

        // Increment Usage
        if (rateLimit) {
            await prisma.rateLimit.update({
                where: { id: rateLimit.id },
                data: { count: { increment: 1 } }
            });
        } else {
            await prisma.rateLimit.create({
                data: {
                    identifier: user.id,
                    type: "ai_chat",
                    windowStart: today,
                    expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Expires end of day
                    count: 1
                }
            });
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}
