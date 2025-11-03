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
        Schema::create('orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->string('order_number', 50)->unique();
            $table->string('customer_name', 100)->nullable();
            $table->enum('service_type', ['Printing', 'ID Creation', 'Tela Purchase', 'Lamination', 'Document Binding', 'Uniform', 'Other']);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('status', ['Pending', 'In Progress', 'Completed', 'Cancelled'])->default('Pending');
            $table->text('notes')->nullable();
            $table->date('preferred_pickup_date')->nullable();
            $table->timestamp('completed_date')->nullable();
            $table->timestamps();
            
            $table->index('order_number');
            $table->index('customer_name');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
