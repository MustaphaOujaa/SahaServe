@echo off
echo Starting SahaServe services...

:: Frontend
cd frontend
start cmd /k npm run dev
cd ..

:: Backend
cd backend
start cmd /k php artisan serve
cd ..

:: Ai services
:: -----------

echo services runing!
pause