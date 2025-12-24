<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['member', 'admin']);

success_response([
    'user' => [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'referral_code' => $user['referral_code'],
    ],
]);

