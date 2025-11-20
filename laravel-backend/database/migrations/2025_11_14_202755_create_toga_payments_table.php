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
        Schema::create('toga_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toga_rental_id')->constrained('toga_rentals')->onDelete('cascade');
            $table->foreignId('toga_department_id')->constrained('toga_departments')->onDelete('cascade');
            $table->string('payment_number', 50)->unique();
            $table->string('student_name');
            $table->string('student_number', 50);
            $table->decimal('amount', 10, 2);
            $table->date('payment_date')->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->enum('status', ['Paid', 'Pending'])->default('Pending');
            $table->enum('type', ['Rental Fee', 'Deposit', 'Rental Fee + Deposit'])->default('Rental Fee');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('payment_number');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toga_payments');
    }
};
