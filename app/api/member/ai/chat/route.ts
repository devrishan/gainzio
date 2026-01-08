import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { processUserMessage } from "@/services/ai";

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { message } = await req.json();
        if (!message || typeof message !== 'string') {
            return new NextResponse("Message required", { status: 400 });
        }

        // Simulate "thinking" delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        const response = await processUserMessage(user.id, message);

        return NextResponse.json(response);

    } catch (error) {
        console.error("[AI_CHAT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
