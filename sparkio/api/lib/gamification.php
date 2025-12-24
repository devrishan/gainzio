<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/database.php';

/**
 * Initialize user stats for a new user
 */
function initialize_user_stats(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare('
        INSERT INTO user_stats (user_id, current_xp, current_level, total_coins)
        VALUES (:user_id, 0, 1, 0)
    ');
    $stmt->execute([':user_id' => $userId]);
}

/**
 * Add XP to user and check for level up
 */
function add_user_xp(PDO $pdo, int $userId, int $xp): array
{
    // Get current stats
    $stmt = $pdo->prepare('SELECT current_xp, current_level FROM user_stats WHERE user_id = :user_id LIMIT 1');
    $stmt->execute([':user_id' => $userId]);
    $stats = $stmt->fetch();
    
    if (!$stats) {
        initialize_user_stats($pdo, $userId);
        $stats = ['current_xp' => 0, 'current_level' => 1];
    }
    
    $newXp = (int) $stats['current_xp'] + $xp;
    $currentLevel = (int) $stats['current_level'];
    
    // Check for level up
    $levelStmt = $pdo->prepare('
        SELECT level, title, xp_required, bonus_coins
        FROM user_levels
        WHERE xp_required <= :xp
        ORDER BY level DESC
        LIMIT 1
    ');
    $levelStmt->execute([':xp' => $newXp]);
    $newLevelData = $levelStmt->fetch();
    
    $newLevel = $newLevelData ? (int) $newLevelData['level'] : $currentLevel;
    $leveledUp = $newLevel > $currentLevel;
    $bonusCoins = 0;
    
    if ($leveledUp) {
        $bonusCoins = (int) $newLevelData['bonus_coins'];
    }
    
    // Update stats
    $updateStmt = $pdo->prepare('
        UPDATE user_stats
        SET current_xp = :xp,
            current_level = :level,
            total_coins = total_coins + :bonus_coins
        WHERE user_id = :user_id
    ');
    $updateStmt->execute([
        ':xp' => $newXp,
        ':level' => $newLevel,
        ':bonus_coins' => $bonusCoins,
        ':user_id' => $userId
    ]);
    
    return [
        'leveled_up' => $leveledUp,
        'new_level' => $newLevel,
        'new_level_title' => $newLevelData ? $newLevelData['title'] : null,
        'bonus_coins' => $bonusCoins,
        'new_xp' => $newXp
    ];
}

/**
 * Add coins to user
 */
function add_user_coins(PDO $pdo, int $userId, int $coins): void
{
    $stmt = $pdo->prepare('
        UPDATE user_stats
        SET total_coins = total_coins + :coins
        WHERE user_id = :user_id
    ');
    $stmt->execute([':coins' => $coins, ':user_id' => $userId]);
}

/**
 * Update daily streak
 */
function update_daily_streak(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare('
        SELECT current_streak, longest_streak, last_streak_at
        FROM user_stats
        WHERE user_id = :user_id
        LIMIT 1
    ');
    $stmt->execute([':user_id' => $userId]);
    $stats = $stmt->fetch();
    
    if (!$stats) {
        return ['streak_updated' => false];
    }
    
    $today = date('Y-m-d');
    $lastStreakDate = $stats['last_streak_at'];
    
    // If already updated today, skip
    if ($lastStreakDate === $today) {
        return ['streak_updated' => false, 'current_streak' => (int) $stats['current_streak']];
    }
    
    $currentStreak = (int) $stats['current_streak'];
    $longestStreak = (int) $stats['longest_streak'];
    
    // Check if yesterday
    $yesterday = date('Y-m-d', strtotime('-1 day'));
    
    if ($lastStreakDate === $yesterday) {
        // Continue streak
        $currentStreak++;
    } else {
        // Reset streak
        $currentStreak = 1;
    }
    
    // Update longest if needed
    if ($currentStreak > $longestStreak) {
        $longestStreak = $currentStreak;
    }
    
    // Update database
    $updateStmt = $pdo->prepare('
        UPDATE user_stats
        SET current_streak = :current_streak,
            longest_streak = :longest_streak,
            last_streak_at = :today
        WHERE user_id = :user_id
    ');
    $updateStmt->execute([
        ':current_streak' => $currentStreak,
        ':longest_streak' => $longestStreak,
        ':today' => $today,
        ':user_id' => $userId
    ]);
    
    return [
        'streak_updated' => true,
        'current_streak' => $currentStreak,
        'longest_streak' => $longestStreak
    ];
}

/**
 * Grant achievement to user
 */
function grant_achievement(PDO $pdo, int $userId, string $achievementCode): bool
{
    try {
        // Get achievement
        $achStmt = $pdo->prepare('SELECT id, reward_coins, reward_xp FROM achievements WHERE code = :code LIMIT 1');
        $achStmt->execute([':code' => $achievementCode]);
        $achievement = $achStmt->fetch();
        
        if (!$achievement) {
            return false;
        }
        
        // Grant achievement (will fail if already exists due to unique constraint)
        $stmt = $pdo->prepare('
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (:user_id, :achievement_id)
        ');
        $stmt->execute([
            ':user_id' => $userId,
            ':achievement_id' => $achievement['id']
        ]);
        
        // Add rewards
        if ($achievement['reward_coins'] > 0) {
            add_user_coins($pdo, $userId, (int) $achievement['reward_coins']);
        }
        if ($achievement['reward_xp'] > 0) {
            add_user_xp($pdo, $userId, (int) $achievement['reward_xp']);
        }
        
        return true;
    } catch (PDOException $e) {
        // Already has achievement
        return false;
    }
}
