
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const task = await prisma.task.findUnique({
            where: { id: params.id },
            include: { category: true }
        });

        if (!task) {
            return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, task });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error fetching task' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        // Remove id and slug from update if present (usually we don't update slug unless requested)
        const { id, slug, createdAt, updatedAt, ...updateData } = body;

        // Ensure numeric fields are converted
        if (updateData.rewardAmount) updateData.rewardAmount = Number(updateData.rewardAmount);
        if (updateData.rewardCoins) updateData.rewardCoins = Number(updateData.rewardCoins);
        if (updateData.priority) updateData.priority = Number(updateData.priority);
        if (updateData.maxSubmissions) updateData.maxSubmissions = updateData.maxSubmissions ? Number(updateData.maxSubmissions) : null;
        if (updateData.expiresAt) updateData.expiresAt = updateData.expiresAt ? new Date(updateData.expiresAt) : null;

        const task = await prisma.task.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json({ success: true, task });
    } catch (error) {
        console.error("Update task error:", error);
        return NextResponse.json({ success: false, error: 'Error updating task' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Soft delete
        await prisma.task.update({
            where: { id: params.id },
            data: { isDeleted: true, deletedAt: new Date(), isActive: false }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Error deleting task' }, { status: 500 });
    }
}
