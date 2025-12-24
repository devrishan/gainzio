-- Database Query Optimization Script
-- Run this after analyzing slow queries to add missing indexes

-- Additional indexes for common query patterns

-- Admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_task_submission_status_submitted_at 
ON "TaskSubmission" (status, "submittedAt" DESC);

CREATE INDEX IF NOT EXISTS idx_user_role_is_deleted 
ON "User" (role, "isDeleted");

CREATE INDEX IF NOT EXISTS idx_withdrawal_status_requested_at 
ON "Withdrawal" (status, "requestedAt" DESC);

-- Task listing queries
CREATE INDEX IF NOT EXISTS idx_task_is_active_expires_at 
ON "Task" ("isActive", "expiresAt");

CREATE INDEX IF NOT EXISTS idx_task_category_active_priority 
ON "Task" ("categoryId", "isActive", priority DESC);

-- User wallet queries
CREATE INDEX IF NOT EXISTS idx_wallet_transaction_user_type_created 
ON "WalletTransaction" ("userId", type, "createdAt" DESC);

-- Referral queries
CREATE INDEX IF NOT EXISTS idx_referral_referrer_status_created 
ON "Referral" ("referrerId", status, "createdAt" DESC);

-- Gamification queries
CREATE INDEX IF NOT EXISTS idx_gamification_state_xp_rank 
ON "GamificationState" (xp DESC, rank);

-- Product suggestions
CREATE INDEX IF NOT EXISTS idx_product_suggestion_status_created 
ON "ProductSuggestion" (status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_product_suggestion_platform_status 
ON "ProductSuggestion" (platform, status);

-- Spark events
CREATE INDEX IF NOT EXISTS idx_spark_event_public_created 
ON "SparkEvent" ("isPublic", "createdAt" DESC);

-- Analyze tables to update statistics
ANALYZE "User";
ANALYZE "Task";
ANALYZE "TaskSubmission";
ANALYZE "Wallet";
ANALYZE "WalletTransaction";
ANALYZE "Withdrawal";
ANALYZE "Referral";
ANALYZE "GamificationState";
ANALYZE "ProductSuggestion";
ANALYZE "SparkEvent";

