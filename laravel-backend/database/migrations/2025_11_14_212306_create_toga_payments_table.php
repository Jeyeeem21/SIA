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
        if (!Schema::hasTable('toga_payments_duplicate')) {
            // Skip - this is a duplicate, using earlier migration
            return;
        }
        Schema::create('toga_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toga_department_id')->constrained('toga_departments')->onDelete('cascade');
            $table->foreignId('toga_student_id')->constrained('toga_students')->onDelete('cascade');
            $table->string('payment_number')->unique();
            $table->string('student_name');
            $table->string('student_number');
            $table->decimal('amount', 10, 2);
            $table->date('payment_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->enum('status', ['Paid', 'Pending'])->default('Pending');
            $table->enum('type', ['Rental Fee', 'Deposit', 'Rental Fee + Deposit'])->default('Rental Fee');
            $table->timestamps();
            
            $table->index('toga_department_id');
            $table->index('toga_student_id');
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
