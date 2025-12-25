<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

const ROOT_PATH = __DIR__ . '/../../';
const ENV_PATH = ROOT_PATH . '.env';

load_env(ENV_PATH);

function env(string $key, ?string $default = null): ?string
{
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

const JWT_ISSUER = 'sparkio_api';

function get_jwt_secret(): string
{
    $secret = env('JWT_SECRET');
    if (!$secret) {
        throw new RuntimeException('JWT_SECRET is not configured.');
    }

    return $secret;
}

function get_frontend_origin(): string
{
    return env('FRONTEND_ORIGIN', '*');
}

function get_jwt_ttl(): int
{
    return (int) env('JWT_TTL', '3600');
}


