# How to Find the Actual Error

## The Issue
Getting 500 Internal Server Error, but need to see the actual error message.

## Steps to Debug

1. **Look at the Next.js Terminal**
   - Find the terminal window running `npm run dev`
   - Look for error messages in red
   - The error will show:
     - The file causing the error
     - The line number
     - The exact error message

2. **Common Error Patterns to Look For:**
   ```
   Error: [something]
   at [file path]:[line number]
   ```

3. **Check for:**
   - Missing environment variables
   - Import errors
   - Syntax errors
   - Network connection errors
   - Database connection errors

## Quick Test

Try accessing these URLs directly:
- `http://localhost:3007/login` - Should work (client component)
- `http://localhost:3007/register` - Should work (client component)  
- `http://localhost:3007/` - Currently failing (home page)

If login/register work but home page doesn't, the issue is specific to the home page or its components.

## Share the Error

Once you see the error in the terminal, share:
1. The error message
2. The file name
3. The line number

This will help identify the exact issue.

