<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user submissions
    $user = require_auth(['member', 'admin']);
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
            t.reward_coins AS task_reward_coins,
            t.reward_money AS task_reward_money,
            t.reward_xp AS task_reward_xp,
            up.product_name AS user_product_name,
            up.order_id AS user_product_order_id,
            (
                SELECT COUNT(*)
                FROM submission_proof_files spf
                WHERE spf.submission_id = ts.id
            ) AS proof_file_count
        FROM task_submissions ts
        INNER JOIN tasks t ON t.id = ts.task_id
        LEFT JOIN user_products up ON up.id = ts.user_product_id
        WHERE ts.user_id = :user_id
    ';
    
    $params = [':user_id' => $user['id']];
    
    if ($status && in_array($status, ['pending', 'approved', 'rejected', 'completed'], true)) {
        $sql .= ' AND ts.status = :status';
        $params[':status'] = $status;
    }
    
    $sql .= ' ORDER BY ts.submitted_at DESC';
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $submissions = $stmt->fetchAll() ?: [];
    
    success_response([
        'submissions' => array_map(static fn($sub) => [
            'id' => (int) $sub['id'],
            'status' => $sub['status'],
            'task_title' => $sub['task_title'],
            'task_reward_coins' => (int) $sub['task_reward_coins'],
            'task_reward_money' => (float) $sub['task_reward_money'],
            'task_reward_xp' => (int) $sub['task_reward_xp'],
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
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Submit new task
    require_once __DIR__ . '/../lib/validators.php';
    
    $user = require_auth(['member', 'admin']);
    $pdo = get_pdo();
    
    $input = decode_json_input();
    $missing = require_fields($input, ['task_id']);
    
    if (!empty($missing)) {
        error_response('Missing required fields: ' . implode(', ', $missing), 422);
    }
    
    $taskId = (int) $input['task_id'];
    
    try {
        $pdo->beginTransaction();
        
        // Check if task exists and is active
        $taskStmt = $pdo->prepare('
            SELECT id, is_one_time, max_redemptions_per_user, reward_coins, reward_money, reward_xp
            FROM tasks
            WHERE id = :task_id AND status = "active"
            LIMIT 1
        ');
        $taskStmt->execute([':task_id' => $taskId]);
        $task = $taskStmt->fetch();
        
        if (!$task) {
            $pdo->rollBack();
            error_response('Task not found or inactive', 404);
        }
        
        // Check if user already submitted this task
        $countStmt = $pdo->prepare('
            SELECT COUNT(*) FROM task_submissions
            WHERE task_id = :task_id AND user_id = :user_id
        ');
        $countStmt->execute([':task_id' => $taskId, ':user_id' => $user['id']]);
        $submissionCount = (int) $countStmt->fetchColumn();
        
        if ($submissionCount >= (int) $task['max_redemptions_per_user']) {
            $pdo->rollBack();
            error_response('Maximum submissions reached for this task', 400);
        }
        
        // Create submission
        $stmt = $pdo->prepare('
            INSERT INTO task_submissions (
                task_id, user_id, user_product_id,
                proof_text, proof_link, proof_notes, status
            ) VALUES (
                :task_id, :user_id, :user_product_id,
                :proof_text, :proof_link, :proof_notes, :status
            )
        ');
        
        $stmt->execute([
            ':task_id' => $taskId,
            ':user_id' => $user['id'],
            ':user_product_id' => $input['user_product_id'] ?? null,
            ':proof_text' => $input['proof_text'] ?? null,
            ':proof_link' => $input['proof_link'] ?? null,
            ':proof_notes' => $input['proof_notes'] ?? null,
            ':status' => 'pending'
        ]);
        
        $submissionId = $pdo->lastInsertId();
        
        $pdo->commit();
        
        success_response([
            'message' => 'Task submitted successfully',
            'submission_id' => (int) $submissionId
        ], 201);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_response('Failed to submit task: ' . $e->getMessage(), 500);
    }
    
} else {
    error_response('Method not allowed.', 405);
}
