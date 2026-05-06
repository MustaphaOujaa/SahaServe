@echo off
echo SahaServe files building...

:: Frontend
cd frontend
start cmd /k "npm install && npm run dev"
cd ..

:: Backend
cd backend
start cmd /k " composer install && php artisan migrate && php artisan key:generate && php artisan serve"
cd ..

echo services ready!
pause