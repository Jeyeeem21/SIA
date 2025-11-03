<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DashboardController;

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
