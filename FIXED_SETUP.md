# ✅ Setup Fixed!

## What I Fixed

1. **Updated `.env` file:**
   - ✅ `FRONTEND_ORIGIN` → `http://localhost:3005` (matches your port)
   - ✅ `JWT_SECRET` → Set to a proper 32-character secret

2. **Created PHP Router:**
   - ✅ Added `api/router.php` to handle `/api/*` paths correctly
   - ✅ Updated `start-api.bat` to use the router

## Next Steps

### 1. Start PHP API Server

**Option A: Using the batch file (Recommended)**
```bash
start-api.bat
```

**Option B: Manual command**
```bash
cd api
php -S 0.0.0.0:8080 router.php
```

The server should start on `http://localhost:8080`

### 2. Verify Database Setup

Make sure you have:
- ✅ Database `sparkio` created
- ✅ Schema imported (`sql/schema.sql`)
- ✅ Seed data imported (`sql/seed.sql`)

**Quick check in MySQL:**
```sql
USE sparkio;
SELECT email, role FROM users WHERE email = 'admin@sparkio.app';
```

Should return:
```
email              | role
admin@sparkio.app  | admin
```

### 3. Restart Next.js Dev Server

After updating `.env`, you MUST restart your Next.js server:
1. Stop the current server (Ctrl+C)
2. Run `npm run dev` again

### 4. Test Login

Go to `http://localhost:3005/login` and use:
- **Email:** `admin@sparkio.app`
- **Password:** `Admin@123`

## Troubleshooting

### Still getting "Unable to login"?

1. **Check PHP API is running:**
   - Open browser: `http://localhost:8080/api/auth/login.php`
   - Should see JSON error (not 404)

2. **Check browser console (F12):**
   - Look for network errors
   - Check if API calls are being made

3. **Verify .env was updated:**
   ```bash
   type .env
   ```
   Should show `FRONTEND_ORIGIN=http://localhost:3005`

4. **Test API directly:**
   ```bash
   # In PowerShell
   Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login.php" -Method POST -ContentType "application/json" -Body '{"email":"admin@sparkio.app","password":"Admin@123"}'
   ```

### Database Connection Issues?

Check your `.env` database settings:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sparkio
DB_USERNAME=root
DB_PASSWORD=
```

Make sure MySQL is running and the database exists.

## Current Configuration

Your `.env` should now have:
```env
FRONTEND_ORIGIN=http://localhost:3005
API_BASE_URL=http://localhost:8080
JWT_SECRET=sparkio-jwt-secret-key-32-characters-long
```

If using XAMPP instead, change:
```env
API_BASE_URL=http://localhost/sparkio
```

