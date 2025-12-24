<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    error_response('Method not allowed.', 405);
}

require_auth(['admin']);
$input = decode_json_input();
$missing = require_fields($input, ['id']);

if (!empty($missing)) {
    error_response('Missing required fields: ' . implode(', ', $missing), 422);
}

$adId = sanitize_int($input['id']);
if (!$adId) {
    error_response('Invalid ad ID.', 422);
}

$fields = [];
$params = [];

if (isset($input['name'])) {
    $fields[] = 'name = :name';
    $params[':name'] = sanitize_string($input['name'], 255);
}

if (isset($input['ad_placement_id'])) {
    $fields[] = 'ad_placement_id = :placement';
    $params[':placement'] = sanitize_string($input['ad_placement_id'], 100);
}

if (isset($input['ad_code_snippet'])) {
    $fields[] = 'ad_code_snippet = :code';
    $params[':code'] = trim((string) $input['ad_code_snippet']);
}

if (isset($input['is_active'])) {
    $fields[] = 'is_active = :is_active';
    $params[':is_active'] = sanitize_boolean($input['is_active']) ? 1 : 0;
}

if (empty($fields)) {
    error_response('No fields to update.', 422);
}

$params[':id'] = $adId;

$pdo = get_pdo();

try {
    $sql = 'UPDATE ads SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
} catch (Throwable $exception) {
    error_response('Failed to update ad.', 500, ['detail' => $exception->getMessage()]);
}

$fetch = $pdo->prepare('SELECT id, name, ad_placement_id, ad_code_snippet, is_active FROM ads WHERE id = :id');
$fetch->execute([':id' => $adId]);
$ad = $fetch->fetch();

if (!$ad) {
    error_response('Ad not found after update.', 404);
}

success_response([
    'message' => 'Ad updated successfully.',
    'ad' => [
        'id' => (int) $ad['id'],
        'name' => $ad['name'],
        'ad_placement_id' => $ad['ad_placement_id'],
        'ad_code_snippet' => $ad['ad_code_snippet'],
        'is_active' => (bool) $ad['is_active'],
    ],
]);

