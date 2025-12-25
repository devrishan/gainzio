# Quick Setup Fix for Login Issue

## Immediate Fix

Your `.env` file needs these updates:

### 1. Update Frontend Origin (You're on port 3005)
```env
FRONTEND_ORIGIN=http://localhost:3005
```

### 2. Update API Base URL

**If using XAMPP (Apache):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost/sparkio
API_BASE_URL=http://localhost/sparkio
```

**If using PHP built-in server:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
API_BASE_URL=http://localhost:8080
```

### 3. Set JWT Secret
```env
JWT_SECRET=sparkio-jwt-secret-key-32-characters-long
```

## Complete .env Configuration

Copy this entire content to your `.env` file:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sparkio
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=sparkio-jwt-secret-key-32-characters-long
JWT_TTL=3600

# Frontend
FRONTEND_ORIGIN=http://localhost:3005

# API - Choose ONE option below:

# Option 1: For XAMPP/Apache
NEXT_PUBLIC_API_BASE_URL=http://localhost/sparkio
API_BASE_URL=http://localhost/sparkio

# Option 2: For PHP built-in server (uncomment if using this)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
# API_BASE_URL=http://localhost:8080
```

## Steps to Fix

1. **Edit `.env` file** with the configuration above
2. **Ensure PHP API is running:**
   - **XAMPP:** Start Apache, ensure project is at `http://localhost/sparkio/api/`
   - **PHP Server:** Run `php -S 0.0.0.0:8080 -t api` in the `api` folder
3. **Ensure database is set up:**
   ```sql
   -- Run in MySQL/phpMyAdmin
   CREATE DATABASE IF NOT EXISTS sparkio;
   -- Then import sql/schema.sql and sql/seed.sql
   ```
4. **Restart Next.js dev server** (Ctrl+C and `npm run dev` again)
5. **Test login** with:
   - Email: `admin@sparkio.app`
   - Password: `Admin@123`

## Verify API is Working

Test the API endpoint in your browser:
- XAMPP: `http://localhost/sparkio/api/auth/login.php` (should show JSON error, not 404)
- PHP Server: `http://localhost:8080/auth/login.php` (should show JSON error, not 404)

If you get 404, the API path is wrong. Check your server configuration.

