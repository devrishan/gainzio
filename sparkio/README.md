## Sparkio Referral Platform

Sparkio is a two-sided referral and payout platform with dedicated experiences for members and administrators. The stack combines a stateless PHP REST API, a MySQL backend, and a modern Next.js (TypeScript) frontend styled with Tailwind and shadcn/ui components.

### Features
- **Members**
  - JWT authenticated dashboard with wallet metrics, referral analytics, and leaderboards.
  - Full referral history with filtering and withdrawal requests to UPI accounts.
- **Administrators**
  - Global KPI dashboard covering users, payouts, and earnings.
  - Referral review workflow with status updates and automatic wallet crediting.
  - Withdrawal processing queue and ads inventory management.
- **Security**
  - JWT-based stateless auth, HttpOnly cookies, and Next.js middleware for route protection.
  - Simple rate-limiting middleware guarding auth endpoints.
  - Environment-driven CORS, secrets, and database configuration.

### Tech Stack
- **Frontend:** Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui, React Query.
- **Backend:** PHP 8 (PDO, JWT utilities), modular REST endpoints.
- **Database:** MySQL with InnoDB, utf8mb4 collation, referential integrity.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- PHP ≥ 8.1 with PDO extensions
- MySQL ≥ 8.0

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy the provided template and adjust for your environment:
```bash
cp env.example .env
```

Populate `.env` with values that match the way you are hosting the PHP API. For a default XAMPP setup (Apache serving the `sparkio` folder), use:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sparkio
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=replace-with-32-char-secret

FRONTEND_ORIGIN=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost/sparkio
API_BASE_URL=http://localhost/sparkio
```

If you prefer PHP’s built-in server instead of Apache, set the API URLs to `http://localhost:8080` (or whichever host/port you bind to).

Key variables to double-check:
- `DB_*` — MySQL connection details for the PHP API.
- `JWT_SECRET` — 32+ character secret for signing tokens.
- `FRONTEND_ORIGIN` — Allowed origin for CORS (e.g., `http://localhost:3000`).
- `NEXT_PUBLIC_API_BASE_URL`, `API_BASE_URL` — URL where the PHP API is served (defaults to `http://localhost:8080` or your Apache alias).

> The `.env` file is shared by both the PHP API and the Next.js frontend.

### 3. Prepare the database
Create the database and tables:
```bash
mysql -u <user> -p -e "CREATE DATABASE sparkio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u <user> -p sparkio < sql/schema.sql
mysql -u <user> -p sparkio < sql/seed.sql
```

The seed creates an initial admin user:
- **Email:** `admin@sparkio.app`
- **Password:** `Admin@123`

### 4. Run the PHP API
Serve the API directory with Apache/XAMPP (preferred for Windows) or PHP's built-in server.

- **XAMPP/Apache:** ensure the document root has the project under `/sparkio` so that `http://localhost/sparkio/api/...` resolves.
- **Built-in server (alternative):**
  ```bash
  php -S 0.0.0.0:8080 -t api
  ```

Ensure the host/port you choose matches the values in `.env` (`API_BASE_URL` & `NEXT_PUBLIC_API_BASE_URL`).
### 5. Run the Next.js frontend
```bash
npm run dev
```

Visit `http://localhost:3000` to access the app.

---

## Project Structure
```
api/                 # PHP REST endpoints, middleware, and utilities
app/                 # Next.js App Router pages (auth, member, admin)
src/components/      # Shared React components & providers
src/services/        # Server-side data fetchers
sql/                 # Database schema and seed scripts
middleware.ts        # Next.js route protection
env.example          # Environment variable template
```

### Maintenance mode
- Visit `/admin/maintenance` to disable logins, set a custom notice, and pick how many minutes until access is restored automatically.
- While maintenance is active, `/login` shows the configured message (including the automatic resume time) and `/api/auth/login` returns `503 Service Unavailable`, so no new sessions can be created.

---

## Testing & Linting
- **Linting:** `npm run lint`
- **Type checking:** handled automatically by Next.js during build.

_Automated tests are not yet implemented; perform manual QA on key flows (auth, referrals, withdrawals) after changes._

---

## Deployment Notes
- Use HTTPS in production to protect JWT cookies (`NODE_ENV=production` enforces `secure` cookies).
- Store secrets (database credentials, JWT secret) in a vault or environment manager.
- Run the PHP API behind a hardened web server (nginx/Apache) and place it on the same private network as MySQL.
- Consider queueing (e.g., RabbitMQ) for withdrawal processing if payouts become long-running.
- Enable full-featured rate limiting (Redis, Cloudflare Turnstile, etc.) before going live.

---

## API Overview
Key endpoints (all JSON):

| Method | Endpoint                             | Description                          |
|--------|--------------------------------------|--------------------------------------|
| POST   | `/api/auth/register.php`             | Register member (optional referral)  |
| POST   | `/api/auth/login.php`                | Login and receive JWT                |
| GET    | `/api/auth/me.php`                   | Fetch current user profile           |
| GET    | `/api/member/dashboard.php`          | Member analytics & wallet            |
| POST   | `/api/member/withdraw.php`           | Submit withdrawal request            |
| GET    | `/api/admin/dashboard.php`           | Admin metrics overview               |
| PUT    | `/api/admin/referrals/update.php`    | Approve / reject referral            |
| PUT    | `/api/admin/withdrawals/process.php` | Process withdrawal                   |
| GET    | `/api/public/ads.php`                | Public ad placements (filters)       |

All protected routes require the `Authorization: Bearer <token>` header.

---

## Troubleshooting
- **401/redirect loops:** Ensure the PHP API is running and `API_BASE_URL` matches the served address.
- **CORS errors:** Confirm `FRONTEND_ORIGIN` aligns with the frontend URL.
- **Rate limit (429):** Auth endpoints allow 10 login attempts/minute and 5 registrations per 5 minutes by IP.
- **Empty dashboards:** Verify the database has referral data; seed or create users to populate stats.

---

Sparkio is designed for extendability—feel free to adapt the data model, swap UPI handling for alternative payment rails, or layer additional analytics as needed.

