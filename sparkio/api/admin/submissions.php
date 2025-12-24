<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['admin']);
$pdo = get_pdo();

// Get status filter from query params
$status = $_GET['status'] ?? null;

$sql = '
    SELECT 
        ts.id,
        ts.status,
        ts.proof_text,
        ts.proof_link,
        ts.proof_notes,
        ts.rejection_reason,
        ts.rejection_notes,
        ts.coins_earned,
        ts.money_earned,
        ts.xp_earned,
        ts.submitted_at,
        ts.reviewed_at,
        t.title AS task_title,
        t.description AS task_description,
        t.reward_coins AS task_reward_coins,
        t.reward_money AS task_reward_money,
        t.reward_xp AS task_reward_xp,
        u.username AS user_username,
        u.email AS user_email,
        up.product_name AS user_product_name,
        up.order_id AS user_product_order_id,
        (
            SELECT COUNT(*)
            FROM submission_proof_files spf
            WHERE spf.submission_id = ts.id
        ) AS proof_file_count
    FROM task_submissions ts
    INNER JOIN tasks t ON t.id = ts.task_id
    INNER JOIN users u ON u.id = ts.user_id
    LEFT JOIN user_products up ON up.id = ts.user_product_id
    WHERE 1=1
';

$params = [];

if ($status && in_array($status, ['pending', 'approved', 'rejected', 'completed'], true)) {
    $sql .= ' AND ts.status = :status';
    $params[':status'] = $status;
}

$sql .= ' ORDER BY 
    CASE ts.status 
        WHEN "pending" THEN 1 
        WHEN "approved" THEN 2 
        WHEN "rejected" THEN 3 
        ELSE 4 
    END,
    ts.submitted_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$submissions = $stmt->fetchAll() ?: [];

success_response([
    'submissions' => array_map(static fn($sub) => [
        'id' => (int) $sub['id'],
        'status' => $sub['status'],
        'task_title' => $sub['task_title'],
        'task_description' => $sub['task_description'],
        'task_reward_coins' => (int) $sub['task_reward_coins'],
        'task_reward_money' => (float) $sub['task_reward_money'],
        'task_reward_xp' => (int) $sub['task_reward_xp'],
        'user_username' => $sub['user_username'],
        'user_email' => $sub['user_email'],
        'proof_text' => $sub['proof_text'],
        'proof_link' => $sub['proof_link'],
        'proof_notes' => $sub['proof_notes'],
        'proof_file_count' => (int) $sub['proof_file_count'],
        'user_product_name' => $sub['user_product_name'],
        'user_product_order_id' => $sub['user_product_order_id'],
        'rejection_reason' => $sub['rejection_reason'],
        'rejection_notes' => $sub['rejection_notes'],
        'coins_earned' => (int) $sub['coins_earned'],
        'money_earned' => (float) $sub['money_earned'],
        'xp_earned' => (int) $sub['xp_earned'],
        'submitted_at' => $sub['submitted_at'],
        'reviewed_at' => $sub['reviewed_at']
    ], $submissions)
]);
