<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/roles.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['member', 'admin']);
$pdo = get_pdo();

// Check user level for eligibility
$statsStmt = $pdo->prepare('SELECT current_level FROM user_stats WHERE user_id = :user_id LIMIT 1');
$statsStmt->execute([':user_id' => $user['id']]);
$userStats = $statsStmt->fetch();
$userLevel = $userStats ? (int) $userStats['current_level'] : 1;

// Get active tasks
$stmt = $pdo->prepare('
    SELECT 
        t.id,
        t.title,
        t.description,
        t.reward_coins,
        t.reward_money,
        t.reward_xp,
        t.type,
        t.is_one_time,
        t.max_redemptions_per_user,
        t.min_spend,
        t.min_user_level,
        t.expires_at,
        c.name AS category_name,
        p.name AS product_name,
        s.name AS store_name,
        (
            SELECT COUNT(*)
            FROM task_submissions ts
            WHERE ts.task_id = t.id AND ts.user_id = :user_id
        ) AS user_submission_count,
        (
            SELECT COUNT(*)
            FROM task_submissions ts
            WHERE ts.task_id = t.id AND ts.status = "approved"
        ) AS total_approved_count
    FROM tasks t
    LEFT JOIN product_categories c ON c.id = t.category_id
    LEFT JOIN products p ON p.id = t.product_id
    LEFT JOIN stores s ON s.id = p.store_id
    WHERE t.status = "active"
    AND (t.expires_at IS NULL OR t.expires_at > NOW())
    AND (t.min_user_level IS NULL OR t.min_user_level <= :user_level)
    ORDER BY t.created_at DESC
');

$stmt->execute([
    ':user_id' => $user['id'],
    ':user_level' => $userLevel
]);

$tasks = $stmt->fetchAll() ?: [];

$formattedTasks = array_map(static fn($task) => [
    'id' => (int) $task['id'],
    'title' => $task['title'],
    'description' => $task['description'],
    'reward_coins' => (int) $task['reward_coins'],
    'reward_money' => (float) $task['reward_money'],
    'reward_xp' => (int) $task['reward_xp'],
    'type' => $task['type'],
    'category_name' => $task['category_name'],
    'product_name' => $task['product_name'],
    'store_name' => $task['store_name'],
    'min_spend' => $task['min_spend'] ? (float) $task['min_spend'] : null,
    'min_user_level' => $task['min_user_level'] ? (int) $task['min_user_level'] : null,
    'is_eligible' => true, // Already filtered by query
    'is_completed' => (int) $task['user_submission_count'] >= (int) $task['max_redemptions_per_user'],
    'user_submission_count' => (int) $task['user_submission_count'],
    'total_approved_count' => (int) $task['total_approved_count'],
    'expires_at' => $task['expires_at']
], $tasks);

success_response([
    'tasks' => $formattedTasks,
    'user_level' => $userLevel
]);
