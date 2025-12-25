<?php

declare(strict_types=1);

function json_response(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function success_response(array $data = [], int $statusCode = 200): void
{
    json_response(['success' => true] + $data, $statusCode);
}

function error_response(string $message, int $statusCode = 400, array $meta = []): void
{
    json_response(['success' => false, 'error' => $message] + $meta, $statusCode);
}

