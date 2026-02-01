import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/services/settings-service";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Returns effective settings (merged logic)
        const settings = await settingsService.getEffectiveSettings(user.id);
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        // User can only update their specific preferences
        if (body.aiPreferences) {
            await settingsService.updateUserPreferences(user.id, body.aiPreferences);
        }

        // Return the new effective state
        const settings = await settingsService.getEffectiveSettings(user.id);
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
