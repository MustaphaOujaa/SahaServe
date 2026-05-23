@echo off
echo Stopping all SahaServe services...

echo Stopping Frontend (Node.js)...
taskkill /F /IM node.exe /T >nul 2>&1

echo Stopping Backend (PHP)...
taskkill /F /IM php.exe /T >nul 2>&1

echo Stopping AI Services (Python/Uvicorn)...
taskkill /F /IM python.exe /T >nul 2>&1

echo All services stopped successfully!
pause
