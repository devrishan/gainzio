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

$user = require_auth(['member', 'admin']);
$pdo = get_pdo();

$categoryId = sanitize_string($_GET['category_id'] ?? '');
$isActive = isset($_GET['is_active']) ? sanitize_boolean($_GET['is_active']) : true;

$conditions = ['t.is_deleted = 0'];
$params = [];

if ($isActive !== null) {
    $conditions[] = 't.is_active = :is_active';
    $params[':is_active'] = $isActive ? 1 : 0;
}

if ($categoryId !== '') {
    $conditions[] = 't.category_id = :category_id';
    $params[':category_id'] = $categoryId;
}

$whereClause = 'WHERE ' . implode(' AND ', $conditions);

$sql = "
    SELECT 
        t.id,
        t.title,
        t.slug,
        t.description,
        t.reward_amount,
        t.reward_coins,
        t.difficulty,
        t.is_active,
        t.max_submissions,
        t.expires_at,
        t.created_at,
        tc.name AS category_name,
        tc.slug AS category_slug,
        (
            SELECT COUNT(*) 
            FROM task_submissions ts 
            WHERE ts.task_id = t.id 
            AND ts.user_id = :user_id
            AND ts.status IN ('SUBMITTED', 'REVIEWING', 'APPROVED')
        ) AS user_submission_count
    FROM tasks t
    INNER JOIN task_categories tc ON tc.id = t.category_id
    {$whereClause}
    ORDER BY t.priority DESC, t.created_at DESC
";

$stmt = $pdo->prepare($sql);
$params[':user_id'] = $user['id'];

foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

$stmt->execute();
$tasks = $stmt->fetchAll() ?: [];

$result = array_map(static function ($row) {
    $submissionCount = (int) $row['user_submission_count'];
    $maxSubmissions = $row['max_submissions'] ? (int) $row['max_submissions'] : null;
    $canSubmit = $maxSubmissions === null || $submissionCount < $maxSubmissions;
    $isExpired = $row['expires_at'] && strtotime($row['expires_at']) < time();

    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'description' => $row['description'],
        'reward_amount' => (float) $row['reward_amount'],
        'reward_coins' => (int) $row['reward_coins'],
        'difficulty' => $row['difficulty'],
        'is_active' => (bool) $row['is_active'],
        'max_submissions' => $maxSubmissions,
        'expires_at' => $row['expires_at'],
        'created_at' => $row['created_at'],
        'category' => [
            'name' => $row['category_name'],
            'slug' => $row['category_slug'],
        ],
        'user_submission_count' => $submissionCount,
        'can_submit' => $canSubmit && !$isExpired,
        'is_expired' => $isExpired,
    ];
}, $tasks);

success_response(['tasks' => $result]);

