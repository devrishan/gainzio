import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

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


    const userRole = authUser.role;
    if (userRole !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, ad_placement_id, ad_code_snippet, is_active } = body;

    // const ad = await prisma.ad.update({
    //   where: { id: params.id },
    //   data: {
    //     name,
    //     adPlacementId: ad_placement_id,
    //     adCodeSnippet: ad_code_snippet,
    //     isActive: is_active,
    //   },
    // });

    return NextResponse.json({
      success: false,
      error: "Ad module maintenance"
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
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }


    const userRole = authUser.role;
    if (userRole !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    // await prisma.ad.delete({
    //   where: { id: params.id },
    // });

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

