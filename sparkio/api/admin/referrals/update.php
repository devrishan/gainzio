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
$missing = require_fields($input, ['referral_id', 'new_status']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$referralId = sanitize_int($input['referral_id']);
$newStatus = sanitize_string($input['new_status'], 20);
$commissionInput = isset($input['commission_amount']) ? (float) sanitize_decimal((string) $input['commission_amount']) : null;

if (!$referralId) {
    error_response('Invalid referral ID.', 422);
}

$allowedStatuses = ['verified', 'rejected'];
if (!in_array($newStatus, $allowedStatuses, true)) {
    error_response('Invalid status value.', 422);
}

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('
        SELECT r.id, r.status, r.commission_amount, r.referrer_id, u.username AS referrer_username
        FROM referrals r
        INNER JOIN users u ON u.id = r.referrer_id
        WHERE r.id = :id
        FOR UPDATE
    ');
    $stmt->execute([':id' => $referralId]);
    $referral = $stmt->fetch();

    if (!$referral) {
        $pdo->rollBack();
        error_response('Referral not found.', 404);
    }

    $currentStatus = $referral['status'];
    $commissionAmount = $commissionInput ?? (float) $referral['commission_amount'];

    if ($newStatus === 'verified') {
        if ($commissionAmount <= 0) {
            $pdo->rollBack();
            error_response('Commission amount must be greater than zero for verification.', 422);
        }

        if ($currentStatus === 'verified') {
            $pdo->rollBack();
            error_response('Referral already verified.', 422);
        }

        $updateReferral = $pdo->prepare('
            UPDATE referrals
            SET status = :status,
                commission_amount = :commission_amount
            WHERE id = :id
        ');
        $updateReferral->execute([
            ':status' => 'verified',
            ':commission_amount' => $commissionAmount,
            ':id' => $referralId,
        ]);

        $walletUpdate = $pdo->prepare('
            UPDATE wallets
            SET balance = balance + :amount,
                total_earned = total_earned + :amount
            WHERE user_id = :user_id
        ');
        $walletUpdate->execute([
            ':amount' => $commissionAmount,
            ':user_id' => $referral['referrer_id'],
        ]);
    } else {
        if ($currentStatus === 'verified') {
            $pdo->rollBack();
            error_response('Verified referrals cannot be marked as rejected.', 422);
        }

        $updateReferral = $pdo->prepare('
            UPDATE referrals
            SET status = :status
            WHERE id = :id
        ');
        $updateReferral->execute([
            ':status' => 'rejected',
            ':id' => $referralId,
        ]);
    }

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_response('Failed to update referral.', 500, ['detail' => $exception->getMessage()]);
}

success_response([
    'message' => 'Referral updated successfully.',
    'referral_id' => $referralId,
    'status' => $newStatus,
    'commission_amount' => $commissionAmount,
]);

