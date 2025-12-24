@echo off
echo Testing Sparkio API Connection...
echo.

echo Testing XAMPP/Apache endpoint (http://localhost/sparkio/api/auth/login.php)...
curl -X POST http://localhost/sparkio/api/auth/login.php -H "Content-Type: application/json" -d "{}" 2>nul
if %errorlevel% equ 0 (
    echo [OK] XAMPP/Apache endpoint is accessible
) else (
    echo [FAIL] XAMPP/Apache endpoint not accessible
)
echo.

echo Testing PHP built-in server endpoint (http://localhost:8080/auth/login.php)...
curl -X POST http://localhost:8080/auth/login.php -H "Content-Type: application/json" -d "{}" 2>nul
if %errorlevel% equ 0 (
    echo [OK] PHP built-in server endpoint is accessible
) else (
    echo [FAIL] PHP built-in server endpoint not accessible
)
echo.

echo.
echo Note: Both endpoints should return a JSON error (not 404)
echo If both fail, the API server is not running.
echo.
pause

