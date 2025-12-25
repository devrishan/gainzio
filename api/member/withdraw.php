<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['member', 'admin']);
$input = decode_json_input();
$missing = require_fields($input, ['amount', 'upi_id']);
if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$amount = (float) sanitize_decimal((string) $input['amount']);
$upiId = sanitize_string($input['upi_id'], 255);

if ($amount <= 0) {
    error_response('Withdrawal amount must be greater than zero.', 422);
}

if ($upiId === '') {
    error_response('UPI ID is required.', 422);
}

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $walletStmt = $pdo->prepare('SELECT id, balance FROM wallets WHERE user_id = :user_id FOR UPDATE');
    $walletStmt->execute([':user_id' => $user['id']]);
    $wallet = $walletStmt->fetch();

    if (!$wallet) {
        $pdo->rollBack();
        error_response('Wallet not found.', 404);
    }

    if ((float) $wallet['balance'] < $amount) {
        $pdo->rollBack();
        error_response('Insufficient wallet balance.', 422);
    }

    $withdrawInsert = $pdo->prepare('
        INSERT INTO withdrawals (user_id, amount, status, upi_id)
        VALUES (:user_id, :amount, :status, :upi_id)
    ');
    $withdrawInsert->execute([
        ':user_id' => $user['id'],
        ':amount' => $amount,
        ':status' => 'pending',
        ':upi_id' => $upiId,
    ]);

    $updateWallet = $pdo->prepare('
        UPDATE wallets
        SET balance = balance - :amount
        WHERE id = :wallet_id
    ');
    $updateWallet->execute([
        ':amount' => $amount,
        ':wallet_id' => $wallet['id'],
    ]);

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_response('Failed to submit withdrawal request.', 500, ['detail' => $exception->getMessage()]);
}

success_response([
    'message' => 'Withdrawal request submitted.',
    'withdrawal' => [
        'amount' => $amount,
        'status' => 'pending',
        'upi_id' => $upiId,
    ],
], 201);

