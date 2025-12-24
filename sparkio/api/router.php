<?php
/**
 * Router for PHP built-in server
 * Handles /api/* paths by removing the /api prefix
 */

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove /api prefix if present
if (strpos($requestPath, '/api/') === 0) {
    $requestPath = substr($requestPath, 4); // Remove '/api'
}

// Remove leading slash
$requestPath = ltrim($requestPath, '/');

// If path is empty, return 404
if (empty($requestPath)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Not found']);
    exit;
}

// Check if the file exists
$filePath = __DIR__ . '/' . $requestPath;

if (file_exists($filePath) && is_file($filePath)) {
    // Serve the PHP file
    return false; // Let PHP handle it
}

// If it's a PHP file that doesn't exist, return 404
if (pathinfo($requestPath, PATHINFO_EXTENSION) === 'php') {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
    exit;
}

// For non-PHP files, return 404
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['success' => false, 'error' => 'Not found']);
exit;

