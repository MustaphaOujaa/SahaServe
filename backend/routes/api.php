<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

#PUBLIC ROUTES -------------------------------------------------
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

//google auth routes 
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

#PROTECTED ROUTES --> USER ONLY ----------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::delete('/deleteAccount', [AuthController::class, 'deleteAccount']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/updateProfile', [AuthController::class, 'updateProfile']);
});