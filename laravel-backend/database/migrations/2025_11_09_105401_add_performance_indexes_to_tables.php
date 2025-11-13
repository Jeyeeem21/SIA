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
        // Orders table indexes
        Schema::table('orders', function (Blueprint $table) {
            $table->index('order_number', 'idx_orders_order_number');
            $table->index('status', 'idx_orders_status');
            $table->index('is_voided', 'idx_orders_is_voided');
            $table->index('created_at', 'idx_orders_created_at');
            $table->index(['status', 'is_voided'], 'idx_orders_status_voided');
        });

        // Order Items table indexes
        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id', 'idx_order_items_order_id');
            $table->index('product_id', 'idx_order_items_product_id');
        });

        // Product Transactions table indexes
        Schema::table('product_transactions', function (Blueprint $table) {
            $table->index('type', 'idx_product_transactions_type');
            $table->index('created_at', 'idx_product_transactions_created_at');
            $table->index(['product_id', 'type', 'created_at'], 'idx_product_transactions_lookup');
        });

        // Inventories table indexes
        Schema::table('inventories', function (Blueprint $table) {
            $table->index('product_id', 'idx_inventories_product_id');
            $table->index('updated_at', 'idx_inventories_updated_at');
        });

        // Products table indexes
        Schema::table('products', function (Blueprint $table) {
            $table->index('category_id', 'idx_products_category_id');
            $table->index('product_name', 'idx_products_product_name');
        });
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
