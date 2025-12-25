@echo off
echo Starting Sparkio PHP API server on port 8080...
echo.
echo Make sure PHP is installed and in your PATH.
echo If you get an error, add PHP to your system PATH or use the full path to php.exe
echo.
cd api
php -S 0.0.0.0:8080 router.php
cd ..
pause

