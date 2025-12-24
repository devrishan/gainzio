import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
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

    const ads = await prisma.ad.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      ads: ads.map((ad) => ({
        id: ad.id,
        name: ad.name,
        ad_placement_id: ad.adPlacementId,
        ad_code_snippet: ad.adCodeSnippet,
        is_active: ad.isActive,
        created_at: ad.createdAt.toISOString(),
        updated_at: ad.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ads' },
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

      // Only admins can create ads
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
    const { name, ad_placement_id, ad_code_snippet, is_active = true } = body;

    if (!name || !ad_placement_id || !ad_code_snippet) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const ad = await prisma.ad.create({
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
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ad' },
      { status: 500 },
    );
  }
}
