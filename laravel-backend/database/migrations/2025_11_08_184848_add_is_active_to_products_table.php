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
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('status');
        });
        
        // Update is_active based on stock and expiration
        DB::statement('UPDATE products p 
            LEFT JOIN inventories i ON p.product_id = i.product_id 
            SET p.is_active = CASE 
                WHEN i.quantity > 0 AND (p.expiration_date IS NULL OR p.expiration_date > NOW()) THEN 1 
                ELSE 0 
            END');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
