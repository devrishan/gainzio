<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

require_auth(['admin']);
$pdo = get_pdo();

$status = isset($_GET['status']) ? sanitize_string($_GET['status'], 20) : 'pending';

$stmt = $pdo->prepare('
    SELECT w.id,
           w.amount,
           w.status,
           w.upi_id,
           w.created_at,
           w.processed_at,
           u.username,
           u.email
    FROM withdrawals w
    INNER JOIN users u ON u.id = w.user_id
    WHERE w.status = :status
    ORDER BY w.created_at ASC
');
$stmt->execute([':status' => $status]);
$withdrawals = $stmt->fetchAll() ?: [];

success_response([
    'withdrawals' => array_map(static fn ($row) => [
        'id' => (int) $row['id'],
        'amount' => (float) $row['amount'],
        'status' => $row['status'],
        'upi_id' => $row['upi_id'],
        'created_at' => $row['created_at'],
        'processed_at' => $row['processed_at'],
        'user' => [
            'username' => $row['username'],
            'email' => $row['email'],
        ],
    ], $withdrawals),
]);

