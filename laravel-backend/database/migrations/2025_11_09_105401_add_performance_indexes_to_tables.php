<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Skip - indexes already added by other migrations
        // This migration is superseded by 2025_12_10_070000_add_redis_optimized_indexes
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_order_number');
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_is_voided');
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_status_voided');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_product_id');
        });

        Schema::table('product_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_product_transactions_type');
            $table->dropIndex('idx_product_transactions_created_at');
            $table->dropIndex('idx_product_transactions_lookup');
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->dropIndex('idx_inventories_product_id');
            $table->dropIndex('idx_inventories_updated_at');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_category_id');
            $table->dropIndex('idx_products_product_name');
        });
    }
};
