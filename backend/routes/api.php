<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

//------- google auth routes ----------
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });
//----------------------