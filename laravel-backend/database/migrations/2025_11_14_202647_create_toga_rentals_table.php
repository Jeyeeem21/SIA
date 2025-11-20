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
        Schema::create('toga_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('toga_department_id')->constrained('toga_departments')->onDelete('cascade');
            $table->string('student_name');
            $table->string('student_number', 50);
            $table->string('contact_number', 20);
            $table->string('size', 10);
            $table->date('rental_date');
            $table->date('return_date');
            $table->decimal('rental_fee', 10, 2);
            $table->decimal('deposit', 10, 2);
            $table->enum('status', ['Active', 'Returned', 'Overdue'])->default('Active');
            $table->enum('payment_status', ['Paid', 'Partial', 'Pending'])->default('Pending');
            $table->timestamps();
            
            $table->index('student_number');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toga_rentals');
    }
};
