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

$status = isset($_GET['status']) ? sanitize_string($_GET['status'], 20) : null;
$userId = sanitize_int($_GET['user_id'] ?? null);
$page = max(1, sanitize_int($_GET['page'] ?? 1) ?? 1);
$perPage = min(100, max(1, sanitize_int($_GET['per_page'] ?? 20) ?? 20));
$offset = ($page - 1) * $perPage;

$conditions = [];
$params = [];

if ($status) {
    $conditions[] = 'r.status = :status';
    $params[':status'] = $status;
}

if ($userId) {
    $conditions[] = 'r.referrer_id = :user_id';
    $params[':user_id'] = $userId;
}

$whereClause = '';
if (!empty($conditions)) {
    $whereClause = 'WHERE ' . implode(' AND ', $conditions);
}

$countStmt = $pdo->prepare('SELECT COUNT(*) FROM referrals r ' . $whereClause);
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

$sql = '
    SELECT r.id,
           r.status,
           r.commission_amount,
           r.created_at,
           r.updated_at,
           referrer.username AS referrer_username,
           referrer.email AS referrer_email,
           referred.username AS referred_username,
           referred.email AS referred_email
    FROM referrals r
    INNER JOIN users referrer ON referrer.id = r.referrer_id
    INNER JOIN users referred ON referred.id = r.referred_user_id
' . $whereClause . '
    ORDER BY r.created_at DESC
    LIMIT :limit OFFSET :offset
';

$stmt = $pdo->prepare($sql);

foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

$stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$referrals = $stmt->fetchAll() ?: [];

success_response([
    'data' => array_map(static fn ($row) => [
        'id' => (int) $row['id'],
        'status' => $row['status'],
        'commission_amount' => (float) $row['commission_amount'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at'],
        'referrer' => [
            'username' => $row['referrer_username'],
            'email' => $row['referrer_email'],
        ],
        'referred' => [
            'username' => $row['referred_username'],
            'email' => $row['referred_email'],
        ],
    ], $referrals),
    'pagination' => [
        'page' => $page,
        'per_page' => $perPage,
        'total' => $total,
        'total_pages' => (int) ceil($total / $perPage),
    ],
]);

