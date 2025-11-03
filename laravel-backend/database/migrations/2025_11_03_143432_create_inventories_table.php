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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->foreignId('product_id')->unique()->constrained('products', 'product_id')->cascadeOnDelete();
            $table->integer('quantity')->default(0);
            $table->integer('reorder_level')->default(10);
            $table->integer('reorder_quantity')->default(50);
            $table->date('last_restock_date')->nullable();
            $table->integer('last_restock_quantity')->nullable();
            $table->enum('status', ['available', 'low', 'out'])->storedAs("
                CASE 
                    WHEN quantity = 0 THEN 'out'
                    WHEN quantity <= reorder_level THEN 'low'
                    ELSE 'available'
                END
            ");
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->index('status');
            $table->index('quantity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
