# SahaServe

SahaServe is a restaurant management and ordering application. It includes a customer frontend, a Laravel API backend, and two small AI services for menu assistance and review analysis.

## Main Features

- User registration, login, OTP, Google auth, and profile management
- Menu browsing by categories, dishes, and tags
- Favorites, cart, orders, and reservations
- Admin dashboard for users, roles, dishes, categories, tags, tables, orders, reservations, and reviews
- AI dish assistant for menu recommendations and cart actions
- AI review analysis for customer feedback insights

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router, Tailwind CSS, RTQ Query
- Backend: Laravel, Sanctum, Spatie Permissions, Laravel Reverb
- AI Services: Python, FastAPI, Groq, OpenRouter
- Database: configured through Laravel `.env`

## Project Structure

```text
frontend/      React client app
backend/       Laravel API app
ai-services/   FastAPI AI services
```

## Requirements

- PHP 8.3+
- Composer
- Node.js and npm
- Python 3
- Database server supported by Laravel

## Setup

For first-time setup on Windows, run:

```bat
runFirstTime.bat
```

This installs frontend, backend, and AI service dependencies, runs Laravel migrations, generates the app key, and starts all services.

Manual setup:

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate

cd ../frontend
npm install

cd ../ai-services/review-analysis/api
pip install fastapi uvicorn python-dotenv groq textblob

cd ../../smart-order-assistance/api
pip install fastapi uvicorn python-dotenv groq
```

## Run

After setup, start all services with:

```bat
run.bat
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Review analysis service: `http://localhost:5000/review`
- Smart order assistant service: `http://localhost:5005/assistant`

## Environment

Important environment values:

- Backend: configure `backend/.env` for database, mail, Sanctum, and Google auth 
- Frontend: `VITE_API_URL`, optional `VITE_REVIEW_ANALYSIS_URL`
- Smart order assistant: `GROQ_API_KEY`, optional `LARAVEL_API_URL`
- Review analysis: `OPENROUTER_API_KEY`

