<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TableController;

## PUBLIC ROUTES -------------------------------------------------

//regular auth
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgotPassword', [AuthController::class, 'forgotPassword']);
Route::post('/resetPassword', [AuthController::class, 'resetPassword']);

//google auth routes 
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

#PROTECTED ROUTES --> USER ONLY ----------------------------------

Route::middleware('auth:sanctum')->group(function () {

    //user actions
    Route::delete('/deleteAccount', [AuthController::class, 'deleteAccount']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/updateProfile', [AuthController::class, 'updateProfile']);
    Route::get('/profile', [AuthController::class, 'profile']);

});

## PROTECTED ROUTES -->
Route::middleware('auth:sanctum')->group(function () {

    # -- PERMISSION---------------------------------------------
    //----TAGS----
    Route::get('/tags', [TagController::class, 'index'])->middleware('permission:view-tag');
    Route::get('/add-tag', [TagController::class, 'store'])->middleware('permission:create-tag');
    Route::get('/update-tag/{id}', [TagController::class, 'update'])->middleware('permission:update-tag');
    Route::get('/delete-tag/{id}', [TagController::class, 'destroy'])->middleware('permission:delete-tag');

    //----USERS HANDLING----
    Route::get('/all-users', [AuthController::class, 'getAllUsers']);

    //----RESERVATIONS----
    Route::get('/user-reservations', [ReservationController::class, 'getUserReservations']);
    Route::get('/all-reservations', [ReservationController::class, 'getAllReservations']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::patch('/reservations/{id}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);

    //----TABLES----
    Route::get('/tables', [TableController::class, 'index']);
    Route::post('/tables', [TableController::class, 'store']);
    Route::get('/tables/{id}', [TableController::class, 'show']);
    Route::patch('/tables/{id}', [TableController::class, 'update']);
    Route::delete('/tables/{id}', [TableController::class, 'destroy']);
    Route::patch('/tables/{id}/availability', [TableController::class, 'changeAvailablity']);

});
