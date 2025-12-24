-- Sparkio Database Schema
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS sparkio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sparkio;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
  referral_code VARCHAR(20) NOT NULL,
  referred_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_username UNIQUE (username),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT uq_users_referral_code UNIQUE (referral_code),
  CONSTRAINT fk_users_referred_by FOREIGN KEY (referred_by)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_users_referral_code ON users (referral_code);

-- Referrals Table (direct parent-child links)
CREATE TABLE IF NOT EXISTS referrals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  referrer_id INT UNSIGNED NULL,
  referred_user_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_referrals_referrer FOREIGN KEY (referrer_id)
    REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_referrals_referred_user FOREIGN KEY (referred_user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_referrals_status ON referrals (status);
CREATE INDEX idx_referrals_referrer ON referrals (referrer_id);
CREATE UNIQUE INDEX uq_referrals_referred_user ON referrals (referred_user_id);

-- Referral Closure Table for multi-level ancestry
CREATE TABLE IF NOT EXISTS referral_closure (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ancestor_id INT UNSIGNED NOT NULL,
  descendant_id INT UNSIGNED NOT NULL,
  depth TINYINT UNSIGNED NOT NULL, -- 0 for self, 1 for L1, 2 for L2, etc.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_referral_closure_ancestor FOREIGN KEY (ancestor_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_referral_closure_descendant FOREIGN KEY (descendant_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT uq_referral_closure_path UNIQUE (ancestor_id, descendant_id)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_referral_closure_ancestor ON referral_closure (ancestor_id);
CREATE INDEX idx_referral_closure_descendant ON referral_closure (descendant_id);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_wallets_user UNIQUE (user_id),
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processed', 'failed') NOT NULL DEFAULT 'pending',
  upi_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_withdrawals_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_withdrawals_status ON withdrawals (status);

-- Ranks Table
CREATE TABLE IF NOT EXISTS ranks (
  level INT UNSIGNED PRIMARY KEY, -- 1, 2, 3...
  title VARCHAR(100) NOT NULL UNIQUE,
  xp_required INT UNSIGNED NOT NULL UNIQUE,
  bonus_coins DECIMAL(10,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- User Gamification Stats
CREATE TABLE IF NOT EXISTS user_gamification (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  current_xp INT UNSIGNED NOT NULL DEFAULT 0,
  current_rank_level INT UNSIGNED NOT NULL DEFAULT 1,
  current_streak INT UNSIGNED NOT NULL DEFAULT 0,
  last_streak_at DATETIME NULL,
  CONSTRAINT uq_user_gamification_user UNIQUE (user_id),
  CONSTRAINT fk_user_gamification_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_user_gamification_rank FOREIGN KEY (current_rank_level)
    REFERENCES ranks(level)
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Achievements Catalog
CREATE TABLE IF NOT EXISTS achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(255) NOT NULL
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  achievement_id INT UNSIGNED NOT NULL,
  earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id)
    REFERENCES achievements(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ad_placement_id VARCHAR(100) NOT NULL,
  ad_code_snippet TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT uq_ads_placement UNIQUE (ad_placement_id)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

