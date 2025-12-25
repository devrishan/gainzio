<?php

declare(strict_types=1);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_TYPES = array_merge(ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES);

function validate_uploaded_file(array $file): array
{
    $errors = [];

    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        $errors[] = 'No file uploaded or invalid upload.';
        return ['valid' => false, 'errors' => $errors];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'File upload error: ' . get_upload_error_message($file['error']);
        return ['valid' => false, 'errors' => $errors];
    }

    if ($file['size'] > MAX_FILE_SIZE) {
        $errors[] = 'File size exceeds maximum allowed size of ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB.';
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_TYPES, true)) {
        $errors[] = 'Invalid file type. Allowed types: images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, QuickTime).';
    }

    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'mime_type' => $mimeType,
    ];
}

function get_upload_error_message(int $errorCode): string
{
    return match ($errorCode) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File is too large.',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded.',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.',
        default => 'Unknown upload error.',
    };
}

function generate_unique_filename(string $originalName, string $mimeType): string
{
    $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    if (empty($extension)) {
        $extension = get_extension_from_mime($mimeType);
    }

    $basename = pathinfo($originalName, PATHINFO_FILENAME);
    $sanitized = preg_replace('/[^a-zA-Z0-9_-]/', '_', $basename);
    $sanitized = mb_substr($sanitized, 0, 50);

    return sprintf('%s_%s.%s', $sanitized, bin2hex(random_bytes(8)), $extension);
}

function get_extension_from_mime(string $mimeType): string
{
    return match ($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/quicktime' => 'mov',
        default => 'bin',
    };
}

function store_uploaded_file(array $file, string $subdirectory = 'proofs'): array
{
    $validation = validate_uploaded_file($file);
    if (!$validation['valid']) {
        return ['success' => false, 'errors' => $validation['errors']];
    }

    $uploadDir = __DIR__ . '/../../public/uploads/' . $subdirectory . '/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            return ['success' => false, 'errors' => ['Failed to create upload directory.']];
        }
    }

    $filename = generate_unique_filename($file['name'], $validation['mime_type']);
    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        return ['success' => false, 'errors' => ['Failed to move uploaded file.']];
    }

    $publicUrl = '/uploads/' . $subdirectory . '/' . $filename;

    return [
        'success' => true,
        'filename' => $filename,
        'path' => $destination,
        'url' => $publicUrl,
        'mime_type' => $validation['mime_type'],
        'size' => $file['size'],
    ];
}

