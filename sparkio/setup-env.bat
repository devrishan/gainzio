@echo off
echo Setting up .env file for Sparkio...
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env from env.example...
    copy env.example .env
)

echo.
echo Current .env configuration:
echo.
type .env
echo.
echo.
echo Please update the following in your .env file:
echo.
echo 1. FRONTEND_ORIGIN=http://localhost:3005
echo 2. API_BASE_URL - Choose one:
echo    - For XAMPP: http://localhost/sparkio
echo    - For PHP built-in server: http://localhost:8080
echo 3. JWT_SECRET - Set to a 32+ character secret
echo.
echo Press any key to open .env in notepad...
pause >nul
notepad .env

