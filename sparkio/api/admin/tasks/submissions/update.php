<?php

declare(strict_types=1);

require_once __DIR__ . '/../../../bootstrap/cors.php';
require_once __DIR__ . '/../../../middleware/auth.php';
require_once __DIR__ . '/../../../lib/response.php';
require_once __DIR__ . '/../../../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    error_response('Method not allowed.', 405);
}

require_auth(['admin']);
$input = decode_json_input();
$missing = require_fields($input, ['submission_id', 'new_status']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$submissionId = sanitize_string($input['submission_id']);
$newStatus = sanitize_string($input['new_status'], 20);
$reviewNotes = sanitize_string($input['review_notes'] ?? '', 1000);
$admin = require_auth(['admin']);

if (empty($submissionId)) {
    error_response('Invalid submission ID.', 422);
}

$allowedStatuses = ['APPROVED', 'REJECTED', 'REVIEWING'];
if (!in_array($newStatus, $allowedStatuses, true)) {
    error_response('Invalid status value. Allowed: APPROVED, REJECTED, REVIEWING', 422);
}

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('
        SELECT 
            ts.id,
            ts.task_id,
            ts.user_id,
            ts.status,
            ts.proof_url,
            t.reward_amount,
            t.reward_coins,
            u.username AS user_username
        FROM task_submissions ts
        INNER JOIN tasks t ON t.id = ts.task_id
        INNER JOIN users u ON u.id = ts.user_id
        WHERE ts.id = :id
        FOR UPDATE
    ');
    $stmt->execute([':id' => $submissionId]);
    $submission = $stmt->fetch();

    if (!$submission) {
        $pdo->rollBack();
        error_response('Submission not found.', 404);
    }

    $currentStatus = $submission['status'];

    if ($currentStatus === 'APPROVED' && $newStatus !== 'APPROVED') {
        $pdo->rollBack();
        error_response('Cannot change status of an already approved submission.', 422);
    }

    if ($currentStatus === 'DELETED') {
        $pdo->rollBack();
        error_response('Cannot update a deleted submission.', 422);
    }

    $reviewedAt = date('Y-m-d H:i:s');

    // Update submission status
    $updateStmt = $pdo->prepare('
        UPDATE task_submissions
        SET status = :status,
            reviewed_by_id = :reviewed_by_id,
            reviewed_at = :reviewed_at,
            notes = CASE WHEN :review_notes IS NOT NULL AND :review_notes != \'\' 
                         THEN CONCAT(COALESCE(notes, \'\'), CASE WHEN notes IS NOT NULL THEN \' | \' ELSE \'\' END, :review_notes)
                         ELSE notes END
        WHERE id = :id
    ');
    $updateStmt->execute([
        ':status' => $newStatus,
        ':reviewed_by_id' => $admin['id'],
        ':reviewed_at' => $reviewedAt,
        ':review_notes' => $reviewNotes ?: null,
        ':id' => $submissionId,
    ]);

    // If approved, credit user wallet
    if ($newStatus === 'APPROVED' && $currentStatus !== 'APPROVED') {
        $rewardAmount = (float) $submission['reward_amount'];
        $rewardCoins = (int) $submission['reward_coins'];

        // Update wallet
        $walletUpdate = $pdo->prepare('
            UPDATE wallets
            SET balance = balance + :amount,
                total_earned = total_earned + :amount,
                coins = coins + :coins
            WHERE user_id = :user_id
        ');
        $walletUpdate->execute([
            ':amount' => $rewardAmount,
            ':coins' => $rewardCoins,
            ':user_id' => $submission['user_id'],
        ]);

        // Create wallet transaction
        $transactionId = bin2hex(random_bytes(16));
        $transactionStmt = $pdo->prepare('
            INSERT INTO wallet_transactions (
                id,
                user_id,
                wallet_id,
                amount,
                type,
                metadata,
                created_at
            ) VALUES (
                :id,
                :user_id,
                (SELECT id FROM wallets WHERE user_id = :user_id LIMIT 1),
                :amount,
                :type,
                :metadata,
                NOW()
            )
        ');
        $transactionStmt->execute([
            ':id' => $transactionId,
            ':user_id' => $submission['user_id'],
            ':amount' => $rewardAmount,
            ':type' => 'task_reward',
            ':metadata' => json_encode([
                'submission_id' => $submissionId,
                'task_id' => $submission['task_id'],
                'reward_coins' => $rewardCoins,
            ]),
        ]);
    }

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_response('Failed to update submission.', 500, ['detail' => $exception->getMessage()]);
}

success_response([
    'message' => 'Submission updated successfully.',
    'submission_id' => $submissionId,
    'status' => $newStatus,
    'reviewed_at' => $reviewedAt,
]);

