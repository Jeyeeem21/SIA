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

        // Products table indexes
        $productIndexes = DB::select("SHOW INDEX FROM products");
        $existingIndexes = collect($productIndexes)->pluck('Key_name')->toArray();
        
        Schema::table('products', function (Blueprint $table) use ($existingIndexes) {
            if (Schema::hasColumn('products', 'product_name') && !in_array('products_product_name_index', $existingIndexes)) {
                $table->index('product_name');
            }
            if (Schema::hasColumn('products', 'category_id') && !in_array('products_category_id_index', $existingIndexes)) {
                $table->index('category_id');
            }
            if (Schema::hasColumn('products', 'status') && !in_array('products_status_index', $existingIndexes)) {
                $table->index('status');
            }
            if (Schema::hasColumn('products', 'created_at') && !in_array('products_created_at_index', $existingIndexes)) {
                $table->index('created_at');
            }
        });

        // Inventories - skip if exists
        Schema::table('inventories', function (Blueprint $table) use ($indexExists) {
            if (!$indexExists('inventories', 'inventories_product_id_index')) {
                $table->index('product_id');
            }
        });

        // Orders - skip if exists
        Schema::table('orders', function (Blueprint $table) use ($indexExists) {
            if (!$indexExists('orders', 'orders_order_number_index')) {
                $table->index('order_number');
            }
            if (!$indexExists('orders', 'orders_customer_name_index')) {
                $table->index('customer_name');
            }
            if (!$indexExists('orders', 'orders_status_index')) {
                $table->index('status');
            }
            if (!$indexExists('orders', 'orders_created_at_index')) {
                $table->index('created_at');
            }
            if (!$indexExists('orders', 'orders_is_voided_index')) {
                $table->index('is_voided');
            }
        });

        // Order Items - skip if exists
        Schema::table('order_items', function (Blueprint $table) use ($indexExists) {
            if (!$indexExists('order_items', 'order_items_order_id_index')) {
                $table->index('order_id');
            }
            if (!$indexExists('order_items', 'order_items_product_id_index')) {
                $table->index('product_id');
            }
        });

        // Product Transactions - skip if exists (use 'type' not 'transaction_type')
        Schema::table('product_transactions', function (Blueprint $table) use ($indexExists) {
            if (!$indexExists('product_transactions', 'product_transactions_product_id_index')) {
                $table->index('product_id');
            }
            if (!$indexExists('product_transactions', 'product_transactions_type_index') && Schema::hasColumn('product_transactions', 'type')) {
                $table->index('type');
            }
            if (!$indexExists('product_transactions', 'product_transactions_created_at_index')) {
                $table->index('created_at');
            }
        });

        // Categories - skip if exists
        Schema::table('categories', function (Blueprint $table) use ($indexExists) {
            if (!$indexExists('categories', 'categories_category_name_index')) {
                $table->index('category_name');
            }
        });

        // Users - skip if exists
        Schema::table('users', function (Blueprint $table) use ($indexExists) {
            if (!$indexExists('users', 'users_role_index') && Schema::hasColumn('users', 'role')) {
                $table->index('role');
            }
        });

        // Payments - skip if exists
        Schema::table('payments', function (Blueprint $table) use ($indexExists) {
            if (!$indexExists('payments', 'payments_order_id_index')) {
                $table->index('order_id');
            }
            if (!$indexExists('payments', 'payments_payment_method_index')) {
                $table->index('payment_method');
            }
            if (!$indexExists('payments', 'payments_created_at_index')) {
                $table->index('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'product_name')) {
                $table->dropIndex(['product_name']);
            }
            if (Schema::hasColumn('products', 'category_id')) {
                $table->dropIndex(['category_id']);
            }
            if (Schema::hasColumn('products', 'status')) {
                $table->dropIndex(['status']);
                if (Schema::hasColumn('products', 'category_id')) {
                    $table->dropIndex(['status', 'category_id']);
                }
            }
            if (Schema::hasColumn('products', 'created_at')) {
                $table->dropIndex(['created_at']);
            }
        });

        Schema::table('inventory', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['status', 'product_id']);
            $table->dropIndex(['last_restock_date']);
            $table->dropIndex(['quantity', 'reorder_level']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['order_number']);
            $table->dropIndex(['customer_name']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['is_voided']);
            $table->dropIndex(['status', 'is_voided', 'created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['product_id']);
            $table->dropIndex(['order_id', 'product_id']);
        });

        Schema::table('product_transactions', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['transaction_type']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['product_id', 'transaction_type', 'created_at']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['category_name']);
            $table->dropIndex(['description']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['role']);
            $table->dropIndex(['role', 'email']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['payment_method']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['order_id', 'payment_method']);
        });
    }
};
