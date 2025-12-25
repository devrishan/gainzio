<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    error_response('Method not allowed.', 405);
}

require_auth(['admin']);
$input = decode_json_input();
$missing = require_fields($input, ['withdrawal_id', 'new_status']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$withdrawalId = sanitize_int($input['withdrawal_id']);
$newStatus = sanitize_string($input['new_status'], 20);

if (!$withdrawalId) {
    error_response('Invalid withdrawal ID.', 422);
}

$allowedStatuses = ['processed', 'failed'];
if (!in_array($newStatus, $allowedStatuses, true)) {
    error_response('Invalid status value.', 422);
}

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('
        SELECT id, user_id, amount, status
        FROM withdrawals
        WHERE id = :id
        FOR UPDATE
    ');
    $stmt->execute([':id' => $withdrawalId]);
    $withdrawal = $stmt->fetch();

    if (!$withdrawal) {
        $pdo->rollBack();
        error_response('Withdrawal not found.', 404);
    }

    if ($withdrawal['status'] === $newStatus) {
        $pdo->rollBack();
        error_response('Withdrawal is already in the requested status.', 422);
    }

    if ($withdrawal['status'] !== 'pending') {
        $pdo->rollBack();
        error_response('Only pending withdrawals can be updated.', 422);
    }

    $processedAt = date('Y-m-d H:i:s');

    $update = $pdo->prepare('
        UPDATE withdrawals
        SET status = :status,
            processed_at = :processed_at
        WHERE id = :id
    ');
    $update->execute([
        ':status' => $newStatus,
        ':processed_at' => $processedAt,
        ':id' => $withdrawalId,
    ]);

    if ($newStatus === 'failed') {
        $walletUpdate = $pdo->prepare('
            UPDATE wallets
            SET balance = balance + :amount
            WHERE user_id = :user_id
        ');
        $walletUpdate->execute([
            ':amount' => $withdrawal['amount'],
            ':user_id' => $withdrawal['user_id'],
        ]);
    }

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_response('Failed to process withdrawal.', 500, ['detail' => $exception->getMessage()]);
}

success_response([
    'message' => 'Withdrawal updated successfully.',
    'withdrawal_id' => $withdrawalId,
    'status' => $newStatus,
    'processed_at' => $processedAt,
]);

