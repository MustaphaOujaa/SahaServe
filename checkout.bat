@echo off
SETLOCAL

cd backend

:: 1. Install Dependencies
echo Status: Running Composer Install...
call composer install
if %ERRORLEVEL% NEQ 0 goto :error

:: 2. Run Migrations
echo Status: Running Database Migrations...
call php artisan migrate
if %ERRORLEVEL% NEQ 0 goto :error

:: 3. Run Bash Script
:: This assumes Git Bash or a similar tool is in your PATH
echo Status: Running Post-Checkout Script...
bash scripts/post-checkout.sh
if %ERRORLEVEL% NEQ 0 goto :error

echo.
echo Success: All tasks completed!
pause
exit /b 0

:error
echo.
echo Error: A command failed. Check the output above.
pause
exit /b 1