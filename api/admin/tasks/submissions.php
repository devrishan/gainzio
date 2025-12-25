<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

require_auth(['admin']);
$pdo = get_pdo();

$status = sanitize_string($_GET['status'] ?? '');
$taskId = sanitize_string($_GET['task_id'] ?? '');
$userId = sanitize_string($_GET['user_id'] ?? '');
$page = max(1, sanitize_int($_GET['page'] ?? 1) ?? 1);
$perPage = min(100, max(1, sanitize_int($_GET['per_page'] ?? 20) ?? 20));
$offset = ($page - 1) * $perPage;

$conditions = [];
$params = [];

if ($status !== '') {
    $conditions[] = 'ts.status = :status';
    $params[':status'] = $status;
}

if ($taskId !== '') {
    $conditions[] = 'ts.task_id = :task_id';
    $params[':task_id'] = $taskId;
}

if ($userId !== '') {
    $conditions[] = 'ts.user_id = :user_id';
    $params[':user_id'] = $userId;
}

$whereClause = '';
if (!empty($conditions)) {
    $whereClause = 'WHERE ' . implode(' AND ', $conditions);
}

$countStmt = $pdo->prepare('SELECT COUNT(*) FROM task_submissions ts ' . $whereClause);
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

$sql = "
    SELECT 
        ts.id,
        ts.task_id,
        ts.user_id,
        ts.status,
        ts.proof_url,
        ts.proof_type,
        ts.notes,
        ts.submitted_at,
        ts.reviewed_at,
        ts.reviewed_by_id,
        t.title AS task_title,
        t.slug AS task_slug,
        t.reward_amount,
        t.reward_coins,
        u.username AS user_username,
        u.email AS user_email,
        u.phone AS user_phone,
        reviewer.username AS reviewer_username
    FROM task_submissions ts
    INNER JOIN tasks t ON t.id = ts.task_id
    INNER JOIN users u ON u.id = ts.user_id
    LEFT JOIN users reviewer ON reviewer.id = ts.reviewed_by_id
    {$whereClause}
    ORDER BY ts.submitted_at DESC
    LIMIT :limit OFFSET :offset
";

$stmt = $pdo->prepare($sql);

foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

$stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();

$submissions = $stmt->fetchAll() ?: [];

$result = array_map(static function ($row) {
    return [
        'id' => $row['id'],
        'task' => [
            'id' => $row['task_id'],
            'title' => $row['task_title'],
            'slug' => $row['task_slug'],
            'reward_amount' => (float) $row['reward_amount'],
            'reward_coins' => (int) $row['reward_coins'],
        ],
        'user' => [
            'id' => $row['user_id'],
            'username' => $row['user_username'],
            'email' => $row['user_email'],
            'phone' => $row['user_phone'],
        ],
        'status' => $row['status'],
        'proof_url' => $row['proof_url'],
        'proof_type' => $row['proof_type'],
        'notes' => $row['notes'],
        'submitted_at' => $row['submitted_at'],
        'reviewed_at' => $row['reviewed_at'],
        'reviewer' => $row['reviewer_username'] ? [
            'id' => $row['reviewed_by_id'],
            'username' => $row['reviewer_username'],
        ] : null,
    ];
}, $submissions);

success_response([
    'data' => $result,
    'pagination' => [
        'page' => $page,
        'per_page' => $perPage,
        'total' => $total,
        'total_pages' => (int) ceil($total / $perPage),
    ],
]);

