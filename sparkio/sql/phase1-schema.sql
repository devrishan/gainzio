-- Phase 1: Core Authentication, Roles, Tasks, and Proof System
-- This extends the existing schema with new tables

USE sparkio;

-- ==========================================
-- 1. USER ROLES SYSTEM (Separate Table for Security)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  role ENUM('user', 'admin', 'product_manager', 'verifier', 'payout_manager') NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by INT UNSIGNED NULL,
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_granted_by FOREIGN KEY (granted_by)
    REFERENCES users(id)
    ON DELETE SET NULL,
  UNIQUE KEY uq_user_role (user_id, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ==========================================
-- 2. PRODUCTS SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS stores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  store_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  image_url VARCHAR(500),
  tags JSON,
  status ENUM('active', 'inactive', 'discontinued') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_store FOREIGN KEY (store_id)
    REFERENCES stores(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES product_categories(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_products_created_by FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

-- ==========================================
-- 3. USER PRODUCTS (My Products/Orders)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  store_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  order_id VARCHAR(100),
  transaction_id VARCHAR(100),
  order_date DATE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method ENUM('upi', 'card', 'wallet', 'emi', 'netbanking', 'other') NOT NULL,
  product_link VARCHAR(500),
  notes TEXT,
  status ENUM('saved', 'used', 'suggested') NOT NULL DEFAULT 'saved',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_products_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_products_store FOREIGN KEY (store_id)
    REFERENCES stores(id),
  CONSTRAINT fk_user_products_category FOREIGN KEY (category_id)
    REFERENCES product_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_user_products_user ON user_products(user_id);
CREATE INDEX idx_user_products_status ON user_products(status);

-- ==========================================
-- 4. PROOF FILES (Screenshots, PDFs, etc.)
-- ==========================================

CREATE TABLE IF NOT EXISTS proof_files (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  user_product_id INT UNSIGNED NULL,
  file_type ENUM('image', 'pdf', 'invoice') NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT UNSIGNED,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_proof_files_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_proof_files_user_product FOREIGN KEY (user_product_id)
    REFERENCES user_products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_proof_files_user ON proof_files(user_id);
CREATE INDEX idx_proof_files_user_product ON proof_files(user_product_id);

-- ==========================================
-- 5. TASKS SYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  reward_coins INT UNSIGNED NOT NULL DEFAULT 0,
  reward_money DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  reward_xp INT UNSIGNED NOT NULL DEFAULT 0,
  type ENUM('product_based', 'instant', 'manual', 'auto_complete') NOT NULL DEFAULT 'manual',
  status ENUM('active', 'paused', 'expired', 'draft') NOT NULL DEFAULT 'active',
  
  -- Eligibility rules
  min_spend DECIMAL(10,2),
  min_user_level INT UNSIGNED DEFAULT 1,
  allowed_regions JSON,
  is_new_user_only TINYINT(1) NOT NULL DEFAULT 0,
  is_one_time TINYINT(1) NOT NULL DEFAULT 1,
  max_redemptions_per_user INT UNSIGNED DEFAULT 1,
  
  -- Auto-reject conditions
  min_order_age_days INT UNSIGNED,
  max_order_age_days INT UNSIGNED,
  
  created_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  
  CONSTRAINT fk_tasks_product FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_tasks_category FOREIGN KEY (category_id)
    REFERENCES product_categories(id),
  CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_category ON tasks(category_id);
CREATE INDEX idx_tasks_product ON tasks(product_id);

-- ==========================================
-- 6. TASK SUBMISSIONS & PROOF
-- ==========================================

CREATE TABLE IF NOT EXISTS task_submissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  user_product_id INT UNSIGNED NULL,
  
  -- Submission data
  proof_text TEXT,
  proof_link VARCHAR(500),
  proof_notes TEXT,
  
  -- Review data
  status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  reviewed_by INT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL,
  rejection_reason ENUM(
    'screenshot_unclear',
    'wrong_product',
    'wrong_amount',
    'outside_time',
    'duplicate_proof',
    'wrong_upi',
    'offer_expired',
    'not_eligible',
    'other'
  ),
  rejection_notes TEXT,
  
  -- Rewards (credited after approval)
  coins_earned INT UNSIGNED DEFAULT 0,
  money_earned DECIMAL(10,2) DEFAULT 0.00,
  xp_earned INT UNSIGNED DEFAULT 0,
  rewards_credited TINYINT(1) NOT NULL DEFAULT 0,
  
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_submissions_task FOREIGN KEY (task_id)
    REFERENCES tasks(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_submissions_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_submissions_user_product FOREIGN KEY (user_product_id)
    REFERENCES user_products(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_submissions_reviewed_by FOREIGN KEY (reviewed_by)
    REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_submissions_status ON task_submissions(status);
CREATE INDEX idx_submissions_user ON task_submissions(user_id);
CREATE INDEX idx_submissions_task ON task_submissions(task_id);
CREATE INDEX idx_submissions_reviewed_by ON task_submissions(reviewed_by);

-- ==========================================
-- 7. SUBMISSION PROOF FILES (Many-to-Many)
-- ==========================================

CREATE TABLE IF NOT EXISTS submission_proof_files (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NOT NULL,
  proof_file_id INT UNSIGNED NOT NULL,
  CONSTRAINT fk_submission_proof_submission FOREIGN KEY (submission_id)
    REFERENCES task_submissions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_submission_proof_file FOREIGN KEY (proof_file_id)
    REFERENCES proof_files(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_submission_proof (submission_id, proof_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 8. USER SUGGESTED PRODUCTS (Product Pipeline)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_suggested_products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_product_id INT UNSIGNED NOT NULL,
  suggested_by INT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted_product', 'accepted_task', 'rejected', 'archived') NOT NULL DEFAULT 'pending',
  reviewed_by INT UNSIGNED NULL,
  reviewed_at TIMESTAMP NULL,
  review_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_suggested_user_product FOREIGN KEY (user_product_id)
    REFERENCES user_products(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_suggested_by FOREIGN KEY (suggested_by)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_suggested_reviewed_by FOREIGN KEY (reviewed_by)
    REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_suggested_status ON user_suggested_products(status);
CREATE INDEX idx_suggested_by_user ON user_suggested_products(suggested_by);

-- ==========================================
-- 9. GAMIFICATION TABLES
-- ==========================================

CREATE TABLE IF NOT EXISTS user_levels (
  level INT UNSIGNED PRIMARY KEY,
  title VARCHAR(50) NOT NULL UNIQUE,
  xp_required INT UNSIGNED NOT NULL UNIQUE,
  bonus_coins INT UNSIGNED DEFAULT 0,
  perks JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_stats (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  current_xp INT UNSIGNED NOT NULL DEFAULT 0,
  current_level INT UNSIGNED NOT NULL DEFAULT 1,
  total_coins INT UNSIGNED NOT NULL DEFAULT 0,
  current_streak INT UNSIGNED NOT NULL DEFAULT 0,
  longest_streak INT UNSIGNED NOT NULL DEFAULT 0,
  last_streak_at DATE NULL,
  tasks_completed INT UNSIGNED NOT NULL DEFAULT 0,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_stats_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_stats_level FOREIGN KEY (current_level)
    REFERENCES user_levels(level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url VARCHAR(500),
  reward_coins INT UNSIGNED DEFAULT 0,
  reward_xp INT UNSIGNED DEFAULT 0,
  category ENUM('tasks', 'earnings', 'referrals', 'streaks', 'social') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_achievements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  achievement_id INT UNSIGNED NOT NULL,
  earned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_achievements_achievement FOREIGN KEY (achievement_id)
    REFERENCES achievements(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_user_achievement (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 10. SEED DATA
-- ==========================================

-- Insert default user levels
INSERT INTO user_levels (level, title, xp_required, bonus_coins, perks) VALUES
(1, 'Newbie', 0, 0, '["Access to basic tasks"]'),
(2, 'Pro', 1000, 50, '["Access to premium tasks", "5% bonus rewards"]'),
(3, 'Elite', 5000, 200, '["Access to exclusive tasks", "10% bonus rewards", "Priority support"]'),
(4, 'Master', 15000, 500, '["Access to all tasks", "15% bonus rewards", "VIP support", "Early access to new features"]');

-- Insert default stores
INSERT INTO stores (name, is_active) VALUES
('Amazon', 1),
('Flipkart', 1),
('Hostinger', 1),
('Navi', 1),
('Meesho', 1),
('Myntra', 1),
('Swiggy', 1),
('Zomato', 1),
('Other', 1);

-- Insert default categories
INSERT INTO product_categories (name, description, icon) VALUES
('Hosting', 'Web hosting and domain services', 'server'),
('Shopping', 'E-commerce and online shopping', 'shopping-cart'),
('Finance', 'Banking, loans, and financial services', 'wallet'),
('Recharge', 'Mobile recharge and bill payments', 'smartphone'),
('Food', 'Food delivery and dining', 'utensils'),
('Fashion', 'Clothing and accessories', 'shirt'),
('Electronics', 'Electronics and gadgets', 'laptop'),
('Other', 'Other categories', 'tag');

-- Insert sample achievements
INSERT INTO achievements (code, name, description, icon_url, reward_coins, reward_xp, category) VALUES
('FIRST_TASK', 'First Steps', 'Complete your first task', NULL, 10, 50, 'tasks'),
('TASK_10', 'Getting Started', 'Complete 10 tasks', NULL, 25, 100, 'tasks'),
('TASK_50', 'Task Master', 'Complete 50 tasks', NULL, 100, 500, 'tasks'),
('EARNED_100', 'First Earnings', 'Earn ₹100', NULL, 20, 100, 'earnings'),
('EARNED_500', 'Money Maker', 'Earn ₹500', NULL, 50, 250, 'earnings'),
('EARNED_1000', 'Big Earner', 'Earn ₹1000', NULL, 100, 500, 'earnings'),
('REFERRAL_5', 'Social Butterfly', 'Refer 5 friends', NULL, 50, 200, 'referrals'),
('STREAK_7', 'Week Warrior', 'Maintain 7-day streak', NULL, 30, 150, 'streaks'),
('STREAK_30', 'Month Master', 'Maintain 30-day streak', NULL, 150, 750, 'streaks');
