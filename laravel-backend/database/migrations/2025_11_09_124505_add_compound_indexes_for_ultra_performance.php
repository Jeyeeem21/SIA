<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Helper function to check if index exists
        $indexExists = function($table, $indexName) {
            $indexes = DB::select("SHOW INDEX FROM $table WHERE Key_name = ?", [$indexName]);
            return count($indexes) > 0;
        };

        Schema::table('inventories', function (Blueprint $table) use ($indexExists) {
            // Compound indexes for ultra-fast queries
            if (!$indexExists('inventories', 'inventories_product_quantity_idx')) {
                $table->index(['product_id', 'quantity'], 'inventories_product_quantity_idx');
            }
            if (!$indexExists('inventories', 'inventories_stock_status_idx')) {
                $table->index(['quantity', 'reorder_level'], 'inventories_stock_status_idx');
            }
        });

        Schema::table('orders', function (Blueprint $table) use ($indexExists) {
            // Compound indexes for order filtering
            if (!$indexExists('orders', 'orders_status_date_idx')) {
                $table->index(['status', 'created_at'], 'orders_status_date_idx');
            }
            if (!$indexExists('orders', 'orders_void_date_idx')) {
                $table->index(['is_voided', 'created_at'], 'orders_void_date_idx');
            }
        });

        Schema::table('order_items', function (Blueprint $table) use ($indexExists) {
            // Compound indexes for fast joins
            if (!$indexExists('order_items', 'order_items_composite_idx')) {
                $table->index(['order_id', 'product_id'], 'order_items_composite_idx');
            }
        });

        Schema::table('product_transactions', function (Blueprint $table) use ($indexExists) {
            // Compound indexes for transaction queries
            if (!$indexExists('product_transactions', 'transactions_product_date_idx')) {
                $table->index(['product_id', 'created_at'], 'transactions_product_date_idx');
            }
            if (!$indexExists('product_transactions', 'transactions_type_date_idx')) {
                $table->index(['type', 'created_at'], 'transactions_type_date_idx');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropIndex('inventories_product_quantity_idx');
            $table->dropIndex('inventories_stock_status_idx');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_status_date_idx');
            $table->dropIndex('orders_void_date_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_composite_idx');
        });

        Schema::table('product_transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_product_date_idx');
            $table->dropIndex('transactions_type_date_idx');
        });
    }
};
