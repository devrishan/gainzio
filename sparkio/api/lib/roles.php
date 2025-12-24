<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap/database.php';

/**
 * Check if user has a specific role
 * @param PDO $pdo
 * @param int $userId
 * @param string $role
 * @return bool
 */
function has_role(PDO $pdo, int $userId, string $role): bool
{
    $stmt = $pdo->prepare('SELECT id FROM user_roles WHERE user_id = :user_id AND role = :role LIMIT 1');
    $stmt->execute([':user_id' => $userId, ':role' => $role]);
    return (bool) $stmt->fetchColumn();
}

/**
 * Check if user has any of the specified roles
 * @param PDO $pdo
 * @param int $userId
 * @param array $roles
 * @return bool
 */
function has_any_role(PDO $pdo, int $userId, array $roles): bool
{
    $placeholders = implode(',', array_fill(0, count($roles), '?'));
    $stmt = $pdo->prepare("SELECT id FROM user_roles WHERE user_id = ? AND role IN ($placeholders) LIMIT 1");
    $stmt->execute(array_merge([$userId], $roles));
    return (bool) $stmt->fetchColumn();
}

/**
 * Get all roles for a user
 * @param PDO $pdo
 * @param int $userId
 * @return array
 */
function get_user_roles(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare('SELECT role FROM user_roles WHERE user_id = :user_id');
    $stmt->execute([':user_id' => $userId]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

/**
 * Grant a role to a user
 * @param PDO $pdo
 * @param int $userId
 * @param string $role
 * @param int|null $grantedBy
 * @return bool
 */
function grant_role(PDO $pdo, int $userId, string $role, ?int $grantedBy = null): bool
{
    try {
        $stmt = $pdo->prepare('INSERT INTO user_roles (user_id, role, granted_by) VALUES (:user_id, :role, :granted_by)');
        return $stmt->execute([
            ':user_id' => $userId,
            ':role' => $role,
            ':granted_by' => $grantedBy
        ]);
    } catch (PDOException $e) {
        // Role already exists (unique constraint)
        return false;
    }
}

/**
 * Revoke a role from a user
 * @param PDO $pdo
 * @param int $userId
 * @param string $role
 * @return bool
 */
function revoke_role(PDO $pdo, int $userId, string $role): bool
{
    $stmt = $pdo->prepare('DELETE FROM user_roles WHERE user_id = :user_id AND role = :role');
    return $stmt->execute([':user_id' => $userId, ':role' => $role]);
}

/**
 * Initialize default role for new user
 * @param PDO $pdo
 * @param int $userId
 * @return bool
 */
function initialize_user_role(PDO $pdo, int $userId): bool
{
    return grant_role($pdo, $userId, 'user', null);
}

/**
 * Get required role object with permissions
 * @param PDO $pdo
 * @param int $userId
 * @return array
 */
function get_user_with_roles(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare('
        SELECT u.id, u.username, u.email, u.referral_code, u.created_at
        FROM users u
        WHERE u.id = :user_id
        LIMIT 1
    ');
    $stmt->execute([':user_id' => $userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        return [];
    }
    
    $roles = get_user_roles($pdo, $userId);
    $user['roles'] = $roles;
    
    return $user;
}
