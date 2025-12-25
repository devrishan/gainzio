<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/database.php';

function generate_referral_code(PDO $pdo, int $length = 8): string
{
    $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $maxIndex = strlen($characters) - 1;

    do {
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $characters[random_int(0, $maxIndex)];
        }

        $stmt = $pdo->prepare('SELECT id FROM users WHERE referral_code = :code LIMIT 1');
        $stmt->execute([':code' => $code]);
        $exists = $stmt->fetchColumn();
    } while ($exists);

    return $code;
}

function initialize_wallet(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare('INSERT INTO wallets (user_id, balance, total_earned) VALUES (:user_id, 0.00, 0.00)');
    $stmt->execute([':user_id' => $userId]);
}

