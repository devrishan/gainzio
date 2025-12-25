import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { Role } from '@prisma/client';
import {
  getAllFeatureFlags,
  setFeatureFlag,
} from '@/lib/feature-flags';
import { z } from 'zod';

const createFlagSchema = z.object({
  key: z.string().min(1).max(100),
  enabled: z.boolean(),
  rolloutPercentage: z.number().min(0).max(100).default(100),
  targetUsers: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
});

export async function GET() {
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

      // Only admins can access
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

    const flags = await getAllFeatureFlags();

    return NextResponse.json({
      success: true,
      flags,
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feature flags' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

      // Only admins can create flags
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

    const body = await request.json();
    const flag = createFlagSchema.parse(body);

    await setFeatureFlag(flag);

    return NextResponse.json({
      success: true,
      message: 'Feature flag created successfully',
      flag,
    });
  } catch (error) {
    console.error('Error creating feature flag:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create feature flag' },
      { status: 500 },
    );
  }
}

