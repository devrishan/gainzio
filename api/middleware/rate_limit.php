<?php

declare(strict_types=1);

function get_client_ip(): string
{
    $keys = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_REAL_IP',
        'REMOTE_ADDR',
    ];

    foreach ($keys as $key) {
        if (!empty($_SERVER[$key])) {
            $value = $_SERVER[$key];
            if ($key === 'HTTP_X_FORWARDED_FOR') {
                $parts = explode(',', $value);
                return trim($parts[0]);
            }
            return $value;
        }
    }

    return 'unknown';
}

function enforce_rate_limit(string $name, int $limit = 10, int $windowSeconds = 60): void
{
    $key = sprintf('rate:%s', $name);
    $now = time();

    if (function_exists('apcu_fetch')) {
        $bucket = apcu_fetch($key);
        if (!is_array($bucket) || $bucket['expires_at'] < $now) {
            $bucket = ['count' => 1, 'expires_at' => $now + $windowSeconds];
        } else {
            $bucket['count']++;
        }
        apcu_store($key, $bucket, $windowSeconds);
        if ($bucket['count'] > $limit) {
            http_response_code(429);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Too many requests. Please try again later.']);
            exit;
        }
        return;
    }

    $storageDir = sys_get_temp_dir() . '/sparkio_rate';
    if (!is_dir($storageDir)) {
        @mkdir($storageDir, 0755, true);
    }

    $file = $storageDir . '/' . sha1($key) . '.json';
    $bucket = ['count' => 0, 'expires_at' => $now + $windowSeconds];

    if (file_exists($file)) {
        $data = json_decode((string) file_get_contents($file), true);
        if (is_array($data) && ($data['expires_at'] ?? 0) > $now) {
            $bucket = $data;
        }
    }

    if ($bucket['expires_at'] < $now) {
        $bucket = ['count' => 1, 'expires_at' => $now + $windowSeconds];
    } else {
        $bucket['count']++;
    }

    file_put_contents($file, json_encode($bucket));

    if ($bucket['count'] > $limit) {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Too many requests. Please try again later.']);
        exit;
    }
}

