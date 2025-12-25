# Fixed 500 Internal Server Error

## Problem
The login page was showing a 500 Internal Server Error because:
1. The JWT library was expecting `JWT_ACCESS_TOKEN_SECRET` and `JWT_REFRESH_TOKEN_SECRET`
2. Your `.env` file only had `JWT_SECRET`
3. When the middleware tried to verify tokens, it failed because the secrets were undefined

## Solution Applied
✅ Updated `src/lib/jwt.ts` to fall back to `JWT_SECRET` if the new format isn't available

## Next Steps

### 1. Update Your `.env` File

Add these lines to your `.env` file (or use the existing `JWT_SECRET`):

```env
# JWT Secrets (use the same value for all if using legacy setup)
JWT_SECRET=sparkio-jwt-secret-key-32-characters-long
JWT_ACCESS_TOKEN_SECRET=sparkio-jwt-secret-key-32-characters-long
JWT_REFRESH_TOKEN_SECRET=sparkio-jwt-secret-key-32-characters-long
```

### 2. Restart Next.js Server

**IMPORTANT:** After any `.env` changes, you MUST restart your Next.js dev server:
1. Stop the server (Ctrl+C)
2. Run `npm run dev` again

### 3. Verify the Fix

1. The login page should now load without 500 errors
2. Try logging in with:
   - Email: `admin@sparkio.app`
   - Password: `Admin@123`

## Current Status

✅ JWT library now supports both new and legacy secret formats
✅ Middleware error handling improved
⚠️ Make sure to restart Next.js after `.env` changes

## If Still Getting Errors

1. **Check Next.js terminal** for specific error messages
2. **Check browser console** (F12) for client-side errors
3. **Verify PHP API is running** on port 8080
4. **Check database connection** - ensure MySQL is running and `sparkio` database exists

