# Debugging Internal Server Error

## Current Issue
Getting 500 Internal Server Error on `http://localhost:3007/`

## Possible Causes

1. **Session API Route Issue**
   - The session route tries to connect to PHP API
   - Even with error handling, there might be an edge case

2. **Server-Side Rendering Issue**
   - Some component might be trying to access browser APIs during SSR
   - Check for `window`, `document`, or `localStorage` usage in components

3. **Environment Variable Issue**
   - Missing or incorrect env variables
   - Check `.env` file

4. **Build Cache Issue**
   - Corrupted `.next` directory
   - Try deleting and rebuilding

## Quick Fixes to Try

### 1. Check Terminal Output
Look at the Next.js terminal for the actual error message. It will show:
- The file causing the error
- The line number
- The exact error message

### 2. Clear Build Cache
```bash
Remove-Item -Recurse -Force .next
npm run dev
```

### 3. Check Environment Variables
```bash
type .env
```
Verify all required variables are set.

### 4. Temporarily Disable SessionProvider
Comment out SessionProvider in `app/layout.tsx` to see if that's the issue:
```tsx
<QueryProvider>
  {/* <SessionProvider> */}
    {children}
  {/* </SessionProvider> */}
</QueryProvider>
```

### 5. Check PHP API is Accessible
```bash
curl http://localhost:8080/api/auth/login.php
```
Should return JSON (not connection error).

## Next Steps
1. Check the Next.js terminal for the exact error
2. Share the error message for further debugging
3. Try the quick fixes above

