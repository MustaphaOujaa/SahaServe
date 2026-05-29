@echo off
echo Starting SahaServe services...

:: Frontend
cd frontend
start cmd /k npm run dev
cd ..

:: Backend
cd backend
start cmd /k php artisan serve
start cmd /k php artisan reverb:start --host=0.0.0.0 --port=8080
cd ..

:: Ai services
:: -----------

:: Review Analysis Service
cd ai-services\review-analysis\api
start cmd /k uvicorn app:app --reload --port 5000
cd ..\..\..

:: Smart Order Assistance Service
cd ai-services\smart-order-assistance\api
start cmd /k uvicorn app:app --reload --port 5005
cd ..\..\..

echo services runing!
pause
