import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { z } from 'zod';

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
      const payload = verifyAccessToken(accessToken);
      userRole = payload.role;

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
    const { name, ad_placement_id, ad_code_snippet, is_active } = body;

    const ad = await prisma.ad.update({
      where: { id: params.id },
      data: {
        name,
        adPlacementId: ad_placement_id,
        adCodeSnippet: ad_code_snippet,
        isActive: is_active,
      },
    });

    return NextResponse.json({
      success: true,
      ad: {
        id: ad.id,
        name: ad.name,
        ad_placement_id: ad.adPlacementId,
        ad_code_snippet: ad.adCodeSnippet,
        is_active: ad.isActive,
        created_at: ad.createdAt.toISOString(),
        updated_at: ad.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ad' },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
      const payload = verifyAccessToken(accessToken);
      userRole = payload.role;

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

    await prisma.ad.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete ad' },
      { status: 500 },
    );
  }
}

