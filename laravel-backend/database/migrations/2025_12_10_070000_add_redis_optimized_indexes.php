<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add optimized indexes for Redis caching and query performance
     */
    public function up(): void
    {
        // Get existing indexes
        $existingIndexes = [];
        $tables = ['products', 'orders', 'order_items', 'inventories', 'categories', 'payments', 
                   'product_transactions', 'rental_properties', 'rental_contracts', 'rental_payments', 
                   'rental_maintenance', 'toga_departments', 'toga_rentals', 'toga_payments', 
                   'users', 'staff_info'];
        
        foreach ($tables as $table) {
            try {
                $indexes = DB::select("SHOW INDEX FROM `{$table}`");
                foreach ($indexes as $index) {
                    $existingIndexes[$table][] = $index->Key_name;
                }
            } catch (\Exception $e) {
                // Table doesn't exist, skip
            }
        }

        // Add indexes only if they don't already exist
        $this->addIndexSafely('products', 'barcode', 'idx_prod_barcode', $existingIndexes);
        $this->addIndexSafely('orders', 'order_number', 'idx_ord_number', $existingIndexes);
        $this->addIndexSafely('orders', 'completed_date', 'idx_ord_completed', $existingIndexes);
        $this->addIndexSafely('order_items', 'order_id', 'idx_oi_order', $existingIndexes);
        $this->addIndexSafely('order_items', 'product_id', 'idx_oi_product', $existingIndexes);
        $this->addIndexSafely('inventories', 'product_id', 'idx_inv_product', $existingIndexes);
        $this->addIndexSafely('payments', 'order_id', 'idx_pay_order', $existingIndexes);
        $this->addIndexSafely('product_transactions', 'product_id', 'idx_pt_product', $existingIndexes);
        $this->addIndexSafely('product_transactions', 'created_at', 'idx_pt_created', $existingIndexes);
        $this->addIndexSafely('rental_contracts', 'property_id', 'idx_rc_property', $existingIndexes);
        $this->addIndexSafely('rental_contracts', 'tenant_id', 'idx_rc_tenant', $existingIndexes);
        $this->addIndexSafely('rental_payments', 'contract_id', 'idx_rp_contract', $existingIndexes);
        $this->addIndexSafely('rental_maintenance', 'property_id', 'idx_rm_property', $existingIndexes);
        $this->addIndexSafely('toga_rentals', 'department_id', 'idx_tr_dept', $existingIndexes);
        $this->addIndexSafely('toga_payments', 'rental_id', 'idx_tp_rental', $existingIndexes);
    }

    /**
     * Add index only if it doesn't exist
     */
    private function addIndexSafely($table, $column, $indexName, $existingIndexes)
    {
        try {
            if (!isset($existingIndexes[$table]) || !in_array($indexName, $existingIndexes[$table])) {
                DB::statement("ALTER TABLE `{$table}` ADD INDEX `{$indexName}` (`{$column}`)");
            }
        } catch (\Exception $e) {
            // Index or table doesn't exist, skip
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $indexes = [
            'products' => ['idx_prod_barcode'],
            'orders' => ['idx_ord_number', 'idx_ord_completed'],
            'order_items' => ['idx_oi_order', 'idx_oi_product'],
            'inventories' => ['idx_inv_product'],
            'payments' => ['idx_pay_order'],
            'product_transactions' => ['idx_pt_product', 'idx_pt_created'],
            'rental_contracts' => ['idx_rc_property', 'idx_rc_tenant'],
            'rental_payments' => ['idx_rp_contract'],
            'rental_maintenance' => ['idx_rm_property'],
            'toga_rentals' => ['idx_tr_dept'],
            'toga_payments' => ['idx_tp_rental'],
        ];

        foreach ($indexes as $table => $tableIndexes) {
            foreach ($tableIndexes as $indexName) {
                try {
                    DB::statement("ALTER TABLE `{$table}` DROP INDEX `{$indexName}`");
                } catch (\Exception $e) {
                    // Index doesn't exist, skip
                }
            }
        }
    }
};
