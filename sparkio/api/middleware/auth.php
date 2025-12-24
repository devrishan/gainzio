<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/database.php';
require_once __DIR__ . '/../lib/jwt.php';
require_once __DIR__ . '/../lib/response.php';

function get_authorization_token(): ?string
{
    $headers = getallheaders();
    $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? null;

    if (!$authorization || !str_starts_with($authorization, 'Bearer ')) {
        return null;
    }

    return substr($authorization, 7);
}

function require_auth(array $allowedRoles = []): array
{
    $token = get_authorization_token();
    if (!$token) {
        error_response('Authorization token missing.', 401);
    }

    $payload = verify_jwt($token);
    if (!$payload) {
        error_response('Invalid or expired token.', 401);
    }

    $userId = $payload['sub'] ?? null;
    if (!$userId) {
        error_response('Invalid token payload.', 401);
    }

    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT id, username, email, role, referral_code FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch();

    if (!$user) {
        error_response('User not found.', 401);
    }

    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles, true)) {
        error_response('Forbidden.', 403);
    }

    return $user;
}

