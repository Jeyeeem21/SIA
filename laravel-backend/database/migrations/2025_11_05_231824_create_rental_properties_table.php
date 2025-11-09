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
        Schema::create('rental_properties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // Commercial, Residential
            $table->string('location');
            $table->string('size');
            $table->decimal('monthly_rate', 10, 2);
            $table->enum('status', ['Occupied', 'Vacant', 'Under Maintenance'])->default('Vacant');
            $table->date('contract_end_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_properties');
    }
};
