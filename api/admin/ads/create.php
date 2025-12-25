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

require_auth(['admin']);
$input = decode_json_input();
$missing = require_fields($input, ['name', 'ad_placement_id', 'ad_code_snippet']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$name = sanitize_string($input['name'], 255);
$placement = sanitize_string($input['ad_placement_id'], 100);
$code = trim((string) $input['ad_code_snippet']);
$isActive = isset($input['is_active']) ? (sanitize_boolean($input['is_active']) ? 1 : 0) : 1;

if ($name === '' || $placement === '' || $code === '') {
    error_response('Invalid ad payload.', 422);
}

$pdo = get_pdo();

try {
    $stmt = $pdo->prepare('
        INSERT INTO ads (name, ad_placement_id, ad_code_snippet, is_active)
        VALUES (:name, :placement, :code, :is_active)
    ');
    $stmt->execute([
        ':name' => $name,
        ':placement' => $placement,
        ':code' => $code,
        ':is_active' => $isActive,
    ]);
} catch (Throwable $exception) {
    error_response('Failed to create ad.', 500, ['detail' => $exception->getMessage()]);
}

$adId = (int) $pdo->lastInsertId();

success_response([
    'message' => 'Ad created successfully.',
    'ad' => [
        'id' => $adId,
        'name' => $name,
        'ad_placement_id' => $placement,
        'ad_code_snippet' => $code,
        'is_active' => (bool) $isActive,
    ],
], 201);

