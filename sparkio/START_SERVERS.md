# How to Start the Servers

## Issue: PHP is not in your system PATH

Since PHP is not accessible from the command line, you have two options:

## Option 1: Use XAMPP (Recommended for Windows)

1. **Start XAMPP Control Panel**
2. **Start Apache** (this will serve your PHP API)
3. **Start MySQL** (for the database)
4. **Copy your project to XAMPP htdocs:**
   - Your project should be at: `E:\xampp\htdocs\sparkio\`
   - Or create a symlink/virtual host

5. **Update your `.env` file:**
   ```env
   API_BASE_URL=http://localhost/sparkio/api
   NEXT_PUBLIC_API_BASE_URL=http://localhost/sparkio/api
   ```

6. **Access the API at:** `http://localhost/sparkio/api/auth/login.php`

## Option 2: Add PHP to System PATH

1. **Find PHP executable:**
   - Usually at: `C:\xampp\php\php.exe`
   - Or wherever XAMPP is installed

2. **Add to PATH:**
   - Open System Properties → Environment Variables
   - Add PHP directory to PATH
   - Restart terminal

3. **Then run:**
   ```bash
   start-api.bat
   ```

## Option 3: Use Full Path in start-api.bat

Edit `start-api.bat` and replace `php` with the full path:
```batch
C:\xampp\php\php.exe -S 0.0.0.0:8080 router.php
```

## Current Status

- ✅ Next.js server: Running on port 3007
- ❌ PHP API server: Not running (PHP not in PATH)

## Quick Fix for Now

The app should still work for the login page even without the PHP API running, but login functionality won't work until the API is accessible.

**To test the login page UI:**
- Go to: `http://localhost:3007/login`
- The page should load (even if login doesn't work yet)

