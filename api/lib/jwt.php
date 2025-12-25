<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/config.php';

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    $padding = 4 - (strlen($data) % 4);
    if ($padding < 4) {
        $data .= str_repeat('=', $padding);
    }
    return base64_decode(strtr($data, '-_', '+/')) ?: '';
}

function generate_jwt(array $payload, int $ttlSeconds = 3600): string
{
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $issuedAt = time();
    $payload = array_merge([
        'iss' => JWT_ISSUER,
        'iat' => $issuedAt,
        'exp' => $issuedAt + $ttlSeconds,
    ], $payload);

    $base64Header = base64url_encode(json_encode($header));
    $base64Payload = base64url_encode(json_encode($payload));

    $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, get_jwt_secret(), true);
    $base64Signature = base64url_encode($signature);

    return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
}

function verify_jwt(string $token): ?array
{
    $segments = explode('.', $token);
    if (count($segments) !== 3) {
        return null;
    }

    [$base64Header, $base64Payload, $base64Signature] = $segments;
    $signature = base64url_decode($base64Signature);
    $expectedSignature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, get_jwt_secret(), true);

    if (!hash_equals($expectedSignature, $signature)) {
        return null;
    }

    $payloadJson = base64url_decode($base64Payload);
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload)) {
        return null;
    }

    if (($payload['iss'] ?? null) !== JWT_ISSUER) {
        return null;
    }

    if (($payload['exp'] ?? 0) < time()) {
        return null;
    }

    return $payload;
}

