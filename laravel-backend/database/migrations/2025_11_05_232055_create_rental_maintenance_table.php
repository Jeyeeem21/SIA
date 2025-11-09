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
        Schema::create('rental_maintenance', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('property_id')->constrained('rental_properties')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('rental_tenants')->onDelete('cascade');
            $table->text('issue');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');
            $table->enum('status', ['Pending', 'In Progress', 'Completed'])->default('Pending');
            $table->date('date_reported');
            $table->string('assigned_to')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_maintenance');
    }
};
