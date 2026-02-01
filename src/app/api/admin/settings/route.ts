import { NextRequest, NextResponse } from "next/server";
import { settingsService } from "@/services/settings-service";
import { getAuthenticatedUser } from "@/lib/api-auth"; // Assuming this exists or similar auth check

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const settings = await settingsService.getSystemSettings();
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        // Validation could be added here (e.g., Zod)

        const updated = await settingsService.updateSystemSettings(body);
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
