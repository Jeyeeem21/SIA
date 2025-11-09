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
        Schema::create('rental_tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('business_name')->nullable();
            $table->string('contact_number');
            $table->string('email');
            $table->foreignId('property_rented_id')->nullable()->constrained('rental_properties')->onDelete('set null');
            $table->enum('contract_status', ['Active', 'Inactive', 'Expired'])->default('Inactive');
            $table->decimal('deposit_paid', 10, 2)->default(0);
            $table->date('last_payment_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rental_tenants');
    }
};
