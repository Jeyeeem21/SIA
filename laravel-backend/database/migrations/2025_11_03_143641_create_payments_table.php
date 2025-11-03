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
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->foreignId('order_id')->constrained('orders', 'order_id')->restrictOnDelete();
            $table->enum('payment_method', ['Cash', 'GCash']);
            $table->decimal('amount', 10, 2);
            $table->string('reference_number', 100)->nullable();
            $table->timestamp('payment_date')->useCurrent();
            $table->foreignId('processed_by')->nullable()->constrained('users', 'id')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
