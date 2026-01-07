import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Fetch top referrers
    const topReferrers = await prisma.user.findMany({
        where: {
            referrals: { some: {} } // Has at least one referral
        },
        include: {
            referrals: {
                select: { id: true, username: true, createdAt: true },
                take: 5 // Limit leaf nodes per parent for visuals
            }
        },
        take: 10,
        orderBy: { referrals: { _count: 'desc' } }
    });

    // Transform to Graph Nodes/Links
    const nodes: any[] = [];
    const links: any[] = [];

    topReferrers.forEach(parent => {
        nodes.push({ id: parent.id, label: parent.username, type: 'parent', val: 10 });
        parent.referrals.forEach(child => {
            nodes.push({ id: child.id, label: child.username, type: 'child', val: 5 });
            links.push({ source: parent.id, target: child.id });
        });
    });

    return NextResponse.json({ success: true, graph: { nodes, links } });
}
