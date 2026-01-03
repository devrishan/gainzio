import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { uploadToS3, validateFile } from '@/lib/s3';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    // Use the ID from the helper
    const userId = authUser.userId;

    const formData = await request.formData();
    const taskId = formData.get('task_id') as string;
    const proofFile = formData.get('proof') as File | null;
    const notes = formData.get('notes') as string | null;

    if (!taskId || !proofFile) {
      return NextResponse.json(
        { success: false, error: 'Task ID and proof file are required' },
        { status: 400 },
      );
    }

    // Validate file
    const validation = validateFile(proofFile);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    // Check if task exists and is active
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.isDeleted || !task.isActive) {
      return NextResponse.json(
        { success: false, error: 'Task not found or inactive' },
        { status: 404 },
      );
    }

    // Check if task is expired
    if (task.expiresAt && task.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Task has expired' },
        { status: 400 },
      );
    }

    // Check submission limits
    const existingSubmissions = await prisma.taskSubmission.count({
      where: {
        taskId: task.id,
        userId: userId,
        status: {
          not: 'DELETED',
        },
      },
    });

    if (task.maxSubmissions && existingSubmissions >= task.maxSubmissions) {
      return NextResponse.json(
        { success: false, error: 'Maximum submissions reached for this task' },
        { status: 400 },
      );
    }

    // Check for pending submissions
    const pendingSubmission = await prisma.taskSubmission.findFirst({
      where: {
        taskId: task.id,
        userId: userId,
        status: {
          in: ['SUBMITTED', 'REVIEWING'],
        },
      },
    });

    if (pendingSubmission) {
      return NextResponse.json(
        { success: false, error: 'You have a pending submission for this task' },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const uploadResult = await uploadToS3({
      file: buffer,
      fileName: proofFile.name,
      contentType: proofFile.type,
      folder: 'task-proofs',
    });

    // Check Flash Time
    let flashMetadata = {};
    const flashConfig = await prisma.systemConfig.findUnique({
      where: { key: 'flash_time_config' },
    });

    if (flashConfig && flashConfig.value) {
      const config = flashConfig.value as any;
      const now = new Date();
      const start = new Date(config.flashStartAt);
      const end = new Date(config.flashEndAt);

      if (config.flashTimeEnabled && now >= start && now <= end) {
        flashMetadata = {
          flash_applied: true,
          flash_multiplier: config.flashMultiplier || 1.5,
          flash_base_reward: Number(task.rewardAmount),
          formatted_bonus: `⚡ Flash Time Bonus (${config.flashMultiplier}x)`
        };
      }
    }

    // Create submission record
    const submission = await prisma.taskSubmission.create({
      data: {
        taskId: task.id,
        userId: userId,
        status: 'SUBMITTED',
        proofUrl: uploadResult.url,
        proofType: proofFile.type,
        notes: notes || null,
        metadata: {
          fileName: proofFile.name,
          fileSize: proofFile.size,
          s3Key: uploadResult.key,
          ...flashMetadata
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            phone: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task submitted successfully',
      submission: {
        id: submission.id,
        task_id: submission.taskId,
        status: submission.status,
        submitted_at: submission.submittedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit task',
      },
      { status: 500 },
    );
  }
}
