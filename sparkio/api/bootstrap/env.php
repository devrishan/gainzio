<?php

declare(strict_types=1);

/**
 * Load environment variables from a .env file into $_ENV.
 *
 * @param string $envPath Absolute path to .env file.
 */
function load_env(string $envPath): void
{
    if (!file_exists($envPath)) {
        return;
    }

    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        [$name, $value] = array_pad(explode('=', $line, 2), 2, null);
        $name = trim($name);
        $value = $value !== null ? trim($value) : '';

        if ($name === '') {
            continue;
        }

        $value = trim($value, "\"'");

        $_ENV[$name] = $value;
        putenv(sprintf('%s=%s', $name, $value));
    }
}

