<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RentalsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SalesAnalyticsController;

// Authentication routes (public)
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');

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
Route::get('orders/sales/history', [OrderController::class, 'getSalesHistory']);
Route::post('orders/{order}/complete', [OrderController::class, 'complete']);
Route::post('orders/{order}/void', [OrderController::class, 'voidOrder']);
Route::apiResource('orders', OrderController::class);

// Reports API routes
Route::get('reports', [ReportsController::class, 'index']);
Route::post('reports/export', [ReportsController::class, 'export']);

// Sales Analytics API routes
Route::get('sales-analytics', [SalesAnalyticsController::class, 'index']);
Route::get('sales-analytics/overview', [SalesAnalyticsController::class, 'overview']);
Route::post('sales-analytics/update-summary', [SalesAnalyticsController::class, 'updateSalesSummary']);

// Product Transactions (Inventory Tracking) API routes
Route::get('product-transactions', [\App\Http\Controllers\ProductTransactionController::class, 'index']);
Route::get('product-transactions/product/{productId}', [\App\Http\Controllers\ProductTransactionController::class, 'getByProduct']);
Route::get('product-transactions/growth-rates', [\App\Http\Controllers\ProductTransactionController::class, 'getProductGrowthRates']);

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

// Rentals API routes
Route::prefix('rentals')->group(function () {
    // Properties
    Route::get('properties', [RentalsController::class, 'getProperties']);
    Route::post('properties', [RentalsController::class, 'createProperty']);
    Route::put('properties/{property}', [RentalsController::class, 'updateProperty']);
    Route::delete('properties/{property}', [RentalsController::class, 'deleteProperty']);

    // Tenants
    Route::get('tenants', [RentalsController::class, 'getTenants']);
    Route::post('tenants', [RentalsController::class, 'createTenant']);
    Route::put('tenants/{tenant}', [RentalsController::class, 'updateTenant']);
    Route::delete('tenants/{tenant}', [RentalsController::class, 'deleteTenant']);

    // Contracts
    Route::get('contracts', [RentalsController::class, 'getContracts']);
    Route::post('contracts', [RentalsController::class, 'createContract']);
    Route::put('contracts/{contract}', [RentalsController::class, 'updateContract']);
    Route::delete('contracts/{contract}', [RentalsController::class, 'deleteContract']);

    // Payments
    Route::get('payments', [RentalsController::class, 'getPayments']);
    Route::post('payments', [RentalsController::class, 'createPayment']);
    Route::put('payments/{payment}', [RentalsController::class, 'updatePayment']);
    Route::delete('payments/{payment}', [RentalsController::class, 'deletePayment']);

    // Maintenance
    Route::get('maintenance', [RentalsController::class, 'getMaintenance']);
    Route::post('maintenance', [RentalsController::class, 'createMaintenance']);
    Route::put('maintenance/{maintenance}', [RentalsController::class, 'updateMaintenance']);
    Route::delete('maintenance/{maintenance}', [RentalsController::class, 'deleteMaintenance']);

    // Stats
    Route::get('stats', [RentalsController::class, 'getStats']);
});

// Toga Rental API routes
Route::prefix('toga-rentals')->group(function () {
    // Statistics
    Route::get('stats', [\App\Http\Controllers\TogaRentalController::class, 'getStats']);
    
    // Departments
    Route::get('departments', [\App\Http\Controllers\TogaRentalController::class, 'getDepartments']);
    Route::post('departments', [\App\Http\Controllers\TogaRentalController::class, 'storeDepartment']);
    Route::put('departments/{id}', [\App\Http\Controllers\TogaRentalController::class, 'updateDepartment']);
    Route::delete('departments/{id}', [\App\Http\Controllers\TogaRentalController::class, 'destroyDepartment']);
    
    // Rentals/Students
    Route::get('departments/{departmentId}/rentals', [\App\Http\Controllers\TogaRentalController::class, 'getRentals']);
    Route::post('rentals', [\App\Http\Controllers\TogaRentalController::class, 'storeRental']);
    Route::put('rentals/{id}', [\App\Http\Controllers\TogaRentalController::class, 'updateRental']);
    Route::delete('rentals/{id}', [\App\Http\Controllers\TogaRentalController::class, 'destroyRental']);
    
    // Payments
    Route::get('departments/{departmentId}/payments', [\App\Http\Controllers\TogaRentalController::class, 'getPayments']);
    Route::post('payments', [\App\Http\Controllers\TogaRentalController::class, 'storePayment']);
    Route::put('payments/{id}', [\App\Http\Controllers\TogaRentalController::class, 'updatePayment']);
    Route::delete('payments/{id}', [\App\Http\Controllers\TogaRentalController::class, 'destroyPayment']);
});
