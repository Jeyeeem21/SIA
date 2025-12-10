<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Update foreign key constraints to allow product deletion while preserving history
     */
    public function up(): void
    {
        // Use raw SQL to drop and recreate the foreign key constraint
        DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_product_id_foreign');
        DB::statement('ALTER TABLE order_items MODIFY product_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_foreign 
                       FOREIGN KEY (product_id) REFERENCES products(product_id) 
                       ON DELETE SET NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original constraint
        DB::statement('ALTER TABLE order_items DROP FOREIGN KEY order_items_product_id_foreign');
        DB::statement('ALTER TABLE order_items MODIFY product_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_foreign 
                       FOREIGN KEY (product_id) REFERENCES products(product_id) 
                       ON DELETE RESTRICT');
    }
};
