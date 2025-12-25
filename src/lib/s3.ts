import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || 'gainzio-uploads';

export interface UploadFileOptions {
  file: Buffer | Uint8Array;
  fileName: string;
  contentType: string;
  folder?: string; // e.g., 'proofs', 'products', 'receipts'
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

/**
 * Upload file to S3
 */
export async function uploadToS3(options: UploadFileOptions): Promise<UploadResult> {
  const { file, fileName, contentType, folder = 'uploads' } = options;

  // Generate unique file name with timestamp
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${folder}/${timestamp}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    // Make files private by default (require signed URLs to access)
    ACL: 'private',
  });

  await s3Client.send(command);

  // Generate public URL (or use CloudFront CDN URL if configured)
  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

  return {
    key,
    url,
    bucket: BUCKET_NAME,
  };
}

/**
 * Get signed URL for private S3 object (valid for 1 hour by default)
 */
export async function getSignedS3Url(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Validate file before upload
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File | { size: number; type: string; name: string }): FileValidationResult {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_DOCUMENT_TYPES];

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: images (JPEG, PNG, GIF, WebP), videos (MP4, WebM, MOV), PDF`,
    };
  }

  return { valid: true };
}

/**
 * Compress image if needed (client-side compression should be done before upload)
 * This is a placeholder for server-side compression if needed
 */
export async function compressImage(file: Buffer, maxWidth: number = 1920, quality: number = 0.8): Promise<Buffer> {
  // For server-side image compression, you would use a library like 'sharp'
  // This is a placeholder - implement if needed
  return file;
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Get content type from file extension
 */
export function getContentTypeFromExtension(extension: string): string {
  const typeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };

  return typeMap[extension] || 'application/octet-stream';
}

