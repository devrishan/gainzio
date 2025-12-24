<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../bootstrap/database.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/validators.php';
require_once __DIR__ . '/../lib/helpers.php';
require_once __DIR__ . '/../lib/roles.php';
require_once __DIR__ . '/../lib/gamification.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Method not allowed.', 405);
}

enforce_rate_limit('register:' . get_client_ip(), 5, 300);

$input = decode_json_input();
$missing = require_fields($input, ['username', 'email', 'password']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$username = sanitize_string($input['username'], 100);
$email = sanitize_email($input['email']);
$password = $input['password'];
$referralCodeInput = isset($input['referral_code']) ? sanitize_string($input['referral_code'], 20) : null;

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_response('Invalid email address.', 422);
}

if (strlen($password) < 8) {
    error_response('Password must be at least 8 characters long.', 422);
}

$pdo = get_pdo();

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email OR username = :username LIMIT 1');
    $stmt->execute([':email' => $email, ':username' => $username]);
    if ($stmt->fetch()) {
        $pdo->rollBack();
        error_response('Email or username already exists.', 409);
    }

    $referrerId = null;
    if ($referralCodeInput) {
        $referrerStmt = $pdo->prepare('SELECT id FROM users WHERE referral_code = :code LIMIT 1');
        $referrerStmt->execute([':code' => $referralCodeInput]);
        $referrerId = $referrerStmt->fetchColumn() ?: null;

        if ($referrerId === null) {
            $pdo->rollBack();
            error_response('Invalid referral code provided.', 422);
        }
    }

    $referralCode = generate_referral_code($pdo);
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $insertUser = $pdo->prepare('
        INSERT INTO users (username, email, password_hash, role, referral_code, referred_by)
        VALUES (:username, :email, :password_hash, :role, :referral_code, :referred_by)
    ');

    $insertUser->execute([
        ':username' => $username,
        ':email' => $email,
        ':password_hash' => $passwordHash,
        ':role' => 'member',
        ':referral_code' => $referralCode,
        ':referred_by' => $referrerId,
    ]);

    $userId = (int) $pdo->lastInsertId();

    // Initialize wallet, role, and stats
    initialize_wallet($pdo, $userId);
    initialize_user_role($pdo, $userId);
    initialize_user_stats($pdo, $userId);

    if ($referrerId) {
        $referralInsert = $pdo->prepare('
            INSERT INTO referrals (referrer_id, referred_user_id, status, commission_amount)
            VALUES (:referrer_id, :referred_user_id, :status, :commission_amount)
        ');
        $referralInsert->execute([
            ':referrer_id' => $referrerId,
            ':referred_user_id' => $userId,
            ':status' => 'pending',
            ':commission_amount' => 0.00,
        ]);
    }

    $pdo->commit();
} catch (Throwable $exception) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_response('Failed to register user.', 500, ['detail' => $exception->getMessage()]);
}

success_response([
    'message' => 'Registration successful.',
    'user' => [
        'id' => $userId,
        'username' => $username,
        'email' => $email,
        'role' => 'member',
        'referral_code' => $referralCode,
    ],
], 201);

