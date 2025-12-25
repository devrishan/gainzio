@echo off
echo ========================================
echo Restarting Next.js Dev Server
echo ========================================
echo.
echo Step 1: Stopping any running Next.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Step 2: Clearing Next.js cache...
if exist .next (
    echo Deleting .next directory...
    rmdir /s /q .next
    echo Cache cleared!
) else (
    echo No .next directory found.
)
echo.
echo Step 3: Starting Next.js dev server...
echo.
call npm run 