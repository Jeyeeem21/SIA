<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add optimized indexes for frequently queried columns
     */
    public function up(): void
    {
        // Add indexes only if they don't exist
        $this->addIndexIfNotExists('products', 'status', 'idx_products_status_v2');
        $this->addIndexIfNotExists('products', 'barcode', 'idx_products_barcode_v2');
        $this->addIndexIfNotExists('products', 'category_id', 'idx_products_category_v2');
        $this->addCompoundIndexIfNotExists('products', ['status', 'category_id'], 'idx_products_status_cat');

        Schema::table('orders', function (Blueprint $table) {
            $table->index('status', 'idx_orders_status');
            $table->index('order_number', 'idx_orders_order_number');
            $table->index('completed_date', 'idx_orders_completed_date');
            $table->index('created_at', 'idx_orders_created_at');
            $table->index(['status', 'completed_date'], 'idx_orders_status_completed');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id', 'idx_order_items_order_id');
            $table->index('product_id', 'idx_order_items_product_id');
            $table->index(['order_id', 'product_id'], 'idx_order_items_order_product');
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->index('product_id', 'idx_inventories_product_id');
            $table->index('quantity', 'idx_inventories_quantity');
            $table->index(['product_id', 'quantity'], 'idx_inventories_product_qty');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index('status', 'idx_categories_status');
            $table->index('category_name', 'idx_categories_name');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('order_id', 'idx_payments_order_id');
            $table->index('payment_date', 'idx_payments_payment_date');
            $table->index('payment_method', 'idx_payments_method');
        });

        Schema::table('product_transactions', function (Blueprint $table) {
            $table->index('product_id', 'idx_product_transactions_product_id');
            $table->index('type', 'idx_product_transactions_type');
            $table->index('created_at', 'idx_product_transactions_created_at');
            $table->index(['product_id', 'type'], 'idx_product_transactions_product_type');
            $table->index(['product_id', 'created_at'], 'idx_product_transactions_product_date');
        });

        Schema::table('rental_properties', function (Blueprint $table) {
            $table->index('status', 'idx_rental_properties_status');
            $table->index('stall_number', 'idx_rental_properties_stall');
        });

        Schema::table('rental_contracts', function (Blueprint $table) {
            $table->index('property_id', 'idx_rental_contracts_property_id');
            $table->index('tenant_id', 'idx_rental_contracts_tenant_id');
            $table->index('status', 'idx_rental_contracts_status');
            $table->index(['property_id', 'status'], 'idx_rental_contracts_property_status');
        });

        Schema::table('rental_payments', function (Blueprint $table) {
            $table->index('contract_id', 'idx_rental_payments_contract_id');
            $table->index('payment_date', 'idx_rental_payments_payment_date');
        });

        Schema::table('rental_maintenance', function (Blueprint $table) {
            $table->index('property_id', 'idx_rental_maintenance_property_id');
            $table->index('status', 'idx_rental_maintenance_status');
        });

        Schema::table('toga_departments', function (Blueprint $table) {
            $table->index('department_name', 'idx_toga_departments_name');
        });

        Schema::table('toga_rentals', function (Blueprint $table) {
            $table->index('department_id', 'idx_toga_rentals_department_id');
            $table->index('student_id', 'idx_toga_rentals_student_id');
            $table->index(['department_id', 'student_id'], 'idx_toga_rentals_dept_student');
        });

        Schema::table('toga_payments', function (Blueprint $table) {
            $table->index('rental_id', 'idx_toga_payments_rental_id');
            $table->index('payment_date', 'idx_toga_payments_payment_date');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('email', 'idx_users_email');
            $table->index('role', 'idx_users_role');
        });

        Schema::table('staff_info', function (Blueprint $table) {
            $table->index('email', 'idx_staff_info_email');
            $table->index('user_id', 'idx_staff_info_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_status');
            $table->dropIndex('idx_products_barcode');
            $table->dropIndex('idx_products_category_id');
            $table->dropIndex('idx_products_status_category');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_order_number');
            $table->dropIndex('idx_orders_completed_date');
            $table->dropIndex('idx_orders_created_at');
            $table->dropIndex('idx_orders_status_completed');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_product_id');
            $table->dropIndex('idx_order_items_order_product');
        });

        Schema::table('inventories', function (Blueprint $table) {
            $table->dropIndex('idx_inventories_product_id');
            $table->dropIndex('idx_inventories_quantity');
            $table->dropIndex('idx_inventories_product_qty');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('idx_categories_status');
            $table->dropIndex('idx_categories_name');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_order_id');
            $table->dropIndex('idx_payments_payment_date');
            $table->dropIndex('idx_payments_method');
        });

        Schema::table('product_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_product_transactions_product_id');
            $table->dropIndex('idx_product_transactions_type');
            $table->dropIndex('idx_product_transactions_created_at');
            $table->dropIndex('idx_product_transactions_product_type');
            $table->dropIndex('idx_product_transactions_product_date');
        });

        Schema::table('rental_properties', function (Blueprint $table) {
            $table->dropIndex('idx_rental_properties_status');
            $table->dropIndex('idx_rental_properties_stall');
        });

        Schema::table('rental_contracts', function (Blueprint $table) {
            $table->dropIndex('idx_rental_contracts_property_id');
            $table->dropIndex('idx_rental_contracts_tenant_id');
            $table->dropIndex('idx_rental_contracts_status');
            $table->dropIndex('idx_rental_contracts_property_status');
        });

        Schema::table('rental_payments', function (Blueprint $table) {
            $table->dropIndex('idx_rental_payments_contract_id');
            $table->dropIndex('idx_rental_payments_payment_date');
        });

        Schema::table('rental_maintenance', function (Blueprint $table) {
            $table->dropIndex('idx_rental_maintenance_property_id');
            $table->dropIndex('idx_rental_maintenance_status');
        });

        Schema::table('toga_departments', function (Blueprint $table) {
            $table->dropIndex('idx_toga_departments_name');
        });

        Schema::table('toga_rentals', function (Blueprint $table) {
            $table->dropIndex('idx_toga_rentals_department_id');
            $table->dropIndex('idx_toga_rentals_student_id');
            $table->dropIndex('idx_toga_rentals_dept_student');
        });

        Schema::table('toga_payments', function (Blueprint $table) {
            $table->dropIndex('idx_toga_payments_rental_id');
            $table->dropIndex('idx_toga_payments_payment_date');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_email');
            $table->dropIndex('idx_users_role');
        });

        Schema::table('staff_info', function (Blueprint $table) {
            $table->dropIndex('idx_staff_info_email');
            $table->dropIndex('idx_staff_info_user_id');
        });
    }
};
