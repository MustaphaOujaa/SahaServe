<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\AI\FeedbackController;
use App\Http\Controllers\AI\DishAssistantController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ReviewController;

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

//dish assistant filtering
Route::get('/ai/dishes/filter', [DishAssistantController::class, 'filter']);
Route::post('/ai/assistant/chat', [DishAssistantController::class, 'chat']);
//categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

//dishes
Route::get('/dishes', [DishController::class, 'index']);
Route::get('/dishes/{id}', [DishController::class, 'show']);
Route::get('/dishes/{id}/reviews', [ReviewController::class, 'dishReviews']);


#PROTECTED ROUTES --> USER ONLY ----------------------------------

Route::middleware('auth:sanctum')->group(function () {
    //user actions
    Route::delete('/deleteAccount', [AuthController::class, 'deleteAccount']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::patch('/updateProfile', [AuthController::class, 'updateProfile']);
    Route::get('/profile', [AuthController::class, 'profile']);

    //tables
    Route::get('/tables', [TableController::class, 'index']);

    //favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{dishId}', [FavoriteController::class, 'destroy']);

    //cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::patch('/cart/items/{id}', [CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    //orders
        Route::get('/delivery/current', [DeliveryController::class, 'current']);
        Route::get('/delivery/history', [DeliveryController::class, 'history']);

    //reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
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
    Route::middleware('permission:manage-users')->group(function () {
        Route::get('/all-users', [AuthController::class, 'getAllUsers']);
        Route::post('/users', [AuthController::class, 'createUser']);
        Route::patch('/users/{id}/role', [AuthController::class, 'updateUserRole']);
        Route::delete('/users/{id}', [AuthController::class, 'deleteUser']);
    });

    //----ROLES AND PERMISSIONS----
    Route::middleware('permission:manage-roles')->group(function () {
        Route::get('/roles-permissions', [AuthController::class, 'rolesAndPermissions']);
    });

    //----CATEGORIES----
    Route::middleware('permission:manage-categories')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::patch('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
    });

    //----DISHES----
    Route::middleware('permission:manage-dishes|manage-dishs')->group(function () {
        Route::post('/dishes', [DishController::class, 'store']);
        Route::patch('/dishes/{id}', [DishController::class, 'update']);
        Route::delete('/dishes/{id}', [DishController::class, 'destroy']);
    });

    //----ORDERS----
    Route::middleware('permission:manage-orders')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    });

    Route::middleware('permission:mark-ready')->group(function () {
        Route::patch('/orders/{id}/ready', [OrderController::class, 'markReady']);
    });

    // Route::middleware('permission:take-delivery')->group(function () {
    //     Route::patch('/orders/{id}/take-delivery', [OrderController::class, 'takeDelivery']);
    // });
    // Route::middleware('permission:mark-delivered')->group(function () {
    //     Route::patch('/orders/{id}/delivered', [OrderController::class, 'markDelivered']);
    // });

    //----REVIEWS----
    Route::middleware('permission:manage-reviews')->group(function () {
        Route::get('/reviews', [ReviewController::class, 'index']);
    });

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

// ADMIN ONLY-----------------------------------------------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:admin')->group(function () {

        //----FEEDBACKS (AI Analysis)------------------------------------
        Route::get('/feedbacks', [FeedbackController::class, 'index']);
        Route::get('/feedbacks/{id}', [FeedbackController::class, 'show']);
    });
});
