<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations - Add critical indexes for real-time performance
     */
    public function up(): void
    {
        // Skip - indexes already added by 2025_12_10_070000_add_redis_optimized_indexes
        return;
        // Orders table optimization - critical for dashboard and reports
        try {
            Schema::table('orders', function (Blueprint $table) {
                // Composite index for dashboard queries (status + created_at)
                $table->index(['status', 'created_at'], 'orders_status_created_idx');
                // Composite index for voided orders filtering
                $table->index(['is_voided', 'status', 'created_at'], 'orders_voided_status_idx');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }

        // Order items optimization - critical for sales analysis
        try {
            Schema::table('order_items', function (Blueprint $table) {
                // Composite index for product sales queries
                $table->index(['product_id', 'order_id'], 'order_items_product_order_idx');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }

        // Inventory optimization - critical for stock checks
        try {
            Schema::table('inventory', function (Blueprint $table) {
                // Composite for low stock queries
                $table->index(['status', 'product_id'], 'inventory_status_product_idx');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }

        // Product transactions optimization - critical for growth analysis
        try {
            Schema::table('product_transactions', function (Blueprint $table) {
                // Composite for transaction analysis by product and time
                $table->index(['product_id', 'transaction_type', 'created_at'], 'trans_product_type_date_idx');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }

        // Payments optimization
        try {
            Schema::table('payments', function (Blueprint $table) {
                // Composite for payment analysis
                $table->index(['order_id', 'payment_method', 'created_at'], 'payments_order_method_date_idx');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_status_created_idx');
            $table->dropIndex('orders_voided_status_idx');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('order_items_product_order_idx');
        });

        Schema::table('inventory', function (Blueprint $table) {
            $table->dropIndex('inventory_status_product_idx');
        });

        Schema::table('product_transactions', function (Blueprint $table) {
            $table->dropIndex('trans_product_type_date_idx');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_order_method_date_idx');
        });
    }
};
