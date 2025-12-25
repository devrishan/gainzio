<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/validators.php';
require_once __DIR__ . '/../../lib/upload.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['member', 'admin']);
$pdo = get_pdo();

$taskId = sanitize_string($_POST['task_id'] ?? '');
$notes = sanitize_string($_POST['notes'] ?? '', 1000);
$proofFile = $_FILES['proof'] ?? null;

if (empty($taskId)) {
    error_response('Task ID is required.', 422);
}

if (!$proofFile || !isset($proofFile['tmp_name'])) {
    error_response('Proof file is required.', 422);
}

try {
    $pdo->beginTransaction();

    // Verify task exists and is active
    $taskStmt = $pdo->prepare('
        SELECT 
            t.id,
            t.title,
            t.reward_amount,
            t.reward_coins,
            t.is_active,
            t.max_submissions,
            t.expires_at,
            t.is_deleted
        FROM tasks t
        WHERE t.id = :task_id
        FOR UPDATE
    ');
    $taskStmt->execute([':task_id' => $taskId]);
    $task = $taskStmt->fetch();

    if (!$task) {
        $pdo->rollBack();
        error_response('Task not found.', 404);
    }

    if ($task['is_deleted'] || !$task['is_active']) {
        $pdo->rollBack();
        error_response('Task is not available.', 422);
    }

    if ($task['expires_at'] && strtotime($task['expires_at']) < time()) {
        $pdo->rollBack();
        error_response('Task has expired.', 422);
    }

    // Check max submissions limit
    if ($task['max_submissions']) {
        $submissionCountStmt = $pdo->prepare('
            SELECT COUNT(*) 
            FROM task_submissions 
            WHERE task_id = :task_id 
            AND user_id = :user_id
            AND status IN (\'SUBMITTED\', \'REVIEWING\', \'APPROVED\')
        ');
        $submissionCountStmt->execute([
            ':task_id' => $taskId,
            ':user_id' => $user['id'],
        ]);
        $submissionCount = (int) $submissionCountStmt->fetchColumn();

        if ($submissionCount >= (int) $task['max_submissions']) {
            $pdo->rollBack();
            error_response('Maximum submission limit reached for this task.', 422);
        }
    }

    // Upload proof file
    $uploadResult = store_uploaded_file($proofFile);
    if (!$uploadResult['success']) {
        $pdo->rollBack();
        error_response('File upload failed: ' . implode(', ', $uploadResult['errors']), 422);
    }

    // Determine proof type from MIME type
    $proofType = 'image';
    if (str_starts_with($uploadResult['mime_type'], 'video/')) {
        $proofType = 'video';
    }

    // Create submission
    $insertStmt = $pdo->prepare('
        INSERT INTO task_submissions (
            id,
            task_id,
            user_id,
            status,
            proof_url,
            proof_type,
            notes,
            submitted_at
        ) VALUES (
            :id,
            :task_id,
            :user_id,
            :status,
            :proof_url,
            :proof_type,
            :notes,
            NOW()
        )
    ');

    $submissionId = bin2hex(random_bytes(16));
    $insertStmt->execute([
        ':id' => $submissionId,
        ':task_id' => $taskId,
        ':user_id' => $user['id'],
        ':status' => 'SUBMITTED',
        ':proof_url' => $uploadResult['url'],
        ':proof_type' => $proofType,
        ':notes' => $notes ?: null,
    ]);

    $pdo->commit();

    success_response([
        'message' => 'Task submission created successfully.',
        'submission_id' => $submissionId,
        'task_id' => $taskId,
        'status' => 'SUBMITTED',
    ], 201);
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_response('Failed to submit task.', 500, ['detail' => $exception->getMessage()]);
}

