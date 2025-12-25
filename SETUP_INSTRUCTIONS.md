# Sparkio Setup Instructions

## Quick Setup Guide

### Step 1: Create .env File

Create a `.env` file in the project root (`E:\sparkio\sparkio\.env`) with the following content:

```env
# Database Configuration (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sparkio
DB_USERNAME=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=sparkio-jwt-secret-key-32-characters-long
JWT_TTL=3600

# Frontend Configuration
FRONTEND_ORIGIN=http://localhost:3005

# API Configuration
# Option 1: For XAMPP/Apache (if project is in htdocs/sparkio)
NEXT_PUBLIC_API_BASE_URL=http://localhost/sparkio/api
API_BASE_URL=http://localhost/sparkio/api

# Option 2: For PHP built-in server (uncomment if using this)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
# API_BASE_URL=http://localhost:8080
```

### Step 2: Setup Database

1. Open MySQL (via XAMPP or standalone)
2. Create the database and import schema:

```sql
CREATE DATABASE IF NOT EXISTS sparkio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Import the schema:
```bash
mysql -u root -p sparkio < sql/schema.sql
```

4. Seed the admin user:
```bash
mysql -u root -p sparkio < sql/seed.sql
```

**Or use phpMyAdmin:**
- Go to http://localhost/phpmyadmin
- Create database `sparkio`
- Import `sql/schema.sql`
- Import `sql/seed.sql`

### Step 3: Start PHP API

**Option A: Using XAMPP (Recommended for Windows)**
1. Start Apache in XAMPP Control Panel
2. Ensure your project is accessible at `http://localhost/sparkio/api/`
3. Test: Visit `http://localhost/sparkio/api/auth/login.php` (should show method not allowed, which is correct)

**Option B: Using PHP Built-in Server**
```bash
cd api
php -S 0.0.0.0:8080
```
Then update `.env` to use `http://localhost:8080` for API URLs.

### Step 4: Start Next.js Frontend

```bash
npm run dev
```

The app will run on `
http://localhost:3000` (or the port shown in terminal).

### Step 5: Login

Use these credentials:
- **Email:** `admin@sparkio.app`
- **Password:** `Admin@123`

## Troubleshooting

### "Unable to login" Error

1. **Check PHP API is running:**
   - Visit `http://localhost/sparkio/api/auth/login.php` in browser
   - Should see JSON error (not 404)

2. **Verify .env file exists and has correct API_BASE_URL**

3. **Check database connection:**
   - Verify MySQL is running
   - Check database `sparkio` exists
   - Verify admin user exists: `SELECT * FROM users WHERE email = 'admin@sparkio.app';`

4. **Check browser console for CORS errors**

5. **Verify JWT_SECRET is set in .env**

### Database Connection Issues

- Ensure MySQL is running
- Check `DB_USERNAME` and `DB_PASSWORD` in `.env`
- Verify database `sparkio` exists

### CORS Errors

- Ensure `FRONTEND_ORIGIN` in `.env` matches your frontend URL (e.g., `http://localhost:3005`)
- Restart both PHP API and Next.js after changing `.env`

## Default Admin Credentials

- **Email:** `admin@sparkio.app`
- **Password:** `Admin@123`
- **Role:** `admin`

