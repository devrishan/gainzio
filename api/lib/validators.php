<?php

declare(strict_types=1);

function require_fields(array $input, array $fields): array
{
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($input[$field]) || $input[$field] === '') {
            $missing[] = $field;
        }
    }

    return $missing;
}

function sanitize_email(string $email): string
{
    return filter_var(mb_strtolower(trim($email)), FILTER_SANITIZE_EMAIL) ?: '';
}

function sanitize_string(string $value, int $maxLength = 255): string
{
    $value = trim(filter_var($value, FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_LOW | FILTER_FLAG_STRIP_HIGH));
    return mb_substr($value, 0, $maxLength);
}

function sanitize_decimal(string $value): string
{
    return number_format((float) $value, 2, '.', '');
}

function sanitize_int($value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }

    if (filter_var($value, FILTER_VALIDATE_INT) === false) {
        return null;
    }

    return (int) $value;
}

function sanitize_boolean($value): ?bool
{
    if ($value === null || $value === '') {
        return null;
    }

    if (in_array($value, [true, 'true', '1', 1], true)) {
        return true;
    }

    if (in_array($value, [false, 'false', '0', 0], true)) {
        return false;
    }

    return null;
}

function decode_json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

