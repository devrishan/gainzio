<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

require_auth(['admin']);
$pdo = get_pdo();

$totalUsers = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();

$pendingWithdrawalsStmt = $pdo->query('
    SELECT COUNT(*) AS total_requests, COALESCE(SUM(amount), 0) AS total_amount
    FROM withdrawals
    WHERE status = "pending"
');
$pendingWithdrawals = $pendingWithdrawalsStmt->fetch() ?: ['total_requests' => 0, 'total_amount' => 0.00];

$totalEarnings = (float) ($pdo->query('SELECT COALESCE(SUM(total_earned), 0) FROM wallets')->fetchColumn() ?: 0);

success_response([
    'metrics' => [
        'total_users' => $totalUsers,
        'pending_withdrawals' => [
            'count' => (int) $pendingWithdrawals['total_requests'],
            'amount' => (float) $pendingWithdrawals['total_amount'],
        ],
        'total_earnings_paid' => $totalEarnings,
    ],
]);

