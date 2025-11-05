<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportsController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Dashboard API
Route::get('dashboard', [DashboardController::class, 'index']);

// Categories API routes
Route::apiResource('categories', CategoryController::class);

// Products API routes
Route::apiResource('products', ProductController::class);

// Inventory API routes
Route::apiResource('inventories', InventoryController::class);
Route::post('inventories/{inventory}/restock', [InventoryController::class, 'restock']);

// Orders API routes
Route::apiResource('orders', OrderController::class);
Route::post('orders/{order}/complete', [OrderController::class, 'complete']);

// Reports API routes
Route::get('reports', [ReportsController::class, 'index']);
Route::post('reports/export', [ReportsController::class, 'export']);

// Settings API routes
Route::prefix('settings')->group(function () {
    Route::get('profile', [\App\Http\Controllers\SettingsController::class, 'getProfile']);
    Route::put('profile', [\App\Http\Controllers\SettingsController::class, 'updateProfile']);
    Route::put('password', [\App\Http\Controllers\SettingsController::class, 'updatePassword']);
    
    // Account Management
    Route::get('users', [\App\Http\Controllers\SettingsController::class, 'getUsers']);
    Route::post('users', [\App\Http\Controllers\SettingsController::class, 'createUser']);
    Route::put('users/{id}', [\App\Http\Controllers\SettingsController::class, 'updateUser']);
    Route::delete('users/{id}', [\App\Http\Controllers\SettingsController::class, 'deleteUser']);
    Route::post('users/{id}/reset-password', [\App\Http\Controllers\SettingsController::class, 'resetUserPassword']);
    Route::post('check-email', [\App\Http\Controllers\SettingsController::class, 'checkEmail']);
});

// Staff API routes
Route::prefix('staff')->group(function () {
    Route::get('/', [\App\Http\Controllers\StaffController::class, 'index']);
    Route::post('/info', [\App\Http\Controllers\StaffController::class, 'storeStaffInfo']);
    Route::post('/{staffInfoId}/create-account', [\App\Http\Controllers\StaffController::class, 'createStaffAccount']);
    Route::put('/info/{id}', [\App\Http\Controllers\StaffController::class, 'updateStaffInfo']);
    Route::delete('/{id}', [\App\Http\Controllers\StaffController::class, 'destroy']);
    Route::get('/{id}', [\App\Http\Controllers\StaffController::class, 'show']);
    Route::post('/check-email', [\App\Http\Controllers\StaffController::class, 'checkEmail']);
});
