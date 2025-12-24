# Troubleshooting Login Issues

## Current Issue: "Unable to login" Error

### Problem
The login form shows "Unable to login" error when trying to authenticate.

### Common Causes & Solutions

#### 1. PHP API Server Not Running ✅ (Most Likely)
**Symptom:** Login fails with "Unable to login" or network errors

**Solution:**
```bash
# Option A: Using the batch file
start-api.bat

# Option B: Manual command
cd api
php -S 0.0.0.0:8080 router.php
```

**Verify it's running:**
- Open browser: `http://localhost:8080/api/auth/login.php`
- Should see JSON error (not 404 or connection refused)

#### 2. Wrong API URL Configuration
**Check your `.env` file:**
```env
API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

**For XAMPP users:**
```env
API_BASE_URL=http://localhost/sparkio
NEXT_PUBLIC_API_BASE_URL=http://localhost/sparkio
```

#### 3. Database Not Set Up
**Verify database exists:**
```sql
-- In MySQL/phpMyAdmin
USE sparkio;
SELECT * FROM users WHERE email = 'admin@sparkio.app';
```

**If no admin user exists, run:**
```bash
mysql -u root -p sparkio < sql/seed.sql
```

#### 4. Database Connection Issues
**Check `.env` database settings:**
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sparkio
DB_USERNAME=root
DB_PASSWORD=
```

**Verify MySQL is running:**
- XAMPP: Check MySQL is started in Control Panel
- Standalone: Check MySQL service is running

#### 5. CORS Issues
**Check `.env`:**
```env
FRONTEND_ORIGIN=http://localhost:3003
```
(Should match your Next.js port)

#### 6. JWT Secret Issues
**Verify `.env` has:**
```env
JWT_SECRET=sparkio-jwt-secret-key-32-characters-long
JWT_ACCESS_TOKEN_SECRET=sparkio-jwt-secret-key-32-characters-long
JWT_REFRESH_TOKEN_SECRET=sparkio-jwt-secret-key-32-characters-long
```

## Quick Diagnostic Steps

1. **Check PHP API is accessible:**
   ```
   http://localhost:8080/api/auth/login.php
   ```
   Should return JSON (not 404)

2. **Check browser console (F12):**
   - Look for network errors
   - Check if API calls are being made
   - Look for CORS errors

3. **Check Next.js terminal:**
   - Look for error messages
   - Check if API calls are failing

4. **Test API directly:**
   ```bash
   # In PowerShell
   Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login.php" -Method POST -ContentType "application/json" -Body '{"email":"admin@sparkio.app","password":"Admin@123"}'
   ```

## Default Admin Credentials

- **Email:** `admin@sparkio.app`
- **Password:** `Admin@123`

## Still Having Issues?

1. Restart both servers:
   - Stop Next.js (Ctrl+C)
   - Stop PHP server (Ctrl+C)
   - Start PHP server first: `start-api.bat`
   - Start Next.js: `npm run dev`

2. Clear browser cache and cookies

3. Check firewall isn't blocking ports 3003 and 8080

