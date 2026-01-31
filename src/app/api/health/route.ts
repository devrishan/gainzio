import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

interface HealthCheck {
  status: 'ok' | 'error';
  message?: string;
  latency?: number;
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    return { status: 'ok', latency };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const redis = getRedis();
    if (!redis) {
      return { status: 'error', message: 'Redis client not available' };
    }
    await redis.ping();
    const latency = Date.now() - start;
    return { status: 'ok', latency };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Redis check failed',
    };
  }
}

async function checkS3(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    const bucketName = process.env.S3_BUCKET_NAME || process.env.S3_BUCKET;
    if (!bucketName) {
      return { status: 'error', message: 'S3 bucket not configured' };
    }

    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    const latency = Date.now() - start;
    return { status: 'ok', latency };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'S3 check failed',
    };
  }
}

export async function GET() {
  const [database, redis, s3] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkS3(),
  ]);

  const checks = {
    database,
    redis,
    s3,
  };

  const healthy = Object.values(checks).every((check) => check.status === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    },
    { status: healthy ? 200 : 503 },
  );
}

