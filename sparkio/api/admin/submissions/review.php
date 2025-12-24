<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['admin']);
$pdo = get_pdo();

$input = decode_json_input();
$missing = require_fields($input, ['submission_id', 'action']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$submissionId = (int) $input['submission_id'];
$action = $input['action']; // 'approve' or 'reject'

if (!in_array($action, ['approve', 'reject'], true)) {
    error_response('Invalid action. Must be "approve" or "reject".', 400);
}

try {
    $pdo->beginTransaction();
    
    // Get submission details
    $stmt = $pdo->prepare('
        SELECT ts.*, t.reward_coins, t.reward_money, t.reward_xp
        FROM task_submissions ts
        INNER JOIN tasks t ON t.id = ts.task_id
        WHERE ts.id = :id AND ts.status = "pending"
        LIMIT 1
    ');
    $stmt->execute([':id' => $submissionId]);
    $submission = $stmt->fetch();
    
    if (!$submission) {
        $pdo->rollBack();
        error_response('Submission not found or already reviewed', 404);
    }
    
    if ($action === 'approve') {
        // Update submission to approved
        $updateStmt = $pdo->prepare('
            UPDATE task_submissions 
            SET status = "approved",
                coins_earned = :coins,
                money_earned = :money,
                xp_earned = :xp,
                reviewed_at = NOW()
            WHERE id = :id
        ');
        $updateStmt->execute([
            ':id' => $submissionId,
            ':coins' => $submission['reward_coins'],
            ':money' => $submission['reward_money'],
            ':xp' => $submission['reward_xp']
        ]);
        
        // Update user wallet
        $walletStmt = $pdo->prepare('
            UPDATE users 
            SET wallet_balance = wallet_balance + :money,
                total_earnings = total_earnings + :money
            WHERE id = :user_id
        ');
        $walletStmt->execute([
            ':money' => $submission['reward_money'],
            ':user_id' => $submission['user_id']
        ]);
        
        // Update user stats
        $statsStmt = $pdo->prepare('
            INSERT INTO user_stats (user_id, coins, xp, tasks_completed)
            VALUES (:user_id, :coins, :xp, 1)
            ON DUPLICATE KEY UPDATE
                coins = coins + :coins,
                xp = xp + :xp,
                tasks_completed = tasks_completed + 1
        ');
        $statsStmt->execute([
            ':user_id' => $submission['user_id'],
            ':coins' => $submission['reward_coins'],
            ':xp' => $submission['reward_xp']
        ]);
        
        $pdo->commit();
        success_response(['message' => 'Submission approved successfully']);
        
    } else {
        // Reject submission
        $rejectionReason = $input['rejection_reason'] ?? 'other';
        $rejectionNotes = $input['rejection_notes'] ?? null;
        
        $updateStmt = $pdo->prepare('
            UPDATE task_submissions 
            SET status = "rejected",
                rejection_reason = :reason,
                rejection_notes = :notes,
                reviewed_at = NOW()
            WHERE id = :id
        ');
        $updateStmt->execute([
            ':id' => $submissionId,
            ':reason' => $rejectionReason,
            ':notes' => $rejectionNotes
        ]);
        
        $pdo->commit();
        success_response(['message' => 'Submission rejected']);
    }
    
} catch (PDOException $e) {
    $pdo->rollBack();
    error_response('Failed to review submission: ' . $e->getMessage(), 500);
}
