<!-- afda866d-c627-42d5-b0e0-78cc090139d0 47a31919-73ff-434b-9844-ffb75839f32a -->
# Earniq Platform — Migration & Enhancement Plan

## Current State Analysis

**Existing Infrastructure:**

- Hybrid architecture: PHP REST API (`api/`) + Next.js frontend
- Prisma schema exists for Earniq (comprehensive, MySQL provider)
- Partial Next.js API routes: OTP auth, some admin endpoints
- Frontend: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- Auth: JWT with sessions (partially implemented), OTP routes exist but providers not integrated
- Database: MySQL (Sparkio schema) + Prisma schema (Earniq models)
- File storage: Local PHP uploads (no S3)
- Redis: Setup exists but underutilized
- Referrals: Single-level only (PHP), schema supports multi-level
- Tasks: Submission flow exists, proxies to PHP backend

**Gaps Identified:**

- Product suggestions feature (no model, no UI, no API)
- "My Products / My Orders" feature
- Product Dashboard for product managers
- Multi-level referral logic (schema ready, logic missing)
- Gamification system (XP, levels, badges - schema ready, logic missing)
- Redis leaderboards
- Spark Wall / SSE real-time feed
- Top Suggestions algorithm
- S3 file uploads
- MSG91/Twilio OTP integration
- Razorpay/Cashfree payout integration
- PostgreSQL migration
- Complete PHP → Next.js API migration
- Feature flags system
- Comprehensive testing

---

## Phase 1: MVP Foundation (Weeks 1-4)

### Epic 1.1: Complete Auth Migration & OTP Integration

**Status:** Partially done (routes exist, providers missing)

**Tasks:**

- [ ] Integrate MSG91 SDK (`src/lib/otp-provider.ts` - complete TODO)
- [ ] Integrate Twilio SDK (fallback provider)
- [ ] Add rate limiting middleware for OTP (Redis-based)
- [ ] Migrate session refresh endpoint (`app/api/auth/session/route.ts`)
- [ ] Update middleware to use new JWT tokens (`earniq_access_token` cookie)
- [ ] Add phone number validation & masking utilities
- [ ] Test OTP flows: request, verify, error states, rate limits

**Acceptance:**

- Users can request OTP via MSG91/Twilio
- OTP verification creates/updates user with referral linkage
- JWT tokens issued correctly, refresh works
- Rate limiting prevents abuse (10 requests per phone per hour)

**Files to Create/Modify:**

- `src/lib/otp-provider.ts` (complete MSG91/Twilio integration)
- `src/lib/rate-limit.ts` (Redis-based rate limiter)
- `app/api/auth/session/route.ts` (refresh token endpoint)
- `middleware.ts` (update to use `earniq_access_token`)

---

### Epic 1.2: Database Migration to PostgreSQL

**Status:** Prisma schema exists (MySQL), needs PostgreSQL migration

**Tasks:**

- [ ] Update Prisma schema provider to `postgresql`
- [ ] Create migration script for existing MySQL data (if migrating)
- [ ] Update `DATABASE_URL` format for PostgreSQL
- [ ] Run Prisma migrations (`prisma migrate dev`)
- [ ] Update seed scripts for PostgreSQL
- [ ] Test all Prisma queries work with PostgreSQL

**Acceptance:**

- Prisma connects to PostgreSQL successfully
- All existing models work (User, Task, Submission, Wallet, etc.)
- Migrations run cleanly
- Seed data loads correctly

**Files to Create/Modify:**

- `prisma/schema.prisma` (change provider)
- `prisma/migrations/` (auto-generated)
- `prisma/seed.ts` (update for PostgreSQL)
- `.env` (update DATABASE_URL)

---

### Epic 1.3: Task Marketplace & Submission (Next.js API)

**Status:** Frontend exists, API proxies to PHP

**Tasks:**

- [ ] Create `app/api/tasks/route.ts` (GET list with filters)
- [ ] Create `app/api/tasks/[id]/route.ts` (GET single task)
- [ ] Migrate `app/api/member/tasks/submit/route.ts` (remove PHP proxy)
- [ ] Implement S3 file upload utility (`src/lib/s3.ts`)
- [ ] Create task submission with file upload to S3
- [ ] Update `TaskSubmissionDialog` to use new endpoint
- [ ] Add file validation (size, type, compression for images)

**Acceptance:**

- Tasks list loads from Prisma (no PHP dependency)
- Task submission uploads proof to S3, creates DB record
- File validation works (max 10MB, image/video/PDF)
- Admin can view submissions with S3 URLs

**Files to Create/Modify:**

- `app/api/tasks/route.ts` (new)
- `app/api/tasks/[id]/route.ts` (new)
- `app/api/member/tasks/submit/route.ts` (migrate from PHP proxy)
- `src/lib/s3.ts` (new - AWS S3 client)
- `src/components/member/task-submission-dialog.tsx` (update)

---

### Epic 1.4: Admin Submission Queue (Next.js API)

**Status:** Frontend exists, API proxies to PHP

**Tasks:**

- [ ] Create `app/api/admin/tasks/submissions/route.ts` (GET list with pagination)
- [ ] Migrate `app/api/admin/tasks/submissions/update/route.ts` (remove PHP dependency)
- [ ] Implement approval logic: credit wallet, update gamification, create transaction
- [ ] Add rejection flow with notes
- [ ] Update `admin-task-submissions-client.tsx` to use new endpoints

**Acceptance:**

- Admin can list submissions with filters (status, task, user)
- Approve/reject updates submission status
- Approval credits wallet and creates transaction record
- Rejection stores admin notes

**Files to Create/Modify:**

- `app/api/admin/tasks/submissions/route.ts` (new)
- `app/api/admin/tasks/submissions/update/route.ts` (migrate)
- `src/services/admin.ts` (update to use new endpoints)

---

### Epic 1.5: Product Suggestions Feature (New)

**Status:** Not implemented

**Tasks:**

- [ ] Add `ProductSuggestion` model to Prisma schema
- [ ] Create migration
- [ ] Create `app/api/member/products/suggest/route.ts` (POST)
- [ ] Create `app/api/member/products/route.ts` (GET user's products)
- [ ] Create "My Products" UI page (`app/(dashboard)/member/products/page.tsx`)
- [ ] Create product suggestion form component
- [ ] Add "Use in Task" flow (link product to task submission)

**Acceptance:**

- Users can suggest products (name, platform, amount, order ID, files)
- Users can view their product suggestions
- Product suggestions can be linked to task submissions
- Product managers can view all suggestions

**Files to Create:**

- `prisma/schema.prisma` (add ProductSuggestion model)
- `app/api/member/products/suggest/route.ts`
- `app/api/member/products/route.ts`
- `app/(dashboard)/member/products/page.tsx`
- `src/components/member/product-suggestion-form.tsx`
- `src/components/member/my-products-list.tsx`

**Prisma Model:**

```prisma
model ProductSuggestion {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  productName String   @db.VarChar(255)
  platform    String   @db.VarChar(100) // "amazon", "flipkart", etc.
  category    String?  @db.VarChar(100)
  amount      Decimal? @db.Decimal(10, 2)
  orderId     String?  @db.VarChar(255)
  files       Json?    // S3 URLs array
  status      String   @default("pending") @db.VarChar(50) // pending, approved, rejected, converted
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
}
```

---

### Epic 1.6: Product Dashboard (New)

**Status:** Not implemented

**Tasks:**

- [ ] Create `app/api/admin/products/suggestions/route.ts` (GET all suggestions)
- [ ] Create `app/api/admin/products/suggestions/[id]/convert/route.ts` (POST - convert to task/product)
- [ ] Create Product Dashboard page (`app/(dashboard)/admin/products/page.tsx`)
- [ ] Add filters: status, platform, date range
- [ ] Add convert-to-task modal/form
- [ ] Add convert-to-product flow (if product catalog exists)

**Acceptance:**

- Product managers can view all user suggestions
- PMs can filter by status, platform, date
- PMs can convert suggestions to tasks
- Conversion creates task and links suggestion

**Files to Create:**

- `app/api/admin/products/suggestions/route.ts`
- `app/api/admin/products/suggestions/[id]/convert/route.ts`
- `app/(dashboard)/admin/products/page.tsx`
- `src/components/admin/product-suggestions-table.tsx`
- `src/components/admin/convert-suggestion-dialog.tsx`

---

## Phase 2: Wallet & Referrals (Weeks 5-8)

### Epic 2.1: Wallet System (Next.js API)

**Status:** Schema exists, PHP implementation exists

**Tasks:**

- [ ] Create `app/api/member/wallet/route.ts` (GET balance, transactions)
- [ ] Create `app/api/member/wallet/transactions/route.ts` (GET history)
- [ ] Migrate withdrawal request (`app/api/member/withdraw/route.ts`)
- [ ] Implement wallet credit on task approval
- [ ] Add transaction history with pagination
- [ ] Update wallet UI components to use new endpoints

**Acceptance:**

- Users can view wallet balance (total, pending, withdrawable)
- Transaction history shows all credits/debits
- Withdrawal requests create pending withdrawals
- Admin can process withdrawals

**Files to Create/Modify:**

- `app/api/member/wallet/route.ts`
- `app/api/member/wallet/transactions/route.ts`
- `app/api/member/withdraw/route.ts` (migrate)
- `src/components/member/wallet-balance-card.tsx` (update)

---

### Epic 2.2: Multi-Level Referral System

**Status:** Schema supports it, logic missing

**Tasks:**

- [ ] Create referral tree traversal utility (`src/lib/referrals.ts`)
- [ ] Implement L1/L2/L3 commission calculation
- [ ] Create referral event on user registration
- [ ] Update referral approval to credit multi-level
- [ ] Create `app/api/member/referrals/route.ts` (GET user's referrals)
- [ ] Add referral dashboard with tree visualization
- [ ] Add commission breakdown UI

**Acceptance:**

- New user registration creates referral events for L1/L2/L3
- Referral approval credits all levels (configurable percentages)
- Users can see their referral tree
- Commission amounts calculated correctly

**Files to Create:**

- `src/lib/referrals.ts` (referral tree logic)
- `app/api/member/referrals/route.ts`
- `src/components/member/referral-tree.tsx`
- `src/components/member/referral-commissions.tsx`

**Commission Logic:**

- L1: 50% of base commission
- L2: 30% of base commission
- L3: 20% of base commission
- Configurable via env vars

---

### Epic 2.3: Withdrawal Processing & Payouts

**Status:** Basic flow exists, payout integration missing

**Tasks:**

- [ ] Integrate Razorpay Payouts SDK
- [ ] Integrate Cashfree Payouts SDK (fallback)
- [ ] Create `app/api/admin/withdrawals/process/route.ts` (migrate from PHP)
- [ ] Add payout execution logic
- [ ] Add webhook handlers for payout status
- [ ] Add payout receipt storage
- [ ] Update withdrawal status based on payout response

**Acceptance:**

- Admin can process withdrawal → triggers Razorpay/Cashfree payout
- Payout status updates withdrawal record
- Webhooks update status automatically
- Receipts stored in S3

**Files to Create/Modify:**

- `src/lib/payouts.ts` (Razorpay/Cashfree client)
- `app/api/admin/withdrawals/process/route.ts` (migrate + add payout)
- `app/api/webhooks/payouts/route.ts` (new)

---

## Phase 3: Gamification & Social (Weeks 9-12)

### Epic 3.1: Gamification System

**Status:** Schema exists, logic missing

**Tasks:**

- [ ] Create XP calculation service (`src/lib/gamification.ts`)
- [ ] Implement level progression (NEWBIE → PRO → ELITE → MASTER)
- [ ] Add XP rewards on task completion
- [ ] Create badge system (first task, 10 tasks, referral milestones)
- [ ] Update user profile to show rank/badges
- [ ] Add streak tracking (daily login)
- [ ] Create gamification dashboard component

**Acceptance:**

- Users earn XP on task approval
- Levels update based on XP thresholds
- Badges awarded automatically
- Streak resets after 7 days inactive

**Files to Create:**

- `src/lib/gamification.ts`
- `src/components/member/gamification-dashboard.tsx`
- `src/components/member/badges-list.tsx`

**XP Rules:**

- Task approval: 100 XP
- Referral verified: 50 XP
- Daily login: 10 XP
- Level thresholds: NEWBIE (0), PRO (1000), ELITE (5000), MASTER (20000)

---

### Epic 3.2: Redis Leaderboards

**Status:** Redis setup exists, leaderboards missing

**Tasks:**

- [ ] Create leaderboard service (`src/lib/leaderboards.ts`)
- [ ] Implement Redis ZSET for rankings
- [ ] Create daily/weekly/monthly/all-time leaderboards
- [ ] Add leaderboard sync job (Redis → DB)
- [ ] Create leaderboard UI component
- [ ] Add real-time updates (optional SSE)

**Acceptance:**

- Leaderboards show top users by XP/coins/earnings
- Rankings update in real-time
- Multiple time periods supported
- Performance: <100ms query time

**Files to Create:**

- `src/lib/leaderboards.ts`
- `app/api/leaderboards/route.ts`
- `src/components/Leaderboard.tsx` (enhance existing)

---

### Epic 3.3: Spark Wall (Real-Time Feed)

**Status:** Schema exists, implementation missing

**Tasks:**

- [ ] Create SSE endpoint (`app/api/sse/spark/route.ts`)
- [ ] Implement event publishing service (`src/lib/spark-events.ts`)
- [ ] Create SparkEvent model usage
- [ ] Publish events on: task approval, referral verified, level up, withdrawal
- [ ] Create Spark Wall UI component (real-time feed)
- [ ] Add event filtering (public vs authenticated)
- [ ] Add rate limiting for SSE connections

**Acceptance:**

- Events publish on key actions
- Clients receive events via SSE
- Feed shows anonymized/public events
- Performance: <50ms event delivery

**Files to Create:**

- `app/api/sse/spark/route.ts`
- `src/lib/spark-events.ts`
- `src/components/SparkWall.tsx`

---

### Epic 3.4: Top Suggestions Algorithm

**Status:** Not implemented

**Tasks:**

- [ ] Create suggestion scoring algorithm (`src/lib/top-suggestions.ts`)
- [ ] Factors: user engagement, product popularity, conversion rate, recency
- [ ] Create `app/api/products/top-suggestions/route.ts`
- [ ] Add caching (Redis) for top suggestions
- [ ] Create Top Suggestions UI component
- [ ] Add admin override for featured suggestions

**Acceptance:**

- Algorithm ranks suggestions by score
- Top 10 suggestions cached for 1 hour
- UI shows top suggestions on homepage
- Admin can pin suggestions

**Files to Create:**

- `src/lib/top-suggestions.ts`
- `app/api/products/top-suggestions/route.ts`
- `src/components/TopSuggestions.tsx`

---

## Phase 4: Migration & Polish (Weeks 13-16)

### Epic 4.1: Complete PHP → Next.js Migration

**Status:** Partial migration done

**Tasks:**

- [ ] Migrate remaining PHP endpoints:
  - `api/member/dashboard.php` → `app/api/member/dashboard/route.ts`
  - `api/admin/dashboard.php` → `app/api/admin/dashboard/route.ts`
  - `api/admin/referrals.php` → `app/api/admin/referrals/route.ts`
  - `api/admin/ads.php` → `app/api/admin/ads/route.ts`
- [ ] Remove PHP API dependency from frontend
- [ ] Update all service files to use Next.js routes
- [ ] Remove `api/` directory (or archive)
- [ ] Update README with new architecture

**Acceptance:**

- All endpoints migrated to Next.js
- No PHP dependencies in frontend
- All tests pass

---

### Epic 4.2: Feature Flags System

**Status:** Not implemented

**Tasks:**

- [ ] Create feature flag service (`src/lib/feature-flags.ts`)
- [ ] Add Redis-based flag storage
- [ ] Create admin UI for managing flags
- [ ] Implement progressive rollout (10% → 50% → 100%)
- [ ] Add flags for: gamification, multi-level referrals, Spark Wall

**Acceptance:**

- Flags can be toggled without deployment
- Progressive rollout works
- Admin can manage flags via UI

**Files to Create:**

- `src/lib/feature-flags.ts`
- `app/api/admin/feature-flags/route.ts`
- `src/components/admin/feature-flags-manager.tsx`

---

### Epic 4.3: Testing & QA

**Status:** No automated tests

**Tasks:**

- [ ] Add Jest/Vitest setup
- [ ] Write unit tests for core services (referrals, gamification, leaderboards)
- [ ] Add integration tests for API routes
- [ ] Create E2E tests for critical flows (signup, task submission, withdrawal)
- [ ] Add test data seeders
- [ ] Set up CI/CD test runs

**Acceptance:**

- >80% code coverage for core logic
- All critical flows have E2E tests
- Tests run in CI

---

### Epic 4.4: Performance & Scalability

**Status:** Basic setup

**Tasks:**

- [ ] Add database query optimization (indexes, query analysis)
- [ ] Implement Redis caching for hot data (leaderboards, top suggestions)
- [ ] Add CDN for static assets
- [ ] Optimize image uploads (compression, thumbnails)
- [ ] Add monitoring (error tracking, performance metrics)
- [ ] Load testing for critical endpoints

**Acceptance:**

- API response times <200ms (p95)
- Leaderboard queries <100ms
- Image uploads <2s for 5MB files

---

## Database Schema Additions

### ProductSuggestion Model

```prisma
model ProductSuggestion {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  productName String   @db.VarChar(255)
  platform    String   @db.VarChar(100)
  category    String?  @db.VarChar(100)
  amount      Decimal? @db.Decimal(10, 2)
  orderId     String?  @db.VarChar(255)
  files       Json?
  status      String   @default("pending") @db.VarChar(50)
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([platform])
}
```

Add to User model:

```prisma
productSuggestions ProductSuggestion[]
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/earniq"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_TOKEN_SECRET="..."
JWT_REFRESH_TOKEN_SECRET="..."
JWT_ACCESS_TOKEN_TTL_SECONDS=900
JWT_REFRESH_TOKEN_TTL_SECONDS=2592000

# OTP
OTP_PROVIDER="msg91" # or "twilio"
MSG91_API_KEY="..."
MSG91_SENDER_ID="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# S3
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="ap-south-1"
S3_BUCKET="earniq-uploads"

# Payouts
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
CASHFREE_APP_ID="..."
CASHFREE_SECRET_KEY="..."

# Feature Flags
FEATURE_GAMIFICATION=true
FEATURE_MULTI_LEVEL_REFERRALS=true
FEATURE_SPARK_WALL=true
```

---

## API Endpoints Summary

### Auth

- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP & login
- `POST /api/auth/session` - Refresh token
- `POST /api/auth/logout` - Logout

### Tasks

- `GET /api/tasks` - List tasks (filters: category, active)
- `GET /api/tasks/[id]` - Get task details
- `POST /api/member/tasks/submit` - Submit task proof

### Products

- `POST /api/member/products/suggest` - Suggest product
- `GET /api/member/products` - Get user's products
- `GET /api/products/top-suggestions` - Get top suggestions
- `GET /api/admin/products/suggestions` - Admin: list all
- `POST /api/admin/products/suggestions/[id]/convert` - Convert to task

### Wallet

- `GET /api/member/wallet` - Get balance
- `GET /api/member/wallet/transactions` - Transaction history
- `POST /api/member/withdraw` - Request withdrawal

### Referrals

- `GET /api/member/referrals` - Get user's referrals
- `GET /api/admin/referrals` - Admin: list all
- `PUT /api/admin/referrals/[id]` - Approve/reject

### Admin

- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/tasks/submissions` - List submissions
- `PUT /api/admin/tasks/submissions/[id]` - Approve/reject
- `PUT /api/admin/withdrawals/[id]/process` - Process withdrawal

### Leaderboards

- `GET /api/leaderboards?period=daily|weekly|monthly|alltime`

### Spark Wall

- `GET /api/sse/spark` - SSE stream for events

---

## Risk & Rollback Plan

**High-Risk Features:**

1. **Wallet/Withdrawals**: Test in staging with small amounts. Rollback: Disable withdrawal feature flag.
2. **Multi-level Referrals**: Test commission calculations thoroughly. Rollback: Revert to single-level.
3. **Database Migration**: Backup MySQL before migration. Rollback: Restore from backup.

**Rollback Procedures:**

- Feature flags: Disable problematic features instantly
- Database: Keep MySQL backup for 30 days
- API: Keep PHP endpoints running in parallel during migration (feature flag to switch)

---

## First 2-Week Sprint Plan

**Week 1:**

- Complete OTP integration (MSG91/Twilio)
- PostgreSQL migration
- S3 file upload setup
- Task submission migration (Next.js API)

**Week 2:**

- Admin submission queue migration
- Product suggestions model & API
- My Products UI
- Product Dashboard (basic)

**Deliverables:**

- Users can sign up via OTP
- Users can submit tasks with S3 uploads
- Admins can approve/reject submissions
- Users can suggest products
- PMs can view suggestions

**Acceptance Criteria:**

- All Phase 1 Epics 1.1-1.6 complete
- No PHP dependencies for core flows
- Database on PostgreSQL
- Files stored in S3

### To-dos

- [ ] Integrate MSG91 and Twilio SDKs for OTP delivery, complete rate limiting, and test OTP flows
- [ ] Migrate Prisma schema to PostgreSQL, create migrations, update seed scripts, and test all queries
- [ ] Implement S3 file upload utility, integrate into task submission flow, and add file validation
- [ ] Migrate task listing and submission endpoints from PHP to Next.js API routes with Prisma
- [ ] Migrate admin submission queue endpoints, implement approval/rejection logic with wallet crediting
- [ ] Add ProductSuggestion model to Prisma schema, create migration, and build API endpoints
- [ ] Create 'My Products' page, product suggestion form, and 'Use in Task' flow
- [ ] Build Product Dashboard for PMs with suggestion listing, filters, and convert-to-task functionality
- [ ] Migrate wallet endpoints, implement transaction history, and update wallet UI components
- [ ] Implement L1/L2/L3 referral logic, commission calculation, and referral tree visualization
- [ ] Integrate Razorpay/Cashfree payouts, implement withdrawal processing, and add webhook handlers
- [ ] Implement XP calculation, level progression, badge system, and streak tracking
- [ ] Build Redis-based leaderboards with daily/weekly/monthly/all-time rankings and sync jobs
- [ ] Implement SSE endpoint for real-time events, event publishing service, and Spark Wall UI
- [ ] Create scoring algorithm for product suggestions, build API endpoint, and add caching
- [ ] Migrate remaining PHP endpoints to Next.js, remove PHP dependencies, and update documentation
- [ ] Implement feature flag system with Redis storage, admin UI, and progressive rollout
- [ ] Add Jest/Vitest setup, write unit/integration/E2E tests, and achieve >80% coverage
- [ ] Optimize database queries, implement Redis caching, add CDN, and perform load testing