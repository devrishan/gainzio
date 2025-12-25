<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../bootstrap/database.php';
require_once __DIR__ . '/../bootstrap/config.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/validators.php';
require_once __DIR__ . '/../lib/jwt.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Method not allowed.', 405);
}

enforce_rate_limit('login:' . get_client_ip(), 10, 60);

$input = decode_json_input();
$missing = require_fields($input, ['email', 'password']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$email = sanitize_email($input['email']);
$password = $input['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_response('Invalid email address.', 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, username, email, password_hash, role, referral_code FROM users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    error_response('Invalid credentials.', 401);
}

$ttl = get_jwt_ttl();
$token = generate_jwt([
    'sub' => (int) $user['id'],
    'role' => $user['role'],
    'email' => $user['email'],
], $ttl);

success_response([
    'token' => $token,
    'token_type' => 'Bearer',
    'expires_in' => $ttl,
    'user' => [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'referral_code' => $user['referral_code'],
    ],
]);

