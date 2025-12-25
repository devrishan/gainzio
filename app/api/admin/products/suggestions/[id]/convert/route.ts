import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { z } from 'zod';

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
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let userId: string;
    let userRole: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userId = payload.sub;
      userRole = payload.role;

      // Only admins can convert
      if (userRole !== Role.ADMIN) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
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

