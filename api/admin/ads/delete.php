<?php

declare(strict_types=1);

require_once __DIR__ . '/../../bootstrap/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    error_response('Method not allowed.', 405);
}

require_auth(['admin']);

$input = decode_json_input();
if (empty($input)) {
    $input = $_GET;
}

$adId = sanitize_int($input['id'] ?? null);
if (!$adId) {
    error_response('Invalid ad ID.', 422);
}

$pdo = get_pdo();

$stmt = $pdo->prepare('DELETE FROM ads WHERE id = :id');
$stmt->execute([':id' => $adId]);

if ($stmt->rowCount() === 0) {
    error_response('Ad not found.', 404);
}

success_response([
    'message' => 'Ad deleted successfully.',
    'ad_id' => $adId,
]);

