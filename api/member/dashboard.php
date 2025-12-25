<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../lib/response.php';

handle_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Method not allowed.', 405);
}

$user = require_auth(['member', 'admin']);
$pdo = get_pdo();

$walletStmt = $pdo->prepare('SELECT balance, total_earned FROM wallets WHERE user_id = :user_id LIMIT 1');
$walletStmt->execute([':user_id' => $user['id']]);
$wallet = $walletStmt->fetch() ?: ['balance' => 0.00, 'total_earned' => 0.00];

$referralsStatsStmt = $pdo->prepare('
    SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = "verified" THEN 1 ELSE 0 END) AS verified,
        SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) AS pending
    FROM referrals
    WHERE referrer_id = :user_id
');
$referralsStatsStmt->execute([':user_id' => $user['id']]);
$referralStats = $referralsStatsStmt->fetch() ?: ['total' => 0, 'verified' => 0, 'pending' => 0];

$totalReferrals = (int) $referralStats['total'];
$successRate = $totalReferrals > 0 ? round(((int) $referralStats['verified'] / $totalReferrals) * 100, 2) : 0.0;

$topReferrersStmt = $pdo->query('
    SELECT u.username, u.referral_code,
           COALESCE(SUM(CASE WHEN r.status = "verified" THEN 1 ELSE 0 END), 0) AS verified_count,
           COALESCE(w.total_earned, 0) AS total_earned
    FROM users u
    LEFT JOIN referrals r ON r.referrer_id = u.id
    LEFT JOIN wallets w ON w.user_id = u.id
    WHERE u.role = "member"
    GROUP BY u.id
    ORDER BY verified_count DESC, total_earned DESC
    LIMIT 5
');
$topReferrers = $topReferrersStmt->fetchAll() ?: [];

success_response([
    'wallet' => [
        'balance' => (float) $wallet['balance'],
        'total_earned' => (float) $wallet['total_earned'],
    ],
    'referrals' => [
        'total' => $totalReferrals,
        'verified' => (int) $referralStats['verified'],
        'pending' => (int) $referralStats['pending'],
        'success_rate' => $successRate,
    ],
    'top_referrers' => array_map(static fn ($row) => [
        'username' => $row['username'],
        'referral_code' => $row['referral_code'],
        'verified_referrals' => (int) $row['verified_count'],
        'total_earned' => (float) $row['total_earned'],
    ], $topReferrers),
]);

