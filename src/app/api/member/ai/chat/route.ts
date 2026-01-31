import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { aiService } from "@/services/ai-service";

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

        // Rate Limiting could go here (e.g. Redis based or simple DB check)

        const response = await aiService.processUserMessage(user.id, message);

        return NextResponse.json(response);
    } catch (error) {
        console.error("AI Chat Error:", error);
        return NextResponse.json(
            { error: "Failed to process message" },
            { status: 500 }
        );
    }
}
