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
        Schema::create('sales_summary', function (Blueprint $table) {
            $table->id('summary_id');
            $table->date('date');
            $table->enum('period_type', ['daily', 'monthly', 'yearly']);
            $table->decimal('total_sales', 12, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->decimal('previous_period_sales', 12, 2)->nullable();
            $table->decimal('growth_rate', 8, 2)->nullable(); // Percentage change
            $table->timestamps();

            $table->unique(['date', 'period_type']);
            $table->index('date');
            $table->index('period_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_summary');
    }
};
