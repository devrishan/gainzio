import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { addXP, checkAndAwardBadges, XP_REWARDS } from '@/lib/gamification';

const convertSchema = z.object({
  taskTitle: z.string().min(1).max(255),
  taskDescription: z.string().min(1),
  categoryId: z.string().min(1),
  rewardAmount: z.number().positive(),
  rewardCoins: z.number().int().nonnegative().optional().default(0),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Easy'),
  maxSubmissions: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }


    const userRole = authUser.role;

    const userId = authUser.userId;

    if (userRole !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const suggestionId = params.id;
    const body = await request.json();

    // Validate input
    const validation = convertSchema.parse(body);

    // Get suggestion
    const suggestion = await prisma.productSuggestion.findUnique({
      where: { id: suggestionId },
      include: { user: true },
    });

    if (!suggestion) {
      return NextResponse.json(
        { success: false, error: 'Product suggestion not found' },
        { status: 404 },
      );
    }

    // Generate slug from title
    const slug = validation.taskTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists
    const existingTask = await prisma.task.findUnique({
      where: { slug },
    });

    const finalSlug = existingTask ? `${slug}-${Date.now()}` : slug;

    // Create task from suggestion
    const task = await prisma.$transaction(async (tx) => {
      // Create task
      const newTask = await tx.task.create({
        data: {
          title: validation.taskTitle,
          slug: finalSlug,
          description: validation.taskDescription,
          categoryId: validation.categoryId,
          rewardAmount: validation.rewardAmount,
          rewardCoins: validation.rewardCoins || 0,
          difficulty: validation.difficulty,
          isActive: true,
          maxSubmissions: validation.maxSubmissions || null,
          expiresAt: validation.expiresAt ? new Date(validation.expiresAt) : null,
        },
      });

      // Update suggestion status
      await tx.productSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: 'converted',
          metadata: {
            ...(suggestion.metadata as object || {}),
            convertedAt: new Date().toISOString(),
            convertedBy: userId,
            taskId: newTask.id,
            taskSlug: newTask.slug,
          },
        },
      });

      return newTask;
    });

    // Award XP and check for badges (outside transaction to avoid locking, or inside if critical? 
    // Gamification state determines rank, so better independent or after success)
    // We'll do it after the transaction to prevent holding locks too long, 
    // but typically we want it atomic. For now, let's do it here. 
    // Actually, `addXP` uses its own db calls. Best to run it after `term` succeeds.

    // 1. Award XP
    try {
      await addXP(suggestion.userId, XP_REWARDS.PRODUCT_SUGGESTION_CONVERTED, 'PRODUCT_SUGGESTION_CONVERTED', {
        suggestionId: suggestion.id,
        taskId: task.id
      });

      // 2. Check for badges (e.g. "Idea Machine")
      await checkAndAwardBadges(suggestion.userId);

      // 3. Notify User
      await prisma.notification.create({
        data: {
          userId: suggestion.userId,
          title: "Suggestion Approved!",
          body: `Your product suggestion "${suggestion.productName}" has been converted into a task. You earned ${XP_REWARDS.PRODUCT_SUGGESTION_CONVERTED} XP!`,
          type: "TASK_APPROVED",
          metadata: {
            suggestionId: suggestion.id,
            taskId: task.id,
            xp: XP_REWARDS.PRODUCT_SUGGESTION_CONVERTED
          }
        }
      });

    } catch (err) {
      console.error("Failed to award gamification rewards for suggestion conversion:", err);
      // Don't fail the request, just log error
    }

    return NextResponse.json({
      success: true,
      message: 'Product suggestion converted to task successfully',
      task: {
        id: task.id,
        title: task.title,
        slug: task.slug,
        created_at: task.createdAt.toISOString(),
      },
      suggestion: {
        id: suggestion.id,
        status: 'converted',
      },
    });
  } catch (error) {
    console.error('Error converting suggestion:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert suggestion',
      },
      { status: 500 },
    );
  }
}

