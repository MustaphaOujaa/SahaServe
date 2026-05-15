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

//tags
Route::get('/tags', [TagController::class, 'index']);


#PROTECTED ROUTES --> USER ONLY ----------------------------------

Route::middleware('auth:sanctum')->group(function () {
    //user actions
    Route::delete('/deleteAccount', [AuthController::class, 'deleteAccount']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/updateProfile', [AuthController::class, 'updateProfile']);
    Route::get('/profile', [AuthController::class, 'profile']);

    //tables
    Route::get('/tables', [TableController::class, 'index']);
});

## PROTECTED ROUTES -->
Route::middleware('auth:sanctum')->group(function () {

    # -- PERMISSION---------------------------------------------
    //----TAGS----
    Route::middleware('permission:manage-tags')->group(function () {
        Route::post('/add-tag', [TagController::class, 'store']);
        Route::patch('/update-tag/{id}', [TagController::class, 'update']);
        Route::delete('/delete-tag/{id}', [TagController::class, 'destroy']);
    });

    //----USERS HANDLING----
    Route::get('/all-users', [AuthController::class, 'getAllUsers']);

    //----RESERVATIONS----
    Route::middleware('permission:make-reservation')->group(function () {
        Route::get('/user-reservations', [ReservationController::class, 'getUserReservations']);
        Route::post('/reservations', [ReservationController::class, 'store']);
    });
    Route::middleware('permission:manage-reservation')->group(function () {
        Route::get('/all-reservations', [ReservationController::class, 'getAllReservations']);
        // Route::get('/reservations/{id}', [ReservationController::class, 'show']);
        Route::patch('/reservations/{id}', [ReservationController::class, 'update']);
        Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    });

    //----TABLES----
    Route::middleware('permission:manage-tables')->group(function () {
        Route::post('/tables', [TableController::class, 'store']);
        // Route::get('/tables/{id}', [TableController::class, 'show']);
        Route::patch('/tables/{id}', [TableController::class, 'update']);
        Route::delete('/tables/{id}', [TableController::class, 'destroy']);
        // Route::patch('/tables/{id}/availability', [TableController::class, 'changeAvailablity']);
    });


});
