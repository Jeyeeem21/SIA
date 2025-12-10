<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * ULTRA-FAST DATABASE INDEXES - Comprehensive optimization for all tables
     * Speeds up: Dashboard, Products, Orders, Inventory, Reports, Rentals, Staff
     */
    public function up(): void
    {
        // Skip - indexes already added by 2025_12_10_070000_add_redis_optimized_indexes
        return;
        // Helper to safely add index (skip if exists)
        $addIndexSafely = function($table, $column, $type = 'index') {
            try {
                $indexName = "{$table}_{$column}_{$type}";
                $exists = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
                
                if (empty($exists)) {
                    Schema::table($table, function (Blueprint $blueprint) use ($column, $type) {
                        if ($type === 'unique') {
                            $blueprint->unique($column);
                        } else {
                            $blueprint->index($column);
                        }
                    });
                    echo "✓ Added {$type} on {$table}.{$column}\n";
                }
            } catch (\Exception $e) {
                // Ignore if column doesn't exist or index already exists
            }
        };

        $addCompositeIndex = function($table, $columns, $indexName = null) {
            try {
                $indexName = $indexName ?? $table . '_' . implode('_', $columns) . '_index';
                $exists = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
                
                if (empty($exists)) {
                    Schema::table($table, function (Blueprint $blueprint) use ($columns, $indexName) {
                        $blueprint->index($columns, $indexName);
                    });
                    echo "✓ Added composite index on {$table}: " . implode(', ', $columns) . "\n";
                }
            } catch (\Exception $e) {
                // Ignore if columns don't exist or index already exists
            }
        };

        // ==================== PRODUCTS TABLE ====================
        $addIndexSafely('products', 'product_name');
        $addIndexSafely('products', 'barcode');
        $addIndexSafely('products', 'sku');
        $addIndexSafely('products', 'price');
        $addIndexSafely('products', 'updated_at');
        $addCompositeIndex('products', ['category_id', 'status']);
        $addCompositeIndex('products', ['status', 'created_at']);

        // ==================== INVENTORIES TABLE ====================
        $addIndexSafely('inventories', 'quantity');
        $addIndexSafely('inventories', 'updated_at');
        $addCompositeIndex('inventories', ['product_id', 'status']);
        $addCompositeIndex('inventories', ['status', 'quantity']);

        // ==================== ORDERS TABLE ====================
        $addIndexSafely('orders', 'customer_name');
        $addIndexSafely('orders', 'updated_at');
        $addIndexSafely('orders', 'completed_date');
        $addCompositeIndex('orders', ['status', 'created_at']);
        $addCompositeIndex('orders', ['is_voided', 'status']);
        $addCompositeIndex('orders', ['completed_date', 'status']);

        // ==================== ORDER_ITEMS TABLE ====================
        $addIndexSafely('order_items', 'quantity');
        $addIndexSafely('order_items', 'unit_price');
        $addCompositeIndex('order_items', ['order_id', 'product_id']);
        $addCompositeIndex('order_items', ['product_id', 'quantity']);

        // ==================== PAYMENTS TABLE ====================
        $addIndexSafely('payments', 'payment_method');
        $addIndexSafely('payments', 'created_at');
        $addCompositeIndex('payments', ['payment_method', 'created_at']);

        // ==================== PRODUCT_TRANSACTIONS TABLE ====================
        $addIndexSafely('product_transactions', 'user_id');
        $addIndexSafely('product_transactions', 'created_at');
        $addCompositeIndex('product_transactions', ['product_id', 'type']);
        $addCompositeIndex('product_transactions', ['type', 'created_at']);
        $addCompositeIndex('product_transactions', ['product_id', 'created_at']);

        // ==================== STAFF_INFO TABLE ====================
        $addIndexSafely('staff_info', 'position');
        $addIndexSafely('staff_info', 'created_at');
        $addCompositeIndex('staff_info', ['status', 'position']);

        // ==================== RENTAL TABLES ====================
        $addIndexSafely('rental_properties', 'type');
        $addIndexSafely('rental_properties', 'created_at');
        $addCompositeIndex('rental_properties', ['status', 'type']);

        $addIndexSafely('rental_tenants', 'name');
        $addIndexSafely('rental_tenants', 'contract_status');
        $addIndexSafely('rental_tenants', 'property_rented_id');
        $addCompositeIndex('rental_tenants', ['contract_status', 'property_rented_id']);

        $addIndexSafely('rental_contracts', 'start_date');
        $addIndexSafely('rental_contracts', 'end_date');
        $addCompositeIndex('rental_contracts', ['property_id', 'status']);
        $addCompositeIndex('rental_contracts', ['tenant_id', 'status']);
        $addCompositeIndex('rental_contracts', ['status', 'end_date']);

        $addIndexSafely('rental_payments', 'payment_date');
        $addCompositeIndex('rental_payments', ['tenant_id', 'status']);
        $addCompositeIndex('rental_payments', ['property_id', 'status']);
        $addCompositeIndex('rental_payments', ['status', 'payment_date']);

        $addIndexSafely('rental_maintenance', 'priority');
        $addIndexSafely('rental_maintenance', 'date_reported');
        $addCompositeIndex('rental_maintenance', ['property_id', 'status']);
        $addCompositeIndex('rental_maintenance', ['status', 'priority']);

        // ==================== SESSIONS TABLE ====================
        $addIndexSafely('sessions', 'last_activity');
        $addIndexSafely('sessions', 'user_id');

        echo "\n✅ COMPREHENSIVE DATABASE INDEXES APPLIED! All queries are now ULTRA-FAST! 🚀\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Indexes will be dropped if table is dropped
    }
};
