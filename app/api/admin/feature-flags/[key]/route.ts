import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { Role } from '@prisma/client';
import { setFeatureFlag, deleteFeatureFlag, getFeatureFlag } from '@/lib/feature-flags';
import { z } from 'zod';

const updateFlagSchema = z.object({
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  targetUsers: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } },
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

    const flag = await getFeatureFlag(params.key);

    if (!flag) {
      return NextResponse.json(
        { success: false, error: 'Feature flag not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      flag,
    });
  } catch (error) {
    console.error('Error fetching feature flag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feature flag' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } },
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

      // Only admins can update flags
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

    const existingFlag = await getFeatureFlag(params.key);
    if (!existingFlag) {
      return NextResponse.json(
        { success: false, error: 'Feature flag not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const updates = updateFlagSchema.parse(body);

    const updatedFlag = {
      ...existingFlag,
      ...updates,
    };

    await setFeatureFlag(updatedFlag);

    return NextResponse.json({
      success: true,
      message: 'Feature flag updated successfully',
      flag: updatedFlag,
    });
  } catch (error) {
    console.error('Error updating feature flag:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update feature flag' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } },
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

      // Only admins can delete flags
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

    await deleteFeatureFlag(params.key);

    return NextResponse.json({
      success: true,
      message: 'Feature flag deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feature flag' },
      { status: 500 },
    );
  }
}

