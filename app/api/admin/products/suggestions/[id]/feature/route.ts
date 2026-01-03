import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { Role } from '@prisma/client';
import { featureSuggestion } from '@/lib/top-suggestions';
import { z } from 'zod';

const featureSchema = z.object({
  featured: z.boolean(),
});

export async function PUT(
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

    // @ts-ignore
    const userRole = authUser.role;
    if (userRole !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const suggestionId = params.id;
    const body = await request.json();
    const { featured } = featureSchema.parse(body);

    await featureSuggestion(suggestionId, featured);

    return NextResponse.json({
      success: true,
      message: `Suggestion ${featured ? 'featured' : 'unfeatured'} successfully`,
    });
  } catch (error) {
    console.error('Error featuring suggestion:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to feature suggestion',
      },
      { status: 500 },
    );
  }
}

