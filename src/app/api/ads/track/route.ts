import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { type, campaignId } = body;

        // Get authenticated user
        const user = await getAuthUser();
        const userId = user?.id || null;

        if (!type || !campaignId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const userAgent = req.headers.get("user-agent");
        const ip = req.headers.get("x-forwarded-for") || "unknown";

        if (type === "VIEW") {
            // Increment view count
            await prisma.adCampaign.update({
                where: { id: campaignId },
                data: { views: { increment: 1 } }
            });

            // Log impression
            await prisma.adImpression.create({
                data: {
                    campaignId,
                    userId,
                    userAgent,
                    ipAddress: typeof ip === 'string' ? ip : ip[0]
                }
            });
        } else if (type === "CLICK") {
            // Increment click count
            await prisma.adCampaign.update({
                where: { id: campaignId },
                data: { clicks: { increment: 1 } }
            });

            // Log click
            await prisma.adClick.create({
                data: {
                    campaignId,
                    userId,
                    userAgent,
                    ipAddress: typeof ip === 'string' ? ip : ip[0]
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("[ADS_TRACK]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
