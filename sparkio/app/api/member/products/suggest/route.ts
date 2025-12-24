import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { uploadToS3, validateFile } from '@/lib/s3';
import { z } from 'zod';

const suggestSchema = z.object({
  productName: z.string().min(1).max(255),
  platform: z.string().min(1).max(100),
  category: z.string().max(100).optional(),
  amount: z.number().positive().optional(),
  orderId: z.string().max(255).optional(),
});

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

    let userId: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userId = payload.sub;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const productName = formData.get('productName') as string;
    const platform = formData.get('platform') as string;
    const category = formData.get('category') as string | null;
    const amount = formData.get('amount') ? parseFloat(formData.get('amount') as string) : undefined;
    const orderId = formData.get('orderId') as string | null;
    const files = formData.getAll('files') as File[];

    // Validate input
    const validation = suggestSchema.parse({
      productName,
      platform,
      category: category || undefined,
      amount,
      orderId: orderId || undefined,
    });

    // Validate and upload files
    const uploadedFiles: string[] = [];
    for (const file of files) {
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        return NextResponse.json(
          { success: false, error: fileValidation.error },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadToS3({
        file: buffer,
        fileName: file.name,
        contentType: file.type,
        folder: 'product-suggestions',
      });

      uploadedFiles.push(uploadResult.url);
    }

    // Create product suggestion
    const suggestion = await prisma.productSuggestion.create({
      data: {
        userId: userId,
        productName: validation.productName,
        platform: validation.platform,
        category: validation.category || null,
        amount: validation.amount ? validation.amount : null,
        orderId: validation.orderId || null,
        files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
        status: 'pending',
        metadata: {
          uploadedAt: new Date().toISOString(),
          fileCount: uploadedFiles.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product suggestion submitted successfully',
      suggestion: {
        id: suggestion.id,
        productName: suggestion.productName,
        platform: suggestion.platform,
        status: suggestion.status,
        created_at: suggestion.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating product suggestion:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit product suggestion',
      },
      { status: 500 },
    );
  }
}

