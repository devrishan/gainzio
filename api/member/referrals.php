<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['member', 'admin']);
$pdo = get_pdo();

$stmt = $pdo->prepare('
    SELECT r.id,
           u.username AS referred_username,
           u.email AS referred_email,
           r.status,
           r.commission_amount,
           r.created_at,
           r.updated_at
    FROM referrals r
    INNER JOIN users u ON u.id = r.referred_user_id
    WHERE r.referrer_id = :user_id
    ORDER BY r.created_at DESC
');

$stmt->execute([':user_id' => $user['id']]);
$referrals = $stmt->fetchAll() ?: [];

success_response([
    'referrals' => array_map(static fn ($row) => [
        'id' => (int) $row['id'],
        'username' => $row['referred_username'],
        'email' => $row['referred_email'],
        'status' => $row['status'],
        'commission_amount' => (float) $row['commission_amount'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
    ], $referrals),
]);

