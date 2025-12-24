<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../bootstrap/database.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/validators.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

$pdo = get_pdo();

$placement = isset($_GET['placement']) ? sanitize_string($_GET['placement'], 100) : null;
$isActive = sanitize_boolean($_GET['is_active'] ?? true);

$conditions = [];
$params = [];

if ($placement) {
    $conditions[] = 'ad_placement_id = :placement';
    $params[':placement'] = $placement;
}

if ($isActive !== null) {
    $conditions[] = 'is_active = :is_active';
    $params[':is_active'] = $isActive ? 1 : 0;
}

$whereClause = '';
if (!empty($conditions)) {
    $whereClause = 'WHERE ' . implode(' AND ', $conditions);
}

$stmt = $pdo->prepare('
    SELECT id, name, ad_placement_id, ad_code_snippet, is_active
    FROM ads
' . $whereClause . '
    ORDER BY id DESC
');
$stmt->execute($params);
$ads = $stmt->fetchAll() ?: [];

success_response([
    'ads' => array_map(static fn ($row) => [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'ad_placement_id' => $row['ad_placement_id'],
        'ad_code_snippet' => $row['ad_code_snippet'],
        'is_active' => (bool) $row['is_active'],
    ], $ads),
]);

