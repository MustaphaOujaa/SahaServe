@echo off
echo SahaServe files building...

:: Frontend
cd frontend
start cmd /k "npm install && npm run dev"
cd ..

:: Backend
cd backend
start cmd /k "composer install && php artisan key:generate && php artisan migrate && php artisan db:seed && php artisan serve"
start cmd /k "timeout /t 20 && php artisan reverb:start --host=0.0.0.0 --port=8080"
cd ..

:: Ai services
cd ai-services\review-analysis\api
start cmd /k "pip install fastapi uvicorn python-dotenv groq textblob && uvicorn app:app --reload --port 5000"
cd ..\..\..

cd ai-services\smart-order-assistance\api
start cmd /k "pip install fastapi uvicorn python-dotenv groq && uvicorn app:app --reload --port 5005"
cd ..\..\..

echo services ready!
pause
