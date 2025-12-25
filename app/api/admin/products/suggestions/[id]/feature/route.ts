import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

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
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let userRole: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userRole = payload.role;

      // Only admins can feature suggestions
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

